import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Info, Trophy, Crown } from "lucide-react";
import type { ExerciseLog } from "@/lib/types";
import type { ExerciseTemplate } from "@/lib/types";
import { detectNewPRs, estimated1RM, type PRRecord, type PRType } from "@/lib/calculations";
import RestTimer from "./RestTimer";
import WarmupSets from "./WarmupSets";

interface Props {
  template: ExerciseTemplate;
  logs: ExerciseLog[];
  previousWeight: number | null;
  existingPR?: PRRecord;
  deloadFactor?: number;
  onUpdateLog: (
    logId: string,
    updates: Partial<Pick<ExerciseLog, "actual_reps" | "weight_kg" | "completed">>,
  ) => void;
  onPR?: () => void;
  /** +1 when rest overlay opens, -1 when it closes (for scroll padding on workout page). */
  onRestTimerDelta?: (delta: 1 | -1) => void;
}

const PR_LABELS: Record<PRType, string> = {
  weight: "Váha PR",
  reps: "Reps PR",
  e1rm: "1RM PR",
};

export default function ExerciseBlock({
  template,
  logs,
  previousWeight,
  existingPR,
  deloadFactor,
  onUpdateLog,
  onPR,
  onRestTimerDelta,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [timerFor, setTimerFor] = useState<number | null>(null);
  const [flashPR, setFlashPR] = useState<string | null>(null);

  const allDone = logs.every((l) => l.completed);
  const doneSets = logs.filter((l) => l.completed).length;
  const isCompound = template.restSeconds >= 120;

  const effectiveWeight =
    deloadFactor && previousWeight
      ? Math.round((previousWeight * deloadFactor) / 2.5) * 2.5
      : previousWeight;

  useEffect(() => {
    if (allDone && logs.length > 0) {
      setExpanded(false);
    }
  }, [allDone, logs.length]);

  useEffect(() => {
    const open = timerFor !== null;
    if (open) {
      onRestTimerDelta?.(1);
    }
    return () => {
      if (open) {
        onRestTimerDelta?.(-1);
      }
    };
  }, [timerFor, onRestTimerDelta]);

  const handleComplete = (log: ExerciseLog) => {
    const nowComplete = !log.completed;
    onUpdateLog(log.id, { completed: nowComplete });

    if (nowComplete && existingPR && log.weight_kg && log.actual_reps) {
      const prs = detectNewPRs(log.weight_kg, log.actual_reps, existingPR);
      if (prs.length > 0) {
        setFlashPR(log.id);
        try { navigator.vibrate?.([50, 30, 50, 30, 50]); } catch {}
        setTimeout(() => setFlashPR(null), 3000);
        onPR?.();
      }
    }

    if (nowComplete && log.set_number < logs.length) {
      setTimerFor(template.restSeconds);
    }
  };

  const getPRsForLog = (log: ExerciseLog): PRType[] => {
    if (!existingPR || !log.completed || !log.weight_kg || !log.actual_reps) return [];
    return detectNewPRs(log.weight_kg, log.actual_reps, existingPR);
  };

  const bestSetE1RM = logs.reduce((best, l) => {
    if (!l.completed || !l.weight_kg || !l.actual_reps) return best;
    const e = estimated1RM(l.weight_kg, l.actual_reps);
    return e > best ? e : best;
  }, 0);

  return (
    <div className={`card overflow-hidden transition-all ${allDone ? "opacity-60" : ""}`}>
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold"
          style={{
            backgroundColor: allDone ? "#166534" : "#1e293b",
            color: allDone ? "#4ade80" : "#94a3b8",
          }}
        >
          {allDone ? (
            <Trophy className="h-5 w-5" />
          ) : (
            `${doneSets}/${logs.length}`
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold leading-snug">{template.name}</p>
          <p className="text-xs text-slate-400">
            {template.sets}×{template.repsMin}–{template.repsMax} · Oddych{" "}
            {template.restSeconds >= 60
              ? `${Math.floor(template.restSeconds / 60)}min`
              : `${template.restSeconds}s`}
            {effectiveWeight != null && (
              <span className="text-brand-400">
                {" "}· {deloadFactor ? "Deload " : "Posl. "}{effectiveWeight}kg
              </span>
            )}
          </p>
          {bestSetE1RM > 0 && (
            <p className="text-[11px] text-slate-500">
              e1RM: <span className="font-mono text-slate-300">{bestSetE1RM}kg</span>
            </p>
          )}
        </div>
        {template.notes && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowNotes((s) => !s);
            }}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
          >
            <Info className="h-4 w-4" />
          </button>
        )}
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-slate-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-500" />
        )}
      </button>

      {showNotes && template.notes && (
        <div className="border-t border-slate-800 bg-brand-950/30 px-4 py-3 text-sm text-brand-300">
          {template.notes}
        </div>
      )}

      {expanded && (
        <>
          {/* Warm-up sets for compound lifts */}
          {isCompound && effectiveWeight && effectiveWeight > 20 && doneSets === 0 && (
            <WarmupSets workingWeight={effectiveWeight} />
          )}

          <div className="border-t border-slate-800">
            <div className="grid grid-cols-[2.5rem_1fr_1fr_3rem] gap-2 px-4 py-2 text-xs font-medium uppercase tracking-wider text-slate-500">
              <span>Set</span>
              <span>Kg</span>
              <span>Reps</span>
              <span className="text-center">✓</span>
            </div>

            {logs.map((log) => {
              const prs = getPRsForLog(log);
              const isFlashing = flashPR === log.id;

              return (
                <div key={log.id}>
                  <div
                    className={`grid grid-cols-[2.5rem_1fr_1fr_3rem] items-center gap-2 px-4 py-2 transition-colors ${
                      log.completed ? "bg-green-950/20" : ""
                    } ${isFlashing ? "animate-pulse bg-yellow-500/10" : ""}`}
                  >
                    <span className="font-mono text-sm text-slate-400">
                      {log.set_number}
                    </span>

                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder={effectiveWeight != null ? String(effectiveWeight) : "kg"}
                      value={log.weight_kg ?? ""}
                      onChange={(e) =>
                        onUpdateLog(log.id, {
                          weight_kg: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className="input py-2 text-center font-mono text-sm"
                    />

                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder={`${template.repsMin}–${template.repsMax}`}
                      value={log.actual_reps ?? ""}
                      onChange={(e) =>
                        onUpdateLog(log.id, {
                          actual_reps: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className="input py-2 text-center font-mono text-sm"
                    />

                    <button
                      onClick={() => handleComplete(log)}
                      className={`mx-auto flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-all ${
                        log.completed
                          ? "border-green-500/40 bg-green-500/20 text-green-400"
                          : "border-slate-700 text-slate-600 hover:border-slate-500"
                      }`}
                    >
                      {log.completed ? "✓" : ""}
                    </button>
                  </div>

                  {prs.length > 0 && (
                    <div className="flex items-center gap-1.5 px-4 pb-2">
                      <Crown className="h-3.5 w-3.5 text-yellow-400" />
                      {prs.map((pr) => (
                        <span
                          key={pr}
                          className="rounded-md bg-yellow-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-400 border border-yellow-500/20"
                        >
                          {PR_LABELS[pr]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {timerFor !== null && (
        <RestTimer seconds={timerFor} onClose={() => setTimerFor(null)} />
      )}
    </div>
  );
}
