import { Card, Button } from "../components";
import { Calendar, ChevronRight, Trash2 } from "lucide-react";
import type { CompletedWorkout } from "../types";
import { useWorkouts } from "../hooks/useWorkouts";
import { useTimer } from "../hooks/useTimer";
import { formatExerciseSummary } from "../utils/exercise";

interface GroupedWorkouts {
  [key: string]: CompletedWorkout[];
}

interface HistoryScreenProps {
  onEditWorkout: (workout: CompletedWorkout) => void;
}

export function HistoryScreen({ onEditWorkout }: HistoryScreenProps) {
  const { completedWorkouts, deleteCompletedWorkout } = useWorkouts();
  const { formatDuration } = useTimer();

  // Group workouts by month
  const groupedWorkouts = completedWorkouts.reduce(
    (groups: GroupedWorkouts, workout) => {
      const date = new Date(workout.completedAt);
      const monthYear = date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(workout);
      return groups;
    },
    {}
  );

  // Sort workouts within each group by date (newest first)
  Object.keys(groupedWorkouts).forEach(key => {
    groupedWorkouts[key].sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  });

  // Get sorted months (newest first)
  const sortedMonths = Object.keys(groupedWorkouts).sort((a, b) => {
    const dateA = new Date(groupedWorkouts[a][0].completedAt);
    const dateB = new Date(groupedWorkouts[b][0].completedAt);
    return dateB.getTime() - dateA.getTime();
  });

  if (completedWorkouts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">History</h1>
          <p className="text-zinc-400">Track your completed workouts</p>
        </div>
        <Card>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="text-blue-400 mb-4" size={32} />
            <p className="text-zinc-400">No workouts completed yet</p>
            <p className="text-sm text-zinc-500">
              Complete your first workout to see it here
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-zinc-400">Track your completed workouts</p>
      </div>

      {sortedMonths.map(month => (
        <div key={month} className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-300">{month}</h2>

          {groupedWorkouts[month].map(workout => {
            const date = new Date(workout.completedAt);
            const formattedDate = date.toLocaleDateString("default", {
              weekday: "short",
              day: "numeric",
              month: "short",
            });
            const formattedTime = date.toLocaleTimeString("default", {
              hour: "numeric",
              minute: "2-digit",
            });

            return (
              <Card
                key={workout.id}
                className="hover:border-blue-500/50 transition-colors cursor-pointer"
                onClick={() => onEditWorkout(workout)}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">{workout.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Calendar size={14} />
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span>{formattedTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={event => {
                        event.stopPropagation();
                        if (
                          confirm("Delete this workout from history?")
                        ) {
                          deleteCompletedWorkout(workout.id);
                        }
                      }}
                    >
                      <Trash2 size={18} className="text-red-400" />
                    </Button>
                    <ChevronRight className="text-zinc-600" size={20} />
                  </div>
                </div>

                <div className="mt-4 space-y-1 text-sm text-zinc-400">
                  {workout.exercises.map(exercise => (
                    <p
                      key={exercise.id}
                      className={exercise.completed === false ? "text-zinc-600" : undefined}
                    >
                      • {exercise.name}:{" "}
                      {exercise.completed === false
                        ? "skipped"
                        : formatExerciseSummary(exercise)}
                    </p>
                  ))}
                </div>

                {workout.duration && (
                  <p className="mt-3 text-sm text-zinc-500 border-t border-zinc-800/50 pt-3">
                    Duration: {formatDuration(workout.duration)}
                  </p>
                )}

                {workout.notes && (
                  <p className="mt-3 text-sm text-zinc-500 border-t border-zinc-800/50 pt-3">
                    {workout.notes}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
}
