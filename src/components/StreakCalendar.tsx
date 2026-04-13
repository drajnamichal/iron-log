import { useMemo } from "react";
import {
  subDays,
  format,
  startOfWeek,
  eachDayOfInterval,
  isSameDay,
  parseISO,
} from "date-fns";
import { sk } from "date-fns/locale";
import type { WorkoutSession } from "@/lib/types";

interface Props {
  sessions: WorkoutSession[];
  weeks?: number;
}

const DAY_LABELS = ["Po", "", "St", "", "Pi", "", "Ne"];

export default function StreakCalendar({ sessions, weeks = 16 }: Props) {
  const data = useMemo(() => {
    const today = new Date();
    const totalDays = weeks * 7;
    const startDate = startOfWeek(subDays(today, totalDays - 1), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: today });

    const completedDates = new Set<string>();
    for (const s of sessions) {
      if (s.completed_at) {
        completedDates.add(format(parseISO(s.started_at), "yyyy-MM-dd"));
      }
    }

    const grid: Array<Array<{ date: Date; count: number; future: boolean }>> = [];
    let weekBucket: Array<{ date: Date; count: number; future: boolean }> = [];

    for (const day of days) {
      const key = format(day, "yyyy-MM-dd");
      const count = completedDates.has(key) ? 1 : 0;
      const future = day > today;
      weekBucket.push({ date: day, count, future });

      if (weekBucket.length === 7) {
        grid.push(weekBucket);
        weekBucket = [];
      }
    }
    if (weekBucket.length > 0) {
      grid.push(weekBucket);
    }

    return grid;
  }, [sessions, weeks]);

  const totalWorkouts = sessions.filter((s) => s.completed_at).length;

  return (
    <div>
      <div className="flex items-end gap-[3px]">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] pr-1">
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="flex h-[13px] items-center text-[9px] text-slate-500"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Week columns */}
        {data.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              <div
                key={di}
                title={format(day.date, "d. MMMM yyyy", { locale: sk })}
                className={`h-[13px] w-[13px] rounded-sm transition-colors ${
                  day.future
                    ? "bg-transparent"
                    : day.count > 0
                      ? "bg-green-500"
                      : isSameDay(day.date, new Date())
                        ? "bg-slate-600 ring-1 ring-slate-400"
                        : "bg-slate-800/80"
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
