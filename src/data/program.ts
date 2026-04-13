import type { ProgramDefinition, ProgramId, WorkoutTemplate } from "@/lib/types";

// ── Push / Pull / Legs ──────────────────────────────────────

const PPL_PROGRAM: ProgramDefinition = {
  id: "ppl",
  name: "Push / Pull / Legs",
  shortName: "PPL",
  description:
    "Klasický split pre pokročilých. Compound lifty 6–8 reps, izolácia 10–15 reps. 3× týždenne.",
  author: "Cavaliere & Huberman",
  workoutOrder: ["push", "pull", "legs"],
  workouts: [
    {
      id: "push",
      name: "Push Day",
      label: "Hrudník, Ramená, Triceps",
      color: "#ef4444",
      exercises: [
        {
          id: "bench-press",
          name: "Bench Press",
          muscleGroup: "chest",
          sets: 4,
          repsMin: 6,
          repsMax: 8,
          restSeconds: 180,
          notes: "Kontrolovany excentric (3s dole). Lopatky stiahni dozadu a dole.",
        },
        {
          id: "incline-db-press",
          name: "Incline Dumbbell Press",
          muscleGroup: "chest",
          sets: 3,
          repsMin: 8,
          repsMax: 10,
          restSeconds: 120,
          notes: "30° sklon. Plny rozsah pohybu.",
        },
        {
          id: "ohp",
          name: "Overhead Press",
          muscleGroup: "shoulders",
          sets: 3,
          repsMin: 8,
          repsMax: 10,
          restSeconds: 150,
          notes: "Stoj. Core zapojeny, bez nadmerneho zaklonu.",
        },
        {
          id: "cable-crossover",
          name: "Cable Crossover",
          muscleGroup: "chest",
          sets: 3,
          repsMin: 10,
          repsMax: 12,
          restSeconds: 90,
          notes: "Konstantne napatie. Pauza v kontrakci 1s.",
        },
        {
          id: "lateral-raise",
          name: "Lateral Raises",
          muscleGroup: "shoulders",
          sets: 3,
          repsMin: 12,
          repsMax: 15,
          restSeconds: 60,
          notes: "Mierne predkloneny. Lakte mierne pokrcene, vedie laket.",
        },
        {
          id: "tricep-pushdown",
          name: "Tricep Pushdown",
          muscleGroup: "triceps",
          sets: 3,
          repsMin: 10,
          repsMax: 12,
          restSeconds: 60,
          notes: "Lakte fixovane pri tele. Plna extenzia.",
        },
        {
          id: "overhead-ext",
          name: "Overhead Tricep Extension",
          muscleGroup: "triceps",
          sets: 3,
          repsMin: 10,
          repsMax: 12,
          restSeconds: 60,
          notes: "Dlha hlava tricepsu - natiahnutie nad hlavou.",
        },
      ],
    },
    {
      id: "pull",
      name: "Pull Day",
      label: "Chrbát, Biceps, Zadné Delty",
      color: "#3b82f6",
      exercises: [
        {
          id: "barbell-row",
          name: "Barbell Row",
          muscleGroup: "back",
          sets: 4,
          repsMin: 6,
          repsMax: 8,
          restSeconds: 180,
          notes: "45° predklon. Tiahni k pupku, lopatky stlac.",
        },
        {
          id: "weighted-pullup",
          name: "Weighted Pull-ups",
          muscleGroup: "back",
          sets: 3,
          repsMin: 6,
          repsMax: 10,
          restSeconds: 150,
          notes: "Plny rozsah - z mrtvej polohy po bradu nad hrazdu.",
        },
        {
          id: "cable-row",
          name: "Seated Cable Row",
          muscleGroup: "back",
          sets: 3,
          repsMin: 8,
          repsMax: 10,
          restSeconds: 120,
          notes: "Hrudnik von, pauza v kontrakci.",
        },
        {
          id: "face-pull",
          name: "Face Pulls",
          muscleGroup: "rear_delts",
          sets: 3,
          repsMin: 15,
          repsMax: 20,
          restSeconds: 60,
          notes: "Externalna rotacia na konci. Krit. pre zdravie ramien (Cavaliere).",
        },
        {
          id: "barbell-curl",
          name: "Barbell Curl",
          muscleGroup: "biceps",
          sets: 3,
          repsMin: 8,
          repsMax: 10,
          restSeconds: 90,
          notes: "Bez sizvu. Kontrolovany excentric.",
        },
        {
          id: "hammer-curl",
          name: "Hammer Curl",
          muscleGroup: "biceps",
          sets: 3,
          repsMin: 10,
          repsMax: 12,
          restSeconds: 60,
          notes: "Brachialis + brachioradialis. Neutralny uchop.",
        },
        {
          id: "rear-delt-fly",
          name: "Reverse Pec Deck",
          muscleGroup: "rear_delts",
          sets: 3,
          repsMin: 12,
          repsMax: 15,
          restSeconds: 60,
          notes: "Pomalý pohyb. Cit vo zadných deltách.",
        },
      ],
    },
    {
      id: "legs",
      name: "Legs Day",
      label: "Quadriceps, Hamstring, Lýtka",
      color: "#22c55e",
      exercises: [
        {
          id: "squat",
          name: "Barbell Squat",
          muscleGroup: "quads",
          sets: 4,
          repsMin: 6,
          repsMax: 8,
          restSeconds: 240,
          notes: "Pod paralelu. Hrudnik hore, kolena v smere prstov.",
        },
        {
          id: "rdl",
          name: "Romanian Deadlift",
          muscleGroup: "hamstrings",
          sets: 3,
          repsMin: 8,
          repsMax: 10,
          restSeconds: 150,
          notes: "Cit v hamstringoch. Tycka blizko tela, hip hinge.",
        },
        {
          id: "leg-press",
          name: "Leg Press",
          muscleGroup: "quads",
          sets: 3,
          repsMin: 10,
          repsMax: 12,
          restSeconds: 120,
          notes: "Nohy stredne siroko. Nezdvihaj zadok z operadla.",
        },
        {
          id: "leg-curl",
          name: "Lying Leg Curl",
          muscleGroup: "hamstrings",
          sets: 3,
          repsMin: 10,
          repsMax: 12,
          restSeconds: 90,
          notes: "Excentric 3s. Plne natiahni na konci.",
        },
        {
          id: "leg-ext",
          name: "Leg Extension",
          muscleGroup: "quads",
          sets: 3,
          repsMin: 10,
          repsMax: 12,
          restSeconds: 90,
          notes: "Pauza v kontrakci 1s. Skvely finisher pre quady.",
        },
        {
          id: "bulgarian-split",
          name: "Bulgarian Split Squat",
          muscleGroup: "glutes",
          sets: 3,
          repsMin: 10,
          repsMax: 12,
          restSeconds: 90,
          notes: "Jednorocky. Koleno smeruje mierne dopredu.",
        },
        {
          id: "calf-raise",
          name: "Standing Calf Raise",
          muscleGroup: "calves",
          sets: 4,
          repsMin: 12,
          repsMax: 15,
          restSeconds: 60,
          notes: "Plny rozsah - dole natiahni, hore kontrakcia s pauzou.",
        },
      ],
    },
  ],
};

// ── Full Body Advanced ──────────────────────────────────────

const FULLBODY_PROGRAM: ProgramDefinition = {
  id: "fullbody",
  name: "Full Body Advanced",
  shortName: "FB",
  description:
    "Vedecky podložený full-body split. Striedanie predĺženej/skrátenej pozície. Schedule A/B periodizácia.",
  author: "Cavaliere & Huberman & Galpin",
  workoutOrder: ["fb_strength", "fb_metabolic", "fb_athletic"],
  workouts: [
    {
      id: "fb_strength",
      name: "Deň 1 – Sila & Predĺžená pozícia",
      label: "Squat, Bench, Pull-up, RDL",
      color: "#ef4444",
      exercises: [
        {
          id: "fb-back-squat",
          name: "Barbell Back Squat",
          muscleGroup: "quads",
          sets: 4,
          repsMin: 4,
          repsMax: 6,
          restSeconds: 240,
          notes:
            "Schedule A – maximálne mechanické napätie. Pod paralelu. Excentric 3s. Lengthened position.",
        },
        {
          id: "fb-weighted-pullup",
          name: "Weighted Pull-ups",
          muscleGroup: "back",
          sets: 4,
          repsMin: 6,
          repsMax: 10,
          restSeconds: 180,
          notes:
            "Predĺžená pozícia pre lats. Plný ROM – z mŕtvej polohy. Mind-muscle connection.",
        },
        {
          id: "fb-bench-press",
          name: "Barbell Bench Press",
          muscleGroup: "chest",
          sets: 4,
          repsMin: 4,
          repsMax: 6,
          restSeconds: 240,
          notes:
            "Schedule A – sila. Lopatky retrahované. Pauza na hrudi 1s. Lengthened position.",
        },
        {
          id: "fb-rdl",
          name: "Romanian Deadlift",
          muscleGroup: "hamstrings",
          sets: 3,
          repsMin: 8,
          repsMax: 10,
          restSeconds: 150,
          notes:
            "Stretch-mediated hypertrophy. Cíť natiahnutie hamstringov. Tyčka blízko tela.",
        },
        {
          id: "fb-incline-curl",
          name: "Incline Dumbbell Curl",
          muscleGroup: "biceps",
          sets: 3,
          repsMin: 10,
          repsMax: 12,
          restSeconds: 60,
          notes:
            "Predĺžená pozícia pre biceps – lavička 45°. Excentric 3s. Lengthened partials na konci série.",
        },
        {
          id: "fb-face-pull-d1",
          name: "Face Pulls",
          muscleGroup: "rear_delts",
          sets: 3,
          repsMin: 15,
          repsMax: 20,
          restSeconds: 60,
          notes:
            "Nápravný cvik (Corrective). Externá rotácia na konci. Zdravie ramenného pletenca.",
        },
      ],
    },
    {
      id: "fb_metabolic",
      name: "Deň 2 – Metabolický & Skrátená pozícia",
      label: "Izolácia, Kontrakcie, Objem",
      color: "#f59e0b",
      exercises: [
        {
          id: "fb-leg-ext",
          name: "Leg Extension",
          muscleGroup: "quads",
          sets: 3,
          repsMin: 12,
          repsMax: 15,
          restSeconds: 60,
          notes:
            "Schedule B – skrátená pozícia. Pauza v kontrakcii 2s. Metabolický stres. Myo-reps na poslednej sérii.",
        },
        {
          id: "fb-chest-row",
          name: "Chest Supported Row",
          muscleGroup: "back",
          sets: 3,
          repsMin: 10,
          repsMax: 12,
          restSeconds: 90,
          notes:
            "Skrátená pozícia pre chrbát. Stlač lopatky na 1s. Eliminuj hybnosť – prsia na lavičke.",
        },
        {
          id: "fb-cable-cross",
          name: "Cable Crossover",
          muscleGroup: "chest",
          sets: 3,
          repsMin: 12,
          repsMax: 15,
          restSeconds: 60,
          notes:
            "Skrátená pozícia pre hrudník. Maximálna kontrakcia. Konštantné napätie kábla.",
        },
        {
          id: "fb-leg-curl",
          name: "Lying Leg Curl",
          muscleGroup: "hamstrings",
          sets: 3,
          repsMin: 10,
          repsMax: 12,
          restSeconds: 90,
          notes:
            "Skrátená pozícia pre hamstringy. Excentric 3s. Lengthened partials po zlyhání.",
        },
        {
          id: "fb-lat-raise",
          name: "Dumbbell Lateral Raise",
          muscleGroup: "shoulders",
          sets: 3,
          repsMin: 12,
          repsMax: 15,
          restSeconds: 60,
          notes:
            "Skrátená pozícia – stredné delty. Mechanický drop-set: lateral → push press na poslednej sérii.",
        },
        {
          id: "fb-tri-pushdown",
          name: "Tricep Pushdowns",
          muscleGroup: "triceps",
          sets: 3,
          repsMin: 12,
          repsMax: 15,
          restSeconds: 60,
          notes:
            "Skrátená pozícia. Rest-pause na poslednej sérii: zlyhanie → 15s pauza → 2-4 reps.",
        },
      ],
    },
    {
      id: "fb_athletic",
      name: "Deň 3 – Atletika & Unilaterálna práca",
      label: "Deadlift, OHP, Split Squat, Carry",
      color: "#22c55e",
      exercises: [
        {
          id: "fb-deadlift",
          name: "Barbell Deadlift",
          muscleGroup: "hamstrings",
          sets: 3,
          repsMin: 4,
          repsMax: 6,
          restSeconds: 240,
          notes:
            "Schedule A – hlavný hinge. Neutrálna pozícia. Reset každý rep. Sila z podlahy.",
        },
        {
          id: "fb-ohp",
          name: "Overhead Press",
          muscleGroup: "shoulders",
          sets: 4,
          repsMin: 6,
          repsMax: 8,
          restSeconds: 180,
          notes:
            "Vertikálny tlak. Stoj, core zapojený. Excentric kontrolovaný. Neutrálna pozícia.",
        },
        {
          id: "fb-bulgarian",
          name: "Bulgarian Split Squat",
          muscleGroup: "glutes",
          sets: 3,
          repsMin: 8,
          repsMax: 10,
          restSeconds: 90,
          notes:
            "Unilaterálna práca – odstránenie asymetrií. Predĺžená pozícia. Jednoročky.",
        },
        {
          id: "fb-tbar-row",
          name: "Dumbbell Row",
          muscleGroup: "back",
          sets: 3,
          repsMin: 8,
          repsMax: 10,
          restSeconds: 90,
          notes:
            "Neutrálna pozícia. Horizontálny ťah. Pauza v kontrakcii.",
        },
        {
          id: "fb-weighted-dips",
          name: "Weighted Dips",
          muscleGroup: "chest",
          sets: 3,
          repsMin: 8,
          repsMax: 15,
          restSeconds: 120,
          notes:
            "Predĺžená pozícia pre hrudník a triceps. Do blízkosti zlyhania. Predklon pre aktiváciu pŕs.",
        },
        {
          id: "fb-farmer-carry",
          name: "Farmer's Carry",
          muscleGroup: "forearms",
          sets: 3,
          repsMin: 40,
          repsMax: 50,
          restSeconds: 90,
          notes:
            "Carry vzorec – dynamická stabilizácia jadra. Ťažké jednoročky. Počítaj kroky. Biomarker sily úchopu.",
        },
      ],
    },
  ],
};

// ── Exports ─────────────────────────────────────────────────

export const ALL_PROGRAMS: ProgramDefinition[] = [PPL_PROGRAM, FULLBODY_PROGRAM];

export const PROGRAM = PPL_PROGRAM.workouts;

export const WORKOUT_ORDER = PPL_PROGRAM.workoutOrder;

export function getProgram(id: ProgramId): ProgramDefinition {
  return ALL_PROGRAMS.find((p) => p.id === id) ?? PPL_PROGRAM;
}

export function getWorkoutTemplate(type: string): WorkoutTemplate | undefined {
  for (const prog of ALL_PROGRAMS) {
    const found = prog.workouts.find((w) => w.id === type);
    if (found) return found;
  }
  return undefined;
}

export function getAllWorkoutTemplates(): WorkoutTemplate[] {
  return ALL_PROGRAMS.flatMap((p) => p.workouts);
}
