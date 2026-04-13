import { useState } from "react";
import { format, parseISO } from "date-fns";
import { sk } from "date-fns/locale";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Dumbbell,
  Crown,
  Zap,
} from "lucide-react";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useSessionVolumes, useE1RMTrend, usePRs } from "@/hooks/useStats";
import { estimated1RM, totalVolume, muscleLabel } from "@/lib/calculations";
import WeightChart from "@/components/WeightChart";
import SwipeToDelete from "@/components/SwipeToDelete";
import { ALL_PROGRAMS } from "@/data/program";
import type { ExerciseLog, WorkoutType, MuscleGroup } from "@/lib/types";

function getTypeConfig(type: WorkoutType): { label: string; color: string } {
  for (const prog of ALL_PROGRAMS) {
    const w = prog.workouts.find((w) => w.id === type);
    if (w) return { label: w.name.replace(/Deň \d+ – /, ""), color: w.color };
  }
  return { label: type, color: "#6366f1" };
}

function formatVolume(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}t`;
  return `${Math.round(v)}kg`;
}

export default function History() {
  const { sessions, getSessionWithLogs, getExerciseHistory, deleteSession } = useWorkouts();
  const sessionVolumes = useSessionVolumes();
  const allPRs = usePRs();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<ExerciseLog[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<"weight" | "e1rm">("e1rm");
  const [exerciseChartData, setExerciseChartData] = useState<
    Array<{ date: string; weight_kg: number }>
  >([]);

  const completed = sessions.filter((s) => s.completed_at);
  const volumeMap = new Map(sessionVolumes.map((sv) => [sv.session.id, sv]));

  const toggleSession = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedLogs([]);
      return;
    }
    setExpandedId(id);
    const session = getSessionWithLogs(id);
    setExpandedLogs(session?.exercise_logs ?? []);
  };

  const loadExerciseChart = (exerciseId: string, mode: "weight" | "e1rm") => {
    if (selectedExercise === exerciseId && chartMode === mode) {
      setSelectedExercise(null);
      return;
    }
    setSelectedExercise(exerciseId);
    setChartMode(mode);

    if (mode === "e1rm") {
      const data = getE1RMData(exerciseId);
      setExerciseChartData(data);
    } else {
      const data = getExerciseHistory(exerciseId);
      setExerciseChartData(
        data.map((d) => ({ date: d.date.slice(0, 10), weight_kg: d.weight_kg })),
      );
    }
  };

  const getE1RMData = (exerciseId: string) => {
    const data = getExerciseHistory(exerciseId);
    return data.map((d) => ({
      date: d.date.slice(0, 10),
      weight_kg: estimated1RM(d.weight_kg, Math.round(d.reps / d.sets)),
    }));
  };

  const groupByExercise = (logs: ExerciseLog[]) => {
    const map = new Map<string, ExerciseLog[]>();
    for (const log of logs) {
      const key = log.exercise_id;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(log);
    }
    return Array.from(map.entries());
  };

  if (completed.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-extrabold tracking-tight">História</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Calendar className="mb-3 h-12 w-12 text-slate-700" />
          <p className="text-slate-400">Žiadne dokončené tréningy</p>
          <p className="mt-1 text-sm text-slate-500">
            Začni trénovať a tu uvidíš svoju históriu
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">História</h1>

      <div className="space-y-2">
        {completed.map((s) => {
          const cfg = getTypeConfig(s.workout_type);
          const isOpen = expandedId === s.id;
          const sv = volumeMap.get(s.id);

          return (
            <SwipeToDelete
              key={s.id}
              onDelete={() => {
                if (expandedId === s.id) {
                  setExpandedId(null);
                  setExpandedLogs([]);
                }
                deleteSession(s.id);
              }}
            >
              <div className="card overflow-hidden">
                <button
                  onClick={() => toggleSession(s.id)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <span
                    className="badge border"
                    style={{
                      backgroundColor: cfg.color + "18",
                      color: cfg.color,
                      borderColor: cfg.color + "30",
                    }}
                  >
                    {cfg.label.slice(0, 14)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {format(parseISO(s.started_at), "EEEE, d. MMMM yyyy", {
                        locale: sk,
                      })}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {s.duration_minutes && <span>{s.duration_minutes} min</span>}
                      {sv && sv.volume > 0 && (
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {formatVolume(sv.volume)}
                        </span>
                      )}
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  )}
                </button>

                {isOpen && (
                  <div className="border-t border-slate-800">
                    {/* Volume by muscle group */}
                    {sv && Object.keys(sv.volumeByMuscle).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 px-4 py-3 border-b border-slate-800/50">
                        {Object.entries(sv.volumeByMuscle)
                          .sort(([, a], [, b]) => b - a)
                          .map(([muscle, vol]) => (
                            <span
                              key={muscle}
                              className="rounded-lg bg-slate-800 px-2 py-1 text-[10px] text-slate-300"
                            >
                              {muscleLabel(muscle as MuscleGroup)}{" "}
                              <span className="font-mono font-semibold">{formatVolume(vol)}</span>
                            </span>
                          ))}
                      </div>
                    )}

                    {groupByExercise(expandedLogs).map(
                      ([exerciseId, logs]) => {
                        const completedLogs = logs.filter((l) => l.completed);
                        const maxWeight = Math.max(
                          ...completedLogs.map((l) => l.weight_kg ?? 0),
                        );
                        const bestE1RM = completedLogs.reduce((best, l) => {
                          if (!l.weight_kg || !l.actual_reps) return best;
                          const e = estimated1RM(l.weight_kg, l.actual_reps);
                          return e > best ? e : best;
                        }, 0);

                        const pr = allPRs.get(exerciseId);
                        const hasPR =
                          pr &&
                          completedLogs.some(
                            (l) =>
                              l.weight_kg === pr.maxWeight &&
                              l.actual_reps === pr.maxWeightReps,
                          );

                        return (
                          <div key={exerciseId} className="border-b border-slate-800/50 last:border-0">
                            <button
                              onClick={() => loadExerciseChart(exerciseId, "e1rm")}
                              className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-slate-800/30"
                            >
                              <Dumbbell className="h-3.5 w-3.5 text-slate-500" />
                              <span className="flex-1 text-sm font-medium">
                                {logs[0].exercise_name}
                              </span>
                              {hasPR && <Crown className="h-3.5 w-3.5 text-yellow-400" />}
                              <span className="text-xs text-slate-400">
                                {maxWeight}kg · e1RM {bestE1RM}kg
                              </span>
                              <TrendingUp className="h-3.5 w-3.5 text-slate-600" />
                            </button>

                            {selectedExercise === exerciseId && (
                              <div className="px-4 pb-3">
                                <div className="mb-2 flex gap-1">
                                  <button
                                    onClick={() => loadExerciseChart(exerciseId, "e1rm")}
                                    className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                                      chartMode === "e1rm"
                                        ? "bg-brand-600 text-white"
                                        : "bg-slate-800 text-slate-400"
                                    }`}
                                  >
                                    e1RM
                                  </button>
                                  <button
                                    onClick={() => loadExerciseChart(exerciseId, "weight")}
                                    className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                                      chartMode === "weight"
                                        ? "bg-brand-600 text-white"
                                        : "bg-slate-800 text-slate-400"
                                    }`}
                                  >
                                    Max váha
                                  </button>
                                </div>
                                <WeightChart
                                  data={exerciseChartData}
                                  height={160}
                                  color={cfg.color}
                                  label={
                                    chartMode === "e1rm"
                                      ? `e1RM – ${logs[0].exercise_name}`
                                      : logs[0].exercise_name
                                  }
                                />
                              </div>
                            )}

                            <div className="px-4 pb-2">
                              {completedLogs.map((l) => (
                                <div
                                  key={l.id}
                                  className="flex items-center gap-4 py-1 text-xs text-slate-400"
                                >
                                  <span className="w-8 font-mono">
                                    S{l.set_number}
                                  </span>
                                  <span className="font-mono">
                                    {l.weight_kg ?? "—"}kg
                                  </span>
                                  <span>×</span>
                                  <span className="font-mono">
                                    {l.actual_reps ?? "—"} reps
                                  </span>
                                  {l.weight_kg && l.actual_reps && (
                                    <span className="ml-auto text-[10px] text-slate-500">
                                      e1RM {estimated1RM(l.weight_kg, l.actual_reps)}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                )}
              </div>
            </SwipeToDelete>
          );
        })}
      </div>
    </div>
  );
}
