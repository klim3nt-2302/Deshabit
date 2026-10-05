import React from 'react';

interface BottomNavProps {
  activeTab: 'home' | 'challenges' | 'therapy' | 'profile';
  onNavigateHome: () => void;
  onNavigateChallenges: () => void;
  onTriggerTherapy: () => void;
  onOpenProfile: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onNavigateHome,
  onNavigateChallenges,
  onTriggerTherapy,
  onOpenProfile,
}) => {
  const tabIndexMap: Record<BottomNavProps['activeTab'], number> = {
    home: 0,
    challenges: 1,
    therapy: 2,
    profile: 3,
  };

  const activeIndex = tabIndexMap[activeTab] ?? 0;

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Navegación principal"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[358px] z-60 rounded-full bg-white/80 backdrop-blur-xl border border-[#ECECEE] shadow-[0px_10px_30px_rgba(0,0,0,0.12)]"
    >
      <div className="relative h-[58px] px-1.5 grid grid-cols-4 items-center">
        {/* ============================================================ */}
        {/* INDICADOR FLOTANTE DESLIZANTE CON BLANCO AL 100% SIN OPACIDAD */}
        {/* ============================================================ */}
        <div
          aria-hidden="true"
          className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc((100%-12px)/4)] pointer-events-none transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        >
          <div className="w-full h-full rounded-full bg-white shadow-[0px_2px_8px_rgba(0,0,0,0.08)]" />
        </div>

        {/* 1. Inicio */}
        <button
          type="button"
          onClick={onNavigateHome}
          id="nav-tab-inicio"
          aria-current={activeTab === 'home' ? 'page' : undefined}
          data-path="inicio"
          className={`relative z-10 flex flex-col items-center justify-center min-w-[40px] h-[46px] rounded-full transition-all duration-200 cursor-pointer active:scale-90 ${
            activeTab === 'home'
              ? 'opacity-100 text-[#FF5A00]'
              : 'opacity-45 hover:opacity-85 text-[#FF5A00]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[20px] transition-transform duration-200"
            style={{
              fontVariationSettings: activeTab === 'home' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            home
          </span>
          <span className="pt-0.5 text-[10px] font-sans font-bold uppercase leading-[13px] tracking-[0.4px] truncate max-w-full px-1">
            Inicio
          </span>
        </button>

        {/* 2. Desafíos */}
        <button
          type="button"
          onClick={onNavigateChallenges}
          id="nav-tab-desafios"
          aria-current={activeTab === 'challenges' ? 'page' : undefined}
          data-path="desafios"
          className={`relative z-10 flex flex-col items-center justify-center min-w-[40px] h-[46px] rounded-full transition-all duration-200 cursor-pointer active:scale-90 ${
            activeTab === 'challenges'
              ? 'opacity-100 text-[#FF5A00]'
              : 'opacity-45 hover:opacity-85 text-[#FF5A00]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[20px] transition-transform duration-200"
            style={{
              fontVariationSettings: activeTab === 'challenges' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            emoji_events
          </span>
          <span className="pt-0.5 text-[10px] font-sans font-bold uppercase leading-[13px] tracking-[0.4px] truncate max-w-full px-1">
            Desafíos
          </span>
        </button>

        {/* 3. Terapia 1:1 */}
        <button
          type="button"
          onClick={onTriggerTherapy}
          id="nav-tab-terapia"
          aria-current={activeTab === 'therapy' ? 'page' : undefined}
          data-path="comunidad"
          className={`relative z-10 flex flex-col items-center justify-center min-w-[40px] h-[46px] rounded-full transition-all duration-200 cursor-pointer active:scale-90 ${
            activeTab === 'therapy'
              ? 'opacity-100 text-[#FF5A00]'
              : 'opacity-45 hover:opacity-85 text-[#FF5A00]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[20px] transition-transform duration-200"
            style={{
              fontVariationSettings: activeTab === 'therapy' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            group
          </span>
          <span className="pt-0.5 text-[10px] font-sans font-bold uppercase leading-[13px] tracking-[0.4px] truncate max-w-full px-1">
            Terapia 1:1
          </span>
        </button>

        {/* 4. Perfil */}
        <button
          type="button"
          onClick={onOpenProfile}
          id="nav-tab-perfil"
          aria-current={activeTab === 'profile' ? 'page' : undefined}
          data-path="perfil"
          className={`relative z-10 flex flex-col items-center justify-center min-w-[40px] h-[46px] rounded-full transition-all duration-200 cursor-pointer active:scale-90 ${
            activeTab === 'profile'
              ? 'opacity-100 text-[#FF5A00]'
              : 'opacity-45 hover:opacity-85 text-[#FF5A00]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[20px] transition-transform duration-200"
            style={{
              fontVariationSettings: activeTab === 'profile' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            person
          </span>
          <span className="pt-0.5 text-[10px] font-sans font-bold uppercase leading-[13px] tracking-[0.4px] truncate max-w-full px-1">
            Perfil
          </span>
        </button>
      </div>
    </nav>
  );
};
