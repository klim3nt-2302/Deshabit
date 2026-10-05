# Líneas rojas del agente

Solo reglas que se pueden violar y detectar. El producto está en `contexto/reglas.md`.

1. No leer `node_modules/`, `package-lock.json` ni volcar `src/` completo en el contexto.
2. No pegar historial de chat dentro de `logs/`, `state/` o `decisions/`. Una sesión = un párrafo o un archivo corto.
3. No dejar `AGENTS.md` por encima de 300 líneas. Si crece, mover detalle a `contexto/`, `gotchas/` o `decisions/`.
4. No copiar un archivo largo al prompt si basta la ruta.
5. No commitear `.env`, `.env.local` ni secretos. `.env.example` sí puede citarse; no inventar una `GEMINI_API_KEY` en código: `@google/genai` está en `package.json` y no se importa en `src/`.
6. No renombrar claves de `localStorage` sin migración y sin una nota en `decisions/`. Claves actuales: `gotchas/persistencia-local.md`.
7. No añadir backend, Express ni llamadas a Gemini como parte de un cambio de UI. `express` está en dependencias; no hay `server.js`.
8. No escribir copy de vergüenza, castigo o “fallaste” en slips, toasts o rachas. El slip es registro, no penalización (`src/App.tsx`, `handleSubmitSlip`).
9. No hacer commit ni push si el usuario no lo pidió en ese mensaje.
10. No borrar `localStorage` del usuario como arreglo. El reset solo existe en el flujo de cerrar sesión ya implementado.
11. No editar `contexto/design.md`, sus tokens (`src/index.css`, `index.html`) ni la estructura del shell sin autorización explícita del usuario. Lista completa: `AGENTS.md`, "Protegido por defecto".
12. No saltarse una regla de este archivo, de `contexto/reglas.md` ni de `contexto/design.md` por un pedido puntual sin autorización explícita. Con autorización, dejar en el mismo turno un archivo en `decisions/` y su línea en `contexto/decisiones.md`. Procedimiento: `AGENTS.md`, "Excepciones: solo con autorización".
