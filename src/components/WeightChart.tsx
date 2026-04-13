import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import { sk } from "date-fns/locale";

interface DataPoint {
  date: string;
  weight_kg: number;
}

interface Props {
  data: DataPoint[];
  height?: number;
  color?: string;
  label?: string;
}

export default function WeightChart({
  data,
  height = 200,
  color = "#6366f1",
  label = "Váha",
}: Props) {
  if (data.length < 2) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-slate-700 text-sm text-slate-500"
        style={{ height }}
      >
        Minimum 2 záznamy pre graf
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    dateLabel: format(parseISO(d.date), "d. MMM", { locale: sk }),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formatted} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="dateLabel"
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={["dataMin - 1", "dataMax + 1"]}
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          unit=" kg"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "0.75rem",
            fontSize: 13,
          }}
          formatter={(value: number) => [`${value} kg`, label]}
          labelFormatter={(l) => l}
        />
        <Area
          type="monotone"
          dataKey="weight_kg"
          stroke={color}
          strokeWidth={2}
          fill={`url(#grad-${color})`}
          dot={{ fill: color, r: 3 }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
