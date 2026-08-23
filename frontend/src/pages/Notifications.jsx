import React, { useEffect, useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Music2,
  Megaphone,
  Info,
  AlertCircle,
  Loader2,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

export default function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState('');

  // ============================================================
  // FETCH NOTIFICATIONS
  // ============================================================

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/notifications');

      console.log('NOTIFICATIONS API RESPONSE:', response.data);

      if (response.data?.success) {
        setNotifications(
          Array.isArray(response.data.notifications)
            ? response.data.notifications
            : []
        );
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);

      setError(
        err.response?.data?.message ||
          'Unable to load notifications'
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD ON PAGE OPEN
  // ============================================================

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ============================================================
  // MARK ONE AS READ
  // ============================================================

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);

      setNotifications((previous) =>
        previous.map((notification) =>
          String(notification.id) === String(id)
            ? {
                ...notification,
                is_read: true,
                read: true,
              }
            : notification
        )
      );
    } catch (err) {
      console.error(
        'Failed to mark notification as read:',
        err
      );
    }
  };

  // ============================================================
  // MARK ALL AS READ
  // ============================================================

  const markAllAsRead = async () => {
    try {
      setMarkingAll(true);

      await api.put('/notifications/read-all');

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: true,
          read: true,
        }))
      );
    } catch (err) {
      console.error(
        'Failed to mark all notifications as read:',
        err
      );
    } finally {
      setMarkingAll(false);
    }
  };

  // ============================================================
  // DELETE NOTIFICATION
  // ============================================================

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);

      setNotifications((previous) =>
        previous.filter(
          (notification) =>
            String(notification.id) !== String(id)
        )
      );
    } catch (err) {
      console.error(
        'Failed to delete notification:',
        err
      );
    }
  };

  // ============================================================
  // CHECK READ STATUS
  // ============================================================

  const isNotificationRead = (notification) => {
    return (
      notification.is_read === true ||
      notification.read === true ||
      notification.isRead === true
    );
  };

  // ============================================================
  // NOTIFICATION ICON
  // ============================================================

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'song':
      case 'new_song':
      case 'music':
        return (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
            <Music2 className="h-5 w-5 text-emerald-400" />
          </div>
        );

      case 'announcement':
      case 'admin':
        return (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
            <Megaphone className="h-5 w-5 text-cyan-400" />
          </div>
        );

      case 'warning':
        return (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
            <AlertCircle className="h-5 w-5 text-amber-400" />
          </div>
        );

      default:
        return (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800">
            <Info className="h-5 w-5 text-slate-400" />
          </div>
        );
    }
  };

  // ============================================================
  // DATE FORMAT
  // ============================================================

  const formatDate = (date) => {
    if (!date) return '';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return parsedDate.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ============================================================
  // UNREAD COUNT
  // ============================================================

  const unreadCount = notifications.filter(
    (notification) =>
      !isNotificationRead(notification)
  ).length;

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-68px)] bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">

          <div className="flex items-center justify-between">
            <div>
              <div className="h-7 w-48 animate-pulse rounded-lg bg-slate-800" />
              <div className="mt-2 h-4 w-64 animate-pulse rounded bg-slate-900" />
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60"
              />
            ))}
          </div>

        </div>
      </main>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="min-h-[calc(100vh-68px)] bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-4xl">

        {/* ====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                border border-slate-800
                bg-slate-900
                text-slate-400
                transition
                hover:border-slate-700
                hover:bg-slate-800
                hover:text-white
              "
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div>

              <div className="flex items-center gap-2">

                <Bell className="h-6 w-6 text-emerald-400" />

                <h1 className="text-2xl font-black text-white">
                  Notifications
                </h1>

              </div>

              <p className="mt-1 text-sm text-slate-500">
                Stay updated with everything happening on Fackify.
              </p>

            </div>

          </div>

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={fetchNotifications}
              className="
                flex items-center gap-2
                rounded-xl
                border border-slate-800
                bg-slate-900
                px-3 py-2
                text-xs font-semibold
                text-slate-400
                transition
                hover:bg-slate-800
                hover:text-white
              "
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={markingAll}
                className="
                  flex items-center gap-2
                  rounded-xl
                  border border-emerald-500/20
                  bg-emerald-500/10
                  px-3 py-2
                  text-xs font-semibold
                  text-emerald-400
                  transition
                  hover:bg-emerald-500/15
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {markingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCheck className="h-4 w-4" />
                )}

                Mark all read
              </button>
            )}

          </div>

        </div>

        {/* ====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">

            <div className="flex items-center gap-3">

              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />

              <div>
                <p className="text-sm font-semibold text-rose-300">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={fetchNotifications}
                  className="mt-1 text-xs font-semibold text-rose-400 underline"
                >
                  Try again
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ====================================================
            STATS
        ===================================================== */}

        <div className="mt-8 grid grid-cols-2 gap-3">

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">

            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
              Total
            </p>

            <p className="mt-1 text-2xl font-black text-white">
              {notifications.length}
            </p>

          </div>

          <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.03] p-4">

            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
              Unread
            </p>

            <p className="mt-1 text-2xl font-black text-emerald-400">
              {unreadCount}
            </p>

          </div>

        </div>

        {/* ====================================================
            EMPTY
        ===================================================== */}

        {!error && notifications.length === 0 && (
          <div className="mt-6 rounded-3xl border border-slate-800/80 bg-slate-900/40 px-6 py-16 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/70">

              <Bell className="h-7 w-7 text-slate-600" />

            </div>

            <h2 className="mt-5 text-lg font-bold text-white">
              You're all caught up
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              You don't have any notifications right now.
              New songs and announcements will appear here.
            </p>

          </div>
        )}

        {/* ====================================================
            NOTIFICATIONS
        ===================================================== */}

        {notifications.length > 0 && (
          <div className="mt-6 space-y-3">

            {notifications.map((notification) => {

              const read =
                isNotificationRead(notification);

              return (
                <article
                  key={notification.id}
                  className={`
                    group relative
                    overflow-hidden
                    rounded-2xl
                    border
                    p-4
                    transition-all duration-300
                    ${
                      read
                        ? 'border-slate-800/80 bg-slate-900/40'
                        : 'border-emerald-500/20 bg-emerald-500/[0.04] shadow-lg shadow-emerald-500/[0.02]'
                    }
                  `}
                >

                  {!read && (
                    <span className="absolute left-0 top-0 h-full w-0.5 bg-emerald-400" />
                  )}

                  <div className="flex gap-4">

                    {getNotificationIcon(
                      notification.type
                    )}

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <h2 className="truncate text-sm font-bold text-white">
                              {notification.title ||
                                'Notification'}
                            </h2>

                            {!read && (
                              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                                New
                              </span>
                            )}

                          </div>

                          <p className="mt-1 text-sm leading-6 text-slate-400">
                            {notification.message || ''}
                          </p>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            deleteNotification(
                              notification.id
                            )
                          }
                          title="Delete notification"
                          className="
                            shrink-0
                            rounded-lg
                            p-2
                            text-slate-600
                            opacity-0
                            transition
                            hover:bg-rose-500/10
                            hover:text-rose-400
                            group-hover:opacity-100
                          "
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">

                        <p className="text-[10px] font-medium text-slate-600">
                          {formatDate(
                            notification.created_at ||
                              notification.createdAt
                          )}
                        </p>

                        {!read && (
                          <button
                            type="button"
                            onClick={() =>
                              markAsRead(
                                notification.id
                              )
                            }
                            className="
                              flex items-center gap-1.5
                              rounded-lg
                              px-2.5 py-1.5
                              text-[10px]
                              font-bold
                              text-emerald-400
                              transition
                              hover:bg-emerald-500/10
                            "
                          >
                            <Check className="h-3.5 w-3.5" />
                            Mark as read
                          </button>
                        )}

                      </div>

                    </div>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </div>

    </main>
  );
}