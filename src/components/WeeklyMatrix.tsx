import React from 'react';
import { DayStatus } from '../types';

interface WeeklyMatrixProps {
  weekLog?: DayStatus[];
  title?: string;
  onDayClick?: (day: DayStatus) => void;
}

export const WeeklyMatrix: React.FC<WeeklyMatrixProps> = ({
  weekLog,
  title = 'Vista Rápida de la Semana',
  onDayClick,
}) => {
  const defaultDays: Array<{
    letter: string;
    num: number;
    status: 'clean' | 'slip' | 'today';
    aria: string;
  }> = [
    { letter: 'V', num: 18, status: 'clean', aria: 'Viernes 18 de octubre: Día limpio' },
    { letter: 'S', num: 19, status: 'clean', aria: 'Sábado 19 de octubre: Día limpio' },
    { letter: 'D', num: 20, status: 'slip', aria: 'Domingo 20 de octubre: Recaída registrada' },
    { letter: 'L', num: 21, status: 'clean', aria: 'Lunes 21 de octubre: Día limpio' },
    { letter: 'M', num: 22, status: 'clean', aria: 'Martes 22 de octubre: Día limpio' },
    { letter: 'X', num: 23, status: 'clean', aria: 'Miércoles 23 de octubre: Día limpio' },
    { letter: 'HOY', num: 24, status: 'today', aria: 'Hoy Jueves 24 de octubre: Sesión de hoy' },
  ];

  return (
    <section
      aria-label="Registro semanal"
      className="w-full bg-white rounded-[24px] p-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] outline outline-1 outline-[#ececee] -outline-offset-1 flex flex-col gap-3"
    >
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-sans font-semibold text-[#09090b] leading-[22px]">
            {title}
          </h2>
          <p className="text-[13px] font-sans font-normal text-[#18181b] leading-[18px]">
            Desempeño consolidado últimos 7 días
          </p>
        </div>
        <span aria-hidden="true" className="material-symbols-outlined text-[#09090b] text-[20px]">
          calendar_today
        </span>
      </div>

      {/* 7-Day Horizontal Matrix Grid */}
      <div className="pt-1 flex items-center justify-between" role="group" aria-label="Matriz de los últimos 7 días">
        {defaultDays.map((day, idx) => {
          const isToday = day.status === 'today';
          const isSlip = day.status === 'slip';

          return (
            <div
              key={idx}
              aria-label={day.aria}
              className="flex flex-col items-center gap-1.5 w-[38.5px] cursor-pointer"
              onClick={() => {
                if (weekLog && weekLog[idx] && onDayClick) {
                  onDayClick(weekLog[idx]);
                }
              }}
            >
              <span
                className={`text-[11px] font-sans leading-[14px] tracking-[0.44px] ${
                  isToday
                    ? 'font-bold text-[#ff5a00]'
                    : 'font-semibold text-[#18181b]'
                }`}
              >
                {day.letter}
              </span>

              <div
                className={`w-10 h-10 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center ${
                  isToday
                    ? 'bg-[#ff5a00] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]'
                    : isSlip
                    ? 'bg-[#ffdad6] text-[#ba1a1a]'
                    : 'bg-[#ececee] text-black'
                }`}
              >
                {isToday ? (
                  <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
                    bolt
                  </span>
                ) : isSlip ? (
                  <span aria-hidden="true" className="material-symbols-outlined text-[14px]">
                    close
                  </span>
                ) : (
                  <span aria-hidden="true" className="material-symbols-outlined text-[14px]">
                    check
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] font-sans leading-[14px] tracking-[0.44px] ${
                  isToday
                    ? 'font-bold text-[#18181b]'
                    : isSlip
                    ? 'font-bold text-[#ba1a1a]'
                    : 'font-medium text-[#18181b]'
                }`}
              >
                {day.num}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span aria-hidden="true" className="w-2 h-2 rounded-full bg-[#ececee]"></span>
          <span className="text-[11px] font-sans font-medium text-[#18181b] leading-[14px] tracking-[0.44px]">
            Día limpio
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span aria-hidden="true" className="w-2 h-2 rounded-full bg-[#ffdad6]"></span>
          <span className="text-[11px] font-sans font-medium text-[#18181b] leading-[14px] tracking-[0.44px]">
            Recaídas registrada
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span aria-hidden="true" className="w-2 h-2 rounded-full bg-[#ff5a00]"></span>
          <span className="text-[11px] font-sans font-semibold text-[#18181b] leading-[14px] tracking-[0.44px]">
            Sesión de hoy
          </span>
        </div>
      </div>
    </section>
  );
};
