import { useMemo } from "react";
import { load } from "@/lib/storage";
import type { ExerciseLog, WorkoutSession, MuscleGroup } from "@/lib/types";
import {
  computePR,
  totalVolume,
  volumeByMuscleGroup,
  estimated1RM,
  type PRRecord,
} from "@/lib/calculations";
import { ALL_PROGRAMS } from "@/data/program";
import { startOfWeek, parseISO } from "date-fns";

function allLogs(): ExerciseLog[] {
  return load<ExerciseLog[]>("logs", []);
}

function allSessions(): WorkoutSession[] {
  return load<WorkoutSession[]>("sessions", []);
}

/**
 * All-time PRs per exercise, computed from all completed logs.
 * Excludes logs from the given sessionId so we can detect "new" PRs in the active session.
 */
export function usePRs(excludeSessionId?: string) {
  return useMemo(() => {
    const logs = allLogs();
    const filtered = excludeSessionId
      ? logs.filter((l) => l.session_id !== excludeSessionId)
      : logs;

    const byExercise = new Map<string, ExerciseLog[]>();
    for (const l of filtered) {
      if (!byExercise.has(l.exercise_id)) byExercise.set(l.exercise_id, []);
      byExercise.get(l.exercise_id)!.push(l);
    }

    const prs = new Map<string, PRRecord>();
    for (const [id, exerciseLogs] of byExercise) {
      prs.set(id, computePR(exerciseLogs));
    }
    return prs;
  }, [excludeSessionId]);
}

/** Volume per session (only completed) */
export function useSessionVolumes() {
  return useMemo(() => {
    const logs = allLogs();
    const sessions = allSessions().filter((s) => s.completed_at);
    const sessionMap = new Map<string, WorkoutSession>();
    for (const s of sessions) sessionMap.set(s.id, s);

    const bySession = new Map<string, ExerciseLog[]>();
    for (const l of logs) {
      if (!sessionMap.has(l.session_id)) continue;
      if (!bySession.has(l.session_id)) bySession.set(l.session_id, []);
      bySession.get(l.session_id)!.push(l);
    }

    return sessions
      .sort((a, b) => a.started_at.localeCompare(b.started_at))
      .map((s) => ({
        session: s,
        volume: totalVolume(bySession.get(s.id) ?? []),
        volumeByMuscle: volumeByMuscleGroup(bySession.get(s.id) ?? []),
      }));
  }, []);
}

/** Weekly volume aggregated by muscle group (last N weeks) */
export function useWeeklyVolume(weeks = 8) {
  return useMemo(() => {
    const logs = allLogs();
    const sessions = allSessions().filter((s) => s.completed_at);
    const sessionMap = new Map<string, WorkoutSession>();
    for (const s of sessions) sessionMap.set(s.id, s);

    const weekBuckets = new Map<
      string,
      { weekLabel: string; muscles: Record<string, number> }
    >();

    const exerciseToMuscle = new Map<string, MuscleGroup>();
    for (const prog of ALL_PROGRAMS) {
      for (const w of prog.workouts) {
        for (const ex of w.exercises) {
          exerciseToMuscle.set(ex.id, ex.muscleGroup);
        }
      }
    }

    for (const l of logs) {
      if (!l.completed || !l.weight_kg || !l.actual_reps) continue;
      const session = sessionMap.get(l.session_id);
      if (!session) continue;

      const ws = startOfWeek(parseISO(session.started_at), {
        weekStartsOn: 1,
      });
      const key = ws.toISOString();
      if (!weekBuckets.has(key)) {
        weekBuckets.set(key, { weekLabel: key, muscles: {} });
      }
      const bucket = weekBuckets.get(key)!;
      const muscle = exerciseToMuscle.get(l.exercise_id) ?? "other";
      const vol = l.weight_kg * l.actual_reps;
      bucket.muscles[muscle] = (bucket.muscles[muscle] ?? 0) + vol;
    }

    return Array.from(weekBuckets.values())
      .sort((a, b) => a.weekLabel.localeCompare(b.weekLabel))
      .slice(-weeks);
  }, [weeks]);
}

/** e1RM trend per exercise over sessions */
export function useE1RMTrend(exerciseId: string) {
  return useMemo(() => {
    const logs = allLogs().filter(
      (l) => l.exercise_id === exerciseId && l.completed && l.weight_kg && l.actual_reps,
    );
    const sessions = allSessions();
    const sessionMap = new Map<string, WorkoutSession>();
    for (const s of sessions) sessionMap.set(s.id, s);

    const bySession = new Map<string, number>();
    for (const l of logs) {
      const session = sessionMap.get(l.session_id);
      if (!session?.completed_at) continue;
      const e = estimated1RM(l.weight_kg!, l.actual_reps!);
      const existing = bySession.get(l.session_id) ?? 0;
      if (e > existing) bySession.set(l.session_id, e);
    }

    return Array.from(bySession.entries())
      .map(([sid, e1rm]) => ({
        date: sessionMap.get(sid)!.started_at.slice(0, 10),
        weight_kg: e1rm,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [exerciseId]);
}
