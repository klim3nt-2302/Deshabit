# 2026-10-05 — Fuera `@google/genai` y `tsx`

**Decisión.** Se quitaron `@google/genai` y `tsx` de `package.json`. Ninguno se importaba ni se usaba en scripts.

**Por qué.** Generaban advertencias en el build de Vercel: `node-domexception` obsoleto y scripts de instalación de `@google/genai`, `protobufjs` y `esbuild`. Sigue la línea de `decisions/2026-09-30-prototipo-local.md`: sin Gemini.

**Si vuelve Gemini.** Reinstalar el SDK es parte de esa decisión nueva, no de un cambio de UI.
