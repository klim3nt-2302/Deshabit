import React from 'react';
import { WifiOff, RefreshCw, Database } from 'lucide-react';

interface OfflineBannerProps {
  isOffline: boolean;
  onRetry: () => void;
  isRetrying?: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOffline,
  onRetry,
  isRetrying = false,
}) => {
  if (!isOffline) return null;

  return (
    <div
      role="alert"
      className="w-full bg-[#18181b] text-white border border-[#27272a] rounded-[16px] p-3 mb-3 text-xs flex items-center justify-between gap-2 shadow-sm animate-in fade-in duration-200"
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#27272a] flex items-center justify-center shrink-0">
          <WifiOff className="w-3.5 h-3.5 text-[#ff5a00]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 font-medium text-white">
            <span>Sin conexión a red</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-[#a1a1aa] bg-[#27272a] px-1.5 py-0.2 rounded-[6px]">
              <Database className="w-2.5 h-2.5" /> SQLite Local
            </span>
          </div>
          <p className="text-[11px] text-[#a1a1aa] leading-tight">
            Tus registros se guardan localmente sin pérdida de datos.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="shrink-0 inline-flex items-center gap-1 bg-[#27272a] hover:bg-[#3f3f46] text-white px-2.5 py-1.5 rounded-[10px] text-[11px] font-medium transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
        <span>Reintentar</span>
      </button>
    </div>
  );
};
