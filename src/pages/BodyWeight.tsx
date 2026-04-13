import { useState } from "react";
import { format, parseISO } from "date-fns";
import { sk } from "date-fns/locale";
import {
  Scale,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { useBodyWeight } from "@/hooks/useBodyWeight";
import WeightChart from "@/components/WeightChart";
import SwipeToDelete from "@/components/SwipeToDelete";

export default function BodyWeight() {
  const { entries, latest, trend, addEntry, deleteEntry } = useBodyWeight();
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [weight, setWeight] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;
    await addEntry(date, Number(weight));
    setWeight("");
    setShowForm(false);
  };

  const chartData = entries.map((e) => ({
    date: e.date,
    weight_kg: e.weight_kg,
  }));

  const firstEntry = entries.length > 0 ? entries[0] : null;
  const totalChange =
    firstEntry && latest
      ? (latest.weight_kg - firstEntry.weight_kg).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Telesná váha</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="btn-primary px-3 py-2 text-sm"
        >
          <Plus className="h-4 w-4" />
          Pridať
        </button>
      </header>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <p className="text-xs text-slate-400">Aktuálna</p>
          <p className="mt-1 text-xl font-bold">
            {latest ? `${latest.weight_kg}` : "—"}
          </p>
          <p className="text-[11px] text-slate-500">kg</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xs text-slate-400">Posledná zm.</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-xl font-bold">
            {trend !== null ? (
              <>
                {trend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                ) : trend < 0 ? (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                ) : (
                  <Minus className="h-4 w-4 text-slate-400" />
                )}
                <span
                  className={
                    trend > 0
                      ? "text-green-400"
                      : trend < 0
                        ? "text-red-400"
                        : ""
                  }
                >
                  {trend > 0 ? "+" : ""}
                  {trend.toFixed(1)}
                </span>
              </>
            ) : (
              "—"
            )}
          </p>
          <p className="text-[11px] text-slate-500">kg</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xs text-slate-400">Celkom</p>
          <p className="mt-1 text-xl font-bold">
            {totalChange !== null ? (
              <span
                className={
                  Number(totalChange) > 0
                    ? "text-green-400"
                    : Number(totalChange) < 0
                      ? "text-red-400"
                      : ""
                }
              >
                {Number(totalChange) > 0 ? "+" : ""}
                {totalChange}
              </span>
            ) : (
              "—"
            )}
          </p>
          <p className="text-[11px] text-slate-500">kg</p>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="card space-y-3 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Dátum</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">
                Váha (kg)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="85.0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                className="input text-sm"
                autoFocus
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1 py-2 text-sm">
              Uložiť
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary py-2 text-sm"
            >
              Zrušiť
            </button>
          </div>
        </form>
      )}

      {/* Chart */}
      <div className="card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Scale className="h-4 w-4 text-slate-400" />
          Priebeh váhy
        </h2>
        <WeightChart data={chartData} height={220} color="#22c55e" label="Váha" />
      </div>

      {/* Entries list */}
      {entries.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-300">
            Záznamy ({entries.length})
          </h2>
          <div className="space-y-1">
            {[...entries].reverse().map((e) => (
              <SwipeToDelete key={e.id} onDelete={() => deleteEntry(e.id)}>
                <div className="flex items-center gap-3 rounded-xl bg-slate-950 px-3 py-2.5">
                  <span className="flex-1 text-sm text-slate-300">
                    {format(parseISO(e.date), "d. MMMM yyyy", { locale: sk })}
                  </span>
                  <span className="font-mono text-sm font-semibold">
                    {e.weight_kg} kg
                  </span>
                </div>
              </SwipeToDelete>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
