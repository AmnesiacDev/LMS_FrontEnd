import React, { useState, useEffect, useCallback } from 'react';
import { useApiRequest } from '../../hooks/useApiRequest';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/Pagination/Pagination';
import './Achievements.css';

const REASON_ICONS = {
  task_submit: '📝',
  perfect_score: '💯',
  attendance: '📅',
  quiz_complete: '🧠',
  lesson_complete: '📚',
  challenge_solved: '🧩',
  puzzle_solved: '🧩',
  exam_passed: '🎓',
  badge_unlocked: '🏆',
  streak_bonus: '🔥',
};

const STAT_LABELS = {
  tasksSubmitted: 'Tasks Submitted',
  tasksOnTime: 'On-Time Tasks',
  perfectScores: 'Perfect Scores',
  sessionsAttended: 'Sessions Attended',
  challengesSolved: 'Challenges Solved',
  puzzlesSolved: 'Puzzles Solved',
  examsAbovePassing: 'Exams Passed',
};

const formatReason = (r = '') => r.replace(/_/g, ' ');
const listFromEnvelope = (payload, key) => {
  if (Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload)) return payload;
  return [];
};

const formatDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
};

const AchievementsPage = () => {
  const { request } = useApiRequest();
  const { socket } = useSocket();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHistory, setTotalHistory] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfileAndBadges = useCallback(async () => {
    const [profRes, badgeRes] = await Promise.all([
      request('/api/v1/gamification/me'),
      request('/api/v1/gamification/me/badges'),
    ]);
    if (profRes.status === 'success') setProfile(profRes.data);
    if (badgeRes.status === 'success') setBadges(listFromEnvelope(badgeRes.data, 'badges'));
  }, [request]);

  const fetchHistory = useCallback(async () => {
    const res = await request(`/api/v1/gamification/me/history?page=${page}&limit=${limit}`);
    if (res.status === 'success') {
      const feed = Array.isArray(res.data) ? res.data : [];
      const total = res.total ?? res.results ?? feed.length;
      const pageSize = res.limit ?? limit;
      setHistory(feed);
      setTotalPages(res.totalPages || Math.max(1, Math.ceil(total / pageSize)));
      setTotalHistory(total);
    }
  }, [request, page, limit]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        await Promise.all([fetchProfileAndBadges(), fetchHistory()]);
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load achievements.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch the feed when page / limit changes
  useEffect(() => {
    fetchHistory().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  // Live updates via socket
  useEffect(() => {
    if (!socket) return;

    const onXp = (data) => {
      setProfile((prev) => (prev ? { ...prev, xp: data.totalXP, level: data.level } : prev));
      // Prepend to the feed only on the first page to keep ordering sane
      setHistory((prev) => {
        if (page !== 1) return prev;
        return [{
          amount: data.amount,
          reason: data.reason,
          awardedAt: new Date().toISOString(),
          _id: `live-${Date.now()}`,
        }, ...prev].slice(0, limit);
      });
    };

    const onBadge = (data) => {
      setProfile((prev) => (prev ? { ...prev, badgeCount: (prev.badgeCount || 0) + 1 } : prev));
      setBadges((prev) => [{
        _id: `live-${Date.now()}`,
        unlockedAt: new Date().toISOString(),
        badge: {
          name: data.name,
          icon: data.icon,
          rarity: data.rarity,
          xpReward: data.xpReward,
          description: 'Newly unlocked!',
        },
      }, ...prev]);
    };

    socket.on('xp:earned', onXp);
    socket.on('badge:unlocked', onBadge);
    return () => {
      socket.off('xp:earned', onXp);
      socket.off('badge:unlocked', onBadge);
    };
  }, [socket, page, limit]);

  if (loading) {
    return (
      <div className="achievements-container" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏆</div>
        <h2>Loading your achievements...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="achievements-container" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
        <h2>Oops!</h2>
        <p style={{ color: 'var(--error)', fontWeight: 'bold' }}>{error}</p>
      </div>
    );
  }

  const xpInLevel = profile ? profile.xp % 100 : 0;
  const stats = profile?.stats || {};

  return (
    <div className="achievements-container">
      <div>
        <h1 className="page-title">🏆 My Achievements</h1>
        <p className="page-subtitle">
          {user?.FullName ? `${user.FullName}, here` : 'Here'} are your badges, XP, and recent activity.
        </p>
      </div>

      {/* Hero stats */}
      {profile && (
        <div className="ach-hero">
          <div className="ach-level-disc">
            <span className="lvl-num">{profile.level}</span>
            <span className="lvl-lbl">Level</span>
          </div>
          <div className="ach-hero-main">
            <div className="ach-xp-row">
              <span>{xpInLevel} / 100 XP to next level</span>
              <span>{profile.lifetimeXP ?? profile.xp} lifetime XP</span>
            </div>
            <div className="nb-progress" style={{ height: '14px', border: '2px solid var(--border-color)' }}>
              <div className="nb-progress-fill" style={{ width: `${Math.min(100, xpInLevel)}%`, background: 'var(--brand-primary)', transition: 'width 0.4s ease' }} />
            </div>
            <div className="ach-quickstats">
              <span className="ach-quickstat">🔥 {profile.currentStreak}d streak</span>
              <span className="ach-quickstat">🏅 record {profile.longestStreak}d</span>
              <span className="ach-quickstat">🎖️ {profile.badgeCount} badges</span>
            </div>
          </div>
        </div>
      )}

      {/* Lifetime stats grid */}
      {Object.keys(stats).length > 0 && (
        <section>
          <h2 className="ach-section-title">📊 Lifetime Stats</h2>
          <div className="ach-stats-grid">
            {Object.entries(stats).map(([key, val]) => (
              <div key={key} className="ach-stat-card">
                <div className="num">{val}</div>
                <div className="lbl">{STAT_LABELS[key] || key}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Badges */}
      <section>
        <h2 className="ach-section-title">🎖️ Badges ({badges.length})</h2>
        {badges.length === 0 ? (
          <div className="ach-empty">
            No badges yet. Submit tasks, ace quizzes, and solve challenges to earn your first one!
          </div>
        ) : (
          <div className="badge-grid">
            {badges.map((entry) => {
              const b = entry.badge || {};
              const rarity = (b.rarity || 'common').toLowerCase();
              return (
                <div key={entry._id} className="badge-card" title={`Unlocked ${formatDate(entry.unlockedAt)}`}>
                  <span className="badge-icon">{b.icon || '🏅'}</span>
                  <span className="badge-name">{b.name}</span>
                  {b.description && <span className="badge-desc">{b.description}</span>}
                  <span className={`badge-rarity ${rarity}`}>{rarity}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* XP history feed */}
      <section>
        <h2 className="ach-section-title">⚡ Recent Activity</h2>
        {history.length === 0 ? (
          <div className="ach-empty">No XP activity yet. Get started to see your history here!</div>
        ) : (
          <>
            <div className="xp-feed">
              {history.map((item) => (
                <div key={item._id} className="xp-feed-row">
                  <span className="xp-feed-icon">{REASON_ICONS[item.reason] || '⚡'}</span>
                  <div className="xp-feed-main">
                    <div className="xp-feed-reason">{formatReason(item.reason)}</div>
                    <div className="xp-feed-date">{formatDate(item.awardedAt)}</div>
                  </div>
                  <span className="xp-feed-amount">+{item.amount}</span>
                </div>
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={totalHistory}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={(n) => { setLimit(n); setPage(1); }}
            />
          </>
        )}
      </section>
    </div>
  );
};

export default AchievementsPage;
