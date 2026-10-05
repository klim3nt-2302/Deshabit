import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface SOSBreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale';

export const SOSBreathingModal: React.FC<SOSBreathingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [totalSecondsLeft, setTotalSecondsLeft] = useState<number>(60);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(4);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // Soft tone generator
  const playSoftTone = (frequency: number) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.035, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // AudioContext fallback
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setTotalSecondsLeft(60);
      setPhaseSecondsLeft(4);
      setPhase('inhale');
      setIsPaused(false);
      setIsCompleted(false);
      return;
    }

    if (isPaused || isCompleted) return;

    const timer = setInterval(() => {
      setTotalSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });

      setPhaseSecondsLeft((prevPhaseSec) => {
        if (prevPhaseSec <= 1) {
          setPhase((currentPhase) => {
            if (currentPhase === 'inhale') {
              playSoftTone(440);
              return 'hold';
            }
            if (currentPhase === 'hold') {
              playSoftTone(330);
              return 'exhale';
            }
            playSoftTone(550);
            return 'inhale';
          });
          return 4;
        }
        return prevPhaseSec - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, isCompleted, soundEnabled]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const phaseConfig = {
    inhale: {
      text: 'Inhala',
      instruction: 'Inhala profundamente por la nariz expandiendo el diafragma',
      scale: 'scale-110 ring-4 ring-[#FF5A00]/30 shadow-2xl',
      bg: 'bg-[#09090B]',
    },
    hold: {
      text: 'Retén',
      instruction: 'Retén el aire con calma y relaja hombros',
      scale: 'scale-105 shadow-xl',
      bg: 'bg-zinc-900',
    },
    exhale: {
      text: 'Exhala',
      instruction: 'Exhala lentamente por la boca descargando tensión',
      scale: 'scale-95 shadow-md',
      bg: 'bg-zinc-800',
    },
  }[phase];

  const formattedTimer = `00:${totalSecondsLeft < 10 ? '0' : ''}${totalSecondsLeft} restante`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="breath-dialog-title"
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-3 pb-24 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md mx-auto h-[82vh] max-h-[800px] bg-white rounded-[28px] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 border border-[#ECECEE]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle & Header */}
        <div className="pt-3 pb-2 px-5 flex flex-col items-center border-b border-[#ECECEE] shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-[#ECECEE] mb-3" />
          <div className="w-full flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#71717A]">
                PROTOCOLO 4-4-4 • ENFOQUE RÁPIDO
              </span>
              <h3 id="breath-dialog-title" className="text-[17px] font-sans font-bold text-[#09090B]">
                Respiración Guiada de Urgencia
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                aria-label="Alternar sonido rítmico"
                className="w-9 h-9 rounded-full bg-[#F4F4F5] hover:bg-[#ECECEE] flex items-center justify-center text-[#09090B] transition-colors active:scale-95 cursor-pointer"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-[#FF5A00]" /> : <VolumeX className="w-4 h-4 text-[#71717A]" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar modal de respiración"
                className="w-9 h-9 rounded-full bg-[#F4F4F5] hover:bg-[#ECECEE] flex items-center justify-center text-[#09090B] transition-colors active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col items-center justify-between space-y-4">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4F4F5] border border-[#ECECEE]">
            <span className="w-2 h-2 rounded-full bg-[#FF5A00] animate-pulse" />
            <span className="text-[11px] font-sans font-semibold text-[#71717A] uppercase tracking-wider">
              Intervención Neurovegetativa Activa
            </span>
          </div>

          {/* Dynamic Breath Ring */}
          <div className="relative flex items-center justify-center my-1">
            <div className="w-56 h-56 rounded-full bg-[#F4F4F5] flex items-center justify-center transition-all duration-700">
              <div
                className={`w-44 h-44 rounded-full ${phaseConfig.bg} flex flex-col items-center justify-center text-white text-center p-4 transition-all duration-700 ${phaseConfig.scale}`}
              >
                <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-white/60 mb-1">
                  FASE
                </span>
                <span className="text-[28px] font-sans font-extrabold tracking-tight leading-none text-white">
                  {phaseConfig.text}
                </span>
                <span className="text-[34px] font-mono font-bold text-[#FF5A00] mt-1 leading-none">
                  {phaseSecondsLeft}s
                </span>
              </div>
            </div>
          </div>

          {/* Time Remaining & Guidance */}
          <div className="w-full text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[#71717A] text-[18px]">timer</span>
              <span className="text-[18px] font-sans font-bold text-[#09090B] tracking-tight">
                {formattedTimer}
              </span>
            </div>
            <p className="text-[13px] font-sans font-medium text-[#09090B]">
              {phaseConfig.instruction}
            </p>
            <p className="text-[11px] font-sans text-[#71717A] max-w-xs mx-auto">
              La necesidad biológica de ceder desciende drásticamente tras 60 segundos de respiración en caja controlada.
            </p>
          </div>

          {/* Clinical Explanatory Box */}
          <div className="w-full p-3.5 rounded-2xl bg-[#F4F4F5] border border-[#ECECEE] flex items-start gap-3 text-left">
            <div className="w-8 h-8 rounded-xl bg-[#ECECEE] flex items-center justify-center text-[#09090B] shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">neurology</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-[12px] font-sans font-bold text-[#09090B]">
                Estimulación del Nervio Vago
              </p>
              <p className="text-[11px] font-sans text-[#71717A] leading-relaxed">
                Al alargar la retención y la exhalación, envías una señal directa al tronco encefálico para silenciar el circuito de urgencia de dopamina.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full space-y-2 pt-1 pb-2">
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#09090B] text-white font-sans font-bold text-[14px] flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-transform cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px] text-white">
                {isPaused ? 'play_arrow' : 'pause'}
              </span>
              <span className="text-white">{isPaused ? 'Reanudar' : 'Pausar'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onComplete();
                onClose();
              }}
              className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-[#F4F4F5] hover:bg-[#ECECEE] text-[#09090B] font-sans font-semibold text-[13px] flex items-center justify-center transition-colors active:scale-98 cursor-pointer"
            >
              {isCompleted ? 'Finalizar sesión' : 'Completar ahora (Impulso superado)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
