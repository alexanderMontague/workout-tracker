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

export function ProgressScreen() {
  const { completedWorkouts } = useWorkouts();

  // Workout frequency stats
  const workoutsThisWeek = completedWorkouts.filter(w => {
    const date = new Date(w.completedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date > weekAgo;
  }).length;

  // Exercise progress tracking
  const exerciseProgress = completedWorkouts.reduce((acc, workout) => {
    workout.exercises.forEach(exercise => {
      if (!acc[exercise.name]) {
        acc[exercise.name] = [];
      }
      acc[exercise.name].push({
        date: workout.completedAt,
        weight: Number(exercise.weight),
        volume:
          Number(exercise.weight) *
          Number(exercise.sets) *
          Number(exercise.reps),
      });
    });
    return acc;
  }, {} as Record<string, Array<{ date: string; weight: number; volume: number }>>);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Progress</h1>

      <Card>
        <h2 className="text-lg font-semibold mb-2">Weekly Overview</h2>
        <p className="text-3xl font-bold">{workoutsThisWeek}</p>
        <p className="text-zinc-400">workouts this week</p>
      </Card>

      {Object.entries(exerciseProgress).map(([exercise, data]) => (
        <Card key={exercise}>
          <h2 className="text-lg font-semibold mb-4">{exercise}</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <XAxis
                dataKey="date"
                tickFormatter={date => new Date(date).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip labelStyle={{ color: "#71717a" }} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#3b82f6"
                name="Weight (lbs)"
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#10b981"
                name="Volume"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      ))}
    </div>
  );
}
