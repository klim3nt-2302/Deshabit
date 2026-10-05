import React from 'react';

interface FloatingNewChallengeButtonProps {
  onClick: () => void;
  id?: string;
  ariaLabel?: string;
}

export const FloatingNewChallengeButton: React.FC<FloatingNewChallengeButtonProps> = ({
  onClick,
  id = 'fab-nuevo-desafio',
  ariaLabel = 'Nuevo desafío',
}) => {
  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-40">
      <button
        type="button"
        onClick={onClick}
        id={id}
        aria-label={ariaLabel}
        className="min-h-[48px] px-4 py-2.5 bg-[#09090B]/50 hover:bg-[#09090B]/75 active:scale-95 backdrop-blur-md rounded-full border border-white/15 shadow-[0px_8px_24px_rgba(0,0,0,0.25)] hover:shadow-[0px_12px_32px_rgba(0,0,0,0.35)] flex items-center gap-2.5 transition-all duration-200 cursor-pointer"
      >
        <div className="w-6 h-6 rounded-full bg-[#FF5A00] flex items-center justify-center shrink-0 shadow-sm">
          <span
            className="material-symbols-outlined text-[16px] font-bold text-white"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            add
          </span>
        </div>
        <span className="text-white text-[15px] font-sans font-semibold tracking-tight pr-1">
          Nuevo desafío
        </span>
      </button>
    </div>
  );
};
