# Persistencia local

Síntoma típico: “no guarda”, datos viejos, o icono que vuelve al semilla.

- Claves: `habitflow_deshabit_v3`, `habitflow_active_habit_v3`, `habitflow_challenges_v1`, `deshabit_notifications_v1`, `deshabit_auth_session_v1`, `deshabit_registered_accounts_v1`, `deshabit_onboarding_completed_v1`, más ajustes `deshabit_currency`, `deshabit_pin_*`, `deshabit_app_blocker_enabled`, `deshabit_blocked_apps`, `deshabit_non_punitive`, `deshabit_morning_*`, `deshabit_night_*`.
- Hábitos guardados se mezclan con `INITIAL_HABITS` para recuperar `icon` si falta (`src/App.tsx`). Cambiar un hábito semilla no pisa título ni racha ya guardados.
- Arrays vacíos en storage se ignoran y vuelve la semilla. Un `[]` persistido no “borra” los datos iniciales.
- `try/catch` vacíos: si el storage falla (cuota, iframe), la UI sigue en memoria y al recargar se pierde.
- `*.log` está en `.gitignore`. Los resúmenes de sesión van en `logs/*.md`.
- PIN por defecto en código: `1234` si no hay `deshabit_pin_code`. No documentar contraseñas demo fuera de `accountsData.ts`.
