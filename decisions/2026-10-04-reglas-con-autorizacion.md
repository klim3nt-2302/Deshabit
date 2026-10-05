# 2026-10-04 — Reglas solo ceden con autorización; design protegido

**Decisión.** Ningún pedido puntual se salta una regla (`reglas.md`, `contexto/reglas.md`, `contexto/design.md`) sin autorización explícita del usuario. Además, `design.md`, sus tokens (`src/index.css`, `index.html`), la estructura del shell y las reglas existentes no se editan sin autorización, aunque el cambio no viole nada.

**Por qué.** Lo pidió el usuario. Antes, "el pedido gana en ese cambio" dejaba que cada pedido erosionara las reglas sin que nadie lo decidiera, y la excepción quedaba solo en el chat. Proteger solo `design.md` no bastaba: cambiar un token en `index.css` lo esquiva.

**Cómo aplicar.** Si un pedido choca: parar, nombrar la regla, preguntar. Autorización = el usuario acepta la excepción en su mensaje; pedir el cambio no cuenta. Con autorización: archivo en `decisions/` y línea en `contexto/decisiones.md` en el mismo turno; si es permanente, actualizar la regla. Vale solo para ese cambio. Procedimiento: `AGENTS.md`, "Excepciones: solo con autorización".
