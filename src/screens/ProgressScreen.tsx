import { Card } from "../components";
import { useWorkouts } from "../hooks/useWorkouts";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { formatExerciseSummary } from "../utils/exercise";
import {
  buildExerciseProgress,
  chartLabel,
  formatSessionChange,
  lastSevenDays,
  type ExercisePoint,
} from "../utils/progress";

function formatChartDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: ExercisePoint }>;
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm shadow-xl">
      <p className="text-zinc-400">{formatChartDate(point.date)}</p>
      <p className="font-medium text-zinc-100">{point.summary}</p>
    </div>
  );
}

export function ProgressScreen() {
  const { completedWorkouts } = useWorkouts();
  const weekDays = lastSevenDays(completedWorkouts);
  const workoutsThisWeek = weekDays.reduce((total, day) => total + day.count, 0);
  const exerciseProgress = buildExerciseProgress(completedWorkouts);

  if (completedWorkouts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Progress</h1>
          <p className="text-zinc-400">See how your lifts and holds change</p>
        </div>
        <Card>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <TrendingUp className="text-blue-400 mb-4" size={32} />
            <p className="text-zinc-400">No workouts completed yet</p>
            <p className="text-sm text-zinc-500">
              Finish a workout to start tracking progress
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Progress</h1>
        <p className="text-zinc-400">Latest session vs last time</p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-2">This week</h2>
        <p className="text-3xl font-bold">{workoutsThisWeek}</p>
        <p className="text-zinc-400 mb-4">
          workout{workoutsThisWeek === 1 ? "" : "s"}
        </p>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => (
            <div key={day.key} className="flex flex-col items-center gap-2">
              <span className="text-xs text-zinc-500">{day.label}</span>
              {day.count > 0 ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-medium">
                  {day.count}
                </span>
              ) : (
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {exerciseProgress.map(exercise => {
        const values = exercise.points.map(point => point.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const pad = min === max ? Math.max(5, min * 0.1 || 5) : (max - min) * 0.2;
        const recent = [...exercise.points].reverse().slice(0, 4);

        return (
          <Card key={exercise.name} className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{exercise.name}</h2>
                <p className="text-2xl font-bold mt-1">
                  {formatExerciseSummary(exercise.latest)}
                </p>
                <p className="text-sm text-zinc-400 mt-1">
                  {exercise.previous
                    ? formatSessionChange(exercise.latest, exercise.previous)
                    : "First time logged"}
                </p>
              </div>
              <p className="text-sm text-zinc-500 shrink-0 text-right">
                Best {formatExerciseSummary(exercise.best)}
              </p>
            </div>

            <div className="space-y-2 text-sm">
              {recent.map((point, index) => (
                <div
                  key={`${point.date}-${index}`}
                  className="flex items-center justify-between gap-3 text-zinc-400"
                >
                  <span>{formatChartDate(point.date)}</span>
                  <span className="text-zinc-200">{point.summary}</span>
                </div>
              ))}
            </div>

            {exercise.points.length > 1 && (
              <div>
                <p className="text-xs text-zinc-500 mb-2">
                  {chartLabel(exercise.metric)} over time
                </p>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart
                    data={exercise.points}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatChartDate}
                      tick={{ fill: "#71717a", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={28}
                    />
                    <YAxis
                      width={40}
                      tick={{ fill: "#71717a", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      domain={[Math.max(0, min - pad), max + pad]}
                    />
                    <Tooltip
                      cursor={{ stroke: "#3f3f46" }}
                      content={({ active, payload }) => (
                        <ChartTooltip
                          active={active}
                          payload={
                            payload as Array<{ payload?: ExercisePoint }>
                          }
                        />
                      )}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
