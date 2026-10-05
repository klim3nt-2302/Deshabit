import React, { useEffect, useState } from 'react';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'info' | 'warning';
  title: string;
  description?: string;
  icon?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
  durationMs?: number;
}

export const Toast: React.FC<ToastProps> = ({
  toast,
  onDismiss,
  durationMs = 4200,
}) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!toast) {
      setProgress(100);
      return;
    }

    setProgress(100);
    const intervalTime = 50;
    const decrement = (intervalTime / durationMs) * 100;

    const timer = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev <= decrement) {
            clearInterval(timer);
            return 0;
          }
          return prev - decrement;
        });
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast, durationMs, isPaused]);

  if (!toast) return null;

  // Decide icon and color scheme based on toast type
  const isSuccess = toast.type === 'success';
  const isWarning = toast.type === 'warning';
  const defaultIcon = isSuccess
    ? 'check_circle'
    : isWarning
    ? 'warning'
    : 'notifications_active';

  const iconName = toast.icon || defaultIcon;

  return (
    <aside
      aria-live="polite"
      aria-label="Notificación del sistema"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className="fixed bottom-[84px] sm:bottom-[92px] left-1/2 -translate-x-1/2 z-[85] w-[calc(100%-32px)] max-w-[370px] animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div
        role="alert"
        className="w-full bg-white/95 backdrop-blur-xl border border-[#ECECEE] shadow-[0px_14px_40px_rgba(0,0,0,0.14)] rounded-2xl p-3.5 flex flex-col gap-2 relative overflow-hidden transition-all hover:shadow-[0px_18px_48px_rgba(0,0,0,0.18)]"
      >
        {/* Top bar: System indicator & Dismiss */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isSuccess
                  ? 'bg-emerald-500'
                  : isWarning
                  ? 'bg-amber-500'
                  : 'bg-[#FF5A00]'
              } animate-pulse`}
            />
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#71717A]">
              Notificación Push
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-[#A1A1AA]">Ahora</span>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Cerrar notificación"
              className="w-5 h-5 rounded-full hover:bg-[#F4F4F5] text-[#71717A] hover:text-[#09090B] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px] select-none shrink-0 leading-none">
                close
              </span>
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isSuccess
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                : isWarning
                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                : 'bg-[#FF5A00]/10 text-[#FF5A00] border border-[#FF5A00]/20'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] select-none shrink-0 leading-none">
              {iconName}
            </span>
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <p className="text-[13px] font-sans font-bold text-[#09090B] leading-tight">
              {toast.title}
            </p>
            {toast.description && (
              <p className="text-[11.5px] font-sans text-[#52525B] leading-snug mt-0.5">
                {toast.description}
              </p>
            )}
          </div>
        </div>

        {/* Subtle timer progress bar at bottom */}
        <div className="w-full h-1 bg-[#F4F4F5] rounded-full overflow-hidden mt-0.5">
          <div
            className={`h-full transition-all duration-75 ease-linear rounded-full ${
              isSuccess
                ? 'bg-emerald-500'
                : isWarning
                ? 'bg-amber-500'
                : 'bg-[#FF5A00]'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </aside>
  );
};
