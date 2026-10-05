import React, { useState } from 'react';
import { X, ShieldCheck, ArrowRight, Clock } from 'lucide-react';
import { Habit } from '../types';

interface SlipModalProps {
  isOpen: boolean;
  habit: Habit;
  onClose: () => void;
  onSubmitSlip: (
    trigger: string,
    notes?: string,
    intensity?: 'leve' | 'moderada' | 'aguda',
    slipTimestamp?: number
  ) => void;
}

const COMMON_TRIGGERS = [
  'Fatiga cognitiva nocturna',
  'Estrés agudo laboral / personal',
  'Fricción ambiental (acceso sin barrera)',
  'Aburrimiento reactivo',
  'Entorno social / presión externa',
  'Disparador emocional imprevisto',
];

export const SlipModal: React.FC<SlipModalProps> = ({
  isOpen,
  habit,
  onClose,
  onSubmitSlip,
}) => {
  // Format current ISO string for datetime-local input
  const getInitialDateTime = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const [dateTimeStr, setDateTimeStr] = useState<string>(getInitialDateTime());
  const [selectedTrigger, setSelectedTrigger] = useState<string>(COMMON_TRIGGERS[0]);
  const [intensity, setIntensity] = useState<'leve' | 'moderada' | 'aguda'>('moderada');
  const [customNotes, setCustomNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slipTimestamp = new Date(dateTimeStr).getTime() || Date.now();
    onSubmitSlip(selectedTrigger, customNotes, intensity, slipTimestamp);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-slip-title"
    >
      <div className="w-full max-w-[390px] bg-[#ffffff] border border-[#ececee] rounded-[28px] sm:rounded-[36px] p-6 relative max-h-[82vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5a00]" />
            <h2 id="modal-slip-title" className="text-[17px] font-semibold text-[#09090b]">
              Registrar Recaída Sin Juicio
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#f4f4f5] text-[#52525b] transition-colors"
            aria-label="Cerrar modal de recaída"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scientific Anti-Guilt Reassurance */}
        <div className="bg-[#f4f4f5] border border-[#ececee] rounded-[16px] p-3.5 mb-4 text-xs text-[#3f3f46] leading-relaxed">
          <div className="flex items-center gap-1.5 font-semibold text-[#09090b] mb-1">
            <ShieldCheck className="w-4 h-4 text-[#09090b]" />
            <span>Dato Biológico, No Fracaso Moral</span>
          </div>
          La recaída no borra la mielinización sináptica alcanzada en días previos. Medimos el intervalo temporal exacto para identificar la fricción del entorno y reajustar sin culpa.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Fecha y Hora Exacta */}
          <div>
            <label
              htmlFor="slip-datetime-input"
              className="flex items-center gap-1 text-[11px] font-semibold text-[#18181b] mb-1.5 uppercase tracking-wider"
            >
              <Clock className="w-3.5 h-3.5 text-[#09090b]" />
              <span>1. Momento exacto del desvío</span>
            </label>
            <input
              id="slip-datetime-input"
              type="datetime-local"
              value={dateTimeStr}
              onChange={(e) => setDateTimeStr(e.target.value)}
              className="w-full h-11 px-3.5 rounded-[14px] bg-[#ffffff] border border-[#ececee] text-xs font-mono-numbers text-[#18181b] focus:outline-none focus:border-[#09090b]"
            />
          </div>

          {/* 2. Categorización del detonante */}
          <div>
            <label className="block text-[11px] font-semibold text-[#18181b] mb-1.5 uppercase tracking-wider">
              2. Factor desencadenante
            </label>
            <div className="grid grid-cols-1 gap-1.5" role="radiogroup" aria-label="Factor desencadenante">
              {COMMON_TRIGGERS.map((trigger) => {
                const isSelected = selectedTrigger === trigger;
                return (
                  <button
                    key={trigger}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedTrigger(trigger)}
                    className={`w-full text-left px-3 py-2.5 rounded-[12px] text-xs transition-all border ${
                      isSelected
                        ? 'bg-[#09090b] text-white border-[#09090b] font-medium'
                        : 'bg-[#ffffff] text-[#18181b] border-[#ececee] hover:bg-[#fafafa]'
                    }`}
                  >
                    {trigger}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Intensidad del desliz */}
          <div>
            <label className="block text-[11px] font-semibold text-[#18181b] mb-1.5 uppercase tracking-wider">
              3. Intensidad del impulso
            </label>
            <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Intensidad del impulso">
              {(['leve', 'moderada', 'aguda'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setIntensity(lvl)}
                  aria-pressed={intensity === lvl}
                  className={`py-2 text-xs rounded-[10px] capitalize border transition-all ${
                    intensity === lvl
                      ? 'bg-[#09090b] text-white border-[#09090b] font-semibold'
                      : 'bg-[#ffffff] text-[#52525b] border-[#ececee] hover:border-[#d4d4d8]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Breve nota de diario / Fricción preventiva */}
          <div>
            <label
              htmlFor="slip-notes-input"
              className="block text-[11px] font-semibold text-[#18181b] mb-1.5 uppercase tracking-wider"
            >
              4. Nota en el diario / Fricción preventiva
            </label>
            <textarea
              id="slip-notes-input"
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="¿Qué catalizador ambiental facilitó el acceso? (ej. teléfono en mesa de noche, app sin bloqueo)"
              className="w-full p-3 rounded-[14px] bg-[#ffffff] border border-[#ececee] text-xs text-[#18181b] placeholder:text-[#a1a1aa] focus:outline-none focus:border-[#09090b] resize-none"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-1">
            <button
              type="submit"
              className="w-full h-[52px] bg-[#09090b] text-white font-medium text-[14px] rounded-[14px] border border-[#2c2e34] flex items-center justify-center gap-2 hover:bg-[#18181b] active:scale-[0.985] transition-all"
            >
              <span>Recalcular Intervalo sin Juicio</span>
              <ArrowRight className="w-4 h-4 text-[#a1a1aa]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
