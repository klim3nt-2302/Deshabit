# Design

Fuente: `src/index.css`, `index.html`. No inventar paleta.

Protegido: manda sobre cualquier cambio. Editarlo o contradecirlo requiere autorización explícita del usuario (`AGENTS.md`, "Protegido por defecto").

## Tokens

- Fondo app `#f9f9fa` (`surface`). Texto `#1a1c1d`. Variante `#47464a`.
- Negro de acción `#09090B` / `#000000`. Borde suave `#ECECEE`.
- Acento brasa `#FF5A00` (`ember`). Selección de texto: fondo ember, texto blanco.
- Error `#ba1a1a` / container `#ffdad6`. Verde de estado solo en métricas positivas (`#10B981` sobre `#ECFDF5`), no como marca.
- Radio de cards grandes: 36px. Nav inferior: píldora flotante, blur, borde `#ECECEE`.
- Fuente: DM Sans. Labels 11/14 tracking 0.04em. Body 13/18 y 14/20. Título 16/22, headline 20/28 y 24/32. Display móvil 36/42 tracking -0.02em. Números con `tabular-nums` (`.font-mono-numbers`).
- Iconos de UI principal: Material Symbols Outlined. `FILL` 1 en tab activo.

## Shell

- Viewport móvil, `user-scalable=no`, `viewport-fit=cover`. `min-height: max(884px, 100dvh)`.
- Nav fija abajo, 4 tabs: Inicio, Desafíos, Terapia, Perfil. Tab activo en ember; indicador blanco deslizante. El detalle no es tab: se entra desde Inicio o Desafíos y vuelve a `previousView`.
- Acciones primarias: alto mínimo 44px, fondo `#09090B`, radio ~16px, `active:scale` corto.
- Safe area: `.pb-safe` / `.pt-safe`.

## Al implementar

Reusar clases de `index.css` (`font-headline-md`, `text-body-sm`) o los hex de arriba. Si un componente ya usa hex suelto, igualar ese archivo; no abrir una tercera escala.
