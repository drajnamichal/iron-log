import { Flame } from "lucide-react";

interface Props {
  workingWeight: number;
}

const BAR_WEIGHT = 20;

function calcWarmupSets(working: number): Array<{ pct: number; weight: number; reps: number }> {
  if (working <= BAR_WEIGHT) return [];

  const sets: Array<{ pct: number; weight: number; reps: number }> = [];

  sets.push({ pct: 0, weight: BAR_WEIGHT, reps: 10 });

  if (working > 40) {
    const w50 = Math.round((working * 0.5) / 2.5) * 2.5;
    if (w50 > BAR_WEIGHT) sets.push({ pct: 50, weight: w50, reps: 8 });
  }

  if (working > 60) {
    const w70 = Math.round((working * 0.7) / 2.5) * 2.5;
    sets.push({ pct: 70, weight: w70, reps: 5 });
  }

  if (working > 80) {
    const w85 = Math.round((working * 0.85) / 2.5) * 2.5;
    sets.push({ pct: 85, weight: w85, reps: 3 });
  }

  return sets;
}

export default function WarmupSets({ workingWeight }: Props) {
  const sets = calcWarmupSets(workingWeight);

  if (sets.length === 0) return null;

  return (
    <div className="border-t border-slate-800 bg-orange-950/10 px-4 py-3">
      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-orange-400">
        <Flame className="h-3 w-3" />
        Warm-up → {workingWeight}kg
      </p>
      <div className="flex gap-2">
        {sets.map((s, i) => (
          <div
            key={i}
            className="flex-1 rounded-lg bg-orange-500/10 px-2 py-1.5 text-center"
          >
            <p className="font-mono text-xs font-bold text-orange-300">{s.weight}kg</p>
            <p className="text-[10px] text-orange-400/70">
              {s.reps}× {s.pct > 0 ? `${s.pct}%` : "tyčka"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
