import React from 'react';

interface NotificationBellButtonProps {
  id: string;
  unreadCount: number;
  onClick: () => void;
}

export const NotificationBellButton: React.FC<NotificationBellButtonProps> = ({
  id,
  unreadCount,
  onClick,
}) => {
  const hasUnread = unreadCount > 0;
  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount);
  const ariaLabel = hasUnread
    ? `Notificaciones, ${unreadCount} sin leer`
    : 'Notificaciones, todo al día';

  return (
    <button
      type="button"
      onClick={onClick}
      id={id}
      aria-label={ariaLabel}
      aria-haspopup="dialog"
      className="w-11 h-11 min-w-[44px] min-h-[44px] relative bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[16px] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex items-center justify-center text-[#18181B] transition-colors hover:bg-[#f9f9fa] active:scale-95 cursor-pointer"
    >
      <span
        aria-hidden="true"
        className="material-symbols-outlined text-[20px]"
        style={hasUnread ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        notifications
      </span>
      {hasUnread && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF5A00] text-white text-[10px] font-sans font-semibold leading-none flex items-center justify-center ring-2 ring-[#F9F9FA] tabular-nums"
        >
          {badgeLabel}
        </span>
      )}
    </button>
  );
};
