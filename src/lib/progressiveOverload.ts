import { format, parseISO } from "date-fns";
import { sk } from "date-fns/locale";
import type { ExerciseLog, WorkoutSession } from "./types";

const PLATE = 2.5;

export function roundToPlate(kg: number): number {
  return Math.round(kg / PLATE) * PLATE;
}

export type LastLiftContext = {
  sessionStartedAt: string;
  topWeightKg: number;
  /** completed sets at top weight, set order */
  topSets: { reps: number | null }[];
};

/**
 * Last completed session (by start time) that has at least one completed set
 * for this exercise with a logged weight (incl. 0 for BW+0).
 */
export function findLastCompletedSessionLift(
  exerciseId: string,
  sessions: WorkoutSession[],
  logs: ExerciseLog[],
  excludeSessionId?: string,
): LastLiftContext | null {
  const completed = [...sessions]
    .filter((s) => s.completed_at && s.id !== excludeSessionId)
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());

  for (const session of completed) {
    const exLogs = logs
      .filter(
        (l) =>
          l.session_id === session.id &&
          l.exercise_id === exerciseId &&
          l.completed &&
          l.weight_kg != null,
      )
      .sort((a, b) => a.set_number - b.set_number);

    if (exLogs.length === 0) continue;

    const topWeightKg = Math.max(...exLogs.map((l) => l.weight_kg!));
    const topSets = exLogs
      .filter((l) => l.weight_kg === topWeightKg)
      .map((l) => ({ reps: l.actual_reps }));

    return { sessionStartedAt: session.started_at, topWeightKg, topSets };
  }

  return null;
}

export type ProgressiveOverloadHint = {
  lastTopWeightKg: number | null;
  lastSessionDateSk: string | null;
  suggestedWeightKg: number | null;
  tone: "progress" | "hold_reps" | "consolidate" | "deload_week" | "first_time";
  lineSk: string;
};

export function buildProgressiveOverloadHint(
  ctx: LastLiftContext | null,
  repsMin: number,
  repsMax: number,
  options?: { isDeloadWeek?: boolean; deloadFactor?: number },
): ProgressiveOverloadHint {
  if (!ctx) {
    return {
      lastTopWeightKg: null,
      lastSessionDateSk: null,
      suggestedWeightKg: null,
      tone: "first_time",
      lineSk:
        "Prvý záznam tohto cviku — začni konzervatívne; váhu zvyšuj až keď zvládneš celý rozsah opakovaní.",
    };
  }

  const W = ctx.topWeightKg;
  const dateSk = format(parseISO(ctx.sessionStartedAt), "d. MMM yyyy", { locale: sk });

  if (options?.isDeloadWeek && options.deloadFactor != null) {
    const eff = roundToPlate(W * options.deloadFactor);
    return {
      lastTopWeightKg: W,
      lastSessionDateSk: dateSk,
      suggestedWeightKg: eff,
      tone: "deload_week",
      lineSk: `Minulý tréning (${dateSk}): max ${W} kg. Deload týždeň — dnes cca ${eff} kg, kontrola techniky.`,
    };
  }

  const { topSets } = ctx;
  if (topSets.length === 0) {
    return {
      lastTopWeightKg: W,
      lastSessionDateSk: dateSk,
      suggestedWeightKg: roundToPlate(W),
      tone: "consolidate",
      lineSk: `Minulý tréning (${dateSk}): max ${W} kg — doplň opakovania v setoch.`,
    };
  }

  const allHaveReps = topSets.every((s) => s.reps != null && s.reps > 0);
  if (!allHaveReps) {
    return {
      lastTopWeightKg: W,
      lastSessionDateSk: dateSk,
      suggestedWeightKg: roundToPlate(W),
      tone: "consolidate",
      lineSk: `Minulý tréning (${dateSk}): max ${W} kg — zapisuj opakovania, potom doladíme progres.`,
    };
  }

  const allAtTopReps = topSets.every((s) => (s.reps ?? 0) >= repsMax);
  const allAtLeastMin = topSets.every((s) => (s.reps ?? 0) >= repsMin);

  if (W === 0) {
    if (allAtTopReps) {
      return {
        lastTopWeightKg: 0,
        lastSessionDateSk: dateSk,
        suggestedWeightKg: PLATE,
        tone: "progress",
        lineSk: `Minulý tréning (${dateSk}): telová váha, sety na ${repsMax}+ reps. Skús dnes +${PLATE} kg závažia.`,
      };
    }
    if (allAtLeastMin) {
      return {
        lastTopWeightKg: 0,
        lastSessionDateSk: dateSk,
        suggestedWeightKg: 0,
        tone: "hold_reps",
        lineSk: `Minulý tréning (${dateSk}): bez závažia — pridaj opakovania smerom k ${repsMax}, potom závažie.`,
      };
    }
    return {
      lastTopWeightKg: 0,
      lastSessionDateSk: dateSk,
      suggestedWeightKg: 0,
      tone: "consolidate",
      lineSk: `Minulý tréning (${dateSk}): bez závažia — sústred sa na čisté ${repsMin}–${repsMax} opakovania.`,
    };
  }

  if (allAtTopReps) {
    const next = roundToPlate(W + PLATE);
    return {
      lastTopWeightKg: W,
      lastSessionDateSk: dateSk,
      suggestedWeightKg: next,
      tone: "progress",
      lineSk: `Minulý tréning (${dateSk}): ${W} kg, sety na horní hranici (${repsMax}). Dnes skús ${next} kg.`,
    };
  }

  if (allAtLeastMin) {
    return {
      lastTopWeightKg: W,
      lastSessionDateSk: dateSk,
      suggestedWeightKg: roundToPlate(W),
      tone: "hold_reps",
      lineSk: `Minulý tréning (${dateSk}): ${W} kg — najprv pridaj opakovania k ${repsMax}, potom váhu.`,
    };
  }

  return {
    lastTopWeightKg: W,
    lastSessionDateSk: dateSk,
    suggestedWeightKg: roundToPlate(W),
    tone: "consolidate",
    lineSk: `Minulý tréning (${dateSk}): ${W} kg — stabilizuj ${repsMin}–${repsMax} opakovaní, potom load.`,
  };
}
