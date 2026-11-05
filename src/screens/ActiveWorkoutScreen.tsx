import { useState, useCallback } from "react";
import { Card, Button, Input } from "../components";
import { Check, Plus, X } from "lucide-react";
import { v4 as uuid } from "uuid";
import type {
  CompletedWorkout,
  Exercise,
  Workout,
  WorkoutSessionMode,
} from "../types";
import {
  formatExerciseSummary,
  isTimedExercise,
  parseNumberInput,
} from "../utils/exercise";
import {
  lastPerformanceMap,
  type LastPerformance,
} from "../utils/progress";
import { cn } from "../utils/cn";
import { SessionFlow } from "./SessionFlow";

interface ActiveWorkoutScreenProps {
  workout: Workout | CompletedWorkout;
  mode: WorkoutSessionMode;
  completedWorkouts: CompletedWorkout[];
  onComplete: (result: {
    exercises: Exercise[];
    duration?: number;
    completedAt?: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

interface ExerciseStatus extends Exercise {
  completed: boolean;
}

function toDateTimeLocal(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function fromDateTimeLocal(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? new Date().toISOString()
    : date.toISOString();
}

function TrackingToggle({
  timed,
  onChange,
}: {
  timed: boolean;
  onChange: (timed: boolean) => void;
}) {
  return (
    <div className="flex rounded-lg bg-zinc-800/50 p-1">
      <button
        type="button"
        className={cn(
          "press flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150",
          !timed ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-zinc-200"
        )}
        onClick={() => onChange(false)}
      >
        Reps
      </button>
      <button
        type="button"
        className={cn(
          "press flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150",
          timed ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-zinc-200"
        )}
        onClick={() => onChange(true)}
      >
        Hold
      </button>
    </div>
  );
}

function ExerciseFields({
  exercise,
  onChange,
}: {
  exercise: Exercise;
  onChange: (updates: Partial<Exercise>) => void;
}) {
  const timed = isTimedExercise(exercise);
  const fieldClass =
    "w-full bg-zinc-800/50 backdrop-blur-none rounded-lg px-3 py-2 border-none focus:none focus:ring-0";

  return (
    <div className="space-y-3" onClick={event => event.stopPropagation()}>
      <TrackingToggle
        timed={timed}
        onChange={nextTimed =>
          onChange({
            tracking: nextTimed ? "time" : "reps",
            durationSeconds:
              typeof exercise.durationSeconds === "number"
                ? exercise.durationSeconds
                : 30,
          })
        }
      />
      <div className="grid grid-cols-3 gap-3">
        <Input
          label="Sets"
          value={exercise.sets}
          onChange={e => onChange({ sets: parseNumberInput(e.target.value) })}
          className={fieldClass}
        />
        {timed ? (
          <Input
            label="Hold (sec)"
            value={exercise.durationSeconds ?? ""}
            onChange={e =>
              onChange({ durationSeconds: parseNumberInput(e.target.value) })
            }
            className={fieldClass}
          />
        ) : (
          <Input
            label="Reps"
            value={exercise.reps}
            onChange={e => onChange({ reps: parseNumberInput(e.target.value) })}
            className={fieldClass}
          />
        )}
        <Input
          label="Weight"
          value={exercise.weight}
          onChange={e => onChange({ weight: parseNumberInput(e.target.value) })}
          className={fieldClass}
        />
      </div>
    </div>
  );
}

function createExercise(): Exercise {
  return {
    id: uuid(),
    name: "",
    tracking: "reps",
    sets: 3,
    reps: 6,
    durationSeconds: 30,
    weight: 0,
  };
}

function LastTime({
  exerciseName,
  previous,
}: {
  exerciseName: string;
  previous?: LastPerformance;
}) {
  if (!previous || !exerciseName.trim()) return null;

  const date = new Date(previous.completedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <p className="text-sm text-zinc-500">
      Last time · {formatExerciseSummary(previous.exercise)} · {date}
    </p>
  );
}

export function ActiveWorkoutScreen(props: ActiveWorkoutScreenProps) {
  if (props.mode === "live" || props.mode === "log") {
    return (
      <SessionFlow
        workout={props.workout}
        mode={props.mode}
        completedWorkouts={props.completedWorkouts}
        onComplete={props.onComplete}
        onCancel={props.onCancel}
      />
    );
  }

  return <EditWorkoutSession {...props} />;
}

function EditWorkoutSession({
  workout,
  completedWorkouts,
  onComplete,
  onCancel,
  onDelete,
}: ActiveWorkoutScreenProps) {
  const lastByName = lastPerformanceMap(completedWorkouts, {
    excludeId: workout.id,
  });

  const [exercises, setExercises] = useState<ExerciseStatus[]>(() =>
    workout.exercises.map(exercise => ({
      ...exercise,
      completed: exercise.completed ?? true,
    }))
  );
  const [notes, setNotes] = useState(workout.notes ?? "");
  const [completedAt, setCompletedAt] = useState(
    "completedAt" in workout && workout.completedAt
      ? workout.completedAt
      : new Date().toISOString()
  );
  const [draft, setDraft] = useState<Exercise | null>(null);

  const updateExercise = useCallback(
    (id: string, updates: Partial<ExerciseStatus>) => {
      setExercises(current =>
        current.map(exercise =>
          exercise.id === id ? { ...exercise, ...updates } : exercise
        )
      );
    },
    []
  );

  const toggleExercise = useCallback((id: string) => {
    setExercises(current =>
      current.map(exercise =>
        exercise.id === id
          ? { ...exercise, completed: !exercise.completed }
          : exercise
      )
    );
  }, []);

  const addDraftExercise = () => {
    if (!draft || !draft.name.trim()) return;

    setExercises(current => [
      ...current,
      {
        ...draft,
        name: draft.name.trim(),
        completed: true,
      },
    ]);
    setDraft(null);
  };

  const handleComplete = () => {
    onComplete({
      exercises: exercises.filter(exercise => exercise.name.trim() !== ""),
      completedAt,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{workout.name}</h1>
          <p className="text-sm text-zinc-400">Edit this workout</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X size={24} />
        </Button>
      </div>

      <Input
        label="When"
        type="datetime-local"
        value={toDateTimeLocal(completedAt)}
        onChange={e => setCompletedAt(fromDateTimeLocal(e.target.value))}
        className="w-full bg-zinc-800/50 border-none"
      />

      <div className="space-y-4">
        {exercises.map(exercise => (
          <Card
            key={exercise.id}
            className={`transition-colors ${
              exercise.completed ? "border-green-500/50" : ""
            }`}
          >
            <div className="flex items-start gap-4">
              <Button
                variant="ghost"
                size="sm"
                className={`mt-1 ${
                  exercise.completed ? "text-green-500" : "text-zinc-500"
                }`}
                onClick={() => toggleExercise(exercise.id)}
              >
                <Check size={20} />
              </Button>

              <div className="flex-1 space-y-3">
                <Input
                  value={exercise.name}
                  onChange={e =>
                    updateExercise(exercise.id, { name: e.target.value })
                  }
                  className="w-full bg-transparent font-medium backdrop-blur-none border-none px-0"
                />
                <ExerciseFields
                  exercise={exercise}
                  onChange={updates => updateExercise(exercise.id, updates)}
                />
                <LastTime
                  exerciseName={exercise.name}
                  previous={lastByName.get(exercise.name.trim())}
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setExercises(current =>
                    current.filter(item => item.id !== exercise.id)
                  )
                }
              >
                <X size={18} className="text-zinc-500" />
              </Button>
            </div>
          </Card>
        ))}

        {draft ? (
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">New exercise</h3>
              <Button variant="ghost" size="sm" onClick={() => setDraft(null)}>
                <X size={18} />
              </Button>
            </div>
            <Input
              placeholder="Exercise name"
              value={draft.name}
              onChange={e => setDraft({ ...draft, name: e.target.value })}
              className="w-full bg-transparent font-medium border-none px-0"
            />
            <ExerciseFields
              exercise={draft}
              onChange={updates => setDraft({ ...draft, ...updates })}
            />
            <Button
              className="w-full"
              disabled={!draft.name.trim()}
              onClick={addDraftExercise}
            >
              Add to workout
            </Button>
          </Card>
        ) : (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setDraft(createExercise())}
          >
            <Plus size={20} className="mr-2" />
            Add exercise
          </Button>
        )}
      </div>

      <Input
        label="Notes (optional)"
        placeholder="How did it go?"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        className="w-full bg-zinc-800/50"
        multiline
        rows={3}
      />

      <Button size="lg" className="w-full" onClick={handleComplete}>
        Save changes
      </Button>

      {onDelete && (
        <Button
          variant="critical"
          className="w-full"
          onClick={() => {
            if (confirm("Delete this workout from history?")) {
              onDelete();
            }
          }}
        >
          Delete workout
        </Button>
      )}
    </div>
  );
}
