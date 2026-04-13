import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dumbbell,
  Play,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Clock,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { startOfWeek, parseISO, differenceInWeeks } from "date-fns";
import { getWorkoutTemplate } from "@/data/program";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useProgram } from "@/hooks/useProgram";
import { usePRs } from "@/hooks/useStats";
import ExerciseBlock from "@/components/ExerciseBlock";
import Confetti from "@/components/Confetti";
import type { WorkoutType, WorkoutSessionWithLogs, ExerciseLog } from "@/lib/types";
import type { ProgressiveOverloadHint } from "@/lib/progressiveOverload";

const DELOAD_EVERY_WEEKS = 5;
const DELOAD_FACTOR = 0.6;

export default function Workout() {
  const navigate = useNavigate();
  const { program } = useProgram();
  const {
    startSession,
    getSessionWithLogs,
    updateLog,
    completeSession,
    deleteSession,
    sessions,
    getPreviousWeight,
    getProgressiveOverloadHint,
  } = useWorkouts();

  const [activeSession, setActiveSession] = useState<WorkoutSessionWithLogs | null>(null);
  const [loading, setLoading] = useState(false);
  const [previousWeights, setPreviousWeights] = useState<Record<string, number | null>>({});
  const [elapsed, setElapsed] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [restTimerDepth, setRestTimerDepth] = useState(0);
  const existingPRs = usePRs(activeSession?.id);

  const handleRestTimerDelta = useCallback((delta: 1 | -1) => {
    setRestTimerDepth((n) => Math.max(0, n + delta));
  }, []);

  const isDeloadWeek = useMemo(() => {
    const completed = sessions.filter((s) => s.completed_at);
    if (completed.length < 9) return false;

    const weeks = new Set<string>();
    for (const s of completed) {
      const ws = startOfWeek(parseISO(s.started_at), { weekStartsOn: 1 });
      weeks.add(ws.toISOString());
    }
    const consecutiveWeeks = weeks.size;
    return consecutiveWeeks > 0 && consecutiveWeeks % DELOAD_EVERY_WEEKS === 0;
  }, [sessions]);

  const progressiveHints = useMemo((): Record<string, ProgressiveOverloadHint> => {
    if (!activeSession?.id) return {};
    const tpl = getWorkoutTemplate(activeSession.workout_type);
    if (!tpl) return {};
    const map: Record<string, ProgressiveOverloadHint> = {};
    for (const ex of tpl.exercises) {
      map[ex.id] = getProgressiveOverloadHint(ex.id, ex.repsMin, ex.repsMax, {
        excludeSessionId: activeSession.id,
        isDeloadWeek,
        deloadFactor: isDeloadWeek ? DELOAD_FACTOR : undefined,
      });
    }
    return map;
  }, [activeSession?.id, activeSession?.workout_type, getProgressiveOverloadHint, isDeloadWeek]);

  useEffect(() => {
    const inProgress = sessions.find((s) => !s.completed_at);
    if (inProgress) {
      const s = getSessionWithLogs(inProgress.id);
      if (s) setActiveSession(s);
    }
  }, [sessions, getSessionWithLogs]);

  useEffect(() => {
    if (!activeSession || activeSession.completed_at) return;
    const start = new Date(activeSession.started_at).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  useEffect(() => {
    if (!activeSession) return;
    const tpl = getWorkoutTemplate(activeSession.workout_type);
    if (!tpl) return;
    const map: Record<string, number | null> = {};
    for (const ex of tpl.exercises) {
      map[ex.id] = getPreviousWeight(ex.id);
    }
    setPreviousWeights(map);
  }, [activeSession, getPreviousWeight]);

  const handleStart = (type: WorkoutType) => {
    setLoading(true);
    const session = startSession(type);
    if (session) {
      setActiveSession(session);
      navigate("/workout", { replace: true });
    }
    setLoading(false);
  };

  const handleUpdateLog = useCallback(
    (logId: string, updates: Partial<Pick<ExerciseLog, "actual_reps" | "weight_kg" | "completed">>) => {
      setActiveSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          exercise_logs: prev.exercise_logs.map((l) =>
            l.id === logId ? { ...l, ...updates } : l,
          ),
        };
      });
      updateLog(logId, updates);
    },
    [updateLog],
  );

  const handlePR = useCallback(() => {
    setShowConfetti(true);
  }, []);

  const handleComplete = () => {
    if (!activeSession) return;
    completeSession(activeSession.id);
    setActiveSession(null);
    navigate("/");
  };

  const handleDiscard = () => {
    if (!activeSession) return;
    if (!window.confirm("Naozaj chceš zahodiť tento tréning?")) return;
    deleteSession(activeSession.id);
    setActiveSession(null);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Active workout view
  if (activeSession) {
    const template = getWorkoutTemplate(activeSession.workout_type)!;
    const allDone = activeSession.exercise_logs.every((l) => l.completed);
    const doneLogs = activeSession.exercise_logs.filter((l) => l.completed).length;
    const totalLogs = activeSession.exercise_logs.length;
    const progress = totalLogs > 0 ? (doneLogs / totalLogs) * 100 : 0;

    return (
      <div
        className={`space-y-4 transition-[padding] duration-200 ${restTimerDepth > 0 ? "pb-36 sm:pb-32" : ""}`}
      >
        {showConfetti && (
          <Confetti onDone={() => setShowConfetti(false)} />
        )}

        <header className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">{template.name}</h1>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(elapsed)}
              </span>
              <span>
                {doneLogs}/{totalLogs} setov
              </span>
              {isDeloadWeek && (
                <span className="rounded bg-yellow-500/15 px-1.5 py-0.5 text-[10px] font-bold text-yellow-400">
                  DELOAD
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleDiscard}
            className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
            title="Zahodiť"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </header>

        {/* Deload banner */}
        {isDeloadWeek && (
          <div className="flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-400" />
            <p className="text-xs text-yellow-300">
              <strong>Deload týždeň</strong> – všetky váhy znížené na 60%. Regenerácia CNS a kĺbov.
            </p>
          </div>
        )}

        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-3">
          {template.exercises.map((ex) => {
            const logs = activeSession.exercise_logs.filter(
              (l) => l.exercise_id === ex.id,
            );
            return (
              <ExerciseBlock
                key={ex.id}
                template={ex}
                logs={logs}
                previousWeight={previousWeights[ex.id] ?? null}
                existingPR={existingPRs.get(ex.id)}
                deloadFactor={isDeloadWeek ? DELOAD_FACTOR : undefined}
                onUpdateLog={handleUpdateLog}
                onPR={handlePR}
                onRestTimerDelta={handleRestTimerDelta}
                progressiveHint={progressiveHints[ex.id]}
              />
            );
          })}
        </div>

        <button
          onClick={handleComplete}
          disabled={loading || !allDone}
          className="btn-primary w-full mb-4"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-5 w-5" />
          )}
          Dokončiť tréning
        </button>
      </div>
    );
  }

  // Workout selection view
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Tréning</h1>
        <p className="text-sm text-slate-400">Vyber si dnešný workout</p>
      </header>

      {isDeloadWeek && (
        <div className="flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-400" />
          <div>
            <p className="text-sm font-semibold text-yellow-300">Deload týždeň</p>
            <p className="text-xs text-yellow-400/80">
              Každý {DELOAD_EVERY_WEEKS}. týždeň – váhy automaticky znížené na 60%.
              Regenerácia CNS, kĺbov a šliach.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {program.workouts.map((w) => (
          <button
            key={w.id}
            onClick={() => handleStart(w.id)}
            disabled={loading}
            className="card group flex w-full items-center gap-4 p-5 text-left transition-all hover:border-slate-600"
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{
                backgroundColor: w.color + "20",
                color: w.color,
              }}
            >
              <Dumbbell className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-bold">{w.name}</p>
              <p className="text-sm text-slate-400">{w.label}</p>
              <p className="mt-1 text-xs text-slate-500">
                {w.exercises.length} cvikov ·{" "}
                {w.exercises.reduce((a, e) => a + e.sets, 0)} setov
              </p>
            </div>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            ) : (
              <Play className="h-5 w-5 text-slate-600 transition-transform group-hover:scale-110 group-hover:text-white" />
            )}
          </button>
        ))}
      </div>

      <div className="card p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-300">
          {program.name}
        </h3>
        <p className="text-xs text-slate-400">{program.description}</p>
        <p className="mt-2 text-[10px] text-slate-500">{program.author}</p>
      </div>
    </div>
  );
}
