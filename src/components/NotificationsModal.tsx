import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AppNotification, Habit, NotificationAction, NotificationKind, NotificationOrigin } from '../types';
import {
  NotificationDayGroup,
  calculateCleanTime,
  formatFullDateTime,
  formatRelativeTime,
  getNotificationDayGroup,
} from '../utils/timeFormat';
import { getHabitIcon } from './HomeFeed';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  habits: Habit[];
  currentTimestamp: number;
  onMarkRead: (id: string) => void;
  onMarkUnread: (id: string) => void;
  onMarkAllRead: () => void;
  onAction: (action: NotificationAction) => void;
}

type NotificationFilter = 'all' | NotificationOrigin;

const FILTERS: { id: NotificationFilter; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'activity', label: 'Tu actividad' },
  { id: 'reminder', label: 'Recordatorios' },
];

const GROUP_LABELS: Record<NotificationDayGroup, string> = {
  today: 'Hoy',
  yesterday: 'Ayer',
  earlier: 'Anteriores',
};

const ORIGIN_META: Record<NotificationOrigin, { label: string; icon: string }> = {
  activity: { label: 'Tu actividad', icon: 'person' },
  reminder: { label: 'Recordatorio', icon: 'notifications_active' },
};

// Ember is reserved for streak / milestone signals (DESIGN.md: vitality accent).
const KIND_META: Record<NotificationKind, { icon: string; label: string; container: string; filled?: boolean }> = {
  milestone: { icon: 'neurology', label: 'Hito', container: 'bg-[#FF5A00]/10 text-[#FF5A00]', filled: true },
  clean_day: { icon: 'local_fire_department', label: 'Racha', container: 'bg-[#FF5A00]/10 text-[#FF5A00]', filled: true },
  slip: { icon: 'restart_alt', label: 'Recaída', container: 'bg-[#ECECEE]/70 text-[#3F3F46]' },
  reflection: { icon: 'edit_note', label: 'Diario', container: 'bg-[#ECECEE]/70 text-[#09090B]' },
  challenge: { icon: 'flag', label: 'Desafío', container: 'bg-[#ECECEE]/70 text-[#09090B]', filled: true },
  reminder: { icon: 'alarm', label: 'Recordatorio', container: 'bg-[#09090B] text-white' },
  system: { icon: 'cloud_done', label: 'Sistema', container: 'bg-[#ECECEE]/70 text-[#3F3F46]' },
};

const EMPTY_STATES: Record<NotificationFilter, { icon: string; title: string; text: string }> = {
  all: {
    icon: 'notifications_off',
    title: 'Aún no tienes notificaciones',
    text: 'Aquí verás tus hitos, registros y recordatorios a medida que avances.',
  },
  activity: {
    icon: 'history',
    title: 'Todavía no hay actividad',
    text: 'Registra un día limpio o escribe una reflexión y aparecerá aquí.',
  },
  reminder: {
    icon: 'alarm_off',
    title: 'No tienes recordatorios',
    text: 'Activa la alerta matutina o el blindaje nocturno para recibirlos.',
  },
};

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  habits,
  currentTimestamp,
  onMarkRead,
  onMarkUnread,
  onMarkAllRead,
  onAction,
}) => {
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const lastOpenedIdRef = useRef<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const selected = selectedId ? notifications.find((n) => n.id === selectedId) ?? null : null;

  const goBackToList = () => {
    setSelectedId(null);
    const returnFocusId = lastOpenedIdRef.current;
    requestAnimationFrame(() => {
      if (returnFocusId) document.getElementById(`notification-card-${returnFocusId}`)?.focus();
    });
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedId(null);
      setAnnouncement('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (selectedId) {
        goBackToList();
      } else {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedId, onClose]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    if (selectedId) backButtonRef.current?.focus();
  }, [selectedId]);

  if (!isOpen) return null;

  const sorted = [...notifications].sort((a, b) => b.timestamp - a.timestamp);
  const visible = filter === 'all' ? sorted : sorted.filter((n) => n.origin === filter);
  const totalUnread = notifications.filter((n) => !n.isRead).length;
  const unreadByFilter: Record<NotificationFilter, number> = {
    all: totalUnread,
    activity: notifications.filter((n) => !n.isRead && n.origin === 'activity').length,
    reminder: notifications.filter((n) => !n.isRead && n.origin === 'reminder').length,
  };

  const grouped = (['today', 'yesterday', 'earlier'] as NotificationDayGroup[])
    .map((group) => ({
      group,
      items: visible.filter((n) => getNotificationDayGroup(n.timestamp, currentTimestamp) === group),
    }))
    .filter((g) => g.items.length > 0);

  const handleOpenNotification = (notification: AppNotification) => {
    lastOpenedIdRef.current = notification.id;
    if (!notification.isRead) onMarkRead(notification.id);
    setSelectedId(notification.id);
  };

  const handleMarkAll = () => {
    if (totalUnread === 0) return;
    onMarkAllRead();
    setAnnouncement('Todas las notificaciones se marcaron como leídas.');
  };

  const handleMarkUnread = (id: string) => {
    onMarkUnread(id);
    setAnnouncement('Notificación marcada como no leída.');
    goBackToList();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={selected ? 'notification-detail-title' : 'notifications-modal-title'}
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-3 pb-24 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={scrollRef}
        className="w-full max-w-[390px] bg-white rounded-[28px] sm:rounded-[32px] p-6 shadow-2xl outline outline-1 outline-[#ECECEE] relative max-h-[82vh] flex flex-col gap-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>

        {selected ? (
          <NotificationDetail
            key={selected.id}
            notification={selected}
            habit={selected.habitId ? habits.find((h) => h.id === selected.habitId) : undefined}
            currentTimestamp={currentTimestamp}
            backButtonRef={backButtonRef}
            onBack={goBackToList}
            onClose={onClose}
            onAction={onAction}
            onMarkUnread={handleMarkUnread}
          />
        ) : (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex flex-col gap-4"
          >
            {/* ============================================================ */}
            {/* HEADER                                                      */}
            {/* ============================================================ */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-[#FF5A00]/10 flex items-center justify-center shrink-0 text-[#FF5A00]">
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined text-[24px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    notifications
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#FF5A00]">
                    Centro de actividad
                  </span>
                  <h2
                    id="notifications-modal-title"
                    className="text-[18px] font-sans font-semibold text-[#09090B] tracking-tight truncate leading-tight"
                  >
                    Notificaciones
                  </h2>
                  <span className="text-[12px] font-sans text-[#3F3F46] mt-0.5">
                    {totalUnread > 0 ? `${totalUnread} sin leer` : 'Estás al día'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar notificaciones"
                className="w-9 h-9 rounded-full bg-[#F9F9FA] hover:bg-[#ECECEE] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex items-center justify-center text-[#3F3F46] hover:text-[#09090B] transition-colors cursor-pointer shrink-0"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                  close
                </span>
              </button>
            </div>

            {/* ============================================================ */}
            {/* FILTROS (SEGMENTED PILLS) + MARCAR TODAS                     */}
            {/* ============================================================ */}
            <div className="flex flex-col gap-2">
              <div
                role="group"
                aria-label="Filtrar notificaciones"
                className="grid grid-cols-3 gap-1.5 pt-1.5"
              >
                {FILTERS.map((f) => {
                  const isActive = filter === f.id;
                  const unread = unreadByFilter[f.id];
                  return (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setFilter(f.id)}
                      className={`relative min-h-[40px] px-2 py-2 rounded-full text-[12px] font-sans font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center justify-center ${
                        isActive
                          ? 'bg-[#09090B] text-white shadow-sm'
                          : 'bg-white text-[#3F3F46] outline outline-1 outline-[#ECECEE] -outline-offset-1 hover:text-[#09090B]'
                      }`}
                    >
                      <span>{f.label}</span>
                      {unread > 0 && (
                        <span className="absolute -top-1.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF5A00] text-white text-[10px] font-semibold leading-none flex items-center justify-center tabular-nums ring-2 ring-white">
                          <span className="sr-only">, </span>
                          {unread}
                          <span className="sr-only"> sin leer</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#3F3F46]">
                  {visible.length} {visible.length === 1 ? 'notificación' : 'notificaciones'}
                </span>
                <button
                  type="button"
                  onClick={handleMarkAll}
                  disabled={totalUnread === 0}
                  className="min-h-[44px] -my-2 -mr-2 px-2 inline-flex items-center gap-1.5 rounded-xl text-[12px] font-sans font-semibold text-[#09090B] hover:bg-[#F9F9FA] transition-colors cursor-pointer disabled:text-[#A1A1AA] disabled:cursor-default disabled:hover:bg-transparent"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
                    done_all
                  </span>
                  Marcar todas como leídas
                </button>
              </div>
            </div>

            {/* ============================================================ */}
            {/* LISTA AGRUPADA POR FECHA                                     */}
            {/* ============================================================ */}
            {grouped.length === 0 ? (
              <div className="w-full bg-[#F9F9FA] rounded-2xl p-6 text-center outline outline-1 outline-[#ECECEE] -outline-offset-1 flex flex-col items-center gap-1.5">
                <span aria-hidden="true" className="material-symbols-outlined text-[28px] text-[#3F3F46]">
                  {EMPTY_STATES[filter].icon}
                </span>
                <p className="text-[14px] font-sans font-semibold text-[#09090B]">
                  {EMPTY_STATES[filter].title}
                </p>
                <p className="text-[12px] font-sans text-[#3F3F46] leading-relaxed">
                  {EMPTY_STATES[filter].text}
                </p>
                {filter === 'reminder' && (
                  <button
                    type="button"
                    onClick={() => onAction({ type: 'settings', label: 'Configurar recordatorios' })}
                    className="mt-2 min-h-[44px] px-4 rounded-xl bg-[#09090B] text-white text-[12px] font-sans font-semibold hover:bg-[#18181B] active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    Configurar en Ajustes
                    <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
                      arrow_forward
                    </span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {grouped.map(({ group, items }) => (
                  <section key={group} aria-label={GROUP_LABELS[group]} className="flex flex-col gap-2">
                    <h3 className="text-[11px] font-sans font-semibold uppercase tracking-[0.04em] text-[#3F3F46]">
                      {GROUP_LABELS[group]}
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {items.map((n) => (
                        <li key={n.id}>
                          <NotificationCard
                            notification={n}
                            currentTimestamp={currentTimestamp}
                            onOpen={() => handleOpenNotification(n)}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

interface NotificationCardProps {
  notification: AppNotification;
  currentTimestamp: number;
  onOpen: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, currentTimestamp, onOpen }) => {
  const kind = KIND_META[notification.kind];
  const origin = ORIGIN_META[notification.origin];
  const isUnread = !notification.isRead;

  return (
    <button
      type="button"
      id={`notification-card-${notification.id}`}
      onClick={onOpen}
      className={`group relative w-full text-left p-3.5 pl-4 rounded-2xl flex items-start gap-3 outline outline-1 -outline-offset-1 transition-all duration-200 cursor-pointer active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-[#09090B] overflow-hidden ${
        isUnread
          ? 'bg-white outline-[#ECECEE] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:shadow-[0px_6px_16px_rgba(0,0,0,0.07)] hover:outline-[#D4D4D8]'
          : 'bg-[#F9F9FA] outline-[#ECECEE] hover:bg-white hover:outline-[#D4D4D8]'
      }`}
    >
      {isUnread && (
        <span aria-hidden="true" className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-[#FF5A00]" />
      )}

      <div
        aria-hidden="true"
        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${kind.container} ${
          isUnread ? '' : 'opacity-70'
        }`}
      >
        <span
          className="material-symbols-outlined text-[20px]"
          style={kind.filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          {kind.icon}
        </span>
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={`text-[14px] font-sans leading-tight line-clamp-2 ${
              isUnread ? 'font-semibold text-[#09090B]' : 'font-medium text-[#3F3F46]'
            }`}
          >
            {isUnread && <span className="sr-only">No leída: </span>}
            {notification.title}
          </h4>
          <span className="text-[11px] font-sans text-[#71717A] shrink-0 leading-tight pt-px">
            {formatRelativeTime(notification.timestamp, currentTimestamp)}
          </span>
        </div>

        <p
          className={`text-[12px] font-sans leading-snug line-clamp-2 ${
            isUnread ? 'text-[#3F3F46]' : 'text-[#71717A]'
          }`}
        >
          {notification.summary}
        </p>

        <div className="flex items-center justify-between gap-2 mt-1">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full outline outline-1 outline-[#ECECEE] -outline-offset-1 bg-white text-[10px] font-sans font-medium text-[#3F3F46]">
            <span aria-hidden="true" className="material-symbols-outlined text-[12px]">
              {origin.icon}
            </span>
            {origin.label}
          </span>

          <span className="flex items-center gap-1.5 shrink-0">
            {isUnread && <span aria-hidden="true" className="w-2 h-2 rounded-full bg-[#FF5A00]" />}
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-[18px] text-[#A1A1AA] group-hover:text-[#09090B] group-hover:translate-x-0.5 transition-all duration-200"
            >
              chevron_right
            </span>
          </span>
        </div>
      </div>
    </button>
  );
};

interface NotificationDetailProps {
  notification: AppNotification;
  habit?: Habit;
  currentTimestamp: number;
  backButtonRef: React.RefObject<HTMLButtonElement | null>;
  onBack: () => void;
  onClose: () => void;
  onAction: (action: NotificationAction) => void;
  onMarkUnread: (id: string) => void;
}

const NotificationDetail: React.FC<NotificationDetailProps> = ({
  notification,
  habit,
  currentTimestamp,
  backButtonRef,
  onBack,
  onClose,
  onAction,
  onMarkUnread,
}) => {
  const kind = KIND_META[notification.kind];
  const origin = ORIGIN_META[notification.origin];
  const habitCleanDays = habit ? calculateCleanTime(habit.startedAt, currentTimestamp).days : 0;
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex flex-col gap-5"
    >
      {/* ============================================================ */}
      {/* NAVEGACIÓN                                                  */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between gap-3">
        <button
          ref={backButtonRef}
          type="button"
          onClick={onBack}
          className="min-h-[44px] -ml-2 px-2 inline-flex items-center gap-1 rounded-xl text-[13px] font-sans font-medium text-[#3F3F46] hover:text-[#09090B] hover:bg-[#F9F9FA] transition-colors cursor-pointer"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
            arrow_back
          </span>
          Notificaciones
        </button>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar notificaciones"
          className="w-9 h-9 rounded-full bg-[#F9F9FA] hover:bg-[#ECECEE] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex items-center justify-center text-[#3F3F46] hover:text-[#09090B] transition-colors cursor-pointer shrink-0"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
            close
          </span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* ENCABEZADO DEL DETALLE                                      */}
      {/* ============================================================ */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className={`w-14 h-14 rounded-3xl flex items-center justify-center shrink-0 ${kind.container}`}
          >
            <span
              className="material-symbols-outlined text-[28px]"
              style={kind.filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {kind.icon}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ECECEE] text-[11px] font-sans font-medium text-[#09090B]">
              <span aria-hidden="true" className="material-symbols-outlined text-[13px]">
                {origin.icon}
              </span>
              {origin.label}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full outline outline-1 outline-[#ECECEE] -outline-offset-1 text-[11px] font-sans font-medium text-[#3F3F46]">
              {kind.label}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <h2
            id="notification-detail-title"
            className="text-[20px] font-sans font-semibold text-[#09090B] tracking-tight leading-[28px]"
          >
            {notification.title}
          </h2>
          <time
            dateTime={new Date(notification.timestamp).toISOString()}
            className="text-[12px] font-sans text-[#71717A]"
          >
            {formatFullDateTime(notification.timestamp)}
          </time>
        </div>
      </div>

      <p className="text-[14px] font-sans text-[#3F3F46] leading-relaxed whitespace-pre-line">
        {notification.body}
      </p>

      {/* ============================================================ */}
      {/* CONTEXTO: HÁBITO RELACIONADO                                 */}
      {/* ============================================================ */}
      {habit && (
        <div className="w-full p-4 rounded-2xl bg-[#F9F9FA] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex flex-col gap-3">
          <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#3F3F46]">
            Hábito relacionado
          </span>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white outline outline-1 outline-[#ECECEE] -outline-offset-1 flex items-center justify-center shrink-0 text-[#09090B]">
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                {getHabitIcon(habit)}
              </span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[14px] font-sans font-semibold text-[#09090B] truncate">{habit.title}</span>
              <span className="text-[12px] font-sans text-[#3F3F46]">
                {habit.category} · {habitCleanDays} {habitCleanDays === 1 ? 'día limpio' : 'días limpios'} de{' '}
                {habit.targetDays}
              </span>
            </div>
          </div>
          <div aria-hidden="true" className="w-full h-1.5 rounded-full bg-[#ECECEE] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#09090B] transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((habitCleanDays / Math.max(1, habit.targetDays)) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ACCIONES                                                    */}
      {/* ============================================================ */}
      <div className="flex flex-col gap-2 pt-1">
        {notification.action && (
          <button
            type="button"
            onClick={() => onAction(notification.action!)}
            className="w-full min-h-[48px] py-3 px-4 bg-[#09090B] text-white rounded-2xl text-[14px] font-sans font-semibold tracking-tight hover:bg-[#18181B] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{notification.action.label}</span>
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={() => onMarkUnread(notification.id)}
          className="w-full min-h-[44px] py-2.5 px-4 bg-[#ECECEE]/70 hover:bg-[#ECECEE] text-[#09090B] rounded-2xl text-[13px] font-sans font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-[#3F3F46]">
            mark_email_unread
          </span>
          Marcar como no leída
        </button>
      </div>
    </motion.div>
  );
};
