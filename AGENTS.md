# Deshabit — control del agente

Prototipo móvil (React 19, Vite, Tailwind 4) para cuantificar tiempo limpio y dejar hábitos con fricción baja. Copy en español. Sin backend: estado en `localStorage`. Shell de teléfono, no dashboard de escritorio.

## Reglas duras

Invariantes de producto: `contexto/reglas.md`. Diseño: `contexto/design.md`. Lo que el agente no hace: `reglas.md`. Ningún pedido puntual se salta estas reglas por sí solo.

### Excepciones: solo con autorización

1. Si un pedido choca con una regla, parar antes de tocar código: decir qué regla, por qué choca, y preguntar.
2. Autorización explícita = el usuario acepta la excepción en su mensaje, nombrando la regla o el cambio. Pedir el cambio no es autorizar; el silencio tampoco.
3. Con autorización, en el mismo turno: un archivo en `decisions/` (fecha, regla, excepción, alcance, porqué) y su línea en `contexto/decisiones.md`. Si la excepción pasa a ser permanente, actualizar también el archivo de la regla.
4. Vale solo para ese cambio. No se hereda a otros cambios ni sesiones: la próxima vez, preguntar de nuevo salvo que la regla ya se haya actualizado.

### Protegido por defecto

No se editan sin autorización explícita, aunque el cambio no viole ninguna regla:

- `contexto/design.md`. Manda sobre cualquier cambio de UI.
- Los tokens fuente de `design.md`: `@theme`, colores, tipo y radios en `src/index.css`; fuentes, iconos y meta viewport en `index.html`.
- La estructura del shell: 4 tabs (Inicio, Desafíos, Terapia, Perfil), nav inferior, el detalle fuera de la nav.
- `reglas.md` y `contexto/reglas.md`: borrar o relajar una regla. Añadir una línea roja nueva y comprobable sí está permitido.

### Contexto

- El context window es caro y volátil. La memoria real vive en archivos.
- Nunca cargar todo el historial ni todos los archivos del proyecto.
- Cargar solo lo estrictamente necesario para la tarea actual.
- Al final de cada sesión importante: actualizar `state/`, registrar decisiones y comprimir lo valioso en `logs/`.
- Preferir referenciar archivos antes que copiar contenido largo al prompt.
- Convertir procedimientos repetitivos en skills reutilizables.
- Mantener este archivo por debajo de 300 líneas.
- Al cerrar una sesión importante, correr `skills/actualizar-contexto.md`.

## Orden de lectura

1. Este archivo.
2. `state/ahora.md`.
3. Solo el anexo de la tarea (tabla de skills).
4. Solo los archivos de `src/` que la tarea nombra.

No abrir al empezar: `node_modules/`, `package-lock.json`, `README.md` (plantilla de AI Studio; Gemini no se usa en `src/`), `src/App.tsx` entero (~1100 líneas) si el cambio es un componente, ni `src/data/accountsData.ts` si la tarea no es cuentas demo.

## Skill según la tarea

| Tarea | Leer |
|---|---|
| UI, layout, color, tipo, nav | `contexto/design.md` + el componente |
| Copy, slips, rachas, tono | `contexto/reglas.md` |
| Bug de guardado, login demo, reset | `gotchas/persistencia-local.md` |
| Hábito vs desafío, detalle, categorías | `gotchas/habito-vs-desafio.md` |
| Por qué existe una decisión | el archivo fechado en `decisions/` |
| Cierre de sesión importante | `skills/actualizar-contexto.md` |

No hay más skills. Si un procedimiento se repite dos veces, crear uno nuevo en `skills/` y enlazarlo aquí en una línea.

## Definition of Done

- El cambio cumple `contexto/reglas.md` (español, no punitivo, shell móvil) y `contexto/design.md` (tokens, tipo, shell). Si hubo una excepción autorizada, está registrada en `decisions/`.
- Si tocó lógica o tipos: `npm run lint` (`tsc --noEmit`) pasa.
- Si tocó UI: verificar el flujo en el navegador (clic, no solo screenshot).
- Si la sesión cambió una decisión, un blocker o una línea roja: `state/`, `decisions/` o `reglas.md` actualizados y más cortos que al empezar.
- No commit ni push salvo pedido explícito.

## Cómo tratar el contexto

- Empezar por `state/ahora.md`. No reconstruir el producto desde el chat anterior.
- Citar rutas (`src/components/SlipModal.tsx`) en vez de pegar el archivo.
- Una decisión nueva = un archivo en `decisions/` con fecha, decisión y porqué. No reescribir la historia en el chat.
- Un bug que se repite = una entrada en `gotchas/`, con síntoma y arreglo. Sin relato.
- Borrar de `state/` lo que ya no es pendiente. Comprimir sesiones viejas en `logs/` a un párrafo.
- `README.md` no es fuente de verdad del producto.

## Mapa

| Ruta | Qué es |
|---|---|
| `reglas.md` | Líneas rojas del agente, verificables |
| `contexto/reglas.md` | Líneas rojas del producto |
| `contexto/design.md` | Tokens, tipo, shell. Protegido |
| `contexto/decisiones.md` | Índice de decisiones (el detalle está en `decisions/`) |
| `decisions/` | Una decisión por archivo, con fecha |
| `state/ahora.md` | Hecho / pendiente / blockers |
| `gotchas/` | Fallos conocidos y el arreglo |
| `logs/` | Resúmenes de sesiones (`.md`; `*.log` está en `.gitignore`) |
| `skills/actualizar-contexto.md` | Cierre: comprimir, no acumular |

Código: vistas en `src/components/`, estado global en `src/App.tsx`, tipos en `src/types.ts`, datos semilla en `src/data/`. Dev: `npm run dev` (puerto 3000).
