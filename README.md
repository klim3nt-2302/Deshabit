# Deshabit

Prototipo móvil para cuantificar tiempo limpio y dejar hábitos con fricción baja. La interfaz está en español. No hay backend: hábitos, desafíos, sesión y ajustes viven en `localStorage`.

## Qué hace

- Cuatro secciones: Inicio, Desafíos, Terapia y Perfil. El detalle de un hábito se abre fuera de la navegación inferior.
- Registro de slips, rachas y ahorro estimado (dinero y tiempo).
- Login, registro y recuperación de contraseña solo en el navegador. No envía correo ni llama a un servidor.

## Requisitos

- [Node.js](https://nodejs.org/) 20 o superior

## Puesta en marcha

```bash
npm install
npm run dev
```

La app queda en [http://localhost:3000](http://localhost:3000). Ábrela con el ancho de un teléfono (~390px): el layout es un shell móvil, no un dashboard de escritorio.

No hace falta archivo `.env` ni clave de API.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en el puerto 3000 |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build localmente |
| `npm run lint` | Comprueba tipos (`tsc --noEmit`) |

## Cuentas demo

Hay tres cuentas de prueba en `src/data/accountsData.ts` (Alejandro, Camila y Matías). Las credenciales están solo en ese archivo.

## Límites de este prototipo

Auth, suscripción Pro, bloqueo de apps y escudo nocturno son interfaz local. No hay API detrás.

## Estructura

| Ruta | Qué es |
| --- | --- |
| `src/components/` | Vistas y modales |
| `src/App.tsx` | Estado global |
| `src/types.ts` | Tipos |
| `src/data/` | Datos semilla, incluidas las cuentas demo |
| `contexto/` | Reglas de producto y de diseño |
