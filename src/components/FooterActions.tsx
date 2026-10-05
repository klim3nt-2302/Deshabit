import React from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { Habit } from '../types';

interface FooterActionsProps {
  habit: Habit;
  onConfirmCleanDay: () => void;
  onOpenSlipModal: () => void;
  isCompletedToday: boolean;
}

export const FooterActions: React.FC<FooterActionsProps> = ({
  habit,
  onConfirmCleanDay,
  onOpenSlipModal,
  isCompletedToday,
}) => {
  const [isPressing, setIsPressing] = React.useState(false);

  return (
    <footer className="w-full mt-auto pt-2 space-y-2.5">
      {/* Dominant CTA Button (52px height, #09090b Obsidian, #2c2e34 border, 14px radius) */}
      <button
        type="button"
        id="btn-mark-clean-day"
        onClick={() => {
          setIsPressing(true);
          setTimeout(() => setIsPressing(false), 250);
          onConfirmCleanDay();
        }}
        className={`w-full h-[52px] bg-[#09090b] text-[#ffffff] font-medium text-[15px] rounded-[14px] border border-[#2c2e34] flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.985] ${
          isPressing ? 'scale-[0.985] bg-[#18181b]' : 'hover:bg-[#18181b]'
        }`}
      >
        <CheckCircle2
          className={`w-4 h-4 transition-transform duration-200 ${
            isPressing ? 'scale-125 text-emerald-400' : 'text-[#a1a1aa]'
          }`}
        />
        <span>
          {isCompletedToday
            ? 'Día de hoy consolidado (+1)'
            : 'Marcar día limpio completado'}
        </span>
      </button>

      {/* Discrete Secondary Button: Anti-punitive slip reporting */}
      <div className="text-center pt-0.5">
        <button
          type="button"
          id="btn-open-slip-modal"
          onClick={onOpenSlipModal}
          className="text-[13px] text-[#71717a] hover:text-[#09090b] transition-colors py-1.5 px-3 rounded-[10px] inline-flex items-center gap-1.5 hover:bg-[#f4f4f5]"
        >
          <RotateCcw className="w-3 h-3 text-[#71717a]" />
          <span>Tuve un desliz hoy (Registrar intervalo sin juicio)</span>
        </button>
      </div>
    </footer>
  );
};
