import React, { useState, useEffect } from "react";
import { Card, Button, Input } from "../components";
import { Plus, X, Save } from "lucide-react";
import type { Exercise, Workout } from "../types";
import { v4 as uuid } from "uuid";
import { cn } from "../utils/cn";
import { isTimedExercise, parseNumberInput } from "../utils/exercise";
interface AddWorkoutScreenProps {
  workout?: Workout | null;
  onClose: () => void;
  onSave: (workout: { name: string; exercises: Exercise[] }) => void;
}

export function AddWorkoutScreen({
  workout,
  onClose,
  onSave,
}: AddWorkoutScreenProps) {
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    if (workout) {
      setWorkoutName(workout.name);
      setExercises(workout.exercises);
    }
  }, [workout]);

  const addExercise = () => {
    const newExercise: Exercise = {
      id: uuid(),
      name: "",
      tracking: "reps",
      sets: 3,
      reps: 6,
      durationSeconds: 30,
      weight: 0,
    };
    setExercises([...exercises, newExercise]);
  };

  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    setExercises(
      exercises.map(exercise =>
        exercise.id === id ? { ...exercise, ...updates } : exercise
      )
    );
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(exercise => exercise.id !== id));
  };

  const isExerciseValid = (exercise: Exercise) => {
    const hasName = exercise.name.trim() !== "";
    const hasSets = typeof exercise.sets === "number" && exercise.sets > 0;
    const hasWeight =
      typeof exercise.weight === "number" && exercise.weight >= 0;

    if (isTimedExercise(exercise)) {
      return (
        hasName &&
        hasSets &&
        hasWeight &&
        typeof exercise.durationSeconds === "number" &&
        exercise.durationSeconds > 0
      );
    }

    return (
      hasName &&
      hasSets &&
      hasWeight &&
      typeof exercise.reps === "number" &&
      exercise.reps > 0
    );
  };

  const isFormValid = () => {
    return (
      workoutName.trim() !== "" &&
      exercises.length > 0 &&
      exercises.every(isExerciseValid)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    onSave({
      name: workoutName.trim(),
      exercises: exercises,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {workout ? "Edit Workout" : "Create Workout"}
        </h1>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X size={24} />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <Input
            type="text"
            placeholder="Workout Name"
            value={workoutName}
            onChange={e => setWorkoutName(e.target.value)}
            className="w-full bg-transparent text-xl backdrop-blur-none font-semibold placeholder:text-zinc-600 border-none focus:none focus:ring-0"
          />
        </Card>

        <div className="space-y-4">
          {exercises.map(exercise => (
            <Card key={exercise.id} className="relative">
              <button
                type="button"
                onClick={() => removeExercise(exercise.id)}
                className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-300 z-10"
              >
                <X size={20} />
              </button>

              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Exercise Name"
                  value={exercise.name}
                  onChange={e =>
                    updateExercise(exercise.id, { name: e.target.value })
                  }
                  className="w-full bg-transparent font-medium backdrop-blur-none placeholder:text-zinc-600 border-none focus:none focus:ring-0"
                />

                <div className="flex rounded-lg bg-zinc-800/50 p-1">
                  <button
                    type="button"
                    className={cn(
                      "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      !isTimedExercise(exercise)
                        ? "bg-blue-600 text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                    )}
                    onClick={() =>
                      updateExercise(exercise.id, { tracking: "reps" })
                    }
                  >
                    Reps
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      isTimedExercise(exercise)
                        ? "bg-blue-600 text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                    )}
                    onClick={() =>
                      updateExercise(exercise.id, {
                        tracking: "time",
                        durationSeconds:
                          typeof exercise.durationSeconds === "number"
                            ? exercise.durationSeconds
                            : 30,
                      })
                    }
                  >
                    Hold
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Input
                      label="Sets"
                      value={exercise.sets}
                      onChange={e =>
                        updateExercise(exercise.id, {
                          sets: parseNumberInput(e.target.value),
                        })
                      }
                      className="w-full bg-zinc-800/50 backdrop-blur-none rounded-lg px-3 py-2 border-none focus:none focus:ring-0"
                    />
                  </div>

                  {isTimedExercise(exercise) ? (
                    <div>
                      <Input
                        label="Hold (sec)"
                        value={exercise.durationSeconds ?? ""}
                        onChange={e =>
                          updateExercise(exercise.id, {
                            durationSeconds: parseNumberInput(e.target.value),
                          })
                        }
                        className="w-full bg-zinc-800/50 backdrop-blur-none rounded-lg px-3 py-2 border-none focus:none focus:ring-0"
                      />
                    </div>
                  ) : (
                    <div>
                      <Input
                        label="Reps"
                        value={exercise.reps}
                        onChange={e =>
                          updateExercise(exercise.id, {
                            reps: parseNumberInput(e.target.value),
                          })
                        }
                        className="w-full bg-zinc-800/50 backdrop-blur-none rounded-lg px-3 py-2 border-none focus:none focus:ring-0"
                      />
                    </div>
                  )}

                  <div>
                    <Input
                      label="Weight (lbs)"
                      value={exercise.weight}
                      onChange={e =>
                        updateExercise(exercise.id, {
                          weight: parseNumberInput(e.target.value),
                        })
                      }
                      className="w-full bg-zinc-800/50 backdrop-blur-none rounded-lg px-3 py-2 border-none focus:none focus:ring-0"
                    />
                  </div>
                </div>

                <Input
                  label="Notes (optional)"
                  type="text"
                  placeholder="Add notes about this exercise..."
                  value={exercise.notes || ""}
                  onChange={e =>
                    updateExercise(exercise.id, { notes: e.target.value })
                  }
                  className="w-full bg-zinc-800/50 backdrop-blur-none rounded-lg px-3 py-2"
                />
              </div>
            </Card>
          ))}

          <Button variant="secondary" className="w-full" onClick={addExercise}>
            <Plus size={20} className="mr-2" />
            Add Exercise
          </Button>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!isFormValid()}
        >
          <Save size={20} className="mr-2" />
          {workout ? "Update Workout" : "Save Workout"}
        </Button>
      </form>
    </div>
  );
}
