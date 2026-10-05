import React, { useState, useEffect } from 'react';
import { X, Check, Zap } from 'lucide-react';
import { HabitTemplate } from '../types';
import { HABIT_TEMPLATES } from '../data/initialData';

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplate?: HabitTemplate | null;
  onCreateHabit: (habitData: {
    title: string;
    category: 'Salud' | 'Foco' | 'Digital' | 'Finanzas';
    triggerDescription: string;
    targetDays: number;
    initialCleanHours?: number;
  }) => void;
}

export const CreateHabitModal: React.FC<CreateHabitModalProps> = ({
  isOpen,
  onClose,
  initialTemplate,
  onCreateHabit,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<HabitTemplate | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState<'Salud' | 'Foco' | 'Digital' | 'Finanzas'>('Salud');
  const [targetDays, setTargetDays] = useState<number>(50);
  const [initialHours, setInitialHours] = useState<number>(0);

  useEffect(() => {
    if (initialTemplate) {
      handleSelectTemplate(initialTemplate);
    }
  }, [initialTemplate]);

  if (!isOpen) return null;

  const handleSelectTemplate = (tmpl: HabitTemplate) => {
    setSelectedTemplate(tmpl);
    setCustomTitle(tmpl.title);
    setCustomCategory(tmpl.category);
    setTargetDays(tmpl.targetDays || 50);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = customTitle.trim() || selectedTemplate?.title || 'Nuevo Desafío';
    const category = selectedTemplate?.category || customCategory;
    const triggerDescription = selectedTemplate?.triggerExample || 'Detonante ambiental identificado';

    onCreateHabit({
      title,
      category,
      triggerDescription,
      targetDays,
      initialCleanHours: initialHours,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-[375px] bg-[#ffffff] border border-[#ececee] rounded-[28px] sm:rounded-[36px] p-6 relative max-h-[82vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#09090b]" />
            <h2 className="text-[17px] font-semibold text-[#09090b]">
              Nuevo Desafío Exprés
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

        <p className="text-[12px] text-[#71717a] mb-4">
          Selecciona una plantilla validada de 1 toque o configura un reto a medida.
        </p>

        {/* 4 One-touch express templates */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-[#18181b] uppercase tracking-wider mb-2">
            Plantillas Validadas (1 toque)
          </label>
          <div className="grid grid-cols-1 gap-2">
            {HABIT_TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplate?.id === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tmpl)}
                  className={`w-full text-left p-3 rounded-[14px] border transition-all text-xs flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#f4f4f5] border-[#09090b] text-[#09090b]'
                      : 'bg-[#ffffff] border-[#ececee] text-[#18181b] hover:bg-[#fafafa]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-semibold text-[13px]">{tmpl.title}</span>
                      <span className="inline-block bg-[#ff5a00] text-white text-[9px] font-medium px-1.5 py-0.2 rounded-[8px] uppercase">
                        {tmpl.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#71717a] line-clamp-1">
                      {tmpl.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#09090b] text-white flex items-center justify-center shrink-0 ml-2">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom or Edit Input */}
        <form onSubmit={handleFormSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#18181b] uppercase tracking-wider mb-1">
              Nombre de la conducta
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Ej: Cero azúcar refinada en meriendas"
              className="w-full h-11 px-3.5 rounded-[14px] bg-[#ffffff] border border-[#ececee] text-xs text-[#18181b] placeholder:text-[#a1a1aa] focus:outline-none focus:border-[#09090b]"
              required
            />
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-[11px] font-semibold text-[#18181b] uppercase tracking-wider mb-1">
              Categoría
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['Salud', 'Foco', 'Digital', 'Finanzas'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCustomCategory(cat)}
                  className={`py-1.5 text-xs rounded-[10px] border transition-all ${
                    customCategory === cat
                      ? 'bg-[#09090b] text-white border-[#09090b] font-medium'
                      : 'bg-[#ffffff] text-[#71717a] border-[#ececee]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Target days selection */}
          <div>
            <label className="block text-[11px] font-semibold text-[#18181b] uppercase tracking-wider mb-1">
              Meta de días
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[30, 50, 90].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setTargetDays(days)}
                  className={`py-1.5 text-xs font-mono-numbers rounded-[10px] border transition-all ${
                    targetDays === days
                      ? 'bg-[#09090b] text-white border-[#09090b] font-medium'
                      : 'bg-[#ffffff] text-[#71717a] border-[#ececee]'
                  }`}
                >
                  {days} días {days === 50 ? '★' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Initial Clean Hours */}
          <div>
            <label className="block text-[11px] font-semibold text-[#18181b] uppercase tracking-wider mb-1">
              ¿Tiempo limpio acumulado previo?
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 12, 24, 48].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setInitialHours(hours)}
                  className={`h-9 rounded-[10px] text-xs font-mono-numbers font-medium border transition-colors ${
                    initialHours === hours
                      ? 'bg-[#09090b] text-white border-[#09090b]'
                      : 'bg-[#ffffff] text-[#18181b] border-[#ececee]'
                  }`}
                >
                  {hours === 0 ? 'Ahora' : `${hours}h`}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-[52px] bg-[#09090b] text-white font-medium text-[14px] rounded-[14px] border border-[#2c2e34] flex items-center justify-center gap-2 hover:bg-[#18181b] active:scale-[0.985] transition-all"
            >
              <Zap className="w-4 h-4 text-[#ff5a00]" />
              <span>Iniciar Desafío ({targetDays} Días)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
