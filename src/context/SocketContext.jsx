import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useApiRequest } from '../hooks/useApiRequest';
import { getSocketUrl } from '../utils/apiUrl';
import { normalizeAppLink } from '../utils/appLinks';
import { notificationIcon } from '../utils/notificationIcons';

const SocketContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);

const getNotificationDetails = (type) => {
  const bgColors = {
    schedule_reminder: 'var(--accent-orange, #f97316)',
    new_session: 'var(--brand-primary, #2563eb)',
    schedule_updated: 'var(--accent-blue, #3b82f6)',
    new_task: 'var(--accent-purple, #a855f7)',
    xp_earned: 'var(--accent-yellow, #eab308)',
    level_up: 'var(--success, #22c55e)',
    badge_unlocked: 'var(--accent-rose, #ec4899)',
    new_submission: 'var(--accent-teal, #14b8a6)',
    new_message: 'var(--accent-indigo, #6366f1)',
    canvas_shared: 'var(--accent-purple, #a855f7)',
  };
  return {
    icon: notificationIcon(type).icon,
    bgColor: bgColors[type] || 'var(--brand-primary, #2563eb)',
  };
};

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const { request } = useApiRequest();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [toasts, setToasts] = useState([]);

  // The connection effect below depends on this, not on `user`. AuthContext
  // rebuilds the user object from the /auth/me response on every hydration and
  // every token refresh, so depending on the object itself tore down and
  // rebuilt the whole socket each time — dropping notifications in the gap.
  // The role is the only field the effect actually reads.
  const userRole = user?.role;

  // Centralized Notification States
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const addToast = (toast) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id, link: normalizeAppLink(toast.link) }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await request('/api/v1/notifications/unread-count');
      setUnreadCount(res.data?.unreadCount ?? 0);
    } catch { /* silently handle */ }
  }, [token, request]);

  const fetchNotifications = useCallback(async (query = {}) => {
    if (!token) return { data: [], total: 0, totalPages: 1 };
    setLoading(true);
    try {
      const queryString = new URLSearchParams(query).toString();
      const url = `/api/v1/notifications${queryString ? `?${queryString}` : ''}`;
      const res = await request(url);
      const list = Array.isArray(res.data) ? res.data.map((n) => ({
        ...n,
        link: normalizeAppLink(n.link),
      })) : [];
      // Overwrite global recent notifications only for page 1 or initial load
      if (!query.page || query.page === 1) {
        setNotifications(list);
      }
      return {
        data: list,
        total: res.total || list.length,
        totalPages: res.totalPages || 1
      };
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      return { data: [], total: 0, totalPages: 1 };
    } finally {
      setLoading(false);
    }
  }, [token, request]);

  const markAsRead = useCallback(async (id) => {
    try {
      await request(`/api/v1/notifications/${id}/read`, 'PATCH');
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, [request]);

  const markAllRead = useCallback(async () => {
    try {
      await request('/api/v1/notifications/read-all', 'PATCH');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, [request]);

  // Fetch initial unread count on login
  useEffect(() => {
    if (token) {
      fetchUnreadCount();
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const backendUrl = getSocketUrl();
    
    const newSocket = io(backendUrl, {
      auth: {
        token: token
      },
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Socket.io connected with ID:', newSocket.id);
      setSocket(newSocket);
    });

    // Without these, a failed handshake was completely silent from the app's
    // side: nothing logged, `socket` stayed null forever, and the only clue was
    // the raw WebSocket error the browser itself prints. A rejected handshake
    // (expired token, deactivated account) and an unroutable /socket.io/ path
    // looked identical — like nothing had happened at all.
    newSocket.on('connect_error', (err) => {
      console.error(
        `Socket.io connection failed (${newSocket.io.engine?.transport?.name ?? 'unknown transport'}):`,
        err.message,
      );
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('Socket.io disconnected:', reason);
      // "io server disconnect" means the server dropped us deliberately — an
      // expired access token, or an account that is no longer active. The
      // client does not auto-reconnect from that state, and it should not:
      // reconnecting needs a fresh token, which arrives as a new `token` value
      // and re-runs this effect.
      if (reason === 'io server disconnect') setSocket(null);
    });

    // Handle generic notifications
    newSocket.on('notification', (notif) => {
      const normalizedNotif = {
        ...notif,
        link: normalizeAppLink(notif.link),
      };
      // 1. Increment count
      setUnreadCount((prev) => prev + 1);

      // 2. Prepend
      setNotifications((prev) => [normalizedNotif, ...prev]);

      // 3. Optional Toast: Suppress gamification toasts for student role to avoid duplication
      const isStudent = userRole === 'student';
      const isGamification = ['xp_earned', 'level_up', 'badge_unlocked'].includes(normalizedNotif.type);

      if (!(isStudent && isGamification)) {
        const details = getNotificationDetails(normalizedNotif.type);
        addToast({
          type: 'notification',
          title: normalizedNotif.title,
          message: normalizedNotif.message,
          icon: details.icon,
          bgColor: details.bgColor,
          link: normalizedNotif.link
        });
      }
    });

    newSocket.on('xp:earned', (data) => {
      addToast({
        type: 'xp',
        title: `+${data.amount} XP Earned!`,
        message: `Reason: ${data.reason ? data.reason.replace(/_/g, ' ') : 'Task completion'}`,
        icon: 'fa-solid fa-bolt',
        bgColor: 'var(--accent-yellow)',
        data
      });
    });

    newSocket.on('level:up', (data) => {
      addToast({
        type: 'level',
        title: `Level Up!`,
        message: `Congratulations! You reached Level ${data.newLevel}!`,
        icon: 'fa-solid fa-crown',
        bgColor: 'var(--success)',
        data
      });
    });

    newSocket.on('badge:unlocked', (data) => {
      addToast({
        type: 'badge',
        title: `Badge Unlocked: ${data.name}!`,
        message: `Rare ${data.rarity} badge unlocked (+${data.xpReward} XP)`,
        icon: 'fa-solid fa-award',
        bgColor: 'var(--accent-rose)',
        data
      });
    });

    return () => {
      newSocket.removeAllListeners();
      newSocket.disconnect();
      setSocket(null);
    };
  }, [token, userRole]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllRead,
      }}
    >
      {children}

      {/* Floating Neo-Brutalist Toasts */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '350px',
        width: '100%',
        pointerEvents: 'none'
      }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => {
              if (toast.link) {
                navigate(toast.link);
                removeToast(toast.id);
              }
            }}
            style={{
              pointerEvents: 'auto',
              background: toast.bgColor || 'var(--card-bg)',
              color: 'var(--text-primary)',
              border: '3px solid var(--border-color)',
              boxShadow: 'var(--shadow-md)',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
              animation: 'popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
              position: 'relative',
              cursor: toast.link ? 'pointer' : 'default',
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            }}
            onMouseEnter={e => {
              if (toast.link) {
                e.currentTarget.style.transform = 'translate(-2px, -2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }
            }}
            onMouseLeave={e => {
              if (toast.link) {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }
            }}
          >
            <span style={{ fontSize: '1.5rem', flexShrink: 0, color: toast.bgColor }}>
              {typeof toast.icon === 'string' && toast.icon.startsWith('fa-')
                ? <i className={toast.icon} />
                : toast.icon}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{toast.title}</h4>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{toast.message}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '1.25rem',
                cursor: 'pointer',
                padding: '0.25rem',
                lineHeight: 1,
                alignSelf: 'flex-start',
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </SocketContext.Provider>
  );
};
