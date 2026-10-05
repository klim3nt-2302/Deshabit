import React, { useState, useEffect, useRef } from 'react';
import {
  UserAccount,
  getRegisteredAccounts,
  findAccountByEmail,
  updateAccountPassword,
  registerNewAccount,
} from '../data/accountsData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  initialMode?: 'login' | 'register';
  onSwitchToOnboarding?: () => void;
}

type AuthViewMode = 'login' | 'register' | 'forgot-otp-request' | 'forgot-otp-verify' | 'reset-password' | 'authenticating';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  onSwitchToOnboarding,
}) => {
  // Current view mode
  const [viewMode, setViewMode] = useState<AuthViewMode>(initialMode);

  // Form values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);

  // Recovery & Reset state
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  // Edge cases: Failed attempts & Lockout security timer
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(60);
  const [authError, setAuthError] = useState('');
  const [shakeError, setShakeError] = useState(false);
  const [prefilledAccountName, setPrefilledAccountName] = useState<string | null>(null);

  // Authenticating transition state
  const [targetAccountForLogin, setTargetAccountForLogin] = useState<UserAccount | null>(null);

  // Accounts list for pre-fill
  const [availableAccounts, setAvailableAccounts] = useState<UserAccount[]>([]);

  // OTP inputs refs
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAvailableAccounts(getRegisteredAccounts());
      setViewMode(initialMode);
      setAuthError('');
      setShakeError(false);
    }
  }, [isOpen, initialMode]);

  // Lockout countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLockedOut && lockoutSeconds > 0) {
      timer = setInterval(() => {
        setLockoutSeconds((prev) => {
          if (prev <= 1) {
            setIsLockedOut(false);
            setFailedAttempts(0);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLockedOut, lockoutSeconds]);

  // Resend OTP timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (viewMode === 'forgot-otp-verify' && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [viewMode, resendTimer]);

  // Handle pre-fill from demo accounts
  const handlePreFillAccount = (acc: UserAccount) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setPrefilledAccountName(acc.name);
    setAuthError('');
  };

  // Trigger shake animation on error
  const triggerErrorShake = (message: string) => {
    setAuthError(message);
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };

  // Perform Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;

    const trimmedEmail = email.trim().toLowerCase();

    // Edge case: empty fields
    if (!trimmedEmail || !password) {
      triggerErrorShake('Por favor completa tu correo y contraseña.');
      return;
    }

    // Edge case: invalid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      triggerErrorShake('Ingresa un formato de correo electrónico válido.');
      return;
    }

    const found = findAccountByEmail(trimmedEmail);

    // Edge case: account does not exist
    if (!found) {
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);
      triggerErrorShake(
        'No existe una cuenta registrada con este correo. Puedes usar el pre-completado de abajo o registrarte.'
      );
      return;
    }

    // Edge case: incorrect password
    if (found.password !== password) {
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);

      if (attempts >= 3) {
        setIsLockedOut(true);
        setLockoutSeconds(60);
        triggerErrorShake(
          'Bóveda bloqueada por seguridad tras 3 intentos erróneos. Espera 60s o restablece tu contraseña.'
        );
      } else {
        triggerErrorShake(
          `Contraseña incorrecta. Te quedan ${3 - attempts} ${
            3 - attempts === 1 ? 'intento' : 'intentos'
          } antes del bloqueo temporal.`
        );
      }
      return;
    }

    // Login success! Proceed to authenticating transition
    setAuthError('');
    setTargetAccountForLogin(found);
    setViewMode('authenticating');

    setTimeout(() => {
      onLoginSuccess(found);
      onClose();
    }, 850);
  };

  // Perform Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (!name.trim()) {
      triggerErrorShake('Por favor ingresa tu nombre.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      triggerErrorShake('Ingresa un correo electrónico válido.');
      return;
    }

    if (password.length < 6) {
      triggerErrorShake('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const existing = findAccountByEmail(trimmedEmail);
    if (existing) {
      triggerErrorShake('Ya existe una cuenta con este correo. Inicia sesión en su lugar.');
      return;
    }

    const newAcc = registerNewAccount(name, trimmedEmail, password);
    setTargetAccountForLogin(newAcc);
    setViewMode('authenticating');

    setTimeout(() => {
      onLoginSuccess(newAcc);
      onClose();
    }, 850);
  };

  // Start Forgot Password Flow
  const handleStartForgotFlow = () => {
    setRecoveryEmail(email || '');
    setAuthError('');
    setViewMode('forgot-otp-request');
  };

  // Request OTP
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = recoveryEmail.trim().toLowerCase();
    if (!trimmed) {
      setAuthError('Por favor ingresa tu correo electrónico.');
      return;
    }

    const found = findAccountByEmail(trimmed);
    if (!found) {
      setAuthError('No encontramos ninguna cuenta asociada a este correo.');
      return;
    }

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setEnteredOtp(['', '', '', '', '', '']);
    setOtpError('');
    setResendTimer(30);
    setAuthError('');
    setViewMode('forgot-otp-verify');
  };

  // Handle individual OTP inputs
  const handleOtpChange = (index: number, val: string) => {
    const char = val.slice(-1);
    const updated = [...enteredOtp];
    updated[index] = char;
    setEnteredOtp(updated);

    // Auto advance focus
    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !enteredOtp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = enteredOtp.join('');

    if (fullCode.length < 6) {
      setOtpError('Ingresa los 6 dígitos del código de verificación.');
      return;
    }

    if (fullCode !== generatedOtp) {
      setOtpError('Código de seguridad incorrecto. Inténtalo nuevamente.');
      return;
    }

    // OTP Correct! Proceed to Reset Password
    setOtpError('');
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
    setViewMode('reset-password');
  };

  // Perform Reset Password
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setResetError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Las contraseñas no coinciden. Verifícalas cuidadosamente.');
      return;
    }

    const success = updateAccountPassword(recoveryEmail, newPassword);
    if (!success) {
      setResetError('Ocurrió un error al actualizar la contraseña.');
      return;
    }

    // Success! Update form and return to login
    setEmail(recoveryEmail);
    setPassword(newPassword);
    setResetSuccessMessage('¡Contraseña restablecida con éxito! Ya puedes iniciar sesión.');
    setViewMode('login');
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-auth-title"
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/65 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-[390px] my-auto bg-white rounded-[32px] p-6 sm:p-7 shadow-2xl border border-[#ECECEE] flex flex-col gap-4 animate-in zoom-in-95 duration-200 ${
          shakeError ? 'animate-shake' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================ */}
        {/* VIEW: AUTHENTICATING SPINNER / DATA SYNC                     */}
        {/* ============================================================ */}
        {viewMode === 'authenticating' && (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in duration-300">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-3xl bg-[#09090B] flex items-center justify-center text-white shadow-xl">
                <span className="material-symbols-outlined text-[32px] text-[#FF5A00] animate-spin">
                  sync
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-sans uppercase tracking-widest text-[#FF5A00] font-bold">
                AUTENTICACIÓN EXITOSA
              </span>
              <h3 className="text-[19px] font-sans font-bold text-[#09090B]">
                Descifrando bóveda neuronal...
              </h3>
              <p className="text-[12px] font-sans text-[#71717A] max-w-[260px] mx-auto">
                Cargando datos de{' '}
                <strong className="text-[#09090B]">{targetAccountForLogin?.name}</strong>:{' '}
                {targetAccountForLogin?.streakHeadline}
              </p>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW: LOGIN                                                  */}
        {/* ============================================================ */}
        {viewMode === 'login' && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#F4F4F5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#09090B] flex items-center justify-center text-white shadow-xs">
                  <span className="material-symbols-outlined text-[18px] text-[#FF5A00]">
                    lock
                  </span>
                </div>
                <div>
                  <h3 id="modal-auth-title" className="text-[18px] font-sans font-bold text-[#09090B] leading-tight">
                    Iniciar Sesión
                  </h3>
                  <span className="text-[10px] text-[#71717A] font-medium block">
                    Accede a tu historial y cuantificador biológico
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="w-8 h-8 rounded-full bg-[#F4F4F5] hover:bg-[#ECECEE] flex items-center justify-center text-[#71717A] hover:text-[#09090B] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Success message banner from reset password */}
            {resetSuccessMessage && (
              <div className="p-3 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center gap-2 text-[#059669] text-[12px] font-medium">
                <span className="material-symbols-outlined text-[18px] shrink-0">check_circle</span>
                <span>{resetSuccessMessage}</span>
              </div>
            )}

            {/* Error banner */}
            {authError && (
              <div className="p-3 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-start gap-2 text-[#DC2626] text-[12px] animate-in fade-in duration-150">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                <span className="leading-snug">{authError}</span>
              </div>
            )}

            {/* Lockout Security Banner */}
            {isLockedOut && (
              <div className="p-3.5 rounded-2xl bg-[#09090B] text-white flex flex-col gap-2 shadow-lg animate-in zoom-in-95">
                <div className="flex items-center gap-2 text-[#FF5A00] font-bold text-[12px]">
                  <span className="material-symbols-outlined text-[18px]">shield</span>
                  <span>BLOQUEO TEMPORAL DE SEGURIDAD</span>
                </div>
                <p className="text-[11px] text-[#D4D4D8] leading-relaxed">
                  Por protección de tus registros neurobiológicos, espera{' '}
                  <strong className="text-white font-mono-numbers text-[13px]">{lockoutSeconds}s</strong>{' '}
                  para volver a intentar, o restablece tu clave ahora.
                </p>
                <button
                  type="button"
                  onClick={handleStartForgotFlow}
                  className="mt-1 py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-[#FF5A00] font-semibold text-[11px] text-center cursor-pointer transition-colors"
                >
                  Restablecer mi contraseña de inmediato →
                </button>
              </div>
            )}

            {/* ============================================================ */}
            {/* SECCIÓN PRE-COMPLETADO CON UN TOQUE (USERFLOW ESPECIFICADO)   */}
            {/* ============================================================ */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#71717A]">
                  Cuentas activas en este dispositivo
                </label>
                <span className="text-[10px] text-[#FF5A00] font-medium">1-tap autofill</span>
              </div>

              {/* Lista de cuentas para pre-completar */}
              <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-0.5">
                {availableAccounts.map((acc) => {
                  const isSelected = email.toLowerCase() === acc.email.toLowerCase();
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handlePreFillAccount(acc)}
                      className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#09090B] text-white border-[#09090B] shadow-xs'
                          : 'bg-[#F9F9FA] border-[#ECECEE] hover:bg-white hover:border-[#09090B]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-white/15 text-white' : 'bg-white text-[#09090B] shadow-xs'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[17px]">
                            {acc.avatarIcon || 'person'}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-[12px] font-bold leading-tight truncate ${isSelected ? 'text-white' : 'text-[#09090B]'}`}>
                            {acc.name}
                          </p>
                          <p className={`text-[10px] leading-tight truncate ${isSelected ? 'text-[#D4D4D8]' : 'text-[#71717A]'}`}>
                            {acc.streakHeadline}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                          isSelected
                            ? 'bg-[#FF5A00] text-white'
                            : 'bg-white text-[#3F3F46] border border-[#ECECEE]'
                        }`}
                      >
                        {isSelected ? 'Cargado' : 'Usar'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {prefilledAccountName && (
                <p className="text-[10px] text-[#059669] font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">check</span>
                  <span>Credenciales de {prefilledAccountName} listas para ingresar.</span>
                </p>
              )}
            </div>

            {/* Formulario de Inicio de Sesión */}
            <form onSubmit={handleLoginSubmit} className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-sans font-semibold text-[#3F3F46] block mb-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#A1A1AA]">
                    mail
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@ejemplo.com"
                    disabled={isLockedOut}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-[#FAFAFA] text-[#09090B] rounded-xl text-[13px] font-sans outline outline-1 outline-[#ECECEE] focus:outline-[#09090B] disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-sans font-semibold text-[#3F3F46]">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={handleStartForgotFlow}
                    className="text-[11px] font-semibold text-[#FF5A00] hover:underline cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#A1A1AA]">
                    key
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLockedOut}
                    required
                    className="w-full pl-9 pr-10 py-2 bg-[#FAFAFA] text-[#09090B] rounded-xl text-[13px] font-sans outline outline-1 outline-[#ECECEE] focus:outline-[#09090B] disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-[#71717A] hover:text-[#09090B] cursor-pointer"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Recordar sesión checkbox */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="rounded text-[#09090B] focus:ring-[#FF5A00] h-4 w-4"
                  />
                  <span className="text-[11px] text-[#71717A] font-medium">
                    Recordar en este dispositivo
                  </span>
                </label>
              </div>

              {/* Botón Iniciar Sesión */}
              <button
                type="submit"
                disabled={isLockedOut}
                className="w-full min-h-[46px] bg-[#09090B] hover:bg-[#18181B] text-white rounded-2xl font-sans font-bold text-[14px] flex items-center justify-center gap-2 active:scale-[0.985] transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                <span className="material-symbols-outlined text-[18px] text-[#FF5A00]">
                  login
                </span>
                <span>Iniciar Sesión y Cargar Datos</span>
              </button>
            </form>

            {/* Footer switcher */}
            <div className="flex items-center justify-between pt-2 border-t border-[#F4F4F5] text-[11px]">
              <button
                type="button"
                onClick={() => setViewMode('register')}
                className="text-[#71717A] hover:text-[#09090B] font-medium cursor-pointer"
              >
                ¿No tienes cuenta? <span className="text-[#09090B] font-bold underline">Registrarme</span>
              </button>

              {onSwitchToOnboarding && (
                <button
                  type="button"
                  onClick={onSwitchToOnboarding}
                  className="text-[#FF5A00] hover:underline font-semibold cursor-pointer"
                >
                  Ver Onboarding
                </button>
              )}
            </div>
          </>
        )}

        {/* ============================================================ */}
        {/* VIEW: REGISTER                                               */}
        {/* ============================================================ */}
        {viewMode === 'register' && (
          <>
            <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#F4F4F5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#09090B] flex items-center justify-center text-white shadow-xs">
                  <span className="material-symbols-outlined text-[18px] text-[#FF5A00]">
                    person_add
                  </span>
                </div>
                <div>
                  <h3 className="text-[18px] font-sans font-bold text-[#09090B] leading-tight">
                    Crear Cuenta
                  </h3>
                  <span className="text-[10px] text-[#71717A] font-medium block">
                    Comienza tu disciplina neurobiológica
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="w-8 h-8 rounded-full bg-[#F4F4F5] hover:bg-[#ECECEE] flex items-center justify-center text-[#71717A] hover:text-[#09090B] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-start gap-2 text-[#DC2626] text-[12px]">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                <span className="leading-snug">{authError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-sans font-semibold text-[#3F3F46] block mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Roberto Díaz"
                  required
                  className="w-full px-3.5 py-2 bg-[#FAFAFA] text-[#09090B] rounded-xl text-[13px] font-sans outline outline-1 outline-[#ECECEE] focus:outline-[#09090B]"
                />
              </div>

              <div>
                <label className="text-[11px] font-sans font-semibold text-[#3F3F46] block mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@ejemplo.com"
                  required
                  className="w-full px-3.5 py-2 bg-[#FAFAFA] text-[#09090B] rounded-xl text-[13px] font-sans outline outline-1 outline-[#ECECEE] focus:outline-[#09090B]"
                />
              </div>

              <div>
                <label className="text-[11px] font-sans font-semibold text-[#3F3F46] block mb-1">
                  Contraseña (mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2 bg-[#FAFAFA] text-[#09090B] rounded-xl text-[13px] font-sans outline outline-1 outline-[#ECECEE] focus:outline-[#09090B]"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[46px] bg-[#09090B] hover:bg-[#18181B] text-white rounded-2xl font-sans font-bold text-[14px] flex items-center justify-center gap-2 active:scale-[0.985] transition-all shadow-md cursor-pointer mt-2"
              >
                <span className="material-symbols-outlined text-[18px] text-[#FF5A00]">
                  check_circle
                </span>
                <span>Registrarme y Comenzar</span>
              </button>
            </form>

            <div className="flex items-center justify-between pt-2 border-t border-[#F4F4F5] text-[11px]">
              <button
                type="button"
                onClick={() => setViewMode('login')}
                className="text-[#71717A] hover:text-[#09090B] font-medium cursor-pointer"
              >
                ¿Ya tienes cuenta? <span className="text-[#09090B] font-bold underline">Iniciar Sesión</span>
              </button>
            </div>
          </>
        )}

        {/* ============================================================ */}
        {/* VIEW: FORGOT PASSWORD - STEP 1 (REQUEST OTP)                 */}
        {/* ============================================================ */}
        {viewMode === 'forgot-otp-request' && (
          <>
            <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#F4F4F5]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="w-7 h-7 rounded-lg bg-[#F4F4F5] flex items-center justify-center text-[#71717A] hover:text-[#09090B] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                </button>
                <div>
                  <h3 className="text-[17px] font-sans font-bold text-[#09090B] leading-tight">
                    Recuperar Contraseña
                  </h3>
                  <span className="text-[10px] text-[#71717A] font-medium block">
                    Paso 1 de 3: Identificación
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="w-8 h-8 rounded-full bg-[#F4F4F5] hover:bg-[#ECECEE] flex items-center justify-center text-[#71717A] hover:text-[#09090B] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-[12px] font-sans text-[#3F3F46] leading-relaxed">
              Ingresa el correo electrónico asociado a tu cuenta para enviarte un código de seguridad de 6 dígitos.
            </p>

            {authError && (
              <div className="p-3 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-start gap-2 text-[#DC2626] text-[12px]">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                <span className="leading-snug">{authError}</span>
              </div>
            )}

            <form onSubmit={handleRequestOtp} className="space-y-3">
              <div>
                <label className="text-[11px] font-sans font-semibold text-[#3F3F46] block mb-1">
                  Correo electrónico registrado
                </label>
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="ejemplo@neuroflow.cl"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FAFAFA] text-[#09090B] rounded-xl text-[13px] font-sans outline outline-1 outline-[#ECECEE] focus:outline-[#09090B]"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[46px] bg-[#09090B] hover:bg-[#18181B] text-white rounded-2xl font-sans font-bold text-[14px] flex items-center justify-center gap-2 active:scale-[0.985] transition-all shadow-md cursor-pointer mt-2"
              >
                <span className="material-symbols-outlined text-[18px] text-[#FF5A00]">
                  send
                </span>
                <span>Enviar Código de Seguridad</span>
              </button>
            </form>
          </>
        )}

        {/* ============================================================ */}
        {/* VIEW: FORGOT PASSWORD - STEP 2 (VERIFY OTP)                  */}
        {/* ============================================================ */}
        {viewMode === 'forgot-otp-verify' && (
          <>
            <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#F4F4F5]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('forgot-otp-request')}
                  className="w-7 h-7 rounded-lg bg-[#F4F4F5] flex items-center justify-center text-[#71717A] hover:text-[#09090B] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                </button>
                <div>
                  <h3 className="text-[17px] font-sans font-bold text-[#09090B] leading-tight">
                    Ingresar Código OTP
                  </h3>
                  <span className="text-[10px] text-[#71717A] font-medium block">
                    Paso 2 de 3: Verificación
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="w-8 h-8 rounded-full bg-[#F4F4F5] hover:bg-[#ECECEE] flex items-center justify-center text-[#71717A] hover:text-[#09090B] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-[12px] font-sans text-[#3F3F46] leading-relaxed">
              Hemos generado un código de 6 dígitos para <strong className="text-[#09090B]">{recoveryEmail}</strong>.
            </p>

            {/* Simulación en pantalla del código para pruebas cómodas */}
            <div className="p-3 bg-[#F4F4F5] rounded-2xl border border-[#ECECEE] flex items-center justify-between text-[12px]">
              <span className="text-[#71717A]">Código de seguridad:</span>
              <button
                type="button"
                onClick={() => {
                  const digits = generatedOtp.split('');
                  setEnteredOtp(digits);
                }}
                className="font-mono-numbers font-bold text-[14px] text-[#FF5A00] tracking-widest bg-white px-2.5 py-1 rounded-lg border border-[#ECECEE] hover:border-[#FF5A00] cursor-pointer"
                title="Haz clic para autocompletar este código"
              >
                {generatedOtp}
              </button>
            </div>

            {otpError && (
              <div className="p-2.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-center gap-2 text-[#DC2626] text-[12px]">
                <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                <span>{otpError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* 6 Casillas de OTP */}
              <div className="grid grid-cols-6 gap-2 pt-1">
                {enteredOtp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-full h-12 text-center text-[18px] font-mono-numbers font-bold bg-[#FAFAFA] rounded-xl outline outline-1 outline-[#ECECEE] focus:outline-[#09090B] focus:bg-white transition-all"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#71717A]">
                <span>¿No recibiste el código?</span>
                <button
                  type="button"
                  disabled={resendTimer > 0}
                  onClick={(e) => handleRequestOtp(e)}
                  className={`font-semibold cursor-pointer ${
                    resendTimer > 0 ? 'text-[#A1A1AA] cursor-not-allowed' : 'text-[#FF5A00] hover:underline'
                  }`}
                >
                  {resendTimer > 0 ? `Reenviar en ${resendTimer}s` : 'Reenviar código'}
                </button>
              </div>

              <button
                type="submit"
                className="w-full min-h-[46px] bg-[#09090B] hover:bg-[#18181B] text-white rounded-2xl font-sans font-bold text-[14px] flex items-center justify-center gap-2 active:scale-[0.985] transition-all shadow-md cursor-pointer mt-1"
              >
                <span>Validar Código</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>
          </>
        )}

        {/* ============================================================ */}
        {/* VIEW: RESET PASSWORD - STEP 3 (NEW PASSWORD)                 */}
        {/* ============================================================ */}
        {viewMode === 'reset-password' && (
          <>
            <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#F4F4F5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#09090B] flex items-center justify-center text-white shadow-xs">
                  <span className="material-symbols-outlined text-[18px] text-[#FF5A00]">
                    password
                  </span>
                </div>
                <div>
                  <h3 className="text-[17px] font-sans font-bold text-[#09090B] leading-tight">
                    Nueva Contraseña
                  </h3>
                  <span className="text-[10px] text-[#71717A] font-medium block">
                    Paso 3 de 3: Finalización
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="w-8 h-8 rounded-full bg-[#F4F4F5] hover:bg-[#ECECEE] flex items-center justify-center text-[#71717A] hover:text-[#09090B] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {resetError && (
              <div className="p-3 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-start gap-2 text-[#DC2626] text-[12px]">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                <span className="leading-snug">{resetError}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-sans font-semibold text-[#3F3F46] block mb-1">
                  Nueva contraseña (mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2 bg-[#FAFAFA] text-[#09090B] rounded-xl text-[13px] font-sans outline outline-1 outline-[#ECECEE] focus:outline-[#09090B]"
                />
              </div>

              <div>
                <label className="text-[11px] font-sans font-semibold text-[#3F3F46] block mb-1">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2 bg-[#FAFAFA] text-[#09090B] rounded-xl text-[13px] font-sans outline outline-1 outline-[#ECECEE] focus:outline-[#09090B]"
                />
              </div>

              {/* Indicador de coincidencia */}
              {newPassword && confirmPassword && (
                <div
                  className={`text-[11px] font-medium flex items-center gap-1.5 ${
                    newPassword === confirmPassword ? 'text-[#059669]' : 'text-[#DC2626]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {newPassword === confirmPassword ? 'check_circle' : 'cancel'}
                  </span>
                  <span>
                    {newPassword === confirmPassword
                      ? 'Las contraseñas coinciden'
                      : 'Las contraseñas no coinciden'}
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="w-full min-h-[46px] bg-[#09090B] hover:bg-[#18181B] text-white rounded-2xl font-sans font-bold text-[14px] flex items-center justify-center gap-2 active:scale-[0.985] transition-all shadow-md cursor-pointer mt-2"
              >
                <span className="material-symbols-outlined text-[18px] text-[#FF5A00]">
                  verified
                </span>
                <span>Guardar Contraseña e Ir al Login</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
