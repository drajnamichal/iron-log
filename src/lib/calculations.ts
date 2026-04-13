import type { ExerciseLog } from "./types";
import type { MuscleGroup } from "./types";
import { ALL_PROGRAMS } from "@/data/program";

// ── 1RM Formulas ──────────────────────────────────────────

/** Epley formula: good for moderate rep ranges (2-10) */
export function epley1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

/** Brzycki formula: good for lower rep ranges (1-12) */
export function brzycki1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  if (reps >= 37) return weight * 2;
  return Math.round((weight * 36) / (37 - reps) * 10) / 10;
}

/** Average of Epley and Brzycki for better accuracy */
export function estimated1RM(weight: number, reps: number): number {
  return Math.round((epley1RM(weight, reps) + brzycki1RM(weight, reps)) / 2 * 10) / 10;
}

/** Best estimated 1RM from a set of logs */
export function bestE1RM(logs: ExerciseLog[]): number {
  let best = 0;
  for (const l of logs) {
    if (l.completed && l.weight_kg && l.actual_reps) {
      const e = estimated1RM(l.weight_kg, l.actual_reps);
      if (e > best) best = e;
    }
  }
  return best;
}

// ── Volume ────────────────────────────────────────────────

/** Volume for a single set: weight × reps */
export function setVolume(log: ExerciseLog): number {
  if (!log.completed || !log.weight_kg || !log.actual_reps) return 0;
  return log.weight_kg * log.actual_reps;
}

/** Total volume from a list of logs */
export function totalVolume(logs: ExerciseLog[]): number {
  return logs.reduce((sum, l) => sum + setVolume(l), 0);
}

/** Volume broken down by muscle group */
export function volumeByMuscleGroup(
  logs: ExerciseLog[],
): Record<MuscleGroup, number> {
  const result = {} as Record<MuscleGroup, number>;
  const exerciseToMuscle = getExerciseMuscleMap();

  for (const l of logs) {
    const vol = setVolume(l);
    if (vol === 0) continue;
    const muscle = exerciseToMuscle.get(l.exercise_id);
    if (muscle) {
      result[muscle] = (result[muscle] ?? 0) + vol;
    }
  }
  return result;
}

// ── PR Detection ──────────────────────────────────────────

export interface PRRecord {
  maxWeight: number;
  maxWeightReps: number;
  maxReps: number;
  maxRepsWeight: number;
  bestE1RM: number;
}

/** Compute all-time PR for an exercise from historical logs */
export function computePR(logs: ExerciseLog[]): PRRecord {
  const pr: PRRecord = {
    maxWeight: 0,
    maxWeightReps: 0,
    maxReps: 0,
    maxRepsWeight: 0,
    bestE1RM: 0,
  };

  for (const l of logs) {
    if (!l.completed) continue;
    const w = l.weight_kg ?? 0;
    const r = l.actual_reps ?? 0;

    if (w > pr.maxWeight || (w === pr.maxWeight && r > pr.maxWeightReps)) {
      pr.maxWeight = w;
      pr.maxWeightReps = r;
    }

    if (r > pr.maxReps || (r === pr.maxReps && w > pr.maxRepsWeight)) {
      pr.maxReps = r;
      pr.maxRepsWeight = w;
    }

    const e = estimated1RM(w, r);
    if (e > pr.bestE1RM) {
      pr.bestE1RM = e;
    }
  }

  return pr;
}

export type PRType = "weight" | "reps" | "e1rm";

/** Check if a given set beats the existing PR, returns which PRs were broken */
export function detectNewPRs(
  weight: number,
  reps: number,
  existingPR: PRRecord,
): PRType[] {
  if (weight <= 0 || reps <= 0) return [];
  const broken: PRType[] = [];

  if (weight > existingPR.maxWeight) {
    broken.push("weight");
  }

  if (reps > existingPR.maxReps) {
    broken.push("reps");
  }

  const e = estimated1RM(weight, reps);
  if (e > existingPR.bestE1RM && existingPR.bestE1RM > 0) {
    broken.push("e1rm");
  }

  return broken;
}

// ── Helpers ───────────────────────────────────────────────

const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: "Hrudník",
  shoulders: "Ramená",
  triceps: "Triceps",
  back: "Chrbát",
  biceps: "Biceps",
  rear_delts: "Zadné delty",
  forearms: "Predlaktia",
  full_body: "Celé telo",
  quads: "Quady",
  hamstrings: "Hamstringy",
  glutes: "Glúty",
  calves: "Lýtka",
  core: "Core",
};

export function muscleLabel(m: MuscleGroup): string {
  return MUSCLE_LABELS[m] ?? m;
}

function getExerciseMuscleMap(): Map<string, MuscleGroup> {
  const map = new Map<string, MuscleGroup>();
  for (const prog of ALL_PROGRAMS) {
    for (const w of prog.workouts) {
      for (const ex of w.exercises) {
        map.set(ex.id, ex.muscleGroup);
      }
    }
  }
  return map;
}
