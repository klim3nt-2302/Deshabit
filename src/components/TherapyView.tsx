import React, { useState, useEffect } from 'react';
import { NotificationBellButton } from './NotificationBellButton';

interface TherapyViewProps {
  onStartBreathing: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount?: number;
  onOpenSettings: () => void;
  onShowToast: (title: string, description?: string) => void;
  isProModalOpen: boolean;
  onSetProModalOpen: (isOpen: boolean) => void;
}

type TherapyCategory = 'all' | 'respiracion' | 'anclaje' | 'reprogramacion';
type BillingPlan = 'annual' | 'monthly';
type CurrencyMode = 'CLP' | 'USD';

export const TherapyView: React.FC<TherapyViewProps> = ({
  onStartBreathing,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  onOpenSettings,
  onShowToast,
  isProModalOpen,
  onSetProModalOpen,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<TherapyCategory>('all');
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan>('annual');
  const [currency, setCurrency] = useState<CurrencyMode>('CLP');

  const handleSubscribePro = () => {
    onSetProModalOpen(false);
    const planDetail =
      selectedPlan === 'annual'
        ? currency === 'CLP'
          ? 'Plan Anual: $4.990 CLP/mes (≈ $5.20 USD)'
          : 'Plan Anual: $5.20 USD/mes (≈ $4.990 CLP)'
        : currency === 'CLP'
          ? 'Plan Mensual: $8.990 CLP/mes (≈ $9.35 USD)'
          : 'Plan Mensual: $9.35 USD/mes (≈ $8.990 CLP)';
    onShowToast(
      selectedPlan === 'annual' ? '¡Prueba PRO de 7 días activada!' : '¡Membresía PRO activada!',
      `${planDetail}. Tienes acceso a los 5 protocolos clínicos, bloqueo de app por contraseña, bloqueo de apps distractoras y análisis de IA.`
    );
  };

  return (
    <div className="flex flex-col w-full pb-36 space-y-6 animate-in fade-in duration-200">
      {/* ============================================================ */}
      {/* 1. HEADER INTEGRADO CON LA VISTA                             */}
      {/* ============================================================ */}
      <header className="w-full flex items-center justify-between py-2">
        <div>
          <h1 className="text-[24px] font-sans font-semibold text-[#09090B] tracking-tight leading-[32px]">
            Terapia 1:1
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Notificaciones */}
          <NotificationBellButton
            id="btn-therapy-notifications"
            unreadCount={unreadNotificationsCount}
            onClick={onOpenNotifications}
          />

          {/* Ajustes / Tune */}
          <button
            type="button"
            onClick={onOpenSettings}
            id="btn-therapy-tune"
            aria-label="Ajustes de vista"
            className="w-11 h-11 min-w-[44px] min-h-[44px] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[16px] outline outline-1 outline-[#ECECEE] -outline-offset-1 flex items-center justify-center transition-colors hover:bg-[#f9f9fa] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px] text-[#18181B]">
              tune
            </span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. SEGMENTED PILLS / FILTROS DE CATEGORÍA                    */}
      {/* ============================================================ */}
      <section aria-label="Filtros de técnicas" className="flex items-center gap-2 overflow-x-auto py-1 -mx-4 px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => setSelectedFilter('all')}
          className={`shrink-0 px-4 py-2.5 rounded-full text-[13px] font-sans font-medium transition-all duration-150 active:scale-95 cursor-pointer ${
            selectedFilter === 'all'
              ? 'bg-[#09090B] text-white shadow-sm'
              : 'bg-[#F4F4F5] text-[#71717A] hover:text-[#09090B]'
          }`}
        >
          Todos (6)
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('respiracion')}
          className={`shrink-0 px-4 py-2.5 rounded-full text-[13px] font-sans font-medium transition-all duration-150 active:scale-95 cursor-pointer ${
            selectedFilter === 'respiracion'
              ? 'bg-[#09090B] text-white shadow-sm'
              : 'bg-[#F4F4F5] text-[#71717A] hover:text-[#09090B]'
          }`}
        >
          Respiración &amp; Vagal
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('anclaje')}
          className={`shrink-0 px-4 py-2.5 rounded-full text-[13px] font-sans font-medium transition-all duration-150 active:scale-95 cursor-pointer ${
            selectedFilter === 'anclaje'
              ? 'bg-[#09090B] text-white shadow-sm'
              : 'bg-[#F4F4F5] text-[#71717A] hover:text-[#09090B]'
          }`}
        >
          Atención &amp; Anclaje
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('reprogramacion')}
          className={`shrink-0 px-4 py-2.5 rounded-full text-[13px] font-sans font-medium transition-all duration-150 active:scale-95 cursor-pointer ${
            selectedFilter === 'reprogramacion'
              ? 'bg-[#09090B] text-white shadow-sm'
              : 'bg-[#F4F4F5] text-[#71717A] hover:text-[#09090B]'
          }`}
        >
          Reprogramación
        </button>
      </section>

      {/* ============================================================ */}
      {/* 4. FEATURED FREE TECHNIQUE CARD: TÉCNICA 4-4-4               */}
      {/* ============================================================ */}
      {(selectedFilter === 'all' || selectedFilter === 'respiracion') && (
        <section
          aria-label="Técnica destacada libre"
          className="relative bg-white rounded-3xl p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.06)] border border-[#ECECEE] space-y-4 hover:shadow-[0px_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F4F4F5] flex items-center justify-center text-[#09090B] shrink-0 border border-[#ECECEE]">
              <span className="material-symbols-outlined text-[26px]">air</span>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECECEE] text-[11px] font-sans font-bold uppercase tracking-wider text-[#09090B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A00]" />
              Gratis • Acceso Libre
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-[19px] leading-snug font-sans font-bold text-[#09090B]">
              Técnica 4-4-4: Enfoque y Respiración en Caja
            </h3>
            <p className="text-[12px] font-sans font-medium text-[#71717A]">
              Regulación del Sistema Parasimpático • 60 Segundos
            </p>
          </div>

          <p className="text-[13px] leading-relaxed font-sans text-[#71717A]">
            Inhala en 4s, retén en 4s y exhala en 4s. Reduce el ritmo cardíaco en menos de un minuto y restaura la actividad en el córtex prefrontal ante impulsos intensos.
          </p>

          {/* Primary Action Button: "Empezar" con tipografía e iconografía en blanco */}
          <button
            type="button"
            onClick={onStartBreathing}
            id="open-box-breath-modal"
            className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#09090B] text-white font-sans font-semibold text-[14px] flex items-center justify-center gap-2 shadow-sm hover:bg-[#18181B] active:scale-98 transition-all cursor-pointer"
          >
            <span
              className="material-symbols-outlined text-[20px] text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              play_arrow
            </span>
            <span className="tracking-tight text-white">Empezar</span>
          </button>
        </section>
      )}

      {/* ============================================================ */}
      {/* 5. PROTOCOLOS CLÍNICOS PRO (TODOS BLOQUEADOS POR DEFECTO)   */}
      {/* ============================================================ */}
      <section className="space-y-4 pt-2" aria-label="Técnicas avanzadas PRO">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#09090B]">lock</span>
            <h3 className="text-[18px] font-sans font-bold text-[#09090B]">
              Protocolos Clínicos PRO
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#ECECEE] text-[11px] font-sans font-semibold text-[#71717A]">
            5 Técnicas
          </span>
        </div>

        {/* PRO CARD 1: Grounding 5-4-3-2-1 */}
        {(selectedFilter === 'all' || selectedFilter === 'anclaje') && (
          <article className="technique-card bg-white rounded-3xl p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.06)] border border-[#ECECEE] space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F4F4F5] flex items-center justify-center text-[#09090B] shrink-0 border border-[#ECECEE]">
                <span className="material-symbols-outlined text-[24px]">visibility</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#09090B] text-white text-[11px] font-sans font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[13px]">lock</span> PRO
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-[18px] leading-snug font-sans font-bold text-[#09090B]">
                Método 5-4-3-2-1: Anclaje Sensorial (Grounding)
              </h4>
              <p className="text-[12px] font-sans font-medium text-[#71717A]">
                Disociación del Impulso • 3 a 5 min
              </p>
            </div>

            <p className="text-[13px] leading-relaxed font-sans text-[#71717A]">
              Fuerza al cerebro a salir del bucle de rumiación o urgencia adictiva anclando los 5 sentidos en el entorno físico inmediato.
            </p>

            {/* Sensory Steps Preview */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-[#F4F4F5] text-[12px] font-sans text-[#09090B]">
              {[
                { step: 5, action: 'ver', desc: 'Cosas que puedes ver a tu alrededor' },
                { step: 4, action: 'tocar', desc: 'Cosas que puedes tocar o sentir' },
                { step: 3, action: 'escuchar', desc: 'Cosas que puedes escuchar' },
                { step: 2, action: 'oler', desc: 'Cosas que puedes oler' },
                { step: 1, action: 'saborear', desc: 'Cosa que puedes saborear' },
              ].map(({ step, action }) => (
                <div
                  key={step}
                  className="w-full flex items-center justify-between gap-2 p-1.5 rounded-xl text-left opacity-90"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full font-sans font-bold text-[11px] flex items-center justify-center shrink-0 bg-[#ECECEE] text-[#09090B]">
                      {step}
                    </span>
                    <span className="truncate">
                      Cosas que puedes <strong className="font-semibold">{action}</strong>
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[15px] text-[#A1A1AA]">lock</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onSetProModalOpen(true)}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#F4F4F5] hover:bg-[#ECECEE] text-[#09090B] font-sans font-medium text-[13px] flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#71717A]">lock</span>
              <span>Desbloquear técnica</span>
            </button>
          </article>
        )}

        {/* PRO CARD 2: Urge Surfing */}
        {(selectedFilter === 'all' || selectedFilter === 'anclaje') && (
          <article className="technique-card bg-white rounded-3xl p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.06)] border border-[#ECECEE] space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F4F4F5] flex items-center justify-center text-[#09090B] shrink-0 border border-[#ECECEE]">
                <span className="material-symbols-outlined text-[24px]">psychology</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#09090B] text-white text-[11px] font-sans font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[13px]">lock</span> PRO
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-[18px] leading-snug font-sans font-bold text-[#09090B]">
                Protocolo de Urge Surfing (Surfear el Impulso)
              </h4>
              <p className="text-[12px] font-sans font-medium text-[#71717A]">
                Terapia de Aceptación y Compromiso (ACT) • 5 min
              </p>
            </div>

            <p className="text-[13px] leading-relaxed font-sans text-[#71717A]">
              En lugar de reprimir el impulso o ceder a él, visualízalo como una ola neuroquímica que alcanza un pico a los 3 minutos y luego se desvanece de forma natural.
            </p>

            {/* Sparkline wave container */}
            <div className="p-3.5 rounded-2xl bg-[#F4F4F5] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-sans text-[#71717A]">
                <span>Curva neuroquímica de dopamina</span>
                <span className="font-bold text-[#FF5A00]">Cresta a 3 min</span>
              </div>
              <svg className="w-full h-9 text-[#FF5A00] overflow-visible" fill="none" viewBox="0 0 300 40">
                <path
                  d="M 0 35 C 70 34, 110 5, 150 4 C 190 5, 230 32, 300 35"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
                <circle cx="150" cy="4" r="3.5" fill="currentColor" />
                <circle cx="150" cy="4" r="7" fill="currentColor" className="animate-ping opacity-60" />
              </svg>
            </div>

            <button
              type="button"
              onClick={() => onSetProModalOpen(true)}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#F4F4F5] hover:bg-[#ECECEE] text-[#09090B] font-sans font-medium text-[13px] flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#71717A]">lock</span>
              <span>Desbloquear técnica</span>
            </button>
          </article>
        )}

        {/* PRO CARD 3: Regla de los 10 Minutos */}
        {(selectedFilter === 'all' || selectedFilter === 'reprogramacion') && (
          <article className="technique-card bg-white rounded-3xl p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.06)] border border-[#ECECEE] space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F4F4F5] flex items-center justify-center text-[#09090B] shrink-0 border border-[#ECECEE]">
                <span className="material-symbols-outlined text-[24px]">timer</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#09090B] text-white text-[11px] font-sans font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[13px]">lock</span> PRO
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-[18px] leading-snug font-sans font-bold text-[#09090B]">
                Regla de los 10 Minutos y Aplazamiento Activo
              </h4>
              <p className="text-[12px] font-sans font-medium text-[#71717A]">
                Fricción Cognitiva • 10 min
              </p>
            </div>

            <p className="text-[13px] leading-relaxed font-sans text-[#71717A]">
              Acuerdo neuroconductual: no te prohíbes la conducta, pero retrasas la decisión 10 minutos mientras realizas una tarea motora distractora.
            </p>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#F4F4F5]">
              <span className="material-symbols-outlined text-[#FF5A00] text-[18px] shrink-0">update</span>
              <span className="text-[12px] font-sans text-[#71717A]">
                Incluye temporizador de enfriamiento y registro de detonante.
              </span>
            </div>

            <button
              type="button"
              onClick={() => onSetProModalOpen(true)}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#F4F4F5] hover:bg-[#ECECEE] text-[#09090B] font-sans font-medium text-[13px] flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#71717A]">lock</span>
              <span>Desbloquear técnica</span>
            </button>
          </article>
        )}

        {/* PRO CARD 4: Suspiro Cíclico */}
        {(selectedFilter === 'all' || selectedFilter === 'respiracion') && (
          <article className="technique-card bg-white rounded-3xl p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.06)] border border-[#ECECEE] space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F4F4F5] flex items-center justify-center text-[#09090B] shrink-0 border border-[#ECECEE]">
                <span className="material-symbols-outlined text-[24px]">self_improvement</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#09090B] text-white text-[11px] font-sans font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[13px]">lock</span> PRO
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-[18px] leading-snug font-sans font-bold text-[#09090B]">
                Suspiro Cíclico (Physiological Sigh)
              </h4>
              <p className="text-[12px] font-sans font-medium text-[#71717A]">
                Neurobiología de Stanford / Huberman • 3 min
              </p>
            </div>

            <p className="text-[13px] leading-relaxed font-sans text-[#71717A]">
              Dos inhalaciones profundas seguidas por la nariz y una exhalación prolongada por la boca. La forma fisiológica más rápida de descargar dióxido de carbono y reducir la excitación autónoma.
            </p>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F4F4F5] text-[12px] font-sans text-[#09090B]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF5A00]" />
                <span>Inhalación doble rápida</span>
              </div>
              <span className="text-[#71717A] font-semibold">Relación 1:2</span>
            </div>

            <button
              type="button"
              onClick={() => onSetProModalOpen(true)}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#F4F4F5] hover:bg-[#ECECEE] text-[#09090B] font-sans font-medium text-[13px] flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#71717A]">lock</span>
              <span>Desbloquear técnica</span>
            </button>
          </article>
        )}

        {/* PRO CARD 5: Diálogo Socrático */}
        {(selectedFilter === 'all' || selectedFilter === 'reprogramacion') && (
          <article className="technique-card bg-white rounded-3xl p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.06)] border border-[#ECECEE] space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F4F4F5] flex items-center justify-center text-[#09090B] shrink-0 border border-[#ECECEE]">
                <span className="material-symbols-outlined text-[24px]">edit_note</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#09090B] text-white text-[11px] font-sans font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[13px]">lock</span> PRO
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-[18px] leading-snug font-sans font-bold text-[#09090B]">
                Reestructuración Cognitiva: Diálogo Socrático
              </h4>
              <p className="text-[12px] font-sans font-medium text-[#71717A]">
                Terapia Cognitivo-Conductual (TCC) • 7 min
              </p>
            </div>

            <p className="text-[13px] leading-relaxed font-sans text-[#71717A]">
              Cuestionamiento guiado de pensamientos automáticos de autosabotaje: "¿Es realmente insoportable este malestar?" y reformulación activa de distorsiones cognitivas.
            </p>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#F4F4F5]">
              <span className="material-symbols-outlined text-[#71717A] text-[18px] shrink-0">
                psychology_alt
              </span>
              <span className="text-[12px] font-sans text-[#71717A]">
                4 preguntas socráticas interactivas + registro de creencia.
              </span>
            </div>

            <button
              type="button"
              onClick={() => onSetProModalOpen(true)}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#F4F4F5] hover:bg-[#ECECEE] text-[#09090B] font-sans font-medium text-[13px] flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#71717A]">lock</span>
              <span>Desbloquear técnica</span>
            </button>
          </article>
        )}
      </section>

      {/* ============================================================ */}
      {/* 6. MODAL CON PLAN DE PAGO PARA HACERSE PRO                   */}
      {/* ============================================================ */}
      {isProModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pro-plans-title"
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-3 pb-24 sm:p-4 animate-in fade-in duration-200"
          onClick={() => onSetProModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md mx-auto max-h-[82vh] overflow-y-auto bg-white rounded-[28px] sm:rounded-3xl shadow-2xl p-6 sm:p-7 flex flex-col space-y-5 animate-in slide-in-from-bottom duration-250 border border-[#ECECEE]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Row with Close & Handle */}
            <div className="w-12 h-1.5 rounded-full bg-[#ECECEE] mx-auto sm:hidden -mt-1 mb-1" />

            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5A00]/15 text-[#FF5A00] text-[11px] font-sans font-bold uppercase tracking-wider">
                <span
                  className="material-symbols-outlined text-[15px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                MEMBRESÍA PRO
              </span>
              <button
                type="button"
                onClick={() => onSetProModalOpen(false)}
                aria-label="Cerrar modal de membresía PRO"
                className="w-9 h-9 rounded-full bg-[#F4F4F5] hover:bg-[#ECECEE] flex items-center justify-center text-[#09090B] transition-colors active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1.5">
              <h3 id="pro-plans-title" className="text-[22px] font-sans font-bold text-[#09090B] leading-tight tracking-tight">
                Planes de Suscripción PRO
              </h3>
              <p className="text-[13px] leading-relaxed font-sans text-[#71717A]">
                Desbloquea el paquete integral de regulación neuroconductual, privacidad confidencial y acompañamiento inteligente.
              </p>
            </div>

            {/* Currency selector header */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[12px] font-sans font-bold text-[#09090B]">
                Frecuencia y divisa:
              </span>
              <div className="inline-flex p-0.5 rounded-xl bg-[#ECECEE] text-[11px] font-sans font-semibold">
                <button
                  type="button"
                  onClick={() => setCurrency('CLP')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    currency === 'CLP'
                      ? 'bg-[#09090B] text-white shadow-xs'
                      : 'text-[#71717A] hover:text-[#09090B]'
                  }`}
                >
                  🇨🇱 CLP ($)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    currency === 'USD'
                      ? 'bg-[#09090B] text-white shadow-xs'
                      : 'text-[#71717A] hover:text-[#09090B]'
                  }`}
                >
                  🇺🇸 USD ($)
                </button>
              </div>
            </div>

            {/* Selector de Planes de Pago (CLP o USD estricto para evitar saltos de línea) */}
            <div className="space-y-2.5">
              {/* Opción Anual */}
              <div
                onClick={() => setSelectedPlan('annual')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                  selectedPlan === 'annual'
                    ? 'border-[#09090B] bg-[#F9F9FA] ring-2 ring-[#09090B]'
                    : 'border-[#ECECEE] bg-white hover:border-[#D4D4D8]'
                }`}
              >
                <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#FF5A00] text-white text-[10px] font-sans font-bold uppercase tracking-wider shadow-sm">
                  Ahorra 44%
                </span>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 min-w-[20px] min-h-[20px] rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        selectedPlan === 'annual' ? 'border-[#09090B]' : 'border-[#D4D4D8]'
                      }`}
                    >
                      {selectedPlan === 'annual' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#09090B] shrink-0" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h5 className="font-sans font-bold text-[14px] text-[#09090B]">Plan Anual</h5>
                        <span className="text-[11px] font-semibold text-[#FF5A00]">7 días gratis</span>
                      </div>
                      <p className="text-[12px] font-sans text-[#71717A] truncate">
                        {currency === 'CLP'
                          ? 'Facturado $59.880 CLP al año'
                          : 'Facturado $59.99 USD al año'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[17px] font-sans font-extrabold text-[#09090B] whitespace-nowrap">
                      {currency === 'CLP' ? '$4.990 CLP' : '$4.99 USD'}
                    </span>
                    <span className="text-[11px] text-[#71717A] block font-medium">/ mes</span>
                  </div>
                </div>
              </div>

              {/* Opción Mensual */}
              <div
                onClick={() => setSelectedPlan('monthly')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedPlan === 'monthly'
                    ? 'border-[#09090B] bg-[#F9F9FA] ring-2 ring-[#09090B]'
                    : 'border-[#ECECEE] bg-white hover:border-[#D4D4D8]'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 min-w-[20px] min-h-[20px] rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        selectedPlan === 'monthly' ? 'border-[#09090B]' : 'border-[#D4D4D8]'
                      }`}
                    >
                      {selectedPlan === 'monthly' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#09090B] shrink-0" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-sans font-bold text-[14px] text-[#09090B]">Plan Mensual</h5>
                      <p className="text-[12px] font-sans text-[#71717A] truncate">
                        {currency === 'CLP'
                          ? 'Facturación flexible mes a mes'
                          : 'Facturación flexible mes a mes'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[17px] font-sans font-extrabold text-[#09090B] whitespace-nowrap">
                      {currency === 'CLP' ? '$8.990 CLP' : '$8.99 USD'}
                    </span>
                    <span className="text-[11px] text-[#71717A] block font-medium">/ mes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefit List: Todos los beneficios del paquete PRO */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#F4F4F5] border border-[#ECECEE]">
              <div className="flex items-center justify-between pb-1 border-b border-[#ECECEE]">
                <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#09090B]">
                  Todo lo que incluye tu membresía PRO
                </span>
                <span className="text-[11px] font-sans font-semibold text-[#FF5A00]">
                  4 Módulos
                </span>
              </div>

              {/* Beneficio 1 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#09090B] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">psychology</span>
                </div>
                <div className="space-y-0.5 text-[12px] font-sans min-w-0 flex-1">
                  <h6 className="font-bold text-[#09090B] leading-tight">
                    Acceso total a los 5 protocolos clínicos
                  </h6>
                  <p className="text-[#71717A] leading-relaxed">
                    Grounding 5-4-3-2-1, Urge Surfing, Suspiro Cíclico, Regla de 10 min y Diálogo Socrático sin límites.
                  </p>
                </div>
              </div>

              {/* Beneficio 2 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#09090B] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </div>
                <div className="space-y-0.5 text-[12px] font-sans min-w-0 flex-1">
                  <h6 className="font-bold text-[#09090B] leading-tight">
                    Función de contraseña para acceder a la app
                  </h6>
                  <p className="text-[#71717A] leading-relaxed">
                    Bloqueo de seguridad con PIN personal o biometría para blindar la privacidad total de tus registros y reflexiones.
                  </p>
                </div>
              </div>

              {/* Beneficio 3 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#09090B] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">block</span>
                </div>
                <div className="space-y-0.5 text-[12px] font-sans min-w-0 flex-1">
                  <h6 className="font-bold text-[#09090B] leading-tight">
                    Bloquear apps para evitar fricciones de distracción
                  </h6>
                  <p className="text-[#71717A] leading-relaxed">
                    Restricción activa de aplicaciones y notificaciones detonantes en momentos de alta vulnerabilidad o fatiga.
                  </p>
                </div>
              </div>

              {/* Beneficio 4 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#09090B] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                </div>
                <div className="space-y-0.5 text-[12px] font-sans min-w-0 flex-1">
                  <h6 className="font-bold text-[#09090B] leading-tight">
                    Análisis IA que ayuda a ver los insights del desafío
                  </h6>
                  <p className="text-[#71717A] leading-relaxed">
                    Diagnóstico inteligente con IA que correlaciona detonantes emocionales, horarios de riesgo y evolución de racha.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions CTA con tipografía e iconografía en blanco */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleSubscribePro}
                id="btn-activate-trial"
                className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#09090B] text-white font-sans font-bold text-[14px] flex items-center justify-center gap-2 shadow-md active:scale-98 transition-transform cursor-pointer text-center"
              >
                <span className="text-white">
                  {selectedPlan === 'annual'
                    ? 'Comenzar prueba gratis de 7 días'
                    : currency === 'CLP'
                    ? 'Suscribirme por $8.990 CLP / mes'
                    : 'Suscribirme por $8.99 USD / mes'}
                </span>
                <span className="material-symbols-outlined text-[18px] text-white shrink-0">arrow_forward</span>
              </button>

              <p className="text-[11px] font-sans text-center text-[#71717A]">
                Sin compromiso de permanencia. Cancela en 1 clic en cualquier momento.
              </p>

              <button
                type="button"
                onClick={() => onSetProModalOpen(false)}
                id="btn-cancel-pro"
                className="w-full py-2 text-center text-[13px] font-sans font-semibold text-[#71717A] hover:text-[#09090B] transition-colors cursor-pointer"
              >
                Volver a técnicas libres
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
