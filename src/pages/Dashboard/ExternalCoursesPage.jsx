import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Link as LinkIcon,
  Pencil,
  Plus,
  Trash2,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal/Modal';
import { useApiRequest } from '../../hooks/useApiRequest';

const hwStatusStyles = {
  Completed: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', label: 'Submitted' },
  Pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: 'Pending' },
  Canceled: { bg: 'rgba(100,116,139,0.1)', color: '#64748b', label: 'Canceled' },
  'Late submission': { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: 'Late' },
};

const emptyCourseForm = { teacher: '', subject: '', studentProfileId: '', color: '#10b981' };
const emptyHwForm = { title: '', description: '', dueDate: '', externalCourse: '', category: 'Project' };

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [value];
};

const formatDate = (value) => {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Invalid date';
  return date.toLocaleDateString();
};

const formatDateTimeInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
};

const getCourseIdFromHw = (hw) => {
  if (!hw?.externalCourse) return '';
  return typeof hw.externalCourse === 'object' ? hw.externalCourse._id : hw.externalCourse;
};

const getProfileIdFromCourse = (course) => {
  const profile = course?.studentProfileId;
  if (!profile) return '';
  return typeof profile === 'object' ? profile._id : profile;
};

const getStudentNameFromCourse = (course) => {
  const profile = course?.studentProfileId;
  if (!profile || typeof profile !== 'object') return 'Student';
  return profile.user?.FullName || profile.user?.UserName || 'Student';
};

const getProfileLabel = (profile) => {
  if (!profile || typeof profile !== 'object') return 'Student';
  return profile.user?.FullName || profile.user?.UserName || 'Student';
};

const isPending = (hw) => hw.status === 'Pending';
const isSubmitted = (hw) => hw.status === 'Completed' || hw.status === 'Late submission';
const isLateOrOverdue = (hw) => {
  if (hw.status === 'Late submission') return true;
  if (hw.status !== 'Pending' || !hw.dueDate) return false;
  return new Date(hw.dueDate) < new Date();
};

const iconButtonStyle = {
  width: '34px',
  height: '34px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-secondary)',
  color: 'var(--text-secondary)',
};

const ExternalCoursesPage = () => {
  const { user } = useAuth();
  const { request } = useApiRequest();
  const role = user?.role || 'student';
  const isAdmin = role === 'admin' || role === 'instructor';
  const canManageCourses = isAdmin || role === 'parent';
  const canManageHw = isAdmin || role === 'parent';
  const canSubmitHomework = role === 'student';

  const [courses, setCourses] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [hwLoading, setHwLoading] = useState(true);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState(null);
  const [hwError, setHwError] = useState(null);
  const [profilesError, setProfilesError] = useState(null);

  const [selectedProfileId, setSelectedProfileId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedCourses, setExpandedCourses] = useState(new Set());

  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [deleteCourse, setDeleteCourse] = useState(null);
  const [courseForm, setCourseForm] = useState(emptyCourseForm);

  const [showCreateHw, setShowCreateHw] = useState(false);
  const [editHw, setEditHw] = useState(null);
  const [deleteHw, setDeleteHw] = useState(null);
  const [markCompleteHw, setMarkCompleteHw] = useState(null);
  const [hwForm, setHwForm] = useState(emptyHwForm);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchProfiles = async () => {
    if (role === 'instructor') return;

    try {
      setProfilesLoading(true);
      const endpoint = role === 'admin' ? '/api/v1/StudentProfile/all' : '/api/v1/StudentProfile/me';
      const data = await request(endpoint);
      const list = data.data?.profiles || data.data?.docs || data.data;
      setProfiles(toArray(list));
      setProfilesError(null);
    } catch (err) {
      setProfilesError(err.message);
    } finally {
      setProfilesLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const endpoint = role === 'student' || role === 'parent' ? '/api/v1/external-course/my-course' : '/api/v1/external-course';
      const data = await request(endpoint);
      const list = data.data?.docs || data.data?.courses || data.data;
      setCourses(toArray(list));
      setCoursesError(null);
    } catch (err) {
      setCoursesError(err.message);
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchHomeworks = async () => {
    try {
      setHwLoading(true);
      const endpoint = role === 'student' || role === 'parent' ? '/api/v1/external-hw/my' : '/api/v1/external-hw';
      const data = await request(endpoint);
      const list = data.data?.docs || data.data;
      setHomeworks(toArray(list));
      setHwError(null);
    } catch (err) {
      setHwError(err.message);
    } finally {
      setHwLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
    fetchCourses();
    fetchHomeworks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const profileOptions = useMemo(() => {
    const fromProfiles = profiles.map((profile) => ({
      id: profile._id,
      label: getProfileLabel(profile),
      grade: profile.grade,
    }));

    const fromCourses = courses.map((course) => ({
      id: getProfileIdFromCourse(course),
      label: getStudentNameFromCourse(course),
      grade: typeof course.studentProfileId === 'object' ? course.studentProfileId?.grade : undefined,
    }));

    const seen = new Set();
    return [...fromProfiles, ...fromCourses].filter((profile) => {
      if (!profile.id || seen.has(profile.id)) return false;
      seen.add(profile.id);
      return true;
    });
  }, [courses, profiles]);

  const visibleCourses = useMemo(() => {
    if (selectedProfileId === 'all') return courses;
    return courses.filter((course) => getProfileIdFromCourse(course) === selectedProfileId);
  }, [courses, selectedProfileId]);

  const visibleCourseIds = useMemo(() => new Set(visibleCourses.map((course) => course._id)), [visibleCourses]);

  const visibleHomeworks = useMemo(() => {
    return homeworks.filter((hw) => {
      const courseId = getCourseIdFromHw(hw);
      if (selectedProfileId === 'all') return !courseId || visibleCourseIds.has(courseId);
      return visibleCourseIds.has(courseId);
    });
  }, [homeworks, selectedProfileId, visibleCourseIds]);

  const filteredHomeworks = useMemo(() => {
    if (statusFilter === 'pending') return visibleHomeworks.filter(isPending);
    if (statusFilter === 'submitted') return visibleHomeworks.filter(isSubmitted);
    if (statusFilter === 'late') return visibleHomeworks.filter(isLateOrOverdue);
    return visibleHomeworks;
  }, [visibleHomeworks, statusFilter]);

  const homeworksByCourse = useMemo(() => {
    const map = new Map();
    filteredHomeworks.forEach((hw) => {
      const courseId = getCourseIdFromHw(hw);
      if (!courseId) return;
      if (!map.has(courseId)) map.set(courseId, []);
      map.get(courseId).push(hw);
    });
    return map;
  }, [filteredHomeworks]);

  const uncategorizedHomeworks = useMemo(() => filteredHomeworks.filter((hw) => !getCourseIdFromHw(hw)), [filteredHomeworks]);

  const stats = useMemo(() => {
    const pending = visibleHomeworks.filter(isPending).length;
    const submitted = visibleHomeworks.filter(isSubmitted).length;
    const late = visibleHomeworks.filter(isLateOrOverdue).length;
    return {
      courses: visibleCourses.length,
      homeworks: visibleHomeworks.length,
      pending,
      submitted,
      late,
    };
  }, [visibleCourses.length, visibleHomeworks]);

  const statusFilters = [
    { key: 'all', label: 'All', count: visibleHomeworks.length },
    { key: 'pending', label: 'Pending', count: stats.pending },
    { key: 'submitted', label: 'Submitted', count: stats.submitted },
    { key: 'late', label: 'Late', count: stats.late },
  ];

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const payload = {
        subject: courseForm.subject,
        studentProfileId: courseForm.studentProfileId,
        createdBy: user?._id,
      };
      if (courseForm.teacher) payload.teacher = courseForm.teacher;
      if (courseForm.color) payload.color = courseForm.color;
      await request('/api/v1/external-course', 'POST', payload);
      setShowCreateCourse(false);
      setCourseForm(emptyCourseForm);
      await fetchCourses();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const payload = {};
      if (courseForm.subject) payload.subject = courseForm.subject;
      if (courseForm.teacher) payload.teacher = courseForm.teacher;
      if (courseForm.color) payload.color = courseForm.color;
      await request(`/api/v1/external-course/${editCourse._id}`, 'PATCH', payload);
      setEditCourse(null);
      await fetchCourses();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    setFormLoading(true);
    setFormError(null);
    try {
      await request(`/api/v1/external-course/${deleteCourse._id}`, 'DELETE');
      setDeleteCourse(null);
      await fetchCourses();
      await fetchHomeworks();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateHw = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      await request('/api/v1/external-hw', 'POST', {
        title: hwForm.title,
        description: hwForm.description,
        dueDate: hwForm.dueDate,
        externalCourse: hwForm.externalCourse,
        category: hwForm.category,
      });
      setShowCreateHw(false);
      setHwForm(emptyHwForm);
      await fetchHomeworks();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateHw = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const payload = {};
      if (hwForm.title) payload.title = hwForm.title;
      if (hwForm.description) payload.description = hwForm.description;
      if (hwForm.dueDate) payload.dueDate = hwForm.dueDate;
      if (hwForm.category) payload.category = hwForm.category;
      if (hwForm.externalCourse) payload.externalCourse = hwForm.externalCourse;
      await request(`/api/v1/external-hw/${editHw._id}`, 'PATCH', payload);
      setEditHw(null);
      await fetchHomeworks();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteHw = async () => {
    setFormLoading(true);
    setFormError(null);
    try {
      await request(`/api/v1/external-hw/${deleteHw._id}`, 'DELETE');
      setDeleteHw(null);
      await fetchHomeworks();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    setFormLoading(true);
    setFormError(null);
    try {
      await request(`/api/v1/external-hw/${markCompleteHw._id}/complete`, 'PATCH', null);
      setMarkCompleteHw(null);
      await fetchHomeworks();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const openCreateCourse = () => {
    setCourseForm({
      ...emptyCourseForm,
      studentProfileId: selectedProfileId !== 'all' ? selectedProfileId : profileOptions[0]?.id || '',
    });
    setFormError(null);
    setShowCreateCourse(true);
  };

  const openCreateHw = (courseId = '') => {
    setHwForm({ ...emptyHwForm, externalCourse: courseId });
    setFormError(null);
    setShowCreateHw(true);
  };

  const openEditCourse = (course) => {
    setCourseForm({
      teacher: course.teacher || '',
      subject: course.subject || '',
      studentProfileId: getProfileIdFromCourse(course),
      color: course.color || '#10b981',
    });
    setFormError(null);
    setEditCourse(course);
  };

  const openEditHw = (hw) => {
    setHwForm({
      title: hw.title || '',
      description: hw.description || '',
      dueDate: formatDateTimeInput(hw.dueDate),
      externalCourse: getCourseIdFromHw(hw),
      category: hw.category || 'Project',
    });
    setFormError(null);
    setEditHw(hw);
  };

  const renderProfileSelector = () => {
    if (profileOptions.length <= 1) return null;

    return (
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <button
          onClick={() => setSelectedProfileId('all')}
          style={{
            padding: '0.5rem 0.85rem',
            borderRadius: '999px',
            border: selectedProfileId === 'all' ? '1px solid var(--brand-primary)' : '1px solid var(--border-color)',
            background: selectedProfileId === 'all' ? 'var(--brand-light)' : 'var(--bg-secondary)',
            color: selectedProfileId === 'all' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            fontSize: '0.82rem',
            fontWeight: 700,
          }}
        >
          All children
        </button>
        {profileOptions.map((profile) => (
          <button
            key={profile.id}
            onClick={() => setSelectedProfileId(profile.id)}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '999px',
              border: selectedProfileId === profile.id ? '1px solid var(--brand-primary)' : '1px solid var(--border-color)',
              background: selectedProfileId === profile.id ? 'var(--brand-light)' : 'var(--bg-secondary)',
              color: selectedProfileId === profile.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}
          >
            {profile.label}
          </button>
        ))}
      </div>
    );
  };

  const renderStatusFilters = () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
      {statusFilters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => setStatusFilter(filter.key)}
          style={{
            padding: '0.52rem 0.9rem',
            borderRadius: '10px',
            border: statusFilter === filter.key ? '1px solid var(--brand-primary)' : '1px solid var(--border-color)',
            background: statusFilter === filter.key ? 'var(--brand-primary)' : 'var(--bg-secondary)',
            color: statusFilter === filter.key ? '#ffffff' : 'var(--text-secondary)',
            fontSize: '0.82rem',
            fontWeight: 700,
          }}
        >
          {filter.label} ({filter.count})
        </button>
      ))}
    </div>
  );

  const renderHomeworkRow = (hw) => {
    const status = hwStatusStyles[hw.status] || hwStatusStyles.Pending;
    const overdue = isLateOrOverdue(hw);

    return (
      <div
        key={hw._id}
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.3fr) minmax(150px, 0.65fr) minmax(120px, 0.55fr) auto',
          gap: '1rem',
          alignItems: 'center',
          padding: '1rem 0',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <h4 style={{ margin: 0, fontSize: '0.98rem' }}>{hw.title || 'Untitled homework'}</h4>
            <span
              className="modal-badge"
              style={{
                background: overdue && hw.status === 'Pending' ? 'rgba(239,68,68,0.1)' : status.bg,
                color: overdue && hw.status === 'Pending' ? '#ef4444' : status.color,
              }}
            >
              {overdue && hw.status === 'Pending' ? 'Overdue' : status.label}
            </span>
          </div>
          {hw.description && (
            <p style={{ margin: '0.1rem 0 0', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
              {hw.description}
            </p>
          )}
          {hw.submissionLinks?.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.55rem' }}>
              {hw.submissionLinks.map((link, index) => (
                <a
                  key={`${link.url}-${index}`}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="modal-chip"
                  style={{ color: 'var(--brand-primary)', fontSize: '0.78rem' }}
                >
                  <LinkIcon size={13} /> {link.name || 'Submission'}
                </a>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <CalendarDays size={15} /> Due {formatDate(hw.dueDate)}
          </span>
          {hw.submissionDate && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)' }}>
              <CheckCircle2 size={15} /> Submitted {formatDate(hw.submissionDate)}
            </span>
          )}
        </div>

        <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 700 }}>
          {hw.category || 'Other'}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
          {canSubmitHomework && hw.status === 'Pending' && (
            <button
              onClick={() => {
                setFormError(null);
                setMarkCompleteHw(hw);
              }}
              className="modal-btn modal-btn-success"
              style={{ width: 'auto', minWidth: '92px', padding: '0.48rem 0.75rem' }}
            >
              <CheckCircle2 size={15} /> Done
            </button>
          )}
          {canManageHw && (
            <>
              <button onClick={() => openEditHw(hw)} style={iconButtonStyle} aria-label="Edit homework">
                <Pencil size={15} />
              </button>
              <button
                onClick={() => {
                  setFormError(null);
                  setDeleteHw(hw);
                }}
                style={{ ...iconButtonStyle, color: 'var(--error)' }}
                aria-label="Delete homework"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const toggleCourseExpand = (courseId) => {
    setExpandedCourses(prev => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  };

  const renderCoursePanel = (course) => {
    const courseHomeworks = homeworksByCourse.get(course._id) || [];
    const allCourseHomeworks = visibleHomeworks.filter((hw) => getCourseIdFromHw(hw) === course._id);
    const submittedCount = allCourseHomeworks.filter(isSubmitted).length;
    const pendingCount = allCourseHomeworks.filter(isPending).length;
    const lateCount = allCourseHomeworks.filter(isLateOrOverdue).length;
    const progress = allCourseHomeworks.length ? Math.round((submittedCount / allCourseHomeworks.length) * 100) : 0;
    const color = course.color || '#10b981';
    const isExpanded = expandedCourses.has(course._id);

    return (
      <section
        key={course._id}
        className="glass-panel"
        style={{
          borderRadius: '14px',
          padding: 0,
          borderLeft: `5px solid ${color}`,
          overflow: 'hidden',
          transition: 'box-shadow 0.2s ease',
        }}
      >
        {/* ─── Clickable Course Header (Accordion Toggle) ─── */}
        <div
          onClick={() => toggleCourseExpand(course._id)}
          style={{
            padding: '1.25rem',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color, marginBottom: '0.35rem' }}>
                <BookOpen size={20} />
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{course.subject || 'External course'}</h2>
                {/* Expand/Collapse arrow */}
                <span style={{
                  marginLeft: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)',
                  transition: 'transform 0.25s ease',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  display: 'inline-block',
                }}>▼</span>
              </div>
              <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <UserRound size={15} /> {course.teacher || 'No teacher'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <GraduationCap size={15} /> {getStudentNameFromCourse(course)}
                </span>
              </div>
            </div>

            {/* Quick Stats Badges (always visible) */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
              <span style={{
                padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700,
                background: 'rgba(16,185,129,0.12)', color: '#10b981',
              }}>
                ✓ {submittedCount}
              </span>
              {pendingCount > 0 && (
                <span style={{
                  padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700,
                  background: 'rgba(245,158,11,0.12)', color: '#f59e0b',
                }}>
                  ⏳ {pendingCount}
                </span>
              )}
              {lateCount > 0 && (
                <span style={{
                  padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700,
                  background: 'rgba(239,68,68,0.12)', color: '#ef4444',
                }}>
                  ⚠ {lateCount}
                </span>
              )}
            </div>

            {/* Action Buttons (stop propagation so click doesn't toggle) */}
            <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
              {canManageHw && (
                <button
                  onClick={() => openCreateHw(course._id)}
                  style={{
                    ...iconButtonStyle,
                    width: 'auto',
                    padding: '0 0.7rem',
                    color: 'var(--brand-primary)',
                    fontWeight: 700,
                  }}
                  title="Add Homework"
                >
                  <Plus size={15} /> HW
                </button>
              )}
              {canManageCourses && (
                <>
                  <button onClick={() => openEditCourse(course)} style={iconButtonStyle} aria-label="Edit course">
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => {
                      setFormError(null);
                      setDeleteCourse(course);
                    }}
                    style={{ ...iconButtonStyle, color: 'var(--error)' }}
                    aria-label="Delete course"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Progress Bar (always visible) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center', marginTop: '0.85rem' }}>
            <div style={{ height: '8px', borderRadius: '999px', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: color, borderRadius: '999px', transition: 'width 0.4s ease' }} />
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700 }}>
              {submittedCount}/{allCourseHomeworks.length} submitted
            </span>
          </div>
        </div>

        {/* ─── Collapsible Homework Section ─── */}
        <div style={{
          maxHeight: isExpanded ? '2000px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.35s ease',
          borderTop: isExpanded ? '2px solid var(--border-color)' : '0px solid transparent',
        }}>
          <div style={{ padding: '0.5rem 1.25rem 1.25rem' }}>
            {courseHomeworks.length === 0 ? (
              <div style={{ padding: '1rem 0 0.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {statusFilter === 'all' ? 'No homework assigned yet.' : 'No homework matches this filter.'}
              </div>
            ) : (
              <div>{courseHomeworks.map(renderHomeworkRow)}</div>
            )}
          </div>
        </div>
      </section>
    );
  };

  const renderCourseSelect = (value, onChange, required = true) => (
    <select className="modal-select" required={required} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Choose a course</option>
      {courses.map((course) => (
        <option key={course._id} value={course._id}>
          {course.subject} - {getStudentNameFromCourse(course)}
        </option>
      ))}
    </select>
  );

  const renderProfileInput = () => {
    if (profileOptions.length > 0) {
      return (
        <select
          className="modal-select"
          required
          value={courseForm.studentProfileId}
          onChange={(e) => setCourseForm({ ...courseForm, studentProfileId: e.target.value })}
        >
          <option value="">Choose a student</option>
          {profileOptions.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.label}{profile.grade ? ` - Grade ${profile.grade}` : ''}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        className="modal-input"
        required
        value={courseForm.studentProfileId}
        onChange={(e) => setCourseForm({ ...courseForm, studentProfileId: e.target.value })}
        placeholder="Student profile ObjectId"
      />
    );
  };

  const loading = coursesLoading || hwLoading || profilesLoading;
  const error = coursesError || hwError || profilesError;

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>External Courses & Homework</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.35rem 0 0' }}>
            Courses are grouped with their related homework.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {canManageCourses && (
            <button onClick={openCreateCourse} className="modal-btn modal-btn-primary" style={{ width: 'auto', padding: '0.62rem 1rem' }}>
              <Plus size={17} /> Add Course
            </button>
          )}
          {canManageHw && (
            <button onClick={() => openCreateHw()} className="modal-btn modal-btn-info" style={{ width: 'auto', padding: '0.62rem 1rem' }}>
              <Plus size={17} /> Add Homework
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Courses', value: stats.courses, icon: BookOpen, color: 'var(--info)' },
          { label: 'Homework', value: stats.homeworks, icon: CalendarDays, color: 'var(--brand-primary)' },
          { label: 'Pending', value: stats.pending, icon: Clock3, color: 'var(--warning)' },
          { label: 'Submitted', value: stats.submitted, icon: CheckCircle2, color: 'var(--success)' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="glass-panel" style={{ borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'grid', placeItems: 'center', color: item.color, background: 'var(--bg-tertiary)' }}>
                <Icon size={19} />
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', lineHeight: 1, fontWeight: 800 }}>{item.value}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700 }}>{item.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {renderProfileSelector()}
      {renderStatusFilters()}

      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading courses and homework...</p>}
      {error && <p style={{ color: 'var(--error)' }}>{error}</p>}

      {!loading && !visibleCourses.length && !uncategorizedHomeworks.length && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '14px' }}>
          <BookOpen size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
          <h3>No external courses found</h3>
          <p style={{ color: 'var(--text-muted)' }}>External courses will appear here once they are assigned.</p>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {visibleCourses.map(renderCoursePanel)}

        {uncategorizedHomeworks.length > 0 && (
          <section className="glass-panel" style={{ borderRadius: '14px', padding: '1.25rem', borderLeft: '5px solid #64748b' }}>
            <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Uncategorized Homework</h2>
            <p style={{ margin: '0.25rem 0 0.5rem', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              Homework without a course link.
            </p>
            {uncategorizedHomeworks.map(renderHomeworkRow)}
          </section>
        )}
      </div>

      <Modal isOpen={showCreateCourse} onClose={() => setShowCreateCourse(false)} title="Add External Course" size="md">
        <form onSubmit={handleCreateCourse}>
          {formError && <div className="modal-error">{formError}</div>}
          <div className="modal-form-group">
            <label className="modal-label">Subject</label>
            <input className="modal-input" required value={courseForm.subject} onChange={(e) => setCourseForm({ ...courseForm, subject: e.target.value })} placeholder="Mathematics" />
          </div>
          <div className="modal-form-group">
            <label className="modal-label">Teacher</label>
            <input className="modal-input" value={courseForm.teacher} onChange={(e) => setCourseForm({ ...courseForm, teacher: e.target.value })} placeholder="Teacher name" />
          </div>
          <div className="modal-form-group">
            <label className="modal-label">Student</label>
            {renderProfileInput()}
          </div>
          <div className="modal-form-group">
            <label className="modal-label">Color</label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input type="color" value={courseForm.color} onChange={(e) => setCourseForm({ ...courseForm, color: e.target.value })} style={{ width: '48px', height: '36px', border: 'none', cursor: 'pointer', borderRadius: '8px' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontFamily: 'monospace' }}>{courseForm.color}</span>
            </div>
          </div>
          <button type="submit" disabled={formLoading} className="modal-btn modal-btn-primary">
            {formLoading ? 'Creating...' : 'Create Course'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={!!editCourse} onClose={() => setEditCourse(null)} title={`Edit - ${editCourse?.subject || 'Course'}`} size="md">
        <form onSubmit={handleUpdateCourse}>
          {formError && <div className="modal-error">{formError}</div>}
          <div className="modal-form-group">
            <label className="modal-label">Subject</label>
            <input className="modal-input" value={courseForm.subject} onChange={(e) => setCourseForm({ ...courseForm, subject: e.target.value })} />
          </div>
          <div className="modal-form-group">
            <label className="modal-label">Teacher</label>
            <input className="modal-input" value={courseForm.teacher} onChange={(e) => setCourseForm({ ...courseForm, teacher: e.target.value })} />
          </div>
          <div className="modal-form-group">
            <label className="modal-label">Color</label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input type="color" value={courseForm.color} onChange={(e) => setCourseForm({ ...courseForm, color: e.target.value })} style={{ width: '48px', height: '36px', border: 'none', cursor: 'pointer', borderRadius: '8px' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontFamily: 'monospace' }}>{courseForm.color}</span>
            </div>
          </div>
          <button type="submit" disabled={formLoading} className="modal-btn modal-btn-info">
            {formLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={!!deleteCourse} onClose={() => setDeleteCourse(null)} title="Delete Course" size="sm">
        <p className="modal-warning-text">Delete <strong>{deleteCourse?.subject}</strong>?</p>
        <p className="modal-warning-sub">This is permanent.</p>
        {formError && <div className="modal-error">{formError}</div>}
        <div className="modal-actions">
          <button onClick={() => setDeleteCourse(null)} className="modal-btn modal-btn-ghost">Cancel</button>
          <button onClick={handleDeleteCourse} disabled={formLoading} className="modal-btn modal-btn-danger">
            {formLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={showCreateHw} onClose={() => setShowCreateHw(false)} title="Add Homework" size="lg">
        <form onSubmit={handleCreateHw}>
          {formError && <div className="modal-error">{formError}</div>}
          <div className="modal-form-group">
            <label className="modal-label">Title</label>
            <input className="modal-input" required value={hwForm.title} onChange={(e) => setHwForm({ ...hwForm, title: e.target.value })} placeholder="Homework title" />
          </div>
          <div className="modal-form-group">
            <label className="modal-label">Description</label>
            <textarea className="modal-textarea" value={hwForm.description} onChange={(e) => setHwForm({ ...hwForm, description: e.target.value })} placeholder="Description" />
          </div>
          <div className="modal-row modal-row-2">
            <div className="modal-form-group">
              <label className="modal-label">Due Date</label>
              <input className="modal-input" type="datetime-local" required value={hwForm.dueDate} onChange={(e) => setHwForm({ ...hwForm, dueDate: e.target.value })} />
            </div>
            <div className="modal-form-group">
              <label className="modal-label">Category</label>
              <select className="modal-select" value={hwForm.category} onChange={(e) => setHwForm({ ...hwForm, category: e.target.value })}>
                <option value="Essay">Essay</option>
                <option value="Project">Project</option>
                <option value="Quiz">Quiz</option>
                <option value="Lab">Lab</option>
                <option value="Presentation">Presentation</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="modal-form-group">
            <label className="modal-label">External Course</label>
            {courses.length ? renderCourseSelect(hwForm.externalCourse, (value) => setHwForm({ ...hwForm, externalCourse: value })) : (
              <input className="modal-input" required value={hwForm.externalCourse} onChange={(e) => setHwForm({ ...hwForm, externalCourse: e.target.value })} placeholder="Course ObjectId" />
            )}
          </div>
          <button type="submit" disabled={formLoading} className="modal-btn modal-btn-primary">
            {formLoading ? 'Creating...' : 'Create Homework'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={!!editHw} onClose={() => setEditHw(null)} title={`Edit - ${editHw?.title || 'Homework'}`} size="lg">
        <form onSubmit={handleUpdateHw}>
          {formError && <div className="modal-error">{formError}</div>}
          <div className="modal-form-group">
            <label className="modal-label">Title</label>
            <input className="modal-input" value={hwForm.title} onChange={(e) => setHwForm({ ...hwForm, title: e.target.value })} />
          </div>
          <div className="modal-form-group">
            <label className="modal-label">Description</label>
            <textarea className="modal-textarea" value={hwForm.description} onChange={(e) => setHwForm({ ...hwForm, description: e.target.value })} />
          </div>
          <div className="modal-row modal-row-2">
            <div className="modal-form-group">
              <label className="modal-label">Due Date</label>
              <input className="modal-input" type="datetime-local" value={hwForm.dueDate} onChange={(e) => setHwForm({ ...hwForm, dueDate: e.target.value })} />
            </div>
            <div className="modal-form-group">
              <label className="modal-label">Category</label>
              <select className="modal-select" value={hwForm.category} onChange={(e) => setHwForm({ ...hwForm, category: e.target.value })}>
                <option value="Essay">Essay</option>
                <option value="Project">Project</option>
                <option value="Quiz">Quiz</option>
                <option value="Lab">Lab</option>
                <option value="Presentation">Presentation</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="modal-form-group">
            <label className="modal-label">External Course</label>
            {courses.length ? renderCourseSelect(hwForm.externalCourse, (value) => setHwForm({ ...hwForm, externalCourse: value }), false) : (
              <input className="modal-input" value={hwForm.externalCourse} onChange={(e) => setHwForm({ ...hwForm, externalCourse: e.target.value })} />
            )}
          </div>
          <button type="submit" disabled={formLoading} className="modal-btn modal-btn-info">
            {formLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={!!deleteHw} onClose={() => setDeleteHw(null)} title="Delete Homework" size="sm">
        <p className="modal-warning-text">Delete <strong>{deleteHw?.title}</strong>?</p>
        <p className="modal-warning-sub">This is permanent.</p>
        {formError && <div className="modal-error">{formError}</div>}
        <div className="modal-actions">
          <button onClick={() => setDeleteHw(null)} className="modal-btn modal-btn-ghost">Cancel</button>
          <button onClick={handleDeleteHw} disabled={formLoading} className="modal-btn modal-btn-danger">
            {formLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!markCompleteHw} onClose={() => setMarkCompleteHw(null)} title="Mark as Complete" size="sm">
        <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
            Mark <strong>{markCompleteHw?.title}</strong> as done?
          </p>
          {formError && <div className="modal-error">{formError}</div>}
          <div className="modal-actions" style={{ justifyContent: 'center' }}>
            <button onClick={() => setMarkCompleteHw(null)} className="modal-btn modal-btn-ghost">Cancel</button>
            <button
              onClick={handleMarkComplete}
              disabled={formLoading}
              className="modal-btn modal-btn-success"
            >
              {formLoading ? 'Saving...' : '✓ Mark Complete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExternalCoursesPage;

