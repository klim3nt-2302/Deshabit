Haz esto con el contexto:

### 1. Analiza el proyecto actual
- Revisa la estructura actual del repositorio.
- Identifica qué información crítica se pierde entre sesiones.
- Detecta archivos o contexto que se están cargando de forma ineficiente.

### 2. Crea la estructura de memoria persistente
Implementa la siguiente estructura de archivos (crea los que no existan) y añade al folder contexto design.md, decisiones.md y reglas.md:

/
├── AGENTS.md                 # Archivo central de control (máximo 250-300 líneas)
├── reglas.md                 # Lo que el agente nunca debe hacer
├── decisions/                # Decisiones importantes con fecha y razonamiento
├── state/                    # Estado actual del proyecto (hecho / pendiente / blockers)
├── skills/actualizar-contexto.md  # Actualiza el contexto y lo mantiene corto
├── gotchas/                  # Problemas conocidos + soluciones
└── logs/                     # Resúmenes comprimidos de sesiones importantes

### 3. Contenido que debes generar

**AGENTS.md** debe contener:
- Identidad y propósito del proyecto
- Reglas duras e invariantes
- Orden de lectura preferido de archivos
- Qué skill usar según el tipo de tarea
- Definition of Done
- Instrucciones claras de cómo el agente debe comportarse con el contexto
- Punteros a las demás carpetas de memoria

**reglas.md** debe contener:
- Lo que el agente nunca debe hacer
- Solo reglas que se puedan violar y detectar (nada de «haz buen diseño»)

**skills/actualizar-contexto.md** debe contener:
- Cuándo correrla: al cerrar una sesión importante, no en cada mensaje
- Qué actualizar: state/, decisions/, logs/, reglas.md si cambió una línea roja
- Cómo mantenerlo eficiente: comprimir lo viejo, borrar lo que ya no sirve, no copiar historial al prompt, no dejar que AGENTS.md pase de 300 líneas
- El resultado de la skill: contexto al día y más corto que al empezar

**En las carpetas**:
- Crea archivos iniciales útiles basados en el estado real del proyecto.
- Extrae y organiza decisiones, estado actual, patrones y gotchas que ya existan en el código o en conversaciones previas (si las hay).
- Escribe corto y concreto. Nada de relleno.

### 4. Reglas de comportamiento que debes instalar
Incluye en AGENTS.md estas reglas fijas:

- El context window es caro y volátil. La memoria real debe vivir en archivos.
- Nunca cargar todo el historial ni todos los archivos del proyecto.
- Cargar solo lo estrictamente necesario para la tarea actual.
- Al final de cada sesión importante: actualizar state/, registrar decisiones y comprimir lo valioso en logs/.
- Preferir referenciar archivos antes que copiar contenido largo al prompt.
- Convertir procedimientos repetitivos en skills reutilizables.
- Mantener AGENTS.md conciso y de alta densidad de información.
- Al cerrar una sesión importante, correr skills/actualizar-contexto.md.

### 5. Resultado esperado
Al terminar debes entregarme:

1. La estructura de archivos creada (lista de archivos y carpetas).
2. El contenido completo de AGENTS.md, reglas.md y skills/actualizar-contexto.md.
3. Resumen de lo que pusiste en cada carpeta.
4. Instrucciones claras de cómo debo usar este sistema a partir de ahora (incluyendo qué decirte al inicio de futuras sesiones).
5. Cualquier mejora adicional que consideres valiosa según las buenas prácticas de optimización de contexto.

Sé práctico y concreto. No generes archivos de más ni texto de relleno.