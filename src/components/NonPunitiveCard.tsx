import React from 'react';
import { TrendingUp, ShieldCheck, HelpCircle } from 'lucide-react';
import { Habit } from '../types';
import { calculateCleanTime, calculateAntiPunitiveStats } from '../utils/timeFormat';

interface NonPunitiveCardProps {
  habit: Habit;
  currentTimestamp: number;
}

export const NonPunitiveCard: React.FC<NonPunitiveCardProps> = ({ habit, currentTimestamp }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const cleanTime = calculateCleanTime(habit.startedAt, currentTimestamp);
  const stats = calculateAntiPunitiveStats(habit, cleanTime.totalDays);

  return (
    <section
      id="card-non-punitive-metrics"
      className="w-full bg-[#ffffff] border border-[#ececee] rounded-[36px] p-6 mb-4"
    >
      {/* Header with Anti-Punitive philosophy badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#09090b]" />
          <span className="text-[12px] font-medium tracking-wide text-[#71717a] uppercase">
            Métrica No Punitiva
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowTooltip(!showTooltip)}
          className="text-[#71717a] hover:text-[#09090b] transition-colors p-1"
          aria-label="Explicación de la métrica no punitiva"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>

      {showTooltip && (
        <div className="mb-3.5 p-3 bg-[#f4f4f5] border border-[#ececee] rounded-[14px] text-xs text-[#3f3f46] leading-relaxed">
          <p className="font-semibold text-[#09090b] mb-1">Filosofía Sin Reseteo Moral:</p>
          Las recaídas no borran las vías neuronales ni la mielinización desarrollada en días previos. Medimos la resiliencia a través de la <strong>ampliación continua de los intervalos entre desvíos</strong>.
        </div>
      )}

      {/* Primary metric display */}
      <div className="mb-3">
        <div className="text-[13px] text-[#71717a] mb-1">Intervalo promedio limpio</div>
        <div className="flex items-baseline gap-2">
          <span className="text-[34px] font-semibold text-[#09090b] font-mono-numbers leading-none">
            {stats.averageCleanIntervalDays}
          </span>
          <span className="text-[18px] text-[#71717a] font-normal">días</span>
          <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full ml-1">
            <TrendingUp className="w-3 h-3" />
            <span>+{stats.expansionPercentage}% vs ciclo previo</span>
          </span>
        </div>
      </div>

      {/* Visual interval progression bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] text-[#71717a] font-mono-numbers">
          <span>Expansión de ventanas limpias</span>
          <span>{stats.synapticRetentionPct}% adaptación sináptica</span>
        </div>

        {/* Micro visual progression columns */}
        <div className="flex items-end gap-1.5 h-9 bg-[#f4f4f5] rounded-[12px] p-1.5 border border-[#ececee]">
          {stats.intervalsList.map((val, idx) => {
            const maxVal = Math.max(...stats.intervalsList, 6);
            const heightPct = Math.min(100, Math.max(25, (val / maxVal) * 100));
            const isCurrent = idx === stats.intervalsList.length - 1;

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col justify-end h-full items-center group relative"
              >
                <div
                  className={`w-full rounded-[6px] transition-all duration-300 ${
                    isCurrent
                      ? 'bg-[#09090b]'
                      : 'bg-[#d4d4d8] group-hover:bg-[#a1a1aa]'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#71717a] px-0.5">
          <span>Ciclos iniciales</span>
          <span className="font-semibold text-[#09090b]">Intervalo actual en curso</span>
        </div>
      </div>

      {/* Synaptic retention badge */}
      <div className="mt-3.5 pt-3 border-t border-[#ececee] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[#3f3f46]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#09090b]" />
          <span>Biología preservada:</span>
        </div>
        <span className="font-medium text-[#09090b]">
          {stats.totalDaysEvaluated} días totales sin dopamina artificial
        </span>
      </div>
    </section>
  );
};
