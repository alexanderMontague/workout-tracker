import { Card, Button } from "../components";
import { Dumbbell, Plus, AlarmClock } from "lucide-react";
import type { Workout } from "../types";
import { useWorkouts } from "../hooks/useWorkouts";
import { useState } from "react";
import { StretchScreen } from "./StretchScreen";

interface HomeScreenProps {
  onAddWorkout: () => void;
  onStartWorkout: (workout: Workout) => void;
}

export function HomeScreen({ onAddWorkout, onStartWorkout }: HomeScreenProps) {
  const { nextWorkout } = useWorkouts();
  const [isStretchMode, setIsStretchMode] = useState(false);

  if (isStretchMode) {
    return <StretchScreen onClose={() => setIsStretchMode(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Next Workout</h1>
        <Dumbbell className="text-blue-400" size={24} />
      </div>

      <Card className="space-y-4">
        {nextWorkout ? (
          <>
            <h2 className="text-lg font-semibold">{nextWorkout.name}</h2>
            <div className="space-y-2 text-sm text-zinc-400">
              {nextWorkout.exercises.map(exercise => (
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
            <Button
              size="lg"
              className="w-full"
              onClick={() => onStartWorkout(nextWorkout)}
            >
              Start Workout
            </Button>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-zinc-400">No workouts created yet</p>
            <Button onClick={onAddWorkout} className="mt-4">
              Create Your First Workout
            </Button>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card
          className="flex flex-col items-center justify-center text-center p-4 hover:border-blue-500/50 transition-colors cursor-pointer"
          onClick={onAddWorkout}
        >
          <Plus className="mb-2 text-blue-400" size={24} />
          <span className="font-medium">Add Workout</span>
          <span className="text-sm text-zinc-400">Create routine</span>
        </Card>

        <Card
          className="flex flex-col items-center justify-center text-center p-4 hover:border-blue-500/50 transition-colors cursor-pointer"
          onClick={() => setIsStretchMode(true)}
        >
          <AlarmClock className="mb-2 text-blue-400" size={24} />
          <span className="font-medium">Stretch</span>
          <span className="text-sm text-zinc-400">Time & Track</span>
        </Card>
      </div>
    </div>
  );
}
