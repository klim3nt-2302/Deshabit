# Hábito vs desafío

Síntoma típico: el detalle abre con días inventados, o “registrar día” no mueve el desafío.

- `handleToggleCleanDay` solo actualiza el array `habits`. Un desafío convertido no confirma el día limpio en `habitflow_challenges_v1`.
- Sin `startDate`, `convertChallengeToHabit` fabrica `startedAt` como `completedDays` + 14 h para que el reloj cuadre. No es la fecha real de alta.
- El hábito convertido nace con `slips: []`. Un slip en esa vista no está definido como escritura al desafío.
- `isInfinite` usa `targetDays: 9999`. No mostrar “día X de 9999”.
- Modos: `record` (Récord), `free` (Libre), `isInfinite` (Infinito). Completado pisa el modo con “Desafío Culminado”.
- Iconos de nav y hábitos: Material Symbols (`home`, `nutrition`). Parte de las cards usa `lucide-react`. No mezclar en el mismo control.
