import React from 'react';
import { Activity, Info, Sparkles } from 'lucide-react';
import { Habit } from '../types';
import { calculateCleanTime, getCurrentMilestone } from '../utils/timeFormat';

interface HeroCardProps {
  habit: Habit;
  currentTimestamp: number;
  onOpenNeuroModal: () => void;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  habit,
  currentTimestamp,
  onOpenNeuroModal,
}) => {
  const cleanTime = calculateCleanTime(habit.startedAt, currentTimestamp);
  const milestoneData = getCurrentMilestone(cleanTime.totalDays);
  
  // Progress towards target (default 30 days)
  const targetDays = habit.targetDays || 30;
  const targetPercentage = Math.min(100, Math.max(1, Math.round((cleanTime.totalDays / targetDays) * 100)));

  return (
    <section
      id="hero-clean-time-card"
      className="w-full bg-[#ffffff] border border-[#ececee] rounded-[36px] p-6 mb-3 transition-all"
    >
      {/* Top row: Status & Live indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
          </span>
          <span className="text-[12px] font-medium tracking-wide text-[#71717a] uppercase">
            Tiempo limpio continuo
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f4f4f5] border border-[#ececee] text-[11px] font-medium text-[#18181b]">
          <Activity className="w-3 h-3 text-[#18181b]" />
          <span>En vivo</span>
        </div>
      </div>

      {/* Habit active title */}
      <h1 className="text-[17px] font-medium text-[#18181b] tracking-tight mb-2">
        {habit.title}
      </h1>

      {/* Main Display Stopwatch */}
      <div className="my-2">
        <div className="flex items-baseline gap-1.5 text-[#09090b] font-semibold leading-[1.05] tracking-tight">
          <span className="text-[54px] sm:text-[60px] font-mono-numbers">
            {cleanTime.days}
          </span>
          <span className="text-[26px] sm:text-[30px] font-normal text-[#71717a] mr-1">
            d
          </span>
          <span className="text-[54px] sm:text-[60px] font-mono-numbers">
            {String(cleanTime.hours).padStart(2, '0')}
          </span>
          <span className="text-[26px] sm:text-[30px] font-normal text-[#71717a]">
            h
          </span>
        </div>

        {/* Minutes and Seconds sub-row */}
        <div className="flex items-center gap-2 mt-1 text-[#71717a] text-[15px] font-mono-numbers font-medium">
          <span className="inline-flex items-center bg-[#f4f4f5] px-2 py-0.5 rounded-[6px] text-[#18181b]">
            {String(cleanTime.minutes).padStart(2, '0')}m
          </span>
          <span>:</span>
          <span className="inline-flex items-center bg-[#f4f4f5] px-2 py-0.5 rounded-[6px] text-[#18181b]">
            {String(cleanTime.seconds).padStart(2, '0')}s
          </span>
          <span className="text-[13px] text-[#71717a] font-sans font-normal ml-1">
            de sincronización biológica
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-[#ececee] my-5" />

      {/* Neurobiological Consolidation Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#ff5a00]" />
            <span className="font-medium text-[#18181b]">
              Consolidación neurobiológica
            </span>
          </div>
          <span className="text-[#71717a] font-mono-numbers font-medium">
            {cleanTime.totalDays} / {targetDays}d ({targetPercentage}%)
          </span>
        </div>

        {/* Progress bar with strict geometry */}
        <div className="w-full h-2 bg-[#f4f4f5] rounded-full overflow-hidden p-[1px] border border-[#ececee]">
          <div
            className="h-full bg-[#09090b] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.max(2, targetPercentage)}%` }}
          />
        </div>

        {/* Milestone explanation card */}
        <div className="bg-[#f4f4f5] border border-[#ececee] rounded-[14px] p-3 text-xs leading-relaxed text-[#18181b]">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-block bg-[#09090b] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-[6px] tracking-wide uppercase">
                {milestoneData.current.shortLabel}
              </span>
              <span className="font-semibold text-[#09090b]">
                {milestoneData.current.title}
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenNeuroModal}
              className="text-[#71717a] hover:text-[#09090b] transition-colors p-0.5"
              aria-label="Ver detalles neurobiológicos"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[#3f3f46] text-[13px] leading-snug">
            {milestoneData.current.biologicalDescription}
          </p>
        </div>
      </div>
    </section>
  );
};
