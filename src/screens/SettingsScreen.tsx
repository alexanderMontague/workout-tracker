import { Card, Button } from "../components";
import { Edit2, Trash2 } from "lucide-react";
import type { Workout } from "../types";

interface SettingsScreenProps {
  workouts: Workout[];
  onEditWorkout: (workout: Workout) => void;
  onDeleteWorkout: (id: string) => void;
}

export function SettingsScreen({
  workouts,
  onEditWorkout,
  onDeleteWorkout,
}: SettingsScreenProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-zinc-400">Manage your workouts and preferences</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Your Workouts</h2>
        {workouts.length === 0 ? (
          <Card>
            <p className="text-zinc-400">No workouts created yet</p>
          </Card>
        ) : (
          workouts.map(workout => (
            <Card key={workout.id} className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{workout.name}</h3>
                  <p className="text-sm text-zinc-400">
                    {workout.exercises.length} exercise
                    {workout.exercises.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditWorkout(workout)}
                  >
                    <Edit2 size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (
                        confirm("Are you sure you want to delete this workout?")
                      ) {
                        onDeleteWorkout(workout.id);
                      }
                    }}
                  >
                    <Trash2 size={18} className="text-red-400" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1 text-sm text-zinc-400">
                {workout.exercises.map(exercise => (
                  <div key={exercise.id}>
                    <p>
                      • {exercise.name}: {exercise.sets}x{exercise.reps} @{" "}
                      {exercise.weight}lbs
                    </p>
                    {exercise.notes && (
                      <p className="ml-4 text-xs text-zinc-500">
                        {exercise.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
