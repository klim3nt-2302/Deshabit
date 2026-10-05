import { Habit, HabitTemplate, NeuroMilestone } from '../types';
import { generateCurrentWeekLog } from '../utils/weekGenerator';

export const NEURO_MILESTONES: NeuroMilestone[] = [
  {
    dayThreshold: 1,
    title: 'Fricción Inicial y Resistencia Prefrontal',
    shortLabel: '24 HORAS',
    biologicalDescription: 'La corteza prefrontal dorsolateral realiza el máximo esfuerzo inhibitorio para anular el impulso automático.',
    circuitryImpact: 'Disminución del bucle dopaminérgico fásico anticipatorio.',
  },
  {
    dayThreshold: 3,
    title: 'Atenuación del Impulso Agudo',
    shortLabel: '3 DÍAS',
    biologicalDescription: 'Los picos abruptos de necesidad se estabilizan al reducir la reactividad de la amígdala ante estímulos detonantes.',
    circuitryImpact: 'Normalización de niveles basales de noradrenalina y cortisol.',
  },
  {
    dayThreshold: 7,
    title: 'Resensibilización Receptores D2',
    shortLabel: '7 DÍAS',
    biologicalDescription: 'Hito crítico: los receptores dopaminérgicos D2 en el cuerpo estriado comienzan a recuperar densidad fisiológica.',
    circuitryImpact: 'Mayor disfrute de estímulos biológicos lentos y disminución del craving compulsivo.',
  },
  {
    dayThreshold: 14,
    title: 'Reconexión Prefrontal-Límbica',
    shortLabel: '14 DÍAS',
    biologicalDescription: 'Fortalecimiento de las sinapsis inhibitorias descendentes hacia los ganglios basales.',
    circuitryImpact: 'Capacidad de pausa consciente de 3 a 5 segundos antes de responder a un impulso ambiental.',
  },
  {
    dayThreshold: 21,
    title: 'Plasticidad Estructural y Neurogénesis',
    shortLabel: '21 DÍAS',
    biologicalDescription: 'Comienza la consolidación de nuevas ramas dendríticas para la conducta alternativa en el hipocampo.',
    circuitryImpact: 'El hábito no ejecutado deja de ser la ruta neural de menor resistencia bioeléctrica.',
  },
  {
    dayThreshold: 30,
    title: 'Mielinización y Automatización Consciente',
    shortLabel: '30 DÍAS',
    biologicalDescription: 'Las vainas de mielina aíslan los nuevos axones prefrontales, fijando el hábito consciente como default biológico.',
    circuitryImpact: 'Resistencia basal a la recaída sin fatiga de fuerza de voluntad.',
  },
  {
    dayThreshold: 50,
    title: 'Consolidación Hebbiana Permanente',
    shortLabel: '50 DÍAS',
    biologicalDescription: 'Reconfiguración arquitectónica de la red de modo por defecto (DMN). La identidad conductual se desacopla del antiguo estímulo.',
    circuitryImpact: 'Extinción del valor de incentivo asignado en la corteza orbitofrontal.',
  },
];

export const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    id: 'template-azucar',
    title: 'Cero Azúcar Refinada',
    category: 'Salud',
    description: 'Supresión de azúcares libres, bollería y bebidas ultraprocesadas para restaurar la sensibilidad insulínica.',
    triggerExample: 'Bajón glucémico vespertino (16:30) / Postre social',
    targetDays: 50,
    scientificContext: 'Los picos glucémicos generan hiperexcitabilidad estriatal seguida de fatiga cortical inmediata.',
    savings: { moneyPerDay: 4.8, minutesPerDay: 30, currency: '€' },
  },
  {
    id: 'template-doomscrolling',
    title: 'Cero Doomscrolling Nocturno',
    category: 'Digital',
    description: 'Cero consumo de feeds infinitos y videos cortos después de las 22:30 en el dormitorio.',
    triggerExample: 'Fatiga cognitiva en la cama / Teléfono en mesa de noche',
    targetDays: 50,
    scientificContext: 'La luz azul y la dopamina fásica de los feeds suprimen la melatonina e hiperexcitan el núcleo supraquiasmático.',
    savings: { moneyPerDay: 0, minutesPerDay: 75, currency: '€' },
  },
  {
    id: 'template-foco',
    title: 'Bloqueo de Multitarea y Redes',
    category: 'Foco',
    description: 'Sesiones de trabajo cognitivo profundo de 90 minutos sin alternancia de pestañas ni mensajería.',
    triggerExample: 'Fricción cognitiva al iniciar una tarea compleja',
    targetDays: 50,
    scientificContext: 'El residuo de atención tarda hasta 23 minutos en disiparse tras una sola distracción digital.',
    savings: { moneyPerDay: 0, minutesPerDay: 60, currency: '€' },
  },
  {
    id: 'template-compras',
    title: 'Cero Compras Impulsivas Online',
    category: 'Finanzas',
    description: 'Moratoria de 48 horas obligatoria antes de cualquier adquisición no planificada en e-commerce.',
    triggerExample: 'Aburrimiento vespertino / Ofertas flash por email',
    targetDays: 50,
    scientificContext: 'La dopamina se descarga durante la anticipación de compra, no con la posesión del objeto adquirido.',
    savings: { moneyPerDay: 12.5, minutesPerDay: 45, currency: '€' },
  },
];

const now = Date.now();
const fortyTwoDaysMs = (42 * 24 * 3600 + 14 * 3600 + 32 * 60 + 45) * 1000;
const fiveDaysSixMinMs = (5 * 24 * 3600 + 0 * 3600 + 6 * 60 + 34) * 1000;
const twoDaysThreeHoursMs = (2 * 24 * 3600 + 3 * 3600 + 6 * 60 + 24) * 1000;
const todayIsoStr = new Date().toISOString().split('T')[0];
const yesterdayIsoStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-cero-cigarrillo',
    title: 'Cero cigarrillo y nicotina',
    category: 'Salud',
    challengeMode: 'Modo Desafío',
    phase: 'Fase 3 / Consolidación',
    levelBadge: 'Nivel 3',
    icon: 'smoke_free',
    triggerDescription: 'Disciplina estricta de abstinencia biológica',
    startedAt: now - fortyTwoDaysMs,
    targetDays: 50,
    cleanDaysCount: 42,
    lastCleanDayConfirmedDate: yesterdayIsoStr,
    historicalIntervalsDays: [7.0, 14.5, 21.0],
    isPriority: true,
    savings: {
      moneyPerDay: 7.5,
      minutesPerDay: 45,
      currency: '€',
    },
    cognitiveReinforcement:
      '"Vas en racha implacable. Tu capacidad pulmonar y niveles basales de dopamina han alcanzado niveles de restauración óptimos."',
    slips: [
      {
        id: 'slip-cig-1',
        timestamp: now - 56 * 24 * 3600 * 1000,
        trigger: 'Reunión social nocturna',
        intervalBeforeSlipDays: 14.5,
        notes: 'Fumé un cigarrillo en una terraza con colegas.',
        intensity: 'leve',
      },
    ],
    reflections: [
      {
        id: 'ref-cig-1',
        timestamp: now - 2 * 24 * 3600 * 1000,
        text: 'Nivel de oxígeno y respiración diafragmática en niveles óptimos. Ya no siento necesidad matutina.',
      },
    ],
    weeklyLog: generateCurrentWeekLog([now - 56 * 24 * 3600 * 1000], 42),
  },
  {
    id: 'habit-azucar',
    title: 'Cero azúcar refinada',
    category: 'Salud',
    challengeMode: 'Modo Desafío',
    phase: 'Fase 1 / Rigor',
    icon: 'nutrition',
    triggerDescription: 'Supresión de ultraprocesados y picos glucémicos vespertinos',
    startedAt: now - fiveDaysSixMinMs,
    targetDays: 21,
    cleanDaysCount: 5,
    lastCleanDayConfirmedDate: yesterdayIsoStr,
    historicalIntervalsDays: [3.5, 5.0],
    isPriority: false,
    savings: {
      moneyPerDay: 4.8,
      minutesPerDay: 25,
      currency: '€',
    },
    cognitiveReinforcement:
      'Papilas gustativas resensibilizadas. La fructosa natural ahora se percibe con mayor intensidad.',
    slips: [],
    reflections: [
      {
        id: 'ref-azucar-1',
        timestamp: now - 1 * 24 * 3600 * 1000,
        text: 'Energía vespertina estable sin bajones ni somnolencia a las 16:30.',
      },
    ],
    weeklyLog: generateCurrentWeekLog([], 5),
  },
  {
    id: 'habit-redes',
    title: 'Pantalla redes',
    category: 'Foco',
    challengeMode: 'Modo Desafío',
    phase: 'Fase 1 / Rigor',
    icon: 'devices',
    triggerDescription: 'Cero feeds infinitos y videos cortos después de las 22:30',
    startedAt: now - twoDaysThreeHoursMs,
    targetDays: 30,
    cleanDaysCount: 2,
    lastCleanDayConfirmedDate: todayIsoStr,
    historicalIntervalsDays: [4.0],
    isPriority: false,
    savings: {
      moneyPerDay: 0,
      minutesPerDay: 75,
      currency: '€',
    },
    cognitiveReinforcement:
      'Tiempo de sueño prolongado y menor estimulación fásica antes de dormir.',
    slips: [],
    reflections: [],
    weeklyLog: generateCurrentWeekLog([], 2),
  },
  {
    id: 'habit-compras',
    title: 'Compras impulsivas',
    category: 'Foco',
    challengeMode: 'Modo Desafío',
    phase: 'Fase 1 / Rigor',
    icon: 'account_balance_wallet',
    triggerDescription: 'Moratoria de 48 horas obligatoria para e-commerce no planificado',
    startedAt: now - fiveDaysSixMinMs,
    targetDays: 30,
    cleanDaysCount: 5,
    lastCleanDayConfirmedDate: yesterdayIsoStr,
    historicalIntervalsDays: [3.0, 5.5],
    isPriority: false,
    savings: {
      moneyPerDay: 12.5,
      minutesPerDay: 40,
      currency: '€',
    },
    cognitiveReinforcement:
      'La dopamina se descarga durante la anticipación; la pausa de 48h desarma la compulsión.',
    slips: [],
    reflections: [],
    weeklyLog: generateCurrentWeekLog([], 5),
  },
];
