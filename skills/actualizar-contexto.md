# Skill: actualizar contexto

Correrla al cerrar una sesión importante (feature, bug difícil, cambio de producto). No en cada mensaje. No si el turno fue una pregunta o un ajuste de copy de una línea.

Excepción autorizada a una regla: se registra siempre en `decisions/`, en el mismo turno, aunque el cambio sea de una línea.

## Qué actualizar

- `state/ahora.md`: mover a hecho lo terminado; dejar solo pendientes y blockers vivos. Borrar lo resuelto.
- `decisions/`: un archivo nuevo solo si hubo una decisión que otro agente no puede redescubrir leyendo el diff. Fecha en el nombre (`YYYY-MM-DD-tema.md`). Enlazarlo en `contexto/decisiones.md` con una línea.
- `logs/YYYY-MM-DD-tema.md`: un párrafo. Qué cambió, qué archivo importa, qué no repetir. Sin transcripción.
- `reglas.md` o `contexto/reglas.md`: solo si apareció una línea roja nueva y comprobable.
- `gotchas/`: solo si el fallo puede repetirse y el arreglo no es obvio en el código.
- `AGENTS.md`: solo si cambia el mapa o la tabla de skills. No narrar la sesión aquí.

## Cómo mantenerlo corto

- Comprimir logs de más de ~15 líneas al siguiente cierre.
- Borrar pendientes cumplidos y decisiones superseded (dejar una línea “reemplazada por …” en el índice).
- No copiar historial, diffs ni código al prompt de memoria.
- Si `AGENTS.md` pasa de 300 líneas, sacar párrafos a la carpeta dueña antes de terminar.
- El resultado de esta skill es contexto al día y más corto que al empezar. Si el conjunto de archivos de memoria creció en líneas netas, cortar hasta que baje.

## Hecho cuando

`state/ahora.md` refleja el repo de hoy, no hay pendientes fantasma, y un agente nuevo puede empezar leyendo solo `AGENTS.md` + `state/ahora.md`.
