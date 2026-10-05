import React, { useState } from 'react';

export interface StreakDataPoint {
  id: number;
  label: string;
  days: number;
  dateStr: string;
  phaseName: string;
  neuroImpact: string;
  status: 'completado' | 'actual';
  coordX: number; // percentage or SVG coordinate
  coordY: number;
}

export const STREAK_DATA_POINTS: StreakDataPoint[] = [
  {
    id: 1,
    label: 'Hito 1',
    days: 5,
    dateStr: '08 Ago',
    phaseName: 'Rigor de Arranque',
    neuroImpact: 'Abstinencia fásica superada. La amígdala reduce la respuesta de alarma ante la privación del estímulo.',
    status: 'completado',
    coordX: 30,
    coordY: 155,
  },
  {
    id: 2,
    label: 'Hito 2',
    days: 12,
    dateStr: '20 Ago',
    phaseName: 'Resistencia Dorsolateral',
    neuroImpact: 'Reclutamiento activo de la corteza prefrontal dorsolateral para vetar impulsos automáticos.',
    status: 'completado',
    coordX: 90,
    coordY: 120,
  },
  {
    id: 3,
    label: 'Hito 3',
    days: 10,
    dateStr: '01 Sep',
    phaseName: 'Reajuste y Mielinización',
    neuroImpact: 'Ajuste neurofisiológico tras fluctuación emocional. La red neuronal preserva el 88% de su memoria basal.',
    status: 'completado',
    coordX: 150,
    coordY: 135,
  },
  {
    id: 4,
    label: 'Hito 4',
    days: 18,
    dateStr: '19 Sep',
    phaseName: 'Rebalanceo Basal',
    neuroImpact: 'Normalización de receptores dopaminérgicos D2 en el cuerpo estriado. Reducción sustancial del craving.',
    status: 'completado',
    coordX: 210,
    coordY: 85,
  },
  {
    id: 5,
    label: 'Hito 5',
    days: 16,
    dateStr: '06 Oct',
    phaseName: 'Meseta de Adaptación',
    neuroImpact: 'Superación de la fatiga de decisión. Las conductas sustitutivas saludables se integran al circuito motor.',
    status: 'completado',
    coordX: 270,
    coordY: 98,
  },
  {
    id: 6,
    label: 'Hito 6',
    days: 26,
    dateStr: '01 Nov',
    phaseName: 'Consolidación Sináptica',
    neuroImpact: 'Espesamiento cortical en áreas de autocontrol ejecutivo. El umbral de reactividad al disparador se triplica.',
    status: 'completado',
    coordX: 330,
    coordY: 48,
  },
  {
    id: 7,
    label: 'Actual',
    days: 34,
    dateStr: 'Hoy',
    phaseName: 'Máximo Histórico Invicto',
    neuroImpact: 'Control inhibitorio automatizado. El circuito de recompensa opera con dopamina tónica equilibrada y foco sostenido.',
    status: 'actual',
    coordX: 390,
    coordY: 20,
  },
];

interface StreakAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreakDays?: number;
}

export const StreakAnalyticsModal: React.FC<StreakAnalyticsModalProps> = ({
  isOpen,
  onClose,
  currentStreakDays = 34,
}) => {
  const [selectedPointId, setSelectedPointId] = useState<number>(7);

  if (!isOpen) return null;

  const selectedPoint =
    STREAK_DATA_POINTS.find((p) => p.id === selectedPointId) ||
    STREAK_DATA_POINTS[STREAK_DATA_POINTS.length - 1];

  // SVG viewBox is 0 0 420 180
  const svgWidth = 420;
  const svgHeight = 180;
  const paddingBottom = 25;

  // Path data
  const linePathD = `M ${STREAK_DATA_POINTS.map((p) => `${p.coordX} ${p.coordY}`).join(' L ')}`;
  const areaPathD = `${linePathD} L ${STREAK_DATA_POINTS[STREAK_DATA_POINTS.length - 1].coordX} ${svgHeight - paddingBottom} L ${STREAK_DATA_POINTS[0].coordX} ${svgHeight - paddingBottom} Z`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="streak-modal-title"
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-3 pb-24 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[390px] bg-white rounded-[28px] sm:rounded-[32px] p-6 shadow-2xl outline outline-1 outline-[#ECECEE] relative max-h-[82vh] flex flex-col gap-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================ */}
        {/* HEADER                                                      */}
        {/* ============================================================ */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#FF5A00]/10 flex items-center justify-center shrink-0 text-[#FF5A00]">
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#FF5A00]">
                Analítica de Racha
              </span>
              <h2
                id="streak-modal-title"
                className="text-[18px] font-sans font-semibold text-[#09090B] tracking-tight truncate leading-tight"
              >
                Racha Histórica Activa
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="w-9 h-9 rounded-full bg-[#F9F9FA] hover:bg-[#ECECEE] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex items-center justify-center text-[#3F3F46] hover:text-[#09090B] transition-colors cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* MÉTRICAS CLAVE SUPERIORES                                   */}
        {/* ============================================================ */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F9F9FA] outline outline-1 outline-[#ECECEE] -outline-offset-1">
            <span className="text-[22px] font-sans font-bold text-[#09090B] tracking-tight">
              {currentStreakDays}d
            </span>
            <span className="text-[10px] font-sans font-medium text-[#3F3F46] leading-tight mt-1">
              Racha actual
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F9F9FA] outline outline-1 outline-[#ECECEE] -outline-offset-1">
            <span className="text-[22px] font-sans font-bold text-[#FF5A00] tracking-tight">
              7/7
            </span>
            <span className="text-[10px] font-sans font-medium text-[#3F3F46] leading-tight mt-1">
              Fases en alza
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F9F9FA] outline outline-1 outline-[#ECECEE] -outline-offset-1">
            <span className="text-[22px] font-sans font-bold text-[#09090B] tracking-tight">
              96.8%
            </span>
            <span className="text-[10px] font-sans font-medium text-[#3F3F46] leading-tight mt-1">
              Eficiencia
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* GRÁFICA MICRO-INTERACTIVA AMPLIADA (SVG)                     */}
        {/* ============================================================ */}
        <div className="w-full bg-[#09090B] rounded-2xl p-4 flex flex-col gap-2.5 text-white shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF5A00] animate-pulse" />
              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#A1A1AA]">
                Trayectoria de consolidación
              </span>
            </div>
            <span className="text-[11px] font-sans font-medium text-[#D4D4D8]">
              Toca un punto para inspeccionar
            </span>
          </div>

          {/* SVG Canvas */}
          <div className="w-full relative mt-1">
            <svg
              viewBox="0 0 420 180"
              className="w-full h-auto overflow-visible select-none"
              role="img"
              aria-label="Gráfica de evolución de racha histórica en 7 hitos"
            >
              <defs>
                <linearGradient id="streakGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF5A00" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#FF5A00" stopOpacity="0.0" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="glow" />
                  <feComposite in="SourceGraphic" in2="glow" operator="over" />
                </filter>
              </defs>

              {/* Guías de referencia horizontales */}
              <line
                x1="20"
                y1="40"
                x2="400"
                y2="40"
                stroke="#27272A"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text x="24" y="36" fill="#71717A" fontSize="9" fontFamily="sans-serif">
                30d (Prefrontal estable)
              </text>

              <line
                x1="20"
                y1="90"
                x2="400"
                y2="90"
                stroke="#27272A"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text x="24" y="86" fill="#71717A" fontSize="9" fontFamily="sans-serif">
                18d (Rebalanceo D2)
              </text>

              <line
                x1="20"
                y1="140"
                x2="400"
                y2="140"
                stroke="#27272A"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text x="24" y="136" fill="#71717A" fontSize="9" fontFamily="sans-serif">
                7d (Fase aguda superada)
              </text>

              {/* Área sombreada bajo la curva */}
              <path d={areaPathD} fill="url(#streakGradient)" />

              {/* Línea principal */}
              <path
                d={linePathD}
                fill="none"
                stroke="#FF5A00"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Puntos de datos interactivos */}
              {STREAK_DATA_POINTS.map((p) => {
                const isSelected = p.id === selectedPointId;
                return (
                  <g
                    key={p.id}
                    onClick={() => setSelectedPointId(p.id)}
                    className="cursor-pointer transition-transform hover:scale-125"
                    tabIndex={0}
                    role="button"
                    aria-label={`${p.label}: ${p.days} días, ${p.phaseName}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedPointId(p.id);
                      }
                    }}
                  >
                    {/* Hit area amplia */}
                    <circle cx={p.coordX} cy={p.coordY} r="14" fill="transparent" />

                    {/* Anillo de selección */}
                    {isSelected && (
                      <circle
                        cx={p.coordX}
                        cy={p.coordY}
                        r="9"
                        fill="none"
                        stroke="#FF5A00"
                        strokeWidth="2"
                        className="animate-ping opacity-75"
                      />
                    )}

                    <circle
                      cx={p.coordX}
                      cy={p.coordY}
                      r={isSelected ? '6.5' : '4.5'}
                      fill={isSelected ? '#FFFFFF' : '#FF5A00'}
                      stroke={isSelected ? '#FF5A00' : '#09090B'}
                      strokeWidth="2"
                      filter={isSelected ? 'url(#glow)' : undefined}
                    />

                    {/* Texto del día */}
                    <text
                      x={p.coordX}
                      y={p.coordY - 10}
                      textAnchor="middle"
                      fill={isSelected ? '#FF5A00' : '#A1A1AA'}
                      fontSize={isSelected ? '10' : '8.5'}
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      fontFamily="sans-serif"
                    >
                      {p.days}d
                    </text>

                    {/* Label fecha al pie */}
                    <text
                      x={p.coordX}
                      y={svgHeight - 8}
                      textAnchor="middle"
                      fill={isSelected ? '#FFFFFF' : '#71717A'}
                      fontSize="8"
                      fontFamily="sans-serif"
                    >
                      {p.dateStr}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* ============================================================ */}
        {/* INSPECTOR DEL PUNTO SELECCIONADO                             */}
        {/* ============================================================ */}
        <div className="w-full p-4 rounded-2xl bg-[#F9F9FA] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex flex-col gap-2 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF5A00]" />
              <span className="text-[12px] font-sans font-semibold text-[#09090B]">
                {selectedPoint.label} · {selectedPoint.phaseName}
              </span>
            </div>
            <span className="text-[11px] font-sans font-medium px-2 py-0.5 rounded-full bg-[#ECECEE] text-[#09090B]">
              {selectedPoint.dateStr} ({selectedPoint.days} días)
            </span>
          </div>

          <p className="text-[12px] font-sans text-[#3F3F46] leading-relaxed">
            {selectedPoint.neuroImpact}
          </p>
        </div>

        {/* ============================================================ */}
        {/* DESGLOSE SCANNABLE DE LOS 7 HITOS DE LA GRÁFICA             */}
        {/* ============================================================ */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-sans uppercase tracking-wider text-[#3F3F46] font-semibold">
              Desglose de Puntos en la Curva
            </span>
            <span className="text-[11px] font-sans text-[#3F3F46]">
              Tendencia +580%
            </span>
          </div>

          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
            {STREAK_DATA_POINTS.map((pt) => {
              const isSelected = pt.id === selectedPointId;
              return (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => setSelectedPointId(pt.id)}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#09090B] text-white shadow-sm'
                      : 'bg-[#F9F9FA] hover:bg-[#ECECEE] text-[#09090B] outline outline-1 outline-[#ECECEE] -outline-offset-1'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        pt.status === 'actual'
                          ? 'bg-[#FF5A00]'
                          : isSelected
                          ? 'bg-white'
                          : 'bg-[#09090B]'
                      }`}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12px] font-sans font-medium truncate leading-tight">
                        {pt.label}: {pt.phaseName}
                      </span>
                      <span
                        className={`text-[10px] font-sans ${
                          isSelected ? 'text-[#A1A1AA]' : 'text-[#71717A]'
                        }`}
                      >
                        {pt.dateStr}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[13px] font-sans font-bold shrink-0 ${
                      isSelected ? 'text-[#FF5A00]' : 'text-[#09090B]'
                    }`}
                  >
                    {pt.days} días
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* BOTÓN DE CIERRE                                             */}
        {/* ============================================================ */}
        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[48px] py-3 px-4 bg-[#09090B] text-white rounded-2xl text-[14px] font-sans font-semibold tracking-tight hover:bg-[#18181B] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
        >
          <span>Continuar racha invicta</span>
          <span className="material-symbols-outlined text-[18px]">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
};
