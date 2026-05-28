import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApiRequest } from './useApiRequest';
import { formatLocalDate } from '../utils/weekBoundary';

// ── Transform a session into a ScheduleEntry ─────────────────────────
function sessionToEntry(session) {
  const startAt = session.date ? new Date(session.date).toISOString() : null;
  if (!startAt) return null;
  const endAt = new Date(new Date(startAt).getTime() + 60 * 60 * 1000).toISOString();

  const instructor = session.instructorId && typeof session.instructorId === 'object'
    ? session.instructorId
    : { _id: session.instructorId, FullName: 'Instructor' };

  return {
    _id: session._id,
    entryType: 'session',
    title: session.title || 'Session',
    subject: session.title || 'Session',
    startAt,
    endAt,
    status: session.status || 'scheduled',
    color: null,
    notes: session.notes || null,
    instructorId: instructor,
    studentProfileId: session.studentProfileId || null,
    sessionId: session._id,
    taskId: null,
    seriesId: null,
  };
}

// ── Transform a task into a ScheduleEntry ────────────────────────────
function taskToEntry(task) {
  const endAt = task.dueDate ? new Date(task.dueDate).toISOString() : null;
  if (!endAt) return null;
  const startAt = new Date(new Date(endAt).getTime() - 30 * 60 * 1000).toISOString();

  const instructor = task.instructorId && typeof task.instructorId === 'object'
    ? task.instructorId
    : { _id: task.instructorId, FullName: 'Instructor' };

  return {
    _id: task._id,
    entryType: 'task_due',
    title: task.title || 'Task Due',
    subject: task.title || 'Task Due',
    startAt,
    endAt,
    status: task.status || 'pending',
    color: null,
    notes: task.description || null,
    instructorId: instructor,
    studentProfileId: task.studentProfileId || null,
    sessionId: null,
    taskId: task._id,
    seriesId: null,
  };
}

// ── Filter entries to the displayed week ─────────────────────────────
function filterToWeek(entries, start, end) {
  const s = start.getTime();
  const e = end.getTime();
  return entries.filter(entry => {
    if (!entry?.startAt) return false;
    const t = new Date(entry.startAt).getTime();
    return t >= s && t <= e;
  });
}

// ── Safely extract array from any API response shape ─────────────────
function extractList(res) {
  if (!res) return [];
  const d = res.data;
  if (!d) return [];
  // Try every known shape
  if (Array.isArray(d)) return d;
  if (Array.isArray(d.docs)) return d.docs;
  if (Array.isArray(d.sessions)) return d.sessions;
  if (Array.isArray(d.tasks)) return d.tasks;
  if (Array.isArray(d.data)) return d.data;
  // Paginated wrapper with results array
  if (d.results && Array.isArray(d.results)) return d.results;
  return [];
}

const useScheduleApi = () => {
  const { user } = useAuth();
  const { request } = useApiRequest();
  const role = (user?.role || '').toLowerCase();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conflicts, setConflicts] = useState([]);

  const abortRef = useRef(null);

  const fetchWeek = useCallback(async (start, end) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access-token') || '';
      const startDate = formatLocalDate(start);
      const endDate   = formatLocalDate(end);

      console.log('[Schedule] fetchWeek', { startDate, endDate, role });

      const isAdmin      = role === 'admin';
      const isInstructor = role === 'instructor';
      const sessionBase  = (isAdmin || isInstructor) ? '/api/v1/session' : '/api/v1/session/me';
      const taskBase     = (isAdmin || isInstructor) ? '/api/v1/task'    : '/api/v1/task/me';
      const params       = new URLSearchParams({ page: '1', limit: '500' });

      // Fire all requests in parallel — schedule endpoint + session/task fallback
      const [scheduleRes, sessionsRes, tasksRes] = await Promise.allSettled([
        // Schedule endpoint (may have ScheduleEntry docs)
        fetch(
          `/api/v1/schedule?startDate=${startDate}&endDate=${endDate}`,
          { headers: { Authorization: `Bearer ${token}` }, credentials: 'include', signal: controller.signal }
        ).then(async (res) => {
          if (!res.ok) return [];
          const data = await res.json();
          const list = data.data?.entries ?? data.data ?? [];
          return Array.isArray(list) ? list : [];
        }),
        // Sessions (always reliable — exists independently of ScheduleEntry)
        request(`${sessionBase}?${params.toString()}`),
        // Tasks (always reliable)
        request(`${taskBase}?${params.toString()}`),
      ]);

      clearTimeout(timeoutId);

      // Extract schedule entries (may be empty if no ScheduleEntry docs exist)
      const scheduleEntries = scheduleRes.status === 'fulfilled' ? scheduleRes.value : [];

      // Extract and transform sessions → schedule-shaped entries
      const sessionList    = sessionsRes.status === 'fulfilled' ? extractList(sessionsRes.value) : [];
      const taskList       = tasksRes.status === 'fulfilled'    ? extractList(tasksRes.value)    : [];
      const sessionEntries = sessionList.map(sessionToEntry).filter(Boolean);
      const taskEntries    = taskList.map(taskToEntry).filter(Boolean);

      console.log('[Schedule] scheduleEntries:', scheduleEntries.length);
      console.log('[Schedule] sessionEntries:', sessionEntries.length);
      console.log('[Schedule] taskEntries:', taskEntries.length);

      // Merge all sources, deduplicating by _id (schedule entries take priority)
      const seen = new Map();
      for (const e of scheduleEntries) {
        if (e?._id) seen.set(String(e._id), e);
      }
      for (const e of [...sessionEntries, ...taskEntries]) {
        if (e?._id && !seen.has(String(e._id))) {
          // Also check if a schedule entry already covers this session/task by reference
          const alreadyCovered = scheduleEntries.some(
            se => (se.sessionId && String(se.sessionId) === String(e._id)) ||
                  (se.taskId && String(se.taskId) === String(e._id))
          );
          if (!alreadyCovered) {
            seen.set(String(e._id), e);
          }
        }
      }

      const merged = [...seen.values()];
      const weekEntries = filterToWeek(merged, start, end);

      console.log('[Schedule] merged total:', merged.length);
      console.log('[Schedule] weekEntries after filter:', weekEntries.length);
      console.log('[Schedule] week bounds:', start.toISOString(), '→', end.toISOString());

      // If nothing in this week but data exists, show all (useful for debugging / new users)
      if (weekEntries.length === 0 && merged.length > 0) {
        console.log('[Schedule] No entries in current week — showing all entries unfiltered');
        setEntries(merged);
      } else {
        setEntries(weekEntries);
      }
      setConflicts([]);

    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') return;
      console.error('[Schedule] fetchWeek error:', err);
      setError(err.message || 'Could not load schedule.');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [request, role]);

  const getEntry = useCallback(async (id) => {
    try {
      const data = await request(`/api/v1/schedule/${id}`);
      return data.data ?? data;
    } catch {
      try {
        const data = await request(`/api/v1/session/${id}`);
        const s = data.data ?? data;
        return sessionToEntry(s) ?? s;
      } catch {
        const data = await request(`/api/v1/task/${id}`);
        const t = data.data ?? data;
        return taskToEntry(t) ?? t;
      }
    }
  }, [request]);

  const createCustom = useCallback(async (payload) => {
    const data = await request('/api/v1/schedule/custom', 'POST', payload);
    if (data.data?.conflicts?.length) setConflicts(data.data.conflicts);
    return data;
  }, [request]);

  const patchEntry = useCallback(async (id, patch) => {
    const data = await request(`/api/v1/schedule/${id}`, 'PATCH', patch);
    if (data.data?.conflicts?.length) setConflicts(data.data.conflicts);
    return data;
  }, [request]);

  const deleteEntry  = useCallback(async (id) => request(`/api/v1/schedule/${id}`, 'DELETE'), [request]);
  const fetchSeries  = useCallback(async () => { const d = await request('/api/v1/schedule/series'); return d.data ?? d ?? []; }, [request]);
  const getSeries    = useCallback(async (id) => { const d = await request(`/api/v1/schedule/series/${id}`); return d.data ?? d; }, [request]);
  const createSeries = useCallback(async (p) => request('/api/v1/schedule/series', 'POST', p), [request]);
  const patchSeries  = useCallback(async (id, p) => request(`/api/v1/schedule/series/${id}`, 'PATCH', p), [request]);
  const deleteSeries = useCallback(async (id) => request(`/api/v1/schedule/series/${id}`, 'DELETE'), [request]);
  const clearConflicts = useCallback(() => setConflicts([]), []);

  return {
    entries, loading, error, conflicts,
    fetchWeek, getEntry, createCustom, patchEntry, deleteEntry,
    fetchSeries, getSeries, createSeries, patchSeries, deleteSeries,
    clearConflicts, setEntries,
  };
};

export default useScheduleApi;
