import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type MouseEvent,
} from "react";
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
  formatClock,
  formatExerciseSummary,
  isTimedExercise,
  parseNumberInput,
} from "../utils/exercise";
import { cn } from "../utils/cn";

interface ActiveWorkoutScreenProps {
  workout: Workout | CompletedWorkout;
  mode: WorkoutSessionMode;
  onComplete: (result: {
    exercises: Exercise[];
    duration?: number;
    completedAt?: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
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

function HoldTimer({
  holdSeconds,
  totalSets,
  completed,
  onAllSetsComplete,
}: {
  holdSeconds: number;
  totalSets: number;
  completed: boolean;
  onAllSetsComplete: () => void;
}) {
  const [completedSets, setCompletedSets] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const finishedHold = useRef(false);

  const running = remaining !== null && remaining > 0;

  useEffect(() => {
    if (remaining === null || remaining <= 0) return;

    const timer = setTimeout(() => {
      setRemaining(prev => (prev === null ? prev : prev - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [remaining]);

  useEffect(() => {
    if (remaining !== 0 || finishedHold.current) return;

    finishedHold.current = true;
    setRemaining(null);
    setCompletedSets(prev => {
      const next = prev + 1;
      if (next >= totalSets) {
        onAllSetsComplete();
      }
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(200);
      }
      return next;
    });
  }, [remaining, totalSets, onAllSetsComplete]);

  const startHold = (event: MouseEvent) => {
    event.stopPropagation();
    if (completed || running) return;
    finishedHold.current = false;
    setRemaining(holdSeconds);
  };

  const cancelHold = (event: MouseEvent) => {
    event.stopPropagation();
    finishedHold.current = true;
    setRemaining(null);
  };

  return (
    <div
      className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-zinc-800/60 px-3 py-2"
      onClick={event => event.stopPropagation()}
    >
      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          {completedSets}/{totalSets} holds
        </p>
        <p className="font-mono text-lg font-semibold text-blue-400">
          {running
            ? formatClock(remaining ?? 0)
            : completed || completedSets >= totalSets
            ? "Done"
            : formatClock(holdSeconds)}
        </p>
      </div>
      {completed || completedSets >= totalSets ? null : running ? (
        <Button variant="secondary" size="sm" onClick={cancelHold}>
          Cancel
        </Button>
      ) : (
        <Button size="sm" onClick={startHold}>
          Start hold
        </Button>
      )}
    </div>
  );
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
          "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          !timed ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-zinc-200"
        )}
        onClick={() => onChange(false)}
      >
        Reps
      </button>
      <button
        type="button"
        className={cn(
          "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
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

export function ActiveWorkoutScreen({
  workout,
  mode,
  onComplete,
  onCancel,
}: ActiveWorkoutScreenProps) {
  const isLive = mode === "live";
  const canEditDetails = !isLive;

  const [exercises, setExercises] = useState<ExerciseStatus[]>(() =>
    workout.exercises.map(exercise => ({
      ...exercise,
      completed: mode === "live" ? false : exercise.completed ?? true,
    }))
  );
  const [duration, setDuration] = useState(0);
  const [notes, setNotes] = useState(workout.notes ?? "");
  const [completedAt, setCompletedAt] = useState(
    "completedAt" in workout && workout.completedAt
      ? workout.completedAt
      : new Date().toISOString()
  );
  const [draft, setDraft] = useState<Exercise | null>(null);

  useEffect(() => {
    if (!isLive) return;

    const timer = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isLive]);

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

  const markExerciseComplete = useCallback((id: string) => {
    setExercises(current =>
      current.map(exercise =>
        exercise.id === id ? { ...exercise, completed: true } : exercise
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
        completed: !isLive,
      },
    ]);
    setDraft(null);
  };

  const handleComplete = () => {
    onComplete({
      exercises: exercises.filter(exercise => exercise.name.trim() !== ""),
      duration: isLive ? duration : undefined,
      completedAt: isLive ? undefined : completedAt,
      notes: notes.trim() || undefined,
    });
  };

  const copy: Record<
    WorkoutSessionMode,
    { subtitle: string; save: string }
  > = {
    live: { subtitle: "Workout in progress", save: "End Workout" },
    log: { subtitle: "Log what you already did", save: "Save workout" },
    edit: { subtitle: "Edit this workout", save: "Save changes" },
  };

  const canSave = mode === "edit" || exercises.some(exercise => exercise.completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{workout.name}</h1>
          <p className="text-sm text-zinc-400">{copy[mode].subtitle}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X size={24} />
        </Button>
      </div>

      {isLive && (
        <div className="flex justify-center">
          <div className="text-4xl font-mono font-bold text-blue-600">
            {formatClock(duration)}
          </div>
        </div>
      )}

      {canEditDetails && (
        <Input
          label="When"
          type="datetime-local"
          value={toDateTimeLocal(completedAt)}
          onChange={e => setCompletedAt(fromDateTimeLocal(e.target.value))}
          className="w-full bg-zinc-800/50 border-none"
        />
      )}

      <div className="space-y-4">
        {exercises.map(exercise => (
          <Card
            key={exercise.id}
            className={`transition-colors ${
              exercise.completed ? "border-green-500/50" : ""
            }`}
            onClick={() => {
              if (isLive && isTimedExercise(exercise)) return;
              if (canEditDetails) return;
              toggleExercise(exercise.id);
            }}
          >
            <div className="flex items-start gap-4">
              <Button
                variant="ghost"
                size="sm"
                className={`mt-1 ${
                  exercise.completed ? "text-green-500" : "text-zinc-500"
                }`}
                onClick={event => {
                  event.stopPropagation();
                  toggleExercise(exercise.id);
                }}
              >
                <Check size={20} />
              </Button>

              <div className="flex-1 space-y-3">
                {canEditDetails ? (
                  <Input
                    value={exercise.name}
                    onChange={e =>
                      updateExercise(exercise.id, { name: e.target.value })
                    }
                    className="w-full bg-transparent font-medium backdrop-blur-none border-none px-0"
                  />
                ) : (
                  <h3 className="font-medium">{exercise.name}</h3>
                )}

                {canEditDetails ? (
                  <ExerciseFields
                    exercise={exercise}
                    onChange={updates => updateExercise(exercise.id, updates)}
                  />
                ) : (
                  <p className="text-sm text-zinc-400">
                    {formatExerciseSummary(exercise)}
                  </p>
                )}

                {exercise.notes && !canEditDetails && (
                  <p className="text-sm text-zinc-500">{exercise.notes}</p>
                )}

                {isLive &&
                  isTimedExercise(exercise) &&
                  typeof exercise.durationSeconds === "number" &&
                  typeof exercise.sets === "number" && (
                    <HoldTimer
                      holdSeconds={exercise.durationSeconds}
                      totalSets={exercise.sets}
                      completed={exercise.completed}
                      onAllSetsComplete={() =>
                        markExerciseComplete(exercise.id)
                      }
                    />
                  )}
              </div>

              {canEditDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={event => {
                    event.stopPropagation();
                    setExercises(current =>
                      current.filter(item => item.id !== exercise.id)
                    );
                  }}
                >
                  <X size={18} className="text-zinc-500" />
                </Button>
              )}
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

      {canEditDetails && (
        <Input
          label="Notes (optional)"
          placeholder="How did it go?"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full bg-zinc-800/50"
          multiline
          rows={3}
        />
      )}

      <Button
        size="lg"
        className="w-full"
        onClick={handleComplete}
        disabled={!canSave}
      >
        {copy[mode].save}
      </Button>
    </div>
  );
}
