# 2026-09-30 — Prototipo 100 % local

**Decisión.** Deshabit sigue como SPA en el navegador. Persistencia = `localStorage`. Auth = cuentas demo. Pro, bloqueo de apps y escudo nocturno = preferencias locales, sin efecto de sistema.

**Por qué.** No hay servidor en el repo. Gemini está declarado en `metadata.json` y `package.json` y no se llama desde `src/`. Añadir backend o IA en un cambio de UI rompe el prototipo y mete secretos.

**No hacer.** Crear `server.js`, cablear `@google/genai`, ni tratar el login como autenticación real. Contraseñas demo viven en claro en `localStorage` (`deshabit_registered_accounts_v1`).
