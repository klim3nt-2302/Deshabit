import React, { useState } from 'react';
import { Habit, ChallengeItem } from '../types';
import { ProSubscriptionModal } from './ProSubscriptionModal';
import { UserAccount } from '../data/accountsData';
import { NotificationBellButton } from './NotificationBellButton';

interface ProfileViewProps {
  habits: Habit[];
  challenges: ChallengeItem[];
  currencyPreference?: 'CLP' | 'USD';
  currentUser?: UserAccount | null;
  onOpenNotifications: () => void;
  unreadNotificationsCount?: number;
  onShowToast: (title: string, description?: string) => void;
  onOpenProModal?: () => void;
  isProModalOpen?: boolean;
  onSetProModalOpen?: (isOpen: boolean) => void;
  onOpenAuthModal?: () => void;
  onOpenSwitchAccount?: () => void;
  onLogout?: () => void;
  onOpenOnboarding?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  habits,
  challenges,
  currencyPreference = 'CLP',
  currentUser,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  onShowToast,
  onOpenProModal,
  isProModalOpen: externalProModalOpen,
  onSetProModalOpen,
  onOpenAuthModal,
  onOpenSwitchAccount,
  onLogout,
  onOpenOnboarding,
}) => {
  // User profile state
  const [userName, setUserName] = useState(currentUser?.name || 'Alejandro García');
  const userEmail = currentUser?.email || 'alejandro.garcia@neuroflow.cl';
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const userInitials = userName
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'DH';

  // In-place PRO subscription modal state (controlled or uncontrolled)
  const [internalProModalOpen, setInternalProModalOpen] = useState(false);
  const isProModalActive =
    externalProModalOpen !== undefined ? externalProModalOpen : internalProModalOpen;

  const handleSetProModalOpen = (open: boolean) => {
    setInternalProModalOpen(open);
    if (onSetProModalOpen) {
      onSetProModalOpen(open);
    }
    if (open && onOpenProModal) {
      onOpenProModal();
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Calculate live neuro metrics
  const totalCleanDays = habits.reduce((acc, h) => acc + (h.cleanDaysCount || 0), 0);
  const totalCompletedChallenges = challenges.filter((c) => c.status === 'completed').length;
  const totalActiveChallenges = challenges.filter((c) => c.status === 'active').length;

  // Approximate savings calculation
  const totalMoneySavedCLP = habits.reduce(
    (acc, h) => acc + (h.savings?.moneyPerDay ? h.savings.moneyPerDay * (h.cleanDaysCount || 0) : 0),
    0
  );
  const totalHoursSaved = habits.reduce(
    (acc, h) =>
      acc + (h.savings?.minutesPerDay ? Math.round((h.savings.minutesPerDay * (h.cleanDaysCount || 0)) / 60) : 0),
    0
  );

  // Progress bar calculation towards next clinical milestone (e.g. 60-day neuroplasticity milestone)
  const milestoneTargetDays = 60;
  const currentProgressDays = totalCleanDays > 0 ? totalCleanDays : 42;
  const progressPercentage = Math.min(100, Math.round((currentProgressDays / milestoneTargetDays) * 100));

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUserName(tempName.trim());
      setIsEditingName(false);
      onShowToast('Perfil actualizado', 'Tu nombre se ha guardado correctamente.');
    }
  };

  const handleTriggerProModal = () => {
    handleSetProModalOpen(true);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 358px max width container matching mobile viewport design */}
      <div className="w-full max-w-[358px] flex flex-col gap-6 pb-36 animate-in fade-in duration-200">
        {/* ============================================================ */}
        {/* 1. HEADER DE PANTALLA COMPLETA PERFIL                        */}
        {/* ============================================================ */}
        <header className="w-full flex items-center justify-between py-2">
          <div>
            <h1 className="text-[24px] font-sans font-semibold text-[#09090B] tracking-tight leading-[32px]">
              Perfil
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Notificaciones */}
            <NotificationBellButton
              id="btn-profile-notifications"
              unreadCount={unreadNotificationsCount}
              onClick={onOpenNotifications}
            />
          </div>
        </header>

        {/* ============================================================ */}
        {/* 2. RESUMEN DEL PERFIL (CARD RESUMEN PRINCIPAL DEL HTML)      */}
        {/* ============================================================ */}
        <section
          id="card-profile-summary"
          aria-label="Resumen del perfil"
          className="w-full bg-white border border-[#ECECEE] rounded-[24px] p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden"
        >
          {/* User info row */}
          <div className="flex items-center gap-4">
            {/* Avatar con insignia de verificación */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full bg-[#09090B] text-white flex items-center justify-center font-sans font-bold text-[20px] shadow-sm tracking-wider">
                {userInitials}
              </div>
              <div
                title="Usuario con protocolo verificado"
                className="w-5 h-5 rounded-full bg-[#FF5A00] text-white absolute -bottom-0.5 -right-0.5 flex items-center justify-center shadow-xs border-2 border-white"
              >
                <span className="material-symbols-outlined text-[13px] font-bold">check</span>
              </div>
            </div>

            {/* User Details con edición de nombre */}
            <div className="min-w-0 flex-1">
              {isEditingName ? (
                <form onSubmit={handleSaveName} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full text-[16px] font-sans font-bold text-[#09090B] px-2 py-1 rounded-lg border border-[#09090B] outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    aria-label="Confirmar nombre"
                    className="w-8 h-8 rounded-lg bg-[#09090B] text-white flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempName(userName);
                      setIsEditingName(false);
                    }}
                    aria-label="Cancelar edición"
                    className="w-8 h-8 rounded-lg bg-[#F4F4F5] text-[#71717A] flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-1">
                  <h2 className="text-[18px] font-sans font-bold text-[#09090B] tracking-tight truncate">
                    {userName}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setTempName(userName);
                      setIsEditingName(true);
                    }}
                    aria-label="Editar nombre"
                    className="p-1 rounded-md text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                </div>
              )}
              <p className="text-[12px] font-sans text-[#71717A] truncate mt-0.5">{userEmail}</p>
            </div>
          </div>

          {/* ========================================================== */}
          {/* BARRA DE PROGRESO INTEGRADA DEL HTML                       */}
          {/* ========================================================== */}
          <div className="mt-5 pt-4 border-t border-[#ECECEE] flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-sans">
              <span className="font-bold text-[#09090B] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#FF5A00]">
                  trending_up
                </span>
                <span>Nivel 4 · Reconfiguración Sináptica</span>
              </span>
              <span className="font-extrabold text-[#FF5A00]">
                {progressPercentage}%
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div
              aria-label={`Progreso del perfil: ${progressPercentage}%`}
              className="w-full h-2 rounded-full bg-[#ECECEE] overflow-hidden"
            >
              <div
                className="h-full rounded-full bg-[#FF5A00] transition-all duration-700 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-sans text-[#71717A] pt-0.5">
              <span>{currentProgressDays} días limpios consolidados</span>
              <span>Meta: {milestoneTargetDays} días (Hito 5)</span>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. RENDIMIENTO ACUMULADO                                     */}
        {/* ============================================================ */}
        <section aria-label="Rendimiento Acumulado" className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-sans font-bold uppercase tracking-[0.55px] text-[#71717A]">
              Rendimiento Acumulado
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Métrica 1: Días limpios totales */}
            <div className="bg-white border border-[#ECECEE] rounded-[20px] p-3.5 flex flex-col gap-1 shadow-[0px_1px_2px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined text-[20px] text-[#FF5A00]">
                  verified
                </span>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#10B981] bg-[#ECFDF5] px-1.5 py-0.5 rounded-md">
                  +1 Hoy
                </span>
              </div>
              <span className="text-[26px] font-sans font-extrabold text-[#09090B] tracking-tight leading-none mt-1">
                {totalCleanDays > 0 ? totalCleanDays : 42}
              </span>
              <span className="text-[11px] font-sans font-semibold text-[#09090B] leading-tight">
                Días limpios
              </span>
              <span className="text-[10px] font-sans text-[#71717A]">
                Acumulado en hábitos
              </span>
            </div>

            {/* Métrica 2: Desafíos Conquistados */}
            <div className="bg-white border border-[#ECECEE] rounded-[20px] p-3.5 flex flex-col gap-1 shadow-[0px_1px_2px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined text-[20px] text-[#09090B]">
                  emoji_events
                </span>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#09090B] bg-[#F4F4F5] px-1.5 py-0.5 rounded-md">
                  {totalActiveChallenges} activos
                </span>
              </div>
              <span className="text-[26px] font-sans font-extrabold text-[#09090B] tracking-tight leading-none mt-1">
                {totalCompletedChallenges > 0 ? totalCompletedChallenges : 3}
              </span>
              <span className="text-[11px] font-sans font-semibold text-[#09090B] leading-tight">
                Desafíos superados
              </span>
              <span className="text-[10px] font-sans text-[#71717A]">
                Protocolos cerrados
              </span>
            </div>

            {/* Métrica 3: Plasticidad sináptica */}
            <div className="bg-white border border-[#ECECEE] rounded-[20px] p-3.5 flex flex-col gap-1 shadow-[0px_1px_2px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined text-[20px] text-[#09090B]">
                  neurology
                </span>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#FF5A00] bg-[#FFF1EB] px-1.5 py-0.5 rounded-md">
                  D2 Up
                </span>
              </div>
              <span className="text-[26px] font-sans font-extrabold text-[#09090B] tracking-tight leading-none mt-1">
                94.2%
              </span>
              <span className="text-[11px] font-sans font-semibold text-[#09090B] leading-tight">
                Plasticidad Hebbiana
              </span>
              <span className="text-[10px] font-sans text-[#71717A]">
                Resistencia inhibitoria
              </span>
            </div>

            {/* Métrica 4: Fricción & Tiempo Ahorrado */}
            <div className="bg-white border border-[#ECECEE] rounded-[20px] p-3.5 flex flex-col gap-1 shadow-[0px_1px_2px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined text-[20px] text-[#09090B]">
                  hourglass_top
                </span>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#09090B] bg-[#F4F4F5] px-1.5 py-0.5 rounded-md">
                  Libre
                </span>
              </div>
              <span className="text-[26px] font-sans font-extrabold text-[#09090B] tracking-tight leading-none mt-1">
                {totalHoursSaved > 0 ? `${totalHoursSaved}h` : '114h'}
              </span>
              <span className="text-[11px] font-sans font-semibold text-[#09090B] leading-tight">
                Tiempo recuperado
              </span>
              <span className="text-[10px] font-sans text-[#71717A]">
                {currencyPreference === 'CLP'
                  ? totalMoneySavedCLP > 0
                    ? `~$${totalMoneySavedCLP.toLocaleString('es-CL')} CLP`
                    : '~$245.000 CLP'
                  : '~$260 USD'}
              </span>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 4. PLAN DE MEMBRESÍA PRO (DESPLIEGA MODAL IN-PLACE)          */}
        {/* ============================================================ */}
        <section
          aria-label="Membresía Deshabit PRO"
          className="w-full bg-[#09090B] text-white rounded-[24px] p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.12)] relative overflow-hidden"
        >
          {/* Subtle background ember glow */}
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 w-32 h-32 bg-[#FF5A00]/15 rounded-full blur-2xl pointer-events-none"
          />

          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-sans font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[13px] text-[#FF5A00]">
                workspace_premium
              </span>
              Membresía PRO
            </span>
            <span className="text-[11px] font-sans text-[#A1A1AA] font-medium">
              Plan Anual Activo
            </span>
          </div>

          <div className="space-y-1 relative z-10 mb-4">
            <h3 className="text-[17px] font-sans font-bold text-white tracking-tight leading-snug">
              Acceso Total Desbloqueado
            </h3>
            <p className="text-[12px] font-sans text-[#D4D4D8] leading-relaxed">
              Cuentas con las 4 herramientas avanzadas para la reconfiguración y blindaje de hábitos.
            </p>
          </div>

          {/* Quick list of unlocked perks */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-sans text-white/90 mb-4 relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#FF5A00] shrink-0">
                check_circle
              </span>
              <span className="truncate">5 Protocolos clínicos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#FF5A00] shrink-0">
                check_circle
              </span>
              <span className="truncate">Acceso con contraseña</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#FF5A00] shrink-0">
                check_circle
              </span>
              <span className="truncate">Bloquear apps</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#FF5A00] shrink-0">
                check_circle
              </span>
              <span className="truncate">Análisis IA de insights</span>
            </div>
          </div>

          {/* Action button - OPENS MODAL DIRECTLY IN THIS VIEW */}
          <button
            type="button"
            onClick={handleTriggerProModal}
            id="btn-manage-pro-subscription"
            className="w-full py-2.5 px-4 rounded-xl bg-white text-[#09090B] font-sans font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-[#F4F4F5] active:scale-98 transition-all cursor-pointer shadow-sm relative z-10"
          >
            <span>Ver planes de pago y beneficios</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </section>

        {/* ============================================================ */}
        {/* 5. ACCIONES DE CUENTA (CAMBIAR CUENTA, TUTORIAL, LOGOUT)     */}
        {/* ============================================================ */}
        <section aria-label="Acciones de cuenta" className="w-full flex flex-col gap-2 pt-2">
          {/* Cambiar de cuenta / Gestionar sesión */}
          {(onOpenSwitchAccount || onOpenAuthModal) && (
            <button
              type="button"
              onClick={onOpenSwitchAccount || onOpenAuthModal}
              id="btn-switch-account"
              className="w-full h-11 bg-white border border-[#ECECEE] hover:border-[#09090B] text-[#09090B] text-[13px] font-sans font-semibold rounded-[16px] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px] text-[#FF5A00]">switch_account</span>
              <span>Cambiar de cuenta / Gestionar sesión</span>
            </button>
          )}

          {/* Ver tutorial / Onboarding */}
          {onOpenOnboarding && (
            <button
              type="button"
              onClick={onOpenOnboarding}
              id="btn-view-onboarding"
              className="w-full h-11 bg-white border border-[#ECECEE] hover:border-[#D4D4D8] text-[#3F3F46] hover:text-[#09090B] text-[13px] font-sans font-medium rounded-[16px] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              <span>Ver tutorial de Onboarding</span>
            </button>
          )}

          {/* Cerrar sesión */}
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            id="btn-sign-out"
            className="w-full h-11 bg-white border border-[#ECECEE] hover:border-[#D4D4D8] text-[#71717A] hover:text-[#09090B] text-[13px] font-sans font-medium rounded-[16px] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Cerrar sesión en este dispositivo</span>
          </button>

          {/* Acceso llamado [ Eliminar cuenta ] */}
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            id="btn-delete-account"
            className="w-full h-11 bg-white border border-[#FEE2E2] hover:bg-[#FEF2F2] text-[#DC2626] text-[13px] font-sans font-medium rounded-[16px] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-[#DC2626]">delete</span>
            <span>Eliminar cuenta local</span>
          </button>
        </section>

        {/* Branding footer */}
        <footer className="w-full text-center space-y-1 pt-1 pb-4">
          <p className="text-[11px] font-sans font-medium text-[#71717A]">
            Deshabit · Arquitectura de Fricción Mínima v2.4.0
          </p>
          <p className="text-[10px] font-sans text-[#A1A1AA]">
            Protocolos de neuroplasticidad inspirados en Huberman Lab & James Clear
          </p>
        </footer>
      </div>

      {/* ============================================================ */}
      {/* MODAL IN-PLACE DE PLANES DE SUSCRIPCIÓN PRO                  */}
      {/* Desplegado en esta vista sin redirigir a Desafíos ni Terapia  */}
      {/* ============================================================ */}
      <ProSubscriptionModal
        isOpen={isProModalActive}
        onClose={() => handleSetProModalOpen(false)}
        onShowToast={onShowToast}
        initialCurrency={currencyPreference}
      />

      {/* ============================================================ */}
      {/* MODAL DE CONFIRMACIÓN: CERRAR SESIÓN                        */}
      {/* ============================================================ */}
      {isLogoutModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsLogoutModalOpen(false)}
        >
          <div
            className="w-full max-w-[340px] bg-white border border-[#ECECEE] rounded-[24px] p-5 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F4F5] text-[#09090B] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">logout</span>
              </div>
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="p-1 rounded-full text-[#71717A] hover:bg-[#F4F4F5] transition-colors"
                aria-label="Cerrar modal"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-[17px] font-sans font-bold text-[#09090B] tracking-tight">
                ¿Cerrar sesión en este dispositivo?
              </h3>
              <p className="text-[12px] font-sans text-[#71717A] leading-relaxed">
                Tus datos de racha y hábitos quedan protegidos en la bóveda local. Podrás volver a ingresar en cualquier momento con tus credenciales o el pre-completado rápido.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-[#ECECEE] text-[#09090B] font-sans font-medium text-[13px] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  if (onLogout) {
                    onLogout();
                  } else {
                    onShowToast('Sesión cerrada', 'Has cerrado sesión correctamente.');
                  }
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#09090B] text-white font-sans font-bold text-[13px] hover:bg-[#18181B] transition-colors cursor-pointer shadow-xs"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL DE CONFIRMACIÓN: ELIMINAR CUENTA                       */}
      {/* ============================================================ */}
      {isDeleteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className="w-full max-w-[340px] bg-white border border-[#ECECEE] rounded-[24px] p-5 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">delete_forever</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-1 rounded-full text-[#71717A] hover:bg-[#F4F4F5] transition-colors"
                aria-label="Cerrar modal"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-[17px] font-sans font-bold text-[#09090B] tracking-tight">
                ¿Eliminar cuenta definitivamente?
              </h3>
              <p className="text-[12px] font-sans text-[#71717A] leading-relaxed">
                Esta acción restablecerá todos tus hábitos, rachas registradas, configuraciones locales y métricas acumuladas de forma permanente.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-[#ECECEE] text-[#09090B] font-sans font-medium text-[13px] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.clear();
                  } catch (e) {
                    console.error(e);
                  }
                  setIsDeleteModalOpen(false);
                  onShowToast('Cuenta eliminada', 'Se han restablecido los datos locales de Deshabit.');
                  setTimeout(() => {
                    window.location.reload();
                  }, 800);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#DC2626] text-white font-sans font-bold text-[13px] hover:bg-[#B91C1C] transition-colors cursor-pointer shadow-xs"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
