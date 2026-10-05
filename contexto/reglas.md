# Reglas de producto

Comprobables en UI o en tipos. Tono y diseño fino viven en la pantalla, no aquí.

1. Copy de interfaz en español (Chile). Reloj relativo: `Ahora`, `Hace N min`, `Ayer, HH:MM` (`src/utils/timeFormat.ts`, `es-CL`, 24 h).
2. Un slip no resta dignidad ni “rompe” al usuario. Intensidad: `leve | moderada | aguda`. Default de modo no punitivo: `true` (`deshabit_non_punitive`).
3. Moneda por defecto `CLP`. La otra opción es `USD`. Cuentas demo pueden traer USD (Camila); no forzar CLP encima de la preferencia guardada.
4. Categorías de hábito: `Salud | Foco | Digital | Finanzas`. De desafío: `health | foco | finance | digital`. No añadir una quinta sin tocar `src/types.ts` y el mapa de `challengeBridge.ts`.
5. Objetivo por defecto de un hábito nuevo: 50 días (`Habit.targetDays`).
6. La app es un shell de teléfono. Layouts nuevos tienen que caber en ~390px de ancho con la nav inferior visible.
7. Login, registro y “olvidé contraseña” solo mutan `localStorage`. No prometer email ni servidor.
8. Notificación nueva: campos de `AppNotification`. Toda acción navegable usa `NotificationAction` (`habit | challenges | therapy | settings | sos | profile`).
