import { useState, useCallback } from "react";
import { load, save, uid } from "@/lib/storage";
import type {
  WorkoutSession,
  WorkoutSessionWithLogs,
  ExerciseLog,
  WorkoutType,
} from "@/lib/types";
import { getWorkoutTemplate } from "@/data/program";

const SESSIONS_KEY = "sessions";
const LOGS_KEY = "logs";

function loadSessions(): WorkoutSession[] {
  return load<WorkoutSession[]>(SESSIONS_KEY, []);
}

function saveSessions(s: WorkoutSession[]) {
  save(SESSIONS_KEY, s);
}

function loadLogs(): ExerciseLog[] {
  return load<ExerciseLog[]>(LOGS_KEY, []);
}

function saveLogs(l: ExerciseLog[]) {
  save(LOGS_KEY, l);
}

export function useWorkouts() {
  const [sessions, setSessions] = useState<WorkoutSession[]>(() =>
    loadSessions().sort(
      (a, b) =>
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
    ),
  );

  const persist = useCallback((next: WorkoutSession[]) => {
    const sorted = [...next].sort(
      (a, b) =>
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
    );
    setSessions(sorted);
    saveSessions(sorted);
  }, []);

  const startSession = useCallback(
    (type: WorkoutType): WorkoutSessionWithLogs | null => {
      const template = getWorkoutTemplate(type);
      if (!template) return null;

      const sessionId = uid();
      const session: WorkoutSession = {
        id: sessionId,
        user_id: "local",
        workout_type: type,
        started_at: new Date().toISOString(),
        completed_at: null,
        notes: null,
        duration_minutes: null,
      };

      const newLogs: ExerciseLog[] = [];
      for (const ex of template.exercises) {
        for (let s = 1; s <= ex.sets; s++) {
          newLogs.push({
            id: uid(),
            session_id: sessionId,
            exercise_id: ex.id,
            exercise_name: ex.name,
            set_number: s,
            planned_reps: ex.repsMax,
            actual_reps: null,
            weight_kg: null,
            completed: false,
            rpe: null,
            notes: null,
          });
        }
      }

      const allLogs = loadLogs();
      saveLogs([...allLogs, ...newLogs]);
      persist([...loadSessions(), session]);

      return { ...session, exercise_logs: newLogs };
    },
    [persist],
  );

  const getSessionWithLogs = useCallback(
    (sessionId: string): WorkoutSessionWithLogs | null => {
      const allSessions = loadSessions();
      const session = allSessions.find((s) => s.id === sessionId);
      if (!session) return null;

      const allLogs = loadLogs();
      const sessionLogs = allLogs
        .filter((l) => l.session_id === sessionId)
        .sort((a, b) => {
          if (a.exercise_id !== b.exercise_id)
            return a.exercise_id.localeCompare(b.exercise_id);
          return a.set_number - b.set_number;
        });

      return { ...session, exercise_logs: sessionLogs };
    },
    [],
  );

  const updateLog = useCallback(
    (
      logId: string,
      updates: Partial<
        Pick<ExerciseLog, "actual_reps" | "weight_kg" | "completed" | "rpe" | "notes">
      >,
    ) => {
      const allLogs = loadLogs();
      const idx = allLogs.findIndex((l) => l.id === logId);
      if (idx === -1) return;
      allLogs[idx] = { ...allLogs[idx], ...updates };
      saveLogs(allLogs);
    },
    [],
  );

  const completeSession = useCallback(
    (sessionId: string) => {
      const all = loadSessions();
      const idx = all.findIndex((s) => s.id === sessionId);
      if (idx === -1) return;

      const now = new Date();
      const started = new Date(all[idx].started_at);
      const duration = Math.round((now.getTime() - started.getTime()) / 60000);

      all[idx] = {
        ...all[idx],
        completed_at: now.toISOString(),
        duration_minutes: duration,
      };

      persist(all);
    },
    [persist],
  );

  const deleteSession = useCallback(
    (sessionId: string) => {
      const all = loadSessions().filter((s) => s.id !== sessionId);
      const allLogs = loadLogs().filter((l) => l.session_id !== sessionId);
      saveLogs(allLogs);
      persist(all);
    },
    [persist],
  );

  const getExerciseHistory = useCallback(
    (
      exerciseId: string,
      limit = 20,
    ): Array<{ date: string; weight_kg: number; reps: number; sets: number }> => {
      const allLogs = loadLogs();
      const allSessions = loadSessions();
      const sessionMap = new Map(allSessions.map((s) => [s.id, s]));

      const completedLogs = allLogs.filter(
        (l) =>
          l.exercise_id === exerciseId &&
          l.completed &&
          l.weight_kg != null &&
          sessionMap.get(l.session_id)?.completed_at,
      );

      const bySession = new Map<
        string,
        { date: string; maxWeight: number; totalReps: number; sets: number }
      >();

      for (const log of completedLogs) {
        const session = sessionMap.get(log.session_id);
        if (!session) continue;

        if (!bySession.has(log.session_id)) {
          bySession.set(log.session_id, {
            date: session.started_at,
            maxWeight: log.weight_kg ?? 0,
            totalReps: log.actual_reps ?? 0,
            sets: 1,
          });
        } else {
          const entry = bySession.get(log.session_id)!;
          entry.maxWeight = Math.max(entry.maxWeight, log.weight_kg ?? 0);
          entry.totalReps += log.actual_reps ?? 0;
          entry.sets += 1;
        }
      }

      return Array.from(bySession.values())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-limit)
        .map((e) => ({
          date: e.date,
          weight_kg: e.maxWeight,
          reps: e.totalReps,
          sets: e.sets,
        }));
    },
    [],
  );

  const getPreviousWeight = useCallback(
    (exerciseId: string): number | null => {
      const allLogs = loadLogs();
      const completed = allLogs
        .filter(
          (l) =>
            l.exercise_id === exerciseId &&
            l.completed &&
            l.weight_kg != null,
        )
        .sort(
          (a, b) =>
            allLogs.indexOf(b) - allLogs.indexOf(a),
        );

      return completed[0]?.weight_kg ?? null;
    },
    [],
  );

  return {
    sessions,
    loading: false,
    startSession,
    getSessionWithLogs,
    updateLog,
    completeSession,
    deleteSession,
    getExerciseHistory,
    getPreviousWeight,
    refresh: () => persist(loadSessions()),
  };
}
