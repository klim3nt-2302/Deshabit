import React from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { Habit } from '../types';

interface HeaderProps {
  currentHabit: Habit;
  allHabits: Habit[];
  onSelectHabit: (habit: Habit) => void;
  onOpenCreateModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentHabit,
  allHabits,
  onSelectHabit,
  onOpenCreateModal,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="relative w-full mb-3 pt-2">
      <div className="flex items-center justify-between gap-2">
        {/* Brand and selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#09090b] inline-block" />
            <span className="text-[20px] font-semibold tracking-tight text-[#09090b]">
              Deshabit
            </span>
          </div>

          {/* Active Category Badge: Exclusive Ember #ff5a00 token */}
          <div className="inline-flex items-center bg-[#ff5a00] text-white text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-[12px] leading-tight">
            {currentHabit.category}
          </div>
        </div>

        {/* Action + Nuevo Pill */}
        <div className="flex items-center gap-1.5">
          {allHabits.length > 1 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center gap-1 bg-[#ffffff] text-[#18181b] border border-[#ececee] text-xs font-medium px-2.5 py-1.5 rounded-full transition-colors hover:bg-[#fafafa]"
                aria-label="Cambiar hábito activo"
              >
                <span className="truncate max-w-[85px] text-[12px]">{currentHabit.title}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#71717a]" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-60 bg-[#ffffff] border border-[#ececee] rounded-[14px] shadow-sm z-50 p-1.5">
                    <p className="px-2.5 py-1 text-[11px] font-medium text-[#71717a] uppercase tracking-wider">
                      Hábitos en cuantificación
                    </p>
                    {allHabits.map((habit) => (
                      <button
                        key={habit.id}
                        type="button"
                        onClick={() => {
                          onSelectHabit(habit);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-[10px] text-xs transition-colors flex items-center justify-between ${
                          habit.id === currentHabit.id
                            ? 'bg-[#f4f4f5] text-[#09090b] font-medium'
                            : 'text-[#18181b] hover:bg-[#fafafa]'
                        }`}
                      >
                        <span className="truncate">{habit.title}</span>
                        {habit.id === currentHabit.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#09090b]" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1 bg-[#ffffff] text-[#18181b] border border-[#ececee] text-xs font-medium px-3 py-1.5 rounded-full transition-colors hover:bg-[#fafafa] active:scale-95"
            id="btn-header-new-habit"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Nuevo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
