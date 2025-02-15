import { useState, useEffect } from "react";
import { Card, Button } from "../components";
import { Check, X } from "lucide-react";
import type { Workout, Exercise } from "../types";

interface ActiveWorkoutScreenProps {
  workout: Workout;
  onComplete: (workout: Workout) => void;
  onCancel: () => void;
}

interface ExerciseStatus extends Exercise {
  completed: boolean;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function ActiveWorkoutScreen({
  workout,
  onComplete,
  onCancel,
}: ActiveWorkoutScreenProps) {
  const [exercises, setExercises] = useState<ExerciseStatus[]>(
    workout.exercises.map(exercise => ({ ...exercise, completed: false }))
  );
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleExercise = (id: string) => {
    setExercises(
      exercises.map(exercise =>
        exercise.id === id
          ? { ...exercise, completed: !exercise.completed }
          : exercise
      )
    );
  };

  const handleComplete = () => {
    onComplete({
      ...workout,
      exercises,
    });
  };

  const anyExerciseCompleted = exercises.some(e => e.completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{workout.name}</h1>
          <p className="text-sm text-zinc-400">Workout in progress</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X size={24} />
        </Button>
      </div>

      <div className="flex justify-center">
        <div className="text-4xl font-mono font-bold text-blue-600">
          {formatDuration(duration)}
        </div>
      </div>

      <div className="space-y-4">
        {exercises.map(exercise => (
          <Card
            key={exercise.id}
            className={`transition-colors ${
              exercise.completed ? "border-green-500/50" : ""
            }`}
            onClick={() => toggleExercise(exercise.id)}
          >
            <div className="flex items-start gap-4">
              <Button
                variant="ghost"
                size="sm"
                className={`mt-1 ${
                  exercise.completed ? "text-green-500" : "text-zinc-500"
                }`}
              >
                <Check size={20} />
              </Button>

              <div className="flex-1">
                <h3 className="font-medium">{exercise.name}</h3>
                <p className="text-sm text-zinc-400">
                  {exercise.sets}x{exercise.reps} @ {exercise.weight}lbs
                </p>
                {exercise.notes && (
                  <p className="text-sm text-zinc-500 mt-2">{exercise.notes}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button
        size="lg"
        className="w-full"
        onClick={handleComplete}
        disabled={!anyExerciseCompleted}
      >
        End Workout
      </Button>
    </div>
  );
}
