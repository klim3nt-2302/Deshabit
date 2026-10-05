import React from 'react';
import { Wind, ShieldAlert } from 'lucide-react';

interface SOSBreathingCardProps {
  onOpenSOSModal: () => void;
}

export const SOSBreathingCard: React.FC<SOSBreathingCardProps> = ({ onOpenSOSModal }) => {
  return (
    <section
      id="card-sos-protocol"
      className="w-full bg-[#ffffff] border border-[#ececee] rounded-[36px] p-5 mb-3 transition-colors hover:border-[#d4d4d8]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-[#f4f4f5] border border-[#ececee] flex items-center justify-center shrink-0 mt-0.5">
            <Wind className="w-5 h-5 text-[#09090b]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[14px] font-semibold text-[#09090b]">
                ¿Impulso urgente ahora?
              </span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-[6px] bg-[#09090b] text-white text-[10px] font-medium tracking-wider uppercase">
                60s
              </span>
            </div>
            <p className="text-[13px] text-[#71717a] leading-tight">
              Protocolo vagal rítmico para desacoplar el pico dopaminérgico.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSOSModal}
          id="btn-trigger-sos-breathing"
          className="shrink-0 bg-[#09090b] text-white text-xs font-medium px-4 py-2 rounded-full border border-[#2c2e34] transition-all hover:bg-[#18181b] active:scale-95 shadow-none"
        >
          Respirar
        </button>
      </div>
    </section>
  );
};
