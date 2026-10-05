# Estado — 2026-09-30

## Hecho

- SPA móvil: Inicio, detalle, Desafíos, Terapia, Perfil. Modales: SOS, slip, crear hábito/desafío, neuro, notificaciones, ajustes, Pro (UI), auth, onboarding.
- Persistencia local de hábitos, desafíos, notificaciones, sesión demo y ajustes. Claves en `gotchas/persistencia-local.md`.
- Tres cuentas demo en `src/data/accountsData.ts` (Alejandro, Camila, Matías). Contraseñas solo ahí; no copiarlas a estos archivos.
- Centro de notificaciones con origen `activity | reminder` y acción que navega (`src/types.ts`).
- Memoria de agente creada en esta sesión (`AGENTS.md` y carpetas de contexto).

## Pendiente

- Auth, pagos Pro, bloqueo de apps y escudo nocturno son UI local. No hay API.
- `@google/genai` y `express` están en `package.json` y no tienen uso en `src/` ni `server.js`.
- `src/App.tsx` concentra el estado (~1100 líneas). Hábitos y desafíos son dos stores que pueden divergir.

## Blockers

Ninguno para seguir en UI local.
