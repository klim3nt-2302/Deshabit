import React from 'react';

interface EmptyStateProps {
  onOpenCreateModal?: () => void;
  onSelectTemplate?: (template: any) => void;
  onResetToNormal?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onOpenCreateModal,
  onResetToNormal,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-snow rounded-3xl shadow-sm space-y-4" id="state-empty">
      <div className="w-16 h-16 rounded-full bg-cloud flex items-center justify-center text-secondary mx-auto">
        <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
        </svg>
      </div>
      <div className="space-y-1.5 max-w-xs mx-auto">
        <h3 className="font-headline-sm text-headline-sm text-primary">Comienza tu primer reto hoy</h3>
        <p className="font-body-sm text-body-sm text-secondary">Aún no tienes hábitos o disciplinas registradas. Tu camino hacia una rutina inquebrantable comienza con un solo paso.</p>
      </div>
      <button
        type="button"
        onClick={() => {
          if (onOpenCreateModal) onOpenCreateModal();
          else if (onResetToNormal) onResetToNormal();
        }}
        className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md text-label-md font-medium shadow-sm hover:opacity-90 transition-all flex items-center gap-2 mx-auto"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        Configurar mi primer hábito
      </button>
    </div>
  );
};
