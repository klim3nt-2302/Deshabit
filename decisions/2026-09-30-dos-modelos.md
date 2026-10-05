# 2026-09-30 — Hábito y desafío son modelos distintos

**Decisión.** `Habit` y `ChallengeItem` no se unifican. El detalle de un desafío pasa por `convertChallengeToHabit` (`src/utils/challengeBridge.ts`) y se pinta con `HabitDetail`.

**Por qué.** El desafío no trae slips ni `startedAt` real. El bridge rellena esos campos para reutilizar la vista. Unificar tipos ahora obliga a migrar las dos claves de storage.

**No hacer.** Duplicar la pantalla de detalle. No asumir que un id de desafío está en el array `habits`. Categorías: hábito `Salud | Foco | Digital | Finanzas`; desafío `health | foco | finance | digital`.
