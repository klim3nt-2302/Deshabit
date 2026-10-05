import React from 'react';
import { X, Brain, CheckCircle2 } from 'lucide-react';
import { NEURO_MILESTONES } from '../data/initialData';

interface NeuroInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDays: number;
}

export const NeuroInsightsModal: React.FC<NeuroInsightsModalProps> = ({
  isOpen,
  onClose,
  currentDays,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-3 pb-24 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-[390px] bg-[#ffffff] border border-[#ececee] rounded-[28px] sm:rounded-[36px] p-6 relative max-h-[82vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#09090b]" />
            <h2 className="text-[17px] font-semibold text-[#09090b]">
              Neurobiología del Cambio
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#f4f4f5] text-[#71717a] transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#71717a] mb-4 leading-relaxed">
          Cronograma de consolidación sináptica a 30 días. Los desvíos temporales no eliminan las ramas dendríticas ya formadas.
        </p>

        {/* Milestone Timeline */}
        <div className="space-y-3">
          {NEURO_MILESTONES.map((m) => {
            const isCompleted = currentDays >= m.dayThreshold;
            const isCurrent =
              currentDays >= m.dayThreshold &&
              (m.dayThreshold === 30 || currentDays < (m.dayThreshold === 1 ? 3 : m.dayThreshold === 3 ? 7 : m.dayThreshold === 7 ? 14 : m.dayThreshold === 14 ? 21 : 30));

            return (
              <div
                key={m.dayThreshold}
                className={`p-3.5 rounded-[16px] border transition-all text-xs ${
                  isCurrent
                    ? 'bg-[#f4f4f5] border-[#09090b]'
                    : isCompleted
                    ? 'bg-[#ffffff] border-[#ececee]'
                    : 'bg-[#fafafa] border-[#ececee] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-[6px] tracking-wide uppercase ${
                        isCurrent
                          ? 'bg-[#09090b] text-white'
                          : isCompleted
                          ? 'bg-[#ececee] text-[#18181b]'
                          : 'bg-[#ececee] text-[#71717a]'
                      }`}
                    >
                      {m.shortLabel}
                    </span>
                    <span className="font-semibold text-[#09090b] text-[13px]">
                      {m.title}
                    </span>
                  </div>
                  {isCompleted && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>

                <p className="text-[#3f3f46] text-[12px] leading-relaxed mb-1.5">
                  {m.biologicalDescription}
                </p>

                <div className="text-[11px] text-[#71717a] italic">
                  Impacto: {m.circuitryImpact}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-[#ececee]">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 bg-[#09090b] text-white text-xs font-medium rounded-[14px] hover:bg-[#18181b] transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
