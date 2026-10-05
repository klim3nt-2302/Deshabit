import React, { useState } from 'react';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  isLoadingSimulated: boolean;
  onToggleLoading: () => void;
  currencyPreference: 'CLP' | 'USD';
  onSetCurrencyPreference: (curr: 'CLP' | 'USD') => void;
  isPinLockEnabled: boolean;
  onTogglePinLock: (enabled: boolean) => void;
  pinCode: string;
  onSetPinCode: (pin: string) => void;
  isAppBlockerEnabled: boolean;
  onToggleAppBlocker: (enabled: boolean) => void;
  blockedApps: string[];
  onSetBlockedApps: (apps: string[]) => void;
  isNonPunitiveMode: boolean;
  onToggleNonPunitiveMode: (enabled: boolean) => void;
  isMorningAlertEnabled: boolean;
  onToggleMorningAlert: (enabled: boolean) => void;
  morningTime: string;
  onSetMorningTime: (time: string) => void;
  isNightShieldEnabled: boolean;
  onToggleNightShield: (enabled: boolean) => void;
  nightShieldRange: { start: string; end: string };
  onSetNightShieldRange: (range: { start: string; end: string }) => void;
  onShowToast: (title: string, description?: string) => void;
}

type SubModalType =
  | null
  | 'pin'
  | 'app_blocker'
  | 'neuro_approach'
  | 'morning_alert'
  | 'night_shield'
  | 'currency'
  | 'offline'
  | 'skeleton';

const AVAILABLE_APPS = [
  { id: 'instagram', name: 'Instagram', icon: 'photo_camera', category: 'Redes sociales' },
  { id: 'tiktok', name: 'TikTok', icon: 'videocam', category: 'Videos cortos' },
  { id: 'x', name: 'X (Twitter)', icon: 'tag', category: 'Microblogging' },
  { id: 'youtube', name: 'YouTube Shorts', icon: 'smart_display', category: 'Videos' },
  { id: 'games', name: 'Juegos móviles', icon: 'sports_esports', category: 'Entretenimiento' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isOffline,
  onToggleOffline,
  isLoadingSimulated,
  onToggleLoading,
  currencyPreference,
  onSetCurrencyPreference,
  isPinLockEnabled,
  onTogglePinLock,
  pinCode,
  onSetPinCode,
  isAppBlockerEnabled,
  onToggleAppBlocker,
  blockedApps,
  onSetBlockedApps,
  isNonPunitiveMode,
  onToggleNonPunitiveMode,
  isMorningAlertEnabled,
  onToggleMorningAlert,
  morningTime,
  onSetMorningTime,
  isNightShieldEnabled,
  onToggleNightShield,
  nightShieldRange,
  onSetNightShieldRange,
  onShowToast,
}) => {
  const [activeSubModal, setActiveSubModal] = useState<SubModalType>(null);

  // Local editing states for submodals
  const [tempPin, setTempPin] = useState(pinCode);
  const [tempPinEnabled, setTempPinEnabled] = useState(isPinLockEnabled);
  const [tempAppBlockerEnabled, setTempAppBlockerEnabled] = useState(isAppBlockerEnabled);
  const [tempBlockedApps, setTempBlockedApps] = useState<string[]>(blockedApps);
  const [tempNonPunitive, setTempNonPunitive] = useState(isNonPunitiveMode);
  const [tempMorningAlert, setTempMorningAlert] = useState(isMorningAlertEnabled);
  const [tempMorningTime, setTempMorningTime] = useState(morningTime);
  const [tempNightShield, setTempNightShield] = useState(isNightShieldEnabled);
  const [tempNightStart, setTempNightStart] = useState(nightShieldRange.start);
  const [tempNightEnd, setTempNightEnd] = useState(nightShieldRange.end);
  const [tempCurrency, setTempCurrency] = useState<'CLP' | 'USD'>(currencyPreference);

  if (!isOpen) return null;

  // Open submodal and sync temporary state
  const handleOpenSubModal = (modal: SubModalType) => {
    if (modal === 'pin') {
      setTempPin(pinCode);
      setTempPinEnabled(isPinLockEnabled);
    } else if (modal === 'app_blocker') {
      setTempAppBlockerEnabled(isAppBlockerEnabled);
      setTempBlockedApps([...blockedApps]);
    } else if (modal === 'neuro_approach') {
      setTempNonPunitive(isNonPunitiveMode);
    } else if (modal === 'morning_alert') {
      setTempMorningAlert(isMorningAlertEnabled);
      setTempMorningTime(morningTime);
    } else if (modal === 'night_shield') {
      setTempNightShield(isNightShieldEnabled);
      setTempNightStart(nightShieldRange.start);
      setTempNightEnd(nightShieldRange.end);
    } else if (modal === 'currency') {
      setTempCurrency(currencyPreference);
    }
    setActiveSubModal(modal);
  };

  return (
    <>
      {/* Main Settings Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-main-title"
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-[390px] my-auto max-h-[85vh] overflow-y-auto bg-white rounded-[28px] sm:rounded-3xl shadow-2xl p-6 flex flex-col gap-6 animate-in zoom-in-95 duration-200 border border-[#ECECEE]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#09090B] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </div>
              <div>
                <h2 id="settings-main-title" className="text-[18px] font-sans font-bold text-[#09090B] leading-tight">
                  Ajustes
                </h2>
                <p className="text-[11px] font-sans text-[#71717A]">
                  Configuración de seguridad, horarios y sistema
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar ajustes"
              className="w-8 h-8 rounded-full bg-[#F4F4F5] hover:bg-[#ECECEE] flex items-center justify-center text-[#71717A] hover:text-[#09090B] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* 1. SEGURIDAD Y PRIVACIDAD PRO                             */}
          {/* ======================================================== */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[11px] font-sans font-bold uppercase tracking-[0.5px] text-[#71717A]">
                Seguridad y Privacidad PRO
              </span>
            </div>

            <div className="bg-white border border-[#ECECEE] rounded-2xl divide-y divide-[#ECECEE] overflow-hidden shadow-xs">
              {/* Acceso 1: Contraseña para acceder a la app */}
              <button
                type="button"
                onClick={() => handleOpenSubModal('pin')}
                className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-[#F9F9FA] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#F4F4F5] group-hover:bg-[#FFF1EB] text-[#09090B] group-hover:text-[#FF5A00] flex items-center justify-center shrink-0 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-sans font-bold text-[#09090B] truncate">
                      Contraseña para acceder a la app
                    </p>
                    <p className="text-[11px] font-sans text-[#71717A] truncate">
                      {isPinLockEnabled ? `PIN activo (${pinCode.replace(/./g, '•')})` : 'Desactivado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      isPinLockEnabled
                        ? 'bg-[#ECFDF5] text-[#10B981]'
                        : 'bg-[#F4F4F5] text-[#71717A]'
                    }`}
                  >
                    {isPinLockEnabled ? 'Activo' : 'Off'}
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-[#A1A1AA] group-hover:text-[#09090B] group-hover:translate-x-0.5 transition-all">
                    chevron_right
                  </span>
                </div>
              </button>

              {/* Acceso 2: Bloquear apps */}
              <button
                type="button"
                onClick={() => handleOpenSubModal('app_blocker')}
                className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-[#F9F9FA] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#F4F4F5] group-hover:bg-[#FFF1EB] text-[#09090B] group-hover:text-[#FF5A00] flex items-center justify-center shrink-0 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">block</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-sans font-bold text-[#09090B] truncate">
                      Bloquear apps
                    </p>
                    <p className="text-[11px] font-sans text-[#71717A] truncate">
                      {isAppBlockerEnabled ? `${blockedApps.length} apps protegidas` : 'Sin restricciones activas'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      isAppBlockerEnabled
                        ? 'bg-[#ECFDF5] text-[#10B981]'
                        : 'bg-[#F4F4F5] text-[#71717A]'
                    }`}
                  >
                    {isAppBlockerEnabled ? 'Activo' : 'Off'}
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-[#A1A1AA] group-hover:text-[#09090B] group-hover:translate-x-0.5 transition-all">
                    chevron_right
                  </span>
                </div>
              </button>

              {/* Acceso 3: Enfoque neuroconductual */}
              <button
                type="button"
                onClick={() => handleOpenSubModal('neuro_approach')}
                className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-[#F9F9FA] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#F4F4F5] group-hover:bg-[#FFF1EB] text-[#09090B] group-hover:text-[#FF5A00] flex items-center justify-center shrink-0 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">favorite</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-sans font-bold text-[#09090B] truncate">
                      Enfoque neuroconductual
                    </p>
                    <p className="text-[11px] font-sans text-[#71717A] truncate">
                      {isNonPunitiveMode ? 'Marco compasivo (resbalón ≠ 0)' : 'Marco lineal estricto'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-[#FFF1EB] text-[#FF5A00]">
                    {isNonPunitiveMode ? 'Compasivo' : 'Estricto'}
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-[#A1A1AA] group-hover:text-[#09090B] group-hover:translate-x-0.5 transition-all">
                    chevron_right
                  </span>
                </div>
              </button>
            </div>
          </section>

          {/* ======================================================== */}
          {/* 2. PREFERENCIAS Y HORARIOS                                */}
          {/* ======================================================== */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[11px] font-sans font-bold uppercase tracking-[0.5px] text-[#71717A]">
                Preferencias y Horarios
              </span>
            </div>

            <div className="bg-white border border-[#ECECEE] rounded-2xl divide-y divide-[#ECECEE] overflow-hidden shadow-xs">
              {/* Acceso 1: Compromiso diario matutino */}
              <button
                type="button"
                onClick={() => handleOpenSubModal('morning_alert')}
                className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-[#F9F9FA] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#F4F4F5] group-hover:bg-[#FFF1EB] text-[#09090B] group-hover:text-[#FF5A00] flex items-center justify-center shrink-0 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">wb_sunny</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-sans font-bold text-[#09090B] truncate">
                      Compromiso diario matutino
                    </p>
                    <p className="text-[11px] font-sans text-[#71717A] truncate">
                      {isMorningAlertEnabled ? `Notificación a las ${morningTime}` : 'Desactivado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] font-sans font-semibold text-[#09090B]">
                    {morningTime}
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-[#A1A1AA] group-hover:text-[#09090B] group-hover:translate-x-0.5 transition-all">
                    chevron_right
                  </span>
                </div>
              </button>

              {/* Acceso 2: Escudo de riesgo nocturno */}
              <button
                type="button"
                onClick={() => handleOpenSubModal('night_shield')}
                className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-[#F9F9FA] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#F4F4F5] group-hover:bg-[#FFF1EB] text-[#09090B] group-hover:text-[#FF5A00] flex items-center justify-center shrink-0 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">bedtime</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-sans font-bold text-[#09090B] truncate">
                      Escudo de riesgo nocturno
                    </p>
                    <p className="text-[11px] font-sans text-[#71717A] truncate">
                      {isNightShieldEnabled ? `${nightShieldRange.start} a ${nightShieldRange.end} hrs` : 'Inactivo'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      isNightShieldEnabled ? 'bg-[#ECFDF5] text-[#10B981]' : 'bg-[#F4F4F5] text-[#71717A]'
                    }`}
                  >
                    {isNightShieldEnabled ? 'Activo' : 'Off'}
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-[#A1A1AA] group-hover:text-[#09090B] group-hover:translate-x-0.5 transition-all">
                    chevron_right
                  </span>
                </div>
              </button>

              {/* Acceso 3: Divisas de ahorro */}
              <button
                type="button"
                onClick={() => handleOpenSubModal('currency')}
                className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-[#F9F9FA] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#F4F4F5] group-hover:bg-[#FFF1EB] text-[#09090B] group-hover:text-[#FF5A00] flex items-center justify-center shrink-0 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">payments</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-sans font-bold text-[#09090B] truncate">
                      Divisas de ahorro
                    </p>
                    <p className="text-[11px] font-sans text-[#71717A] truncate">
                      Moneda para cuantificación y planes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] font-sans font-bold px-2 py-0.5 rounded-md bg-[#ECECEE] text-[#09090B]">
                    {currencyPreference === 'CLP' ? '🇨🇱 CLP' : '🇺🇸 USD'}
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-[#A1A1AA] group-hover:text-[#09090B] group-hover:translate-x-0.5 transition-all">
                    chevron_right
                  </span>
                </div>
              </button>
            </div>
          </section>

          {/* ======================================================== */}
          {/* 3. SISTEMA Y ALMACENAMIENTO                               */}
          {/* ======================================================== */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[11px] font-sans font-bold uppercase tracking-[0.5px] text-[#71717A]">
                Sistema y Almacenamiento
              </span>
            </div>

            <div className="bg-white border border-[#ECECEE] rounded-2xl divide-y divide-[#ECECEE] overflow-hidden shadow-xs">
              {/* Acceso 1: Activar modo offline */}
              <button
                type="button"
                onClick={() => handleOpenSubModal('offline')}
                className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-[#F9F9FA] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#F4F4F5] group-hover:bg-[#FFF1EB] text-[#09090B] group-hover:text-[#FF5A00] flex items-center justify-center shrink-0 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">wifi_off</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-sans font-bold text-[#09090B] truncate">
                      Activar modo offline
                    </p>
                    <p className="text-[11px] font-sans text-[#71717A] truncate">
                      {isOffline ? 'Modo sin conexión forzado' : 'En línea con persistencia local'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      isOffline ? 'bg-[#FFF1EB] text-[#FF5A00]' : 'bg-[#F4F4F5] text-[#71717A]'
                    }`}
                  >
                    {isOffline ? 'Offline' : 'Online'}
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-[#A1A1AA] group-hover:text-[#09090B] group-hover:translate-x-0.5 transition-all">
                    chevron_right
                  </span>
                </div>
              </button>

              {/* Acceso 2: Simulador skeleton loader */}
              <button
                type="button"
                onClick={() => handleOpenSubModal('skeleton')}
                className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-[#F9F9FA] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#F4F4F5] group-hover:bg-[#FFF1EB] text-[#09090B] group-hover:text-[#FF5A00] flex items-center justify-center shrink-0 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">hourglass_empty</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-sans font-bold text-[#09090B] truncate">
                      Simulador skeleton loader
                    </p>
                    <p className="text-[11px] font-sans text-[#71717A] truncate">
                      {isLoadingSimulated ? 'Mostrando animación shimmer' : 'Carga normal'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      isLoadingSimulated ? 'bg-[#FFF1EB] text-[#FF5A00]' : 'bg-[#F4F4F5] text-[#71717A]'
                    }`}
                  >
                    {isLoadingSimulated ? 'Activo' : 'Normal'}
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-[#A1A1AA] group-hover:text-[#09090B] group-hover:translate-x-0.5 transition-all">
                    chevron_right
                  </span>
                </div>
              </button>
            </div>
          </section>

          {/* Footer note */}
          <div className="pt-2 text-center border-t border-[#ECECEE]">
            <p className="text-[11px] font-sans text-[#A1A1AA]">
              Deshabit v2.4 · Todos los cambios se guardan localmente
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SUB-MODALES DEDICADOS PARA CADA ACCESO                       */}
      {/* ============================================================ */}

      {/* 1. Modal: Contraseña para acceder a la app */}
      {activeSubModal === 'pin' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setActiveSubModal(null)}
        >
          <div
            className="w-full max-w-[340px] bg-white border border-[#ECECEE] rounded-[28px] p-6 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F4F5] text-[#09090B] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">lock</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubModal(null)}
                className="p-1 rounded-full text-[#71717A] hover:bg-[#F4F4F5]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-[17px] font-sans font-bold text-[#09090B]">
                Contraseña de Acceso
              </h3>
              <p className="text-[12px] font-sans text-[#71717A] leading-relaxed">
                Protege tu diario conductual con un código PIN de 4 dígitos o biometría.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F4F5]">
              <span className="text-[13px] font-sans font-semibold text-[#09090B]">
                Solicitar contraseña al abrir
              </span>
              <button
                type="button"
                onClick={() => setTempPinEnabled(!tempPinEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  tempPinEnabled ? 'bg-[#09090B]' : 'bg-[#D4D4D8]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    tempPinEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {tempPinEnabled && (
              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-sans font-bold uppercase text-[#71717A] block text-center">
                  PIN numérico de 4 dígitos
                </label>
                <div className="flex justify-center">
                  <input
                    type="password"
                    maxLength={4}
                    value={tempPin}
                    onChange={(e) => setTempPin(e.target.value.replace(/\D/g, ''))}
                    className="w-36 h-12 text-center text-[24px] font-mono tracking-[8px] bg-[#F4F4F5] border border-[#ECECEE] rounded-xl outline-none focus:border-[#09090B]"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveSubModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#ECECEE] text-[#09090B] font-sans font-semibold text-[13px] hover:bg-[#F4F4F5] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onTogglePinLock(tempPinEnabled);
                  if (tempPinEnabled && tempPin.length === 4) {
                    onSetPinCode(tempPin);
                  }
                  setActiveSubModal(null);
                  onShowToast(
                    tempPinEnabled ? 'Contraseña configurada' : 'Contraseña desactivada',
                    tempPinEnabled ? 'Tu PIN de acceso ha sido actualizado exitosamente.' : 'Ya no se solicitará PIN al entrar.'
                  );
                }}
                disabled={tempPinEnabled && tempPin.length !== 4}
                className="flex-1 py-2.5 rounded-xl bg-[#09090B] text-white font-sans font-semibold text-[13px] disabled:opacity-50 hover:bg-[#27272A] cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: Bloquear apps */}
      {activeSubModal === 'app_blocker' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setActiveSubModal(null)}
        >
          <div
            className="w-full max-w-[340px] bg-white border border-[#ECECEE] rounded-[28px] p-6 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF1EB] text-[#FF5A00] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">block</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubModal(null)}
                className="p-1 rounded-full text-[#71717A] hover:bg-[#F4F4F5]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-[17px] font-sans font-bold text-[#09090B]">
                Bloqueo de Apps Distractoras
              </h3>
              <p className="text-[12px] font-sans text-[#71717A] leading-relaxed">
                Añade fricción cognitiva para impedir accesos involuntarios a plataformas de alta recompensa rápida.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F4F5]">
              <span className="text-[13px] font-sans font-semibold text-[#09090B]">
                Fricción ambiental activa
              </span>
              <button
                type="button"
                onClick={() => setTempAppBlockerEnabled(!tempAppBlockerEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  tempAppBlockerEnabled ? 'bg-[#FF5A00]' : 'bg-[#D4D4D8]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    tempAppBlockerEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {tempAppBlockerEnabled && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                <label className="text-[11px] font-sans font-bold uppercase text-[#71717A] block">
                  Apps seleccionadas para blindar
                </label>
                <div className="space-y-1.5">
                  {AVAILABLE_APPS.map((app) => {
                    const isChecked = tempBlockedApps.includes(app.id);
                    return (
                      <div
                        key={app.id}
                        onClick={() => {
                          if (isChecked) {
                            setTempBlockedApps(tempBlockedApps.filter((id) => id !== app.id));
                          } else {
                            setTempBlockedApps([...tempBlockedApps, app.id]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-[#FFF1EB] border-[#FFD8C7]'
                            : 'bg-white border-[#ECECEE] hover:bg-[#F9F9FA]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[18px] text-[#09090B]">
                            {app.icon}
                          </span>
                          <div>
                            <p className="text-[12px] font-sans font-bold text-[#09090B] leading-tight">
                              {app.name}
                            </p>
                            <p className="text-[10px] font-sans text-[#71717A] leading-tight">
                              {app.category}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isChecked ? 'bg-[#FF5A00] border-[#FF5A00] text-white' : 'border-[#D4D4D8]'
                          }`}
                        >
                          {isChecked && <span className="material-symbols-outlined text-[12px]">check</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveSubModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#ECECEE] text-[#09090B] font-sans font-semibold text-[13px] hover:bg-[#F4F4F5] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onToggleAppBlocker(tempAppBlockerEnabled);
                  onSetBlockedApps(tempBlockedApps);
                  setActiveSubModal(null);
                  onShowToast(
                    tempAppBlockerEnabled ? 'Bloqueador activado' : 'Bloqueador desactivado',
                    `Se han establecido ${tempBlockedApps.length} aplicaciones blindadas.`
                  );
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#09090B] text-white font-sans font-semibold text-[13px] hover:bg-[#27272A] cursor-pointer"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal: Enfoque neuroconductual */}
      {activeSubModal === 'neuro_approach' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setActiveSubModal(null)}
        >
          <div
            className="w-full max-w-[340px] bg-white border border-[#ECECEE] rounded-[28px] p-6 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF1EB] text-[#FF5A00] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">favorite</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubModal(null)}
                className="p-1 rounded-full text-[#71717A] hover:bg-[#F4F4F5]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-[17px] font-sans font-bold text-[#09090B]">
                Enfoque Neuroconductual
              </h3>
              <p className="text-[12px] font-sans text-[#71717A] leading-relaxed">
                Define cómo procesa la app los resbalones accidentales.
              </p>
            </div>

            <div className="space-y-2">
              <div
                onClick={() => setTempNonPunitive(true)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  tempNonPunitive
                    ? 'border-[#09090B] bg-[#F9F9FA] ring-2 ring-[#09090B]'
                    : 'border-[#ECECEE] bg-white hover:border-[#D4D4D8]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#FF5A00]">
                      psychology_alt
                    </span>
                    <h4 className="text-[13px] font-sans font-bold text-[#09090B]">
                      Marco Compasivo (Recomendado)
                    </h4>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      tempNonPunitive ? 'border-[#09090B]' : 'border-[#D4D4D8]'
                    }`}
                  >
                    {tempNonPunitive && <div className="w-2 h-2 rounded-full bg-[#09090B]" />}
                  </div>
                </div>
                <p className="text-[11px] font-sans text-[#71717A] mt-1.5 leading-relaxed">
                  Un resbalón es solo una desviación temporal de datos. Tu neuroplasticidad y días ganados no se borran a cero.
                </p>
              </div>

              <div
                onClick={() => setTempNonPunitive(false)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  !tempNonPunitive
                    ? 'border-[#09090B] bg-[#F9F9FA] ring-2 ring-[#09090B]'
                    : 'border-[#ECECEE] bg-white hover:border-[#D4D4D8]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#71717A]">
                      restart_alt
                    </span>
                    <h4 className="text-[13px] font-sans font-bold text-[#09090B]">
                      Marco Lineal Estricto
                    </h4>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      !tempNonPunitive ? 'border-[#09090B]' : 'border-[#D4D4D8]'
                    }`}
                  >
                    {!tempNonPunitive && <div className="w-2 h-2 rounded-full bg-[#09090B]" />}
                  </div>
                </div>
                <p className="text-[11px] font-sans text-[#71717A] mt-1.5 leading-relaxed">
                  Cualquier desliz reinicia la racha activa inmediatamente a día 0.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveSubModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#ECECEE] text-[#09090B] font-sans font-semibold text-[13px] hover:bg-[#F4F4F5] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onToggleNonPunitiveMode(tempNonPunitive);
                  setActiveSubModal(null);
                  onShowToast(
                    'Enfoque actualizado',
                    tempNonPunitive ? 'Modo compasivo activo: tu plasticidad acumulada está protegida.' : 'Modo estricto activado.'
                  );
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#09090B] text-white font-sans font-semibold text-[13px] hover:bg-[#27272A] cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: Compromiso diario matutino */}
      {activeSubModal === 'morning_alert' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setActiveSubModal(null)}
        >
          <div
            className="w-full max-w-[340px] bg-white border border-[#ECECEE] rounded-[28px] p-6 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF1EB] text-[#FF5A00] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">wb_sunny</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubModal(null)}
                className="p-1 rounded-full text-[#71717A] hover:bg-[#F4F4F5]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-[17px] font-sans font-bold text-[#09090B]">
                Compromiso Diario Matutino
              </h3>
              <p className="text-[12px] font-sans text-[#71717A] leading-relaxed">
                Notificación suave para anclar la intención prefrontal al despertar.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F4F5]">
              <span className="text-[13px] font-sans font-semibold text-[#09090B]">
                Notificación matutina
              </span>
              <button
                type="button"
                onClick={() => setTempMorningAlert(!tempMorningAlert)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  tempMorningAlert ? 'bg-[#09090B]' : 'bg-[#D4D4D8]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    tempMorningAlert ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {tempMorningAlert && (
              <div className="space-y-2">
                <label className="text-[11px] font-sans font-bold uppercase text-[#71717A] block">
                  Horario de alerta
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['07:00 AM', '08:00 AM', '09:00 AM'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTempMorningTime(t)}
                      className={`py-2 rounded-xl text-[12px] font-sans font-bold border transition-colors cursor-pointer ${
                        tempMorningTime === t
                          ? 'bg-[#09090B] text-white border-[#09090B]'
                          : 'bg-white text-[#71717A] border-[#ECECEE] hover:border-[#D4D4D8]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveSubModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#ECECEE] text-[#09090B] font-sans font-semibold text-[13px] hover:bg-[#F4F4F5] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onToggleMorningAlert(tempMorningAlert);
                  onSetMorningTime(tempMorningTime);
                  setActiveSubModal(null);
                  onShowToast(
                    tempMorningAlert ? 'Compromiso matutino fijado' : 'Alerta desactivada',
                    `Horario configurado para las ${tempMorningTime}.`
                  );
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#09090B] text-white font-sans font-semibold text-[13px] hover:bg-[#27272A] cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal: Escudo de riesgo nocturno */}
      {activeSubModal === 'night_shield' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setActiveSubModal(null)}
        >
          <div
            className="w-full max-w-[340px] bg-white border border-[#ECECEE] rounded-[28px] p-6 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF1EB] text-[#FF5A00] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">bedtime</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubModal(null)}
                className="p-1 rounded-full text-[#71717A] hover:bg-[#F4F4F5]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-[17px] font-sans font-bold text-[#09090B]">
                Escudo de Riesgo Nocturno
              </h3>
              <p className="text-[12px] font-sans text-[#71717A] leading-relaxed">
                Protección reforzada durante tus horas de mayor vulnerabilidad por fatiga del lóbulo frontal.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F4F5]">
              <span className="text-[13px] font-sans font-semibold text-[#09090B]">
                Escudo nocturno activo
              </span>
              <button
                type="button"
                onClick={() => setTempNightShield(!tempNightShield)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  tempNightShield ? 'bg-[#09090B]' : 'bg-[#D4D4D8]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    tempNightShield ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {tempNightShield && (
              <div className="space-y-2">
                <label className="text-[11px] font-sans font-bold uppercase text-[#71717A] block">
                  Ventana de alta vulnerabilidad
                </label>
                <div className="flex items-center justify-between p-3 rounded-xl border border-[#ECECEE] bg-[#FAFAFA]">
                  <div className="text-center flex-1">
                    <span className="text-[10px] text-[#71717A] uppercase font-bold block">Inicio</span>
                    <span className="text-[14px] font-sans font-bold text-[#09090B]">{tempNightStart}</span>
                  </div>
                  <span className="text-[#A1A1AA] font-bold">→</span>
                  <div className="text-center flex-1">
                    <span className="text-[10px] text-[#71717A] uppercase font-bold block">Término</span>
                    <span className="text-[14px] font-sans font-bold text-[#09090B]">{tempNightEnd}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveSubModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#ECECEE] text-[#09090B] font-sans font-semibold text-[13px] hover:bg-[#F4F4F5] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onToggleNightShield(tempNightShield);
                  onSetNightShieldRange({ start: tempNightStart, end: tempNightEnd });
                  setActiveSubModal(null);
                  onShowToast(
                    tempNightShield ? 'Escudo nocturno activado' : 'Escudo nocturno pausado',
                    `Vigente entre las ${tempNightStart} y las ${tempNightEnd} hrs.`
                  );
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#09090B] text-white font-sans font-semibold text-[13px] hover:bg-[#27272A] cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal: Divisas de ahorro */}
      {activeSubModal === 'currency' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setActiveSubModal(null)}
        >
          <div
            className="w-full max-w-[340px] bg-white border border-[#ECECEE] rounded-[28px] p-6 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F4F5] text-[#09090B] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">payments</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubModal(null)}
                className="p-1 rounded-full text-[#71717A] hover:bg-[#F4F4F5]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-[17px] font-sans font-bold text-[#09090B]">
                Divisas de Ahorro y Planes
              </h3>
              <p className="text-[12px] font-sans text-[#71717A] leading-relaxed">
                Elige la moneda para expresar el dinero ahorrado en tus hábitos y la tarifa de planes.
              </p>
            </div>

            <div className="space-y-2">
              <div
                onClick={() => setTempCurrency('CLP')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  tempCurrency === 'CLP'
                    ? 'border-[#09090B] bg-[#F9F9FA] ring-2 ring-[#09090B]'
                    : 'border-[#ECECEE] bg-white hover:border-[#D4D4D8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[20px]">🇨🇱</span>
                  <div>
                    <h4 className="text-[13px] font-sans font-bold text-[#09090B]">
                      Pesos Chilenos (CLP)
                    </h4>
                    <p className="text-[11px] font-sans text-[#71717A]">
                      Ejemplo: $245.000 CLP acumulados
                    </p>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    tempCurrency === 'CLP' ? 'border-[#09090B]' : 'border-[#D4D4D8]'
                  }`}
                >
                  {tempCurrency === 'CLP' && <div className="w-2 h-2 rounded-full bg-[#09090B]" />}
                </div>
              </div>

              <div
                onClick={() => setTempCurrency('USD')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  tempCurrency === 'USD'
                    ? 'border-[#09090B] bg-[#F9F9FA] ring-2 ring-[#09090B]'
                    : 'border-[#ECECEE] bg-white hover:border-[#D4D4D8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[20px]">🇺🇸</span>
                  <div>
                    <h4 className="text-[13px] font-sans font-bold text-[#09090B]">
                      Dólares Americanos (USD)
                    </h4>
                    <p className="text-[11px] font-sans text-[#71717A]">
                      Ejemplo: $260 USD acumulados
                    </p>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    tempCurrency === 'USD' ? 'border-[#09090B]' : 'border-[#D4D4D8]'
                  }`}
                >
                  {tempCurrency === 'USD' && <div className="w-2 h-2 rounded-full bg-[#09090B]" />}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveSubModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#ECECEE] text-[#09090B] font-sans font-semibold text-[13px] hover:bg-[#F4F4F5] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onSetCurrencyPreference(tempCurrency);
                  setActiveSubModal(null);
                  onShowToast('Divisa actualizada', `Se ha seleccionado ${tempCurrency === 'CLP' ? 'Pesos Chilenos (CLP)' : 'Dólares (USD)'}.`);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#09090B] text-white font-sans font-semibold text-[13px] hover:bg-[#27272A] cursor-pointer"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal: Activar modo offline */}
      {activeSubModal === 'offline' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setActiveSubModal(null)}
        >
          <div
            className="w-full max-w-[340px] bg-white border border-[#ECECEE] rounded-[28px] p-6 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF1EB] text-[#FF5A00] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">wifi_off</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubModal(null)}
                className="p-1 rounded-full text-[#71717A] hover:bg-[#F4F4F5]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-[17px] font-sans font-bold text-[#09090B]">
                Modo Offline y SQLite
              </h3>
              <p className="text-[12px] font-sans text-[#71717A] leading-relaxed">
                Prueba la arquitectura de resiliencia: la app guarda todos tus registros localmente sin requerir conexión a internet.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl border border-[#ECECEE] bg-[#FAFAFA] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-sans font-semibold text-[#09090B]">
                  Simular desconexión
                </span>
                <button
                  type="button"
                  onClick={onToggleOffline}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                    isOffline ? 'bg-[#FF5A00]' : 'bg-[#D4D4D8]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      isOffline ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] font-sans text-[#71717A]">
                {isOffline
                  ? 'El banner superior está visible y las operaciones se almacenan en cola local.'
                  : 'Conexión activa normal con persistencia local instantánea.'}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveSubModal(null)}
                className="w-full py-2.5 rounded-xl bg-[#09090B] text-white font-sans font-semibold text-[13px] hover:bg-[#27272A] cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Modal: Simulador skeleton loader */}
      {activeSubModal === 'skeleton' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setActiveSubModal(null)}
        >
          <div
            className="w-full max-w-[340px] bg-white border border-[#ECECEE] rounded-[28px] p-6 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F4F5] text-[#09090B] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">hourglass_empty</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubModal(null)}
                className="p-1 rounded-full text-[#71717A] hover:bg-[#F4F4F5]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-[17px] font-sans font-bold text-[#09090B]">
                Simulador Skeleton Loader
              </h3>
              <p className="text-[12px] font-sans text-[#71717A] leading-relaxed">
                Muestra la animación shimmer de carga previa para validar la experiencia de baja latencia sin alterar tus datos.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl border border-[#ECECEE] bg-[#FAFAFA] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-sans font-semibold text-[#09090B]">
                  Activar estado Shimmer
                </span>
                <button
                  type="button"
                  onClick={onToggleLoading}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                    isLoadingSimulated ? 'bg-[#09090B]' : 'bg-[#D4D4D8]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      isLoadingSimulated ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] font-sans text-[#71717A]">
                {isLoadingSimulated
                  ? 'La interfaz muestra esqueletos de carga. Al desactivar, volverá a la vista regular.'
                  : 'Vista normal de la interfaz.'}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveSubModal(null)}
                className="w-full py-2.5 rounded-xl bg-[#09090B] text-white font-sans font-semibold text-[13px] hover:bg-[#27272A] cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
