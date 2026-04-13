import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dumbbell,
  TrendingUp,
  Calendar,
  Scale,
  ChevronRight,
  Flame,
  Zap,
  Crown,
  Repeat,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { format, parseISO, startOfWeek, isWithinInterval, endOfWeek } from "date-fns";
import { sk } from "date-fns/locale";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useBodyWeight } from "@/hooks/useBodyWeight";
import { useWeeklyVolume, usePRs } from "@/hooks/useStats";
import { useProgram } from "@/hooks/useProgram";
import { muscleLabel } from "@/lib/calculations";
import { ALL_PROGRAMS, getAllWorkoutTemplates } from "@/data/program";
import SwipeToDelete from "@/components/SwipeToDelete";
import StreakCalendar from "@/components/StreakCalendar";
import type { WorkoutType, MuscleGroup } from "@/lib/types";

const MUSCLE_COLORS: Record<string, string> = {
  chest: "#ef4444",
  shoulders: "#f97316",
  triceps: "#f59e0b",
  back: "#3b82f6",
  biceps: "#6366f1",
  rear_delts: "#8b5cf6",
  quads: "#22c55e",
  hamstrings: "#14b8a6",
  glutes: "#06b6d4",
  calves: "#84cc16",
  core: "#ec4899",
  forearms: "#a78bfa",
  full_body: "#f472b6",
};

export default function Dashboard() {
  const { sessions, deleteSession } = useWorkouts();
  const { latest, trend } = useBodyWeight();
  const weeklyVolume = useWeeklyVolume(6);
  const allPRs = usePRs();
  const { program, selectProgram } = useProgram();
  const navigate = useNavigate();

  const allTemplates = getAllWorkoutTemplates();

  const thisWeek = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    return sessions.filter(
      (s) =>
        s.completed_at &&
        isWithinInterval(parseISO(s.started_at), { start: weekStart, end: weekEnd }),
    );
  }, [sessions]);

  const completedTypes = new Set(thisWeek.map((s) => s.workout_type));

  const nextWorkout = useMemo(() => {
    for (const type of program.workoutOrder) {
      if (!completedTypes.has(type)) return type;
    }
    return program.workoutOrder[0];
  }, [completedTypes, program]);

  const totalSessions = sessions.filter((s) => s.completed_at).length;

  const streak = useMemo(() => {
    let count = 0;
    const completed = sessions.filter((s) => s.completed_at);
    if (completed.length === 0) return 0;

    const weeks = new Set<string>();
    for (const s of completed) {
      const ws = startOfWeek(parseISO(s.started_at), { weekStartsOn: 1 });
      weeks.add(ws.toISOString());
    }

    const sorted = Array.from(weeks)
      .map((w) => new Date(w))
      .sort((a, b) => b.getTime() - a.getTime());

    for (let i = 0; i < sorted.length; i++) {
      if (i === 0) {
        const now = new Date();
        const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
        const diff = Math.abs(sorted[i].getTime() - currentWeekStart.getTime());
        if (diff > 7 * 86400000) break;
      } else {
        const diff = sorted[i - 1].getTime() - sorted[i].getTime();
        if (diff > 8 * 86400000) break;
      }
      count++;
    }
    return count;
  }, [sessions]);

  const nextTemplate = program.workouts.find((p) => p.id === nextWorkout)!;

  const workoutLabels = useMemo(() => {
    const map: Record<string, { label: string; badge: string }> = {};
    for (const prog of ALL_PROGRAMS) {
      for (const w of prog.workouts) {
        const badgeClass =
          w.color === "#ef4444"
            ? "badge-push"
            : w.color === "#3b82f6"
              ? "badge-pull"
              : "badge-legs";
        map[w.id] = { label: w.name.replace(/Deň \d+ – /, ""), badge: badgeClass };
      }
    }
    return map;
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Iron Log</h1>
        <p className="text-sm text-slate-400">
          {format(new Date(), "EEEE, d. MMMM", { locale: sk })}
        </p>
      </header>

      {/* Program Selector */}
      <div className="flex gap-2">
        {ALL_PROGRAMS.map((p) => (
          <button
            key={p.id}
            onClick={() => selectProgram(p.id)}
            className={`flex-1 rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition-all ${
              program.id === p.id
                ? "border-brand-500/50 bg-brand-600/20 text-brand-300"
                : "border-slate-700/50 bg-slate-900/50 text-slate-500 active:bg-slate-800"
            }`}
          >
            <span className="block text-xs font-normal opacity-70">{p.shortName}</span>
            {p.name}
          </button>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <Flame className="mx-auto mb-1 h-5 w-5 text-orange-400" />
          <p className="text-xl font-bold">{streak}</p>
          <p className="text-[11px] text-slate-400">Týždňov v rade</p>
        </div>
        <div className="card p-3 text-center">
          <Dumbbell className="mx-auto mb-1 h-5 w-5 text-brand-400" />
          <p className="text-xl font-bold">{totalSessions}</p>
          <p className="text-[11px] text-slate-400">Tréningov</p>
        </div>
        <div className="card p-3 text-center">
          <Scale className="mx-auto mb-1 h-5 w-5 text-emerald-400" />
          <p className="text-xl font-bold">
            {latest ? `${latest.weight_kg}` : "—"}
          </p>
          <p className="text-[11px] text-slate-400">
            kg{" "}
            {trend !== null && (
              <span className={trend > 0 ? "text-green-400" : "text-red-400"}>
                {trend > 0 ? "+" : ""}
                {trend.toFixed(1)}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Streak Calendar */}
      {sessions.length > 0 && (
        <div className="card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-400" />
            <h2 className="font-semibold">Aktivita</h2>
          </div>
          <div className="overflow-x-auto">
            <StreakCalendar sessions={sessions} weeks={14} />
          </div>
        </div>
      )}

      {/* Weekly Progress */}
      <div className="card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <h2 className="font-semibold">Tento týždeň</h2>
          <span className="ml-auto text-sm text-slate-400">
            {thisWeek.filter((s) => program.workoutOrder.includes(s.workout_type)).length}/
            {program.workoutOrder.length}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {program.workoutOrder.map((type) => {
            const done = completedTypes.has(type);
            const wt = program.workouts.find((w) => w.id === type)!;
            return (
              <div
                key={type}
                className={`rounded-xl border p-2.5 text-center text-xs font-medium transition-all ${
                  done
                    ? "border-green-500/30 bg-green-500/10 text-green-400"
                    : "border-slate-700/50 text-slate-500"
                }`}
              >
                {done ? "✓ " : ""}
                {program.id === "ppl"
                  ? type.charAt(0).toUpperCase() + type.slice(1)
                  : `D${program.workoutOrder.indexOf(type) + 1}`}
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Volume Chart */}
      {weeklyVolume.length > 1 && (
        <div className="card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <h2 className="font-semibold">Týždenný objem</h2>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={weeklyVolume.map((w) => {
                const row: Record<string, unknown> = {
                  week: format(parseISO(w.weekLabel), "d. MMM", { locale: sk }),
                };
                for (const [m, v] of Object.entries(w.muscles)) {
                  row[m] = Math.round((v / 1000) * 10) / 10;
                }
                return row;
              })}
              margin={{ top: 4, right: 0, bottom: 0, left: -20 }}
            >
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                unit="t"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "0.75rem",
                  fontSize: 11,
                }}
                formatter={(value: number, name: string) => [
                  `${value}t`,
                  muscleLabel(name as MuscleGroup),
                ]}
              />
              {Object.keys(weeklyVolume[0]?.muscles ?? {}).map((muscle) => (
                <Bar
                  key={muscle}
                  dataKey={muscle}
                  stackId="vol"
                  fill={MUSCLE_COLORS[muscle] ?? "#6366f1"}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {Object.keys(weeklyVolume[weeklyVolume.length - 1]?.muscles ?? {}).map(
              (m) => (
                <span key={m} className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span
                    className="inline-block h-2 w-2 rounded-sm"
                    style={{ backgroundColor: MUSCLE_COLORS[m] ?? "#6366f1" }}
                  />
                  {muscleLabel(m as MuscleGroup)}
                </span>
              ),
            )}
          </div>
        </div>
      )}

      {/* Personal Records */}
      {allPRs.size > 0 && (
        <div className="card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-400" />
            <h2 className="font-semibold">Osobné rekordy</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Array.from(allPRs.entries())
              .filter(([, pr]) => pr.maxWeight > 0)
              .sort(([, a], [, b]) => b.bestE1RM - a.bestE1RM)
              .slice(0, 6)
              .map(([exerciseId, pr]) => {
                const exName =
                  allTemplates.find((e) => e.id === exerciseId)?.name ?? exerciseId;
                return (
                  <div
                    key={exerciseId}
                    className="rounded-xl bg-slate-800/60 p-2.5"
                  >
                    <p className="text-xs font-medium text-slate-300 truncate">
                      {exName}
                    </p>
                    <p className="mt-0.5 font-mono text-sm font-bold text-yellow-400">
                      {pr.maxWeight}kg × {pr.maxWeightReps}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      e1RM {pr.bestE1RM}kg
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Next Workout CTA */}
      <button
        onClick={() => navigate("/workout")}
        className="card group flex w-full items-center gap-4 p-5 text-left transition-all hover:border-brand-500/40"
      >
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: nextTemplate.color + "20", color: nextTemplate.color }}
        >
          <Dumbbell className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Ďalší tréning
          </p>
          <p className="mt-0.5 text-lg font-bold">{nextTemplate.name}</p>
          <p className="text-sm text-slate-400">{nextTemplate.label}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-600 transition-transform group-hover:translate-x-1" />
      </button>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <TrendingUp className="h-4 w-4 text-slate-400" />
            Posledné tréningy
          </h2>
          <div className="space-y-2">
            {sessions.slice(0, 5).map((s) => {
              const wt = allTemplates.find((t) =>
                ALL_PROGRAMS.some((p) => p.workouts.some((w) => w.id === s.workout_type)),
              );
              const template = ALL_PROGRAMS.flatMap((p) => p.workouts).find(
                (w) => w.id === s.workout_type,
              );
              const label = template?.name ?? s.workout_type;
              const badgeColor = template?.color ?? "#6366f1";

              return (
                <SwipeToDelete key={s.id} onDelete={() => deleteSession(s.id)}>
                  <div className="card flex items-center gap-3 px-4 py-3">
                    <span
                      className="badge border"
                      style={{
                        backgroundColor: badgeColor + "18",
                        color: badgeColor,
                        borderColor: badgeColor + "30",
                      }}
                    >
                      {label.replace(/Deň \d+ – /, "").slice(0, 12)}
                    </span>
                    <span className="flex-1 text-sm text-slate-300">
                      {format(parseISO(s.started_at), "d. MMM yyyy", { locale: sk })}
                    </span>
                    {s.duration_minutes && (
                      <span className="text-xs text-slate-500">
                        {s.duration_minutes} min
                      </span>
                    )}
                    {s.completed_at ? (
                      <span className="text-xs text-green-500">✓</span>
                    ) : (
                      <span className="text-xs text-yellow-500">rozpracované</span>
                    )}
                  </div>
                </SwipeToDelete>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
