import React, { useState, useEffect, useRef } from 'react';
import {
  UserAccount,
  getRegisteredAccounts,
  findAccountByEmail,
  updateAccountPassword,
  registerNewAccount,
} from '../data/accountsData';

export interface AuthScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
  initialMode?: 'login' | 'register' | 'switch-account';
  onCancel?: () => void; // Available when switching account while already logged in
  activeUser?: UserAccount | null;
  onSwitchToOnboarding?: () => void;
}

type AuthViewMode =
  | 'login'
  | 'register'
  | 'switch-account'
  | 'forgot-otp-request'
  | 'forgot-otp-verify'
  | 'reset-password'
  | 'authenticating';

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  initialMode = 'login',
  onCancel,
  activeUser,
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
  const [showNewPassword, setShowNewPassword] = useState(false);
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
    setAvailableAccounts(getRegisteredAccounts());
    setViewMode(initialMode);
    setAuthError('');
    setShakeError(false);
  }, [initialMode]);

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

  // Handle 1-tap pre-fill from registered accounts
  const handlePreFillAccount = (acc: UserAccount) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setPrefilledAccountName(acc.name);
    setAuthError('');
    setShakeError(false);
  };

  // Trigger shake on error
  const triggerErrorShake = (msg: string) => {
    setAuthError(msg);
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };

  // Submit Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedEmail) {
      triggerErrorShake('Por favor ingresa tu correo electrónico.');
      return;
    }

    if (!trimmedPass) {
      triggerErrorShake('Por favor ingresa tu contraseña.');
      return;
    }

    const matchedAccount = findAccountByEmail(trimmedEmail);

    if (!matchedAccount || matchedAccount.password !== trimmedPass) {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);

      if (nextAttempts >= 3) {
        setIsLockedOut(true);
        setLockoutSeconds(60);
        triggerErrorShake('Has superado 3 intentos fallidos. Bóveda bloqueada por seguridad.');
      } else {
        triggerErrorShake(
          `Credenciales incorrectas. Te queda${3 - nextAttempts === 1 ? '' : 'n'} ${
            3 - nextAttempts
          } intento${3 - nextAttempts === 1 ? '' : 's'} antes del bloqueo.`
        );
      }
      return;
    }

    // Success! Show authenticating data sync screen
    setTargetAccountForLogin(matchedAccount);
    setViewMode('authenticating');

    setTimeout(() => {
      onLoginSuccess(matchedAccount);
    }, 750);
  };

  // Submit Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedName) {
      triggerErrorShake('Por favor ingresa tu nombre o alias de disciplina.');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      triggerErrorShake('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (trimmedPass.length < 6) {
      triggerErrorShake('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const existing = findAccountByEmail(trimmedEmail);
    if (existing) {
      triggerErrorShake('Ya existe una cuenta con este correo. Inicia sesión en su lugar.');
      return;
    }

    const newAcc = registerNewAccount(trimmedName, trimmedEmail, trimmedPass);
    setAvailableAccounts(getRegisteredAccounts());
    setTargetAccountForLogin(newAcc);
    setViewMode('authenticating');

    setTimeout(() => {
      onLoginSuccess(newAcc);
    }, 750);
  };

  // Step 1: Start Forgot Password flow
  const handleStartForgotFlow = () => {
    setRecoveryEmail(email || '');
    setAuthError('');
    setOtpError('');
    setViewMode('forgot-otp-request');
  };

  // Step 1: Submit Request OTP
  const handleRequestOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = recoveryEmail.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setOtpError('Ingresa un correo válido registrado en Deshabit.');
      return;
    }

    const account = findAccountByEmail(trimmed);
    if (!account) {
      setOtpError('No encontramos ninguna cuenta activa asociada a este correo.');
      return;
    }

    // Generate simulated 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setEnteredOtp(['', '', '', '', '', '']);
    setOtpError('');
    setResendTimer(30);
    setViewMode('forgot-otp-verify');
  };

  // Step 2: Handle OTP input changes
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.slice(-1);
    const updated = [...enteredOtp];
    updated[index] = digit;
    setEnteredOtp(updated);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !enteredOtp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const joined = enteredOtp.join('');
    if (joined.length < 6) {
      setOtpError('Por favor ingresa los 6 dígitos del código de seguridad.');
      return;
    }

    if (joined !== generatedOtp) {
      setOtpError('Código de verificación incorrecto. Revisa el código de prueba simulado.');
      return;
    }

    setOtpError('');
    setNewPassword('');
    setConfirmPassword('');
    setViewMode('reset-password');
  };

  // Step 3: Password Strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(newPassword);

  // Step 3: Submit New Password
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (newPassword.length < 8) {
      setResetError('La nueva contraseña debe tener mínimo 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Las contraseñas no coinciden. Verifícalas cuidadosamente.');
      return;
    }

    const account = findAccountByEmail(recoveryEmail);
    const success = updateAccountPassword(recoveryEmail, newPassword);
    if (!success) {
      setResetError('Error al guardar la nueva contraseña en el almacén seguro.');
      return;
    }

    // Success! Update local lists and prefill into login
    setAvailableAccounts(getRegisteredAccounts());
    setEmail(recoveryEmail);
    setPassword(newPassword);
    setPrefilledAccountName(account?.name || null);
    setResetSuccessMessage('Contraseña actualizada con éxito. Ya puedes iniciar sesión con tu nueva clave.');
    setAuthError('');
    setViewMode('login');
  };

  // Quick switch direct login
  const handleQuickSwitchDirect = (acc: UserAccount) => {
    setTargetAccountForLogin(acc);
    setViewMode('authenticating');
    setTimeout(() => {
      onLoginSuccess(acc);
    }, 600);
  };

  return (
    <div className="w-full min-h-screen bg-[#F9F9FA] text-[#09090B] flex flex-col items-center selection:bg-[#FF5A00] selection:text-white">
      {/* Top Header / Nav */}
      <header className="w-full max-w-[390px] pt-4 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-9 h-9 rounded-full bg-white border border-[#ECECEE] hover:border-[#09090B] flex items-center justify-center text-[#09090B] transition-colors cursor-pointer shadow-xs active:scale-95"
              aria-label="Volver a la app"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-1">
              <span className="font-sans font-black text-[18px] tracking-tight text-[#09090B]">
                DESHABIT
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A00] mt-0.5 inline-block" />
            </div>
            <span className="text-[10px] font-sans font-medium text-[#71717A] tracking-wider uppercase block">
              Control Neurobiológico
            </span>
          </div>
        </div>

        {/* Action button on top right */}
        {onSwitchToOnboarding && viewMode !== 'authenticating' && (
          <button
            type="button"
            onClick={onSwitchToOnboarding}
            className="text-[11px] font-sans font-medium text-[#71717A] hover:text-[#09090B] flex items-center gap-1 transition-colors cursor-pointer py-1 px-2.5 rounded-full hover:bg-white border border-transparent hover:border-[#ECECEE]"
          >
            <span className="material-symbols-outlined text-[15px]">menu_book</span>
            <span>Tutorial</span>
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="w-full max-w-[390px] flex-1 px-4 py-6 flex flex-col justify-center">
        <div
          className={`w-full bg-white rounded-[28px] p-6 shadow-sm border border-[#ECECEE] flex flex-col gap-5 ${
            shakeError ? 'animate-shake' : ''
          }`}
        >
          {/* ============================================================ */}
          {/* VIEW: AUTHENTICATING SPINNER / DATA SYNC                     */}
          {/* ============================================================ */}
          {viewMode === 'authenticating' && (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-5 animate-in fade-in duration-300">
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 rounded-3xl bg-[#09090B] flex items-center justify-center text-white shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#FF5A00]/20 to-transparent" />
                  <span className="material-symbols-outlined text-[36px] text-[#FF5A00] animate-spin">
                    sync
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-sans uppercase tracking-widest text-[#FF5A00] font-bold">
                  AUTENTICACIÓN EXITOSA
                </span>
                <h2 className="text-[20px] font-sans font-bold text-[#09090B]">
                  Descifrando bóveda neuronal...
                </h2>
                <p className="text-[13px] font-sans text-[#71717A] max-w-[280px] mx-auto">
                  Sincronizando registros de{' '}
                  <strong className="text-[#09090B]">{targetAccountForLogin?.name}</strong>:{' '}
                  {targetAccountForLogin?.streakHeadline}
                </p>
              </div>

              {/* Progress bar pulse */}
              <div className="w-48 h-1.5 rounded-full bg-[#F4F4F5] overflow-hidden">
                <div className="h-full bg-[#09090B] rounded-full animate-pulse w-full" />
              </div>

              <div className="p-3 rounded-2xl bg-[#F9F9FA] border border-[#ECECEE] w-full text-left space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[#71717A]">
                  <span>Hábitos sincronizados:</span>
                  <span className="font-bold text-[#09090B]">
                    {targetAccountForLogin?.habits.length || 0} activos
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#71717A]">
                  <span>Racha consolidada:</span>
                  <span className="font-bold text-[#FF5A00]">
                    {targetAccountForLogin?.stats.totalCleanDays || 0} días limpios
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#71717A]">
                  <span>Moneda de cuantificación:</span>
                  <span className="font-bold text-[#09090B]">
                    {targetAccountForLogin?.currency || 'CLP'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW: LOGIN                                                  */}
          {/* ============================================================ */}
          {viewMode === 'login' && (
            <>
              {/* Header Title */}
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#F4F4F5]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#09090B] flex items-center justify-center text-white shadow-xs">
                    <span className="material-symbols-outlined text-[19px] text-[#FF5A00]">
                      lock
                    </span>
                  </div>
                  <div>
                    <h1 className="text-[19px] font-sans font-bold text-[#09090B] leading-tight">
                      Iniciar Sesión
                    </h1>
                    <span className="text-[11px] text-[#71717A] font-medium block">
                      Accede a tu historial y cuantificador biológico
                    </span>
                  </div>
                </div>
              </div>

              {/* Success message banner from reset password */}
              {resetSuccessMessage && (
                <div className="p-3 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center gap-2 text-[#059669] text-[12px] font-medium animate-in fade-in duration-200">
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
                    <strong className="text-white font-mono text-[13px]">{lockoutSeconds}s</strong>{' '}
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
                  <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#71717A]">
                    Cuentas activas en este dispositivo
                  </label>
                  <span className="text-[10px] text-[#FF5A00] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">bolt</span>
                    1-tap autofill
                  </span>
                </div>

                {/* Lista de cuentas para pre-completar */}
                <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-0.5">
                  {availableAccounts.map((acc) => {
                    const isSelected = email.toLowerCase() === acc.email.toLowerCase();
                    const isCurrent = activeUser?.id === acc.id;

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
                            <div className="flex items-center gap-1.5">
                              <p className={`text-[12px] font-bold leading-tight truncate ${isSelected ? 'text-white' : 'text-[#09090B]'}`}>
                                {acc.name}
                              </p>
                              {isCurrent && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#10B981]/20 text-[#10B981] font-semibold">
                                  En uso
                                </span>
                              )}
                            </div>
                            <p className={`text-[10px] leading-tight truncate ${isSelected ? 'text-[#D4D4D8]' : 'text-[#71717A]'}`}>
                              {acc.streakHeadline}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1">
                          {isSelected ? (
                            <span className="text-[11px] font-semibold text-[#FF5A00] flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[15px]">check_circle</span>
                              Listo
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#71717A] group-hover:text-[#09090B]">
                              Usar
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {prefilledAccountName && (
                  <div className="p-2 rounded-xl bg-[#F4F4F5] flex items-center justify-between text-[11px] text-[#09090B]">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-[#FF5A00]">
                        check_circle
                      </span>
                      Pre-completado para: <strong>{prefilledAccountName}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('');
                        setPassword('');
                        setPrefilledAccountName(null);
                      }}
                      className="text-[#71717A] hover:text-[#09090B] text-[10px] underline cursor-pointer"
                    >
                      Limpiar
                    </button>
                  </div>
                )}
              </div>

              {/* Formulario de Login */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                {/* Input Email */}
                <div className="space-y-1">
                  <label className="text-[12px] font-sans font-semibold text-[#09090B]">
                    Correo Electrónico
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-[#71717A] text-[18px]">
                      mail
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setAuthError('');
                      }}
                      disabled={isLockedOut}
                      placeholder="ejemplo@deshabit.io"
                      className="w-full h-11 pl-10 pr-3 rounded-2xl bg-[#F9F9FA] border border-[#ECECEE] focus:border-[#09090B] focus:bg-white text-[13px] text-[#09090B] outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Input Contraseña */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[12px] font-sans font-semibold text-[#09090B]">
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={handleStartForgotFlow}
                      className="text-[11px] text-[#FF5A00] hover:underline font-semibold cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-[#71717A] text-[18px]">
                      key
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setAuthError('');
                      }}
                      disabled={isLockedOut}
                      placeholder="••••••••••••"
                      className="w-full h-11 pl-10 pr-10 rounded-2xl bg-[#F9F9FA] border border-[#ECECEE] focus:border-[#09090B] focus:bg-white text-[13px] text-[#09090B] outline-none transition-all disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-[#71717A] hover:text-[#09090B] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Recordar sesión */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberSession}
                      onChange={(e) => setRememberSession(e.target.checked)}
                      className="w-4 h-4 rounded border-[#ECECEE] text-[#09090B] focus:ring-0 accent-[#09090B]"
                    />
                    <span className="text-[11px] font-sans text-[#71717A]">
                      Mantener sesión activa en este dispositivo
                    </span>
                  </label>
                </div>

                {/* Botón Principal Iniciar Sesión */}
                <button
                  type="submit"
                  disabled={isLockedOut}
                  className="w-full h-12 bg-[#09090B] hover:bg-[#18181B] text-white rounded-2xl font-sans font-semibold text-[14px] flex items-center justify-center gap-2 active:scale-[0.985] transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  <span className="material-symbols-outlined text-[19px]">login</span>
                  <span>
                    {prefilledAccountName
                      ? `Ingresar como ${prefilledAccountName.split(' ')[0]}`
                      : 'Iniciar Sesión en Deshabit'}
                  </span>
                </button>
              </form>

              {/* Footer Switch to Register */}
              <div className="pt-2 text-center border-t border-[#F4F4F5]">
                <p className="text-[12px] font-sans text-[#71717A]">
                  ¿No tienes una cuenta aún?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('register');
                      setAuthError('');
                    }}
                    className="font-semibold text-[#09090B] hover:text-[#FF5A00] underline cursor-pointer"
                  >
                    Crear cuenta nueva
                  </button>
                </p>
              </div>
            </>
          )}

          {/* ============================================================ */}
          {/* VIEW: SWITCH ACCOUNT                                         */}
          {/* ============================================================ */}
          {viewMode === 'switch-account' && (
            <>
              {/* Header Title */}
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#F4F4F5]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#09090B] flex items-center justify-center text-white shadow-xs">
                    <span className="material-symbols-outlined text-[19px] text-[#FF5A00]">
                      switch_account
                    </span>
                  </div>
                  <div>
                    <h1 className="text-[19px] font-sans font-bold text-[#09090B] leading-tight">
                      Cambiar de Cuenta
                    </h1>
                    <span className="text-[11px] text-[#71717A] font-medium block">
                      Alterna de perfil sin perder tus progresos guardados
                    </span>
                  </div>
                </div>
              </div>

              {/* Active User Card */}
              {activeUser && (
                <div className="p-3 rounded-2xl bg-[#F9F9FA] border border-[#ECECEE] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-[#09090B] text-white flex items-center justify-center font-bold text-[13px]">
                      {activeUser.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-bold text-[#09090B]">
                          {activeUser.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#10B981]/20 text-[#059669] font-bold">
                          ACTIVA
                        </span>
                      </div>
                      <span className="text-[11px] text-[#71717A] block">{activeUser.email}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de otras cuentas disponibles para cambiar con 1 toque */}
              <div className="space-y-2">
                <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#71717A]">
                  Seleccionar otra cuenta registrada
                </label>

                <div className="flex flex-col gap-2">
                  {availableAccounts.map((acc) => {
                    const isCurrent = activeUser?.id === acc.id;
                    return (
                      <div
                        key={acc.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 transition-all ${
                          isCurrent
                            ? 'bg-white border-[#10B981]/50'
                            : 'bg-[#F9F9FA] border-[#ECECEE] hover:border-[#09090B] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-white border border-[#ECECEE] text-[#09090B] flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[19px]">
                              {acc.avatarIcon || 'person'}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-[#09090B] leading-tight truncate">
                              {acc.name}
                            </p>
                            <p className="text-[11px] text-[#71717A] leading-tight truncate">
                              {acc.streakHeadline}
                            </p>
                          </div>
                        </div>

                        {isCurrent ? (
                          <span className="text-[11px] font-semibold text-[#10B981] px-2 py-1 rounded-xl bg-[#10B981]/10">
                            En sesión
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleQuickSwitchDirect(acc)}
                            className="px-3 py-1.5 rounded-xl bg-[#09090B] hover:bg-[#18181B] text-white text-[12px] font-semibold cursor-pointer active:scale-95 transition-transform"
                          >
                            Cambiar →
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Or switch to full login with another email */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('');
                    setPassword('');
                    setViewMode('login');
                  }}
                  className="w-full h-11 bg-white border border-[#ECECEE] hover:border-[#09090B] text-[#09090B] rounded-2xl font-sans font-semibold text-[13px] flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Iniciar con otra cuenta de correo</span>
                </button>

                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="w-full py-2 text-center text-[12px] font-sans text-[#71717A] hover:text-[#09090B] cursor-pointer"
                  >
                    ← Volver a mi sesión actual
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
              {/* Header Title */}
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#F4F4F5]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#09090B] flex items-center justify-center text-white shadow-xs">
                    <span className="material-symbols-outlined text-[19px] text-[#FF5A00]">
                      person_add
                    </span>
                  </div>
                  <div>
                    <h1 className="text-[19px] font-sans font-bold text-[#09090B] leading-tight">
                      Crear Nueva Cuenta
                    </h1>
                    <span className="text-[11px] text-[#71717A] font-medium block">
                      Comienza tu arquitectura de hábitos biológicos
                    </span>
                  </div>
                </div>
              </div>

              {/* Error banner */}
              {authError && (
                <div className="p-3 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-start gap-2 text-[#DC2626] text-[12px]">
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                  <span className="leading-snug">{authError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Nombre */}
                <div className="space-y-1">
                  <label className="text-[12px] font-sans font-semibold text-[#09090B]">
                    Tu Nombre o Alias
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Matías Lagos"
                    className="w-full h-11 px-3.5 rounded-2xl bg-[#F9F9FA] border border-[#ECECEE] focus:border-[#09090B] focus:bg-white text-[13px] text-[#09090B] outline-none transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[12px] font-sans font-semibold text-[#09090B]">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="matias@ejemplo.com"
                    className="w-full h-11 px-3.5 rounded-2xl bg-[#F9F9FA] border border-[#ECECEE] focus:border-[#09090B] focus:bg-white text-[13px] text-[#09090B] outline-none transition-all"
                  />
                </div>

                {/* Contraseña */}
                <div className="space-y-1">
                  <label className="text-[12px] font-sans font-semibold text-[#09090B]">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full h-11 px-3.5 rounded-2xl bg-[#F9F9FA] border border-[#ECECEE] focus:border-[#09090B] focus:bg-white text-[13px] text-[#09090B] outline-none transition-all"
                  />
                </div>

                {/* Botón de Registro */}
                <button
                  type="submit"
                  className="w-full h-12 bg-[#09090B] hover:bg-[#18181B] text-white rounded-2xl font-sans font-semibold text-[14px] flex items-center justify-center gap-2 active:scale-[0.985] transition-all shadow-md cursor-pointer mt-2"
                >
                  <span className="material-symbols-outlined text-[19px]">done</span>
                  <span>Registrar y Comenzar</span>
                </button>
              </form>

              <div className="pt-2 text-center border-t border-[#F4F4F5]">
                <p className="text-[12px] font-sans text-[#71717A]">
                  ¿Ya tienes una cuenta creada?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('login');
                      setAuthError('');
                    }}
                    className="font-semibold text-[#09090B] hover:text-[#FF5A00] underline cursor-pointer"
                  >
                    Iniciar Sesión
                  </button>
                </p>
              </div>
            </>
          )}

          {/* ============================================================ */}
          {/* VIEW: FORGOT PASSWORD STEP 1 - REQUEST OTP                   */}
          {/* ============================================================ */}
          {viewMode === 'forgot-otp-request' && (
            <>
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#F4F4F5]">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setViewMode('login')}
                    className="w-8 h-8 rounded-full bg-[#F4F4F5] hover:bg-[#ECECEE] flex items-center justify-center text-[#71717A] hover:text-[#09090B] transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  </button>
                  <div>
                    <h1 className="text-[18px] font-sans font-bold text-[#09090B] leading-tight">
                      Recuperar Contraseña
                    </h1>
                    <span className="text-[11px] text-[#71717A] font-medium block">
                      Paso 1 de 3: Identificación
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[12px] font-sans text-[#71717A] leading-relaxed">
                Ingresa el correo asociado a tu cuenta de Deshabit. Te enviaremos un código seguro de 6
                dígitos para verificar tu identidad y restablecer tu clave.
              </p>

              {otpError && (
                <div className="p-3 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-start gap-2 text-[#DC2626] text-[12px]">
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                  <span className="leading-snug">{otpError}</span>
                </div>
              )}

              <form onSubmit={handleRequestOtpSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[12px] font-sans font-semibold text-[#09090B]">
                    Correo Registrado
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-[#71717A] text-[18px]">
                      mail
                    </span>
                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => {
                        setRecoveryEmail(e.target.value);
                        setOtpError('');
                      }}
                      placeholder="ejemplo@deshabit.io"
                      className="w-full h-11 pl-10 pr-3 rounded-2xl bg-[#F9F9FA] border border-[#ECECEE] focus:border-[#09090B] focus:bg-white text-[13px] text-[#09090B] outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-[#09090B] hover:bg-[#18181B] text-white rounded-2xl font-sans font-semibold text-[14px] flex items-center justify-center gap-2 active:scale-[0.985] transition-all shadow-md cursor-pointer"
                >
                  <span>Enviar Código de Seguridad</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </form>
            </>
          )}

          {/* ============================================================ */}
          {/* VIEW: FORGOT PASSWORD STEP 2 - VERIFY OTP                     */}
          {/* ============================================================ */}
          {viewMode === 'forgot-otp-verify' && (
            <>
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#F4F4F5]">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setViewMode('forgot-otp-request')}
                    className="w-8 h-8 rounded-full bg-[#F4F4F5] hover:bg-[#ECECEE] flex items-center justify-center text-[#71717A] hover:text-[#09090B] transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  </button>
                  <div>
                    <h1 className="text-[18px] font-sans font-bold text-[#09090B] leading-tight">
                      Verificar Código
                    </h1>
                    <span className="text-[11px] text-[#71717A] font-medium block">
                      Paso 2 de 3: Código de 6 dígitos
                    </span>
                  </div>
                </div>
              </div>

              {/* Simulated OTP notice badge */}
              <div className="p-3.5 rounded-2xl bg-[#F9F9FA] border border-[#E4E4E7] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-[#FF5A00] tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">mark_email_read</span>
                    CÓDIGO SIMULADO ENVIADO
                  </span>
                  <span className="text-[10px] text-[#71717A]">{recoveryEmail}</span>
                </div>
                <p className="text-[11px] text-[#3F3F46] leading-relaxed">
                  Para probar este caso de uso sin esperar correos externos, tu código de verificación es:{' '}
                  <strong className="text-[#09090B] font-mono text-[14px] tracking-wider font-bold">
                    {generatedOtp}
                  </strong>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const digits = generatedOtp.split('');
                    setEnteredOtp(digits);
                    setOtpError('');
                  }}
                  className="text-[11px] text-[#FF5A00] hover:underline font-semibold cursor-pointer"
                >
                  ⚡ Autocompletar código de prueba
                </button>
              </div>

              {otpError && (
                <div className="p-3 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-start gap-2 text-[#DC2626] text-[12px]">
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                  <span className="leading-snug">{otpError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                {/* 6-box segmented OTP inputs */}
                <div className="flex items-center justify-center gap-2">
                  {enteredOtp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpInputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-11 h-13 rounded-2xl bg-[#F9F9FA] border border-[#ECECEE] focus:border-[#09090B] focus:bg-white text-center text-[19px] font-mono font-bold text-[#09090B] outline-none transition-all"
                    />
                  ))}
                </div>

                {/* Resend timer */}
                <div className="text-center">
                  {resendTimer > 0 ? (
                    <span className="text-[11px] text-[#71717A]">
                      Reenviar código en <strong className="text-[#09090B]">{resendTimer}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                        setGeneratedOtp(newCode);
                        setResendTimer(30);
                        setOtpError('');
                      }}
                      className="text-[11px] text-[#FF5A00] hover:underline font-semibold cursor-pointer"
                    >
                      Reenviar nuevo código de seguridad
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-[#09090B] hover:bg-[#18181B] text-white rounded-2xl font-sans font-semibold text-[14px] flex items-center justify-center gap-2 active:scale-[0.985] transition-all shadow-md cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[19px]">verified_user</span>
                  <span>Verificar y Continuar</span>
                </button>
              </form>
            </>
          )}

          {/* ============================================================ */}
          {/* VIEW: FORGOT PASSWORD STEP 3 - RESET PASSWORD                */}
          {/* ============================================================ */}
          {viewMode === 'reset-password' && (
            <>
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#F4F4F5]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#09090B] flex items-center justify-center text-white shadow-xs">
                    <span className="material-symbols-outlined text-[19px] text-[#FF5A00]">
                      password
                    </span>
                  </div>
                  <div>
                    <h1 className="text-[18px] font-sans font-bold text-[#09090B] leading-tight">
                      Nueva Contraseña
                    </h1>
                    <span className="text-[11px] text-[#71717A] font-medium block">
                      Paso 3 de 3: Define tu nueva clave
                    </span>
                  </div>
                </div>
              </div>

              {resetError && (
                <div className="p-3 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-start gap-2 text-[#DC2626] text-[12px]">
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                  <span className="leading-snug">{resetError}</span>
                </div>
              )}

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                {/* Nueva Contraseña */}
                <div className="space-y-1">
                  <label className="text-[12px] font-sans font-semibold text-[#09090B]">
                    Nueva Contraseña
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-[#71717A] text-[18px]">
                      lock_reset
                    </span>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full h-11 pl-10 pr-10 rounded-2xl bg-[#F9F9FA] border border-[#ECECEE] focus:border-[#09090B] focus:bg-white text-[13px] text-[#09090B] outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 text-[#71717A] hover:text-[#09090B] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showNewPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#71717A]">Seguridad de clave:</span>
                      <span
                        className={`font-bold ${
                          passwordStrength <= 1
                            ? 'text-[#DC2626]'
                            : passwordStrength === 2
                            ? 'text-[#F59E0B]'
                            : 'text-[#10B981]'
                        }`}
                      >
                        {passwordStrength <= 1 ? 'Débil' : passwordStrength === 2 ? 'Media' : 'Fuerte'}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 h-1.5">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`rounded-full transition-all ${
                            step <= passwordStrength
                              ? passwordStrength <= 1
                                ? 'bg-[#DC2626]'
                                : passwordStrength === 2
                                ? 'bg-[#F59E0B]'
                                : 'bg-[#10B981]'
                              : 'bg-[#ECECEE]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Confirmar Contraseña */}
                <div className="space-y-1">
                  <label className="text-[12px] font-sans font-semibold text-[#09090B]">
                    Confirmar Contraseña
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-[#71717A] text-[18px]">
                      check
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                      className="w-full h-11 pl-10 pr-3 rounded-2xl bg-[#F9F9FA] border border-[#ECECEE] focus:border-[#09090B] focus:bg-white text-[13px] text-[#09090B] outline-none transition-all"
                    />
                  </div>
                  {confirmPassword && (
                    <p
                      className={`text-[11px] font-medium ${
                        newPassword === confirmPassword ? 'text-[#10B981]' : 'text-[#DC2626]'
                      }`}
                    >
                      {newPassword === confirmPassword
                        ? '✓ Las contraseñas coinciden'
                        : '✗ Las contraseñas no coinciden aún'}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-[#09090B] hover:bg-[#18181B] text-white rounded-2xl font-sans font-semibold text-[14px] flex items-center justify-center gap-2 active:scale-[0.985] transition-all shadow-md cursor-pointer mt-2"
                >
                  <span className="material-symbols-outlined text-[19px]">save</span>
                  <span>Guardar y Actualizar Contraseña</span>
                </button>
              </form>
            </>
          )}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="w-full max-w-[390px] px-4 text-center space-y-1 pb-4">
        <p className="text-[11px] font-sans font-medium text-[#71717A]">
          Deshabit · Arquitectura de Fricción Mínima v2.4.0
        </p>
        <p className="text-[10px] font-sans text-[#A1A1AA]">
          Cifrado local seguro de registros biométricos y hábitos
        </p>
      </footer>
    </div>
  );
};
