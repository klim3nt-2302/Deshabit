import React, { useState } from 'react';

interface ProSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (title: string, description?: string) => void;
  initialCurrency?: 'CLP' | 'USD';
}

export const ProSubscriptionModal: React.FC<ProSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  initialCurrency = 'CLP',
}) => {
  const [currency, setCurrency] = useState<'CLP' | 'USD'>(initialCurrency);
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');

  if (!isOpen) return null;

  const handleSubscribe = () => {
    onClose();
    onShowToast(
      '¡Suscripción PRO Activada!',
      selectedPlan === 'annual'
        ? `Has iniciado tu prueba gratuita de 7 días (${currency === 'CLP' ? '$59.880 CLP/año' : '$59.99 USD/año'}).`
        : `Membresía mensual activada (${currency === 'CLP' ? '$8.990 CLP/mes' : '$8.99 USD/mes'}).`
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pro-plans-modal-title"
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-3 pb-24 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md mx-auto max-h-[82vh] overflow-y-auto bg-white rounded-[28px] sm:rounded-3xl shadow-2xl p-6 sm:p-7 flex flex-col space-y-5 animate-in slide-in-from-bottom duration-250 border border-[#ECECEE]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle para móvil */}
        <div className="w-12 h-1.5 rounded-full bg-[#ECECEE] mx-auto sm:hidden -mt-1 mb-1" />

        {/* Top Header */}
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
            onClick={onClose}
            aria-label="Cerrar modal de membresía PRO"
            className="w-9 h-9 rounded-full bg-[#F4F4F5] hover:bg-[#ECECEE] flex items-center justify-center text-[#09090B] transition-colors active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <h3 id="pro-plans-modal-title" className="text-[22px] font-sans font-bold text-[#09090B] leading-tight tracking-tight">
            Planes de Suscripción PRO
          </h3>
          <p className="text-[13px] leading-relaxed font-sans text-[#71717A]">
            Desbloquea el paquete integral de regulación neuroconductual, privacidad confidencial y acompañamiento inteligente.
          </p>
        </div>

        {/* Selector de divisa */}
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
                Impide la apertura impulsiva de redes sociales y apps adictivas durante tus ventanas de alta vulnerabilidad.
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
                Diagnóstico inteligente sobre patrones de recaída, detonantes emocionales y predicción de impulsos.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleSubscribe}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#09090B] hover:bg-[#27272A] text-white font-sans font-bold text-[14px] flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer shadow-md"
          >
            <span>
              {selectedPlan === 'annual'
                ? 'Comenzar prueba gratuita de 7 días'
                : 'Suscribirme al Plan Mensual'}
            </span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>

          <p className="text-[11px] text-center text-[#71717A] font-sans">
            Cancela en cualquier momento desde tu configuración. Sin permanencia.
          </p>
        </div>
      </div>
    </div>
  );
};
