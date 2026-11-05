import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../components";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  List,
  Plus,
  X,
} from "lucide-react";
import type {
  CompletedWorkout,
  Exercise,
  SetLog,
  Workout,
} from "../types";
import {
  formatClock,
  formatExerciseSummary,
  formatHold,
  isTimedExercise,
  parseNumberInput,
} from "../utils/exercise";
import { lastPerformanceMap } from "../utils/progress";
import { buildSetLogs, collapseSetLogs } from "../utils/session";
import { cn } from "../utils/cn";

const REST_SECONDS = 90;

interface SessionFlowProps {
  workout: Workout | CompletedWorkout;
  mode: "live" | "log";
  completedWorkouts: CompletedWorkout[];
  onComplete: (result: {
    exercises: Exercise[];
    duration?: number;
    completedAt?: string;
  }) => void;
  onCancel: () => void;
}

function GymNumber({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | "";
  onChange: (value: number | "") => void;
}) {
  return (
    <label className="flex-1 min-w-0">
      <span className="block text-xs text-zinc-500 mb-1">{label}</span>
      <input
        inputMode="numeric"
        value={value}
        onChange={e => onChange(parseNumberInput(e.target.value))}
        className="w-full rounded-2xl bg-zinc-800 px-2 py-4 text-center text-3xl font-semibold text-zinc-100 outline-none transition-[box-shadow] duration-150 focus:ring-2 focus:ring-blue-500"
      />
    </label>
  );
}

function formatSetSummary(log: SetLog, timed: boolean): string {
  const weight =
    typeof log.weight === "number" && log.weight > 0 ? `${log.weight}lbs` : "";

  if (timed) {
    const hold = formatHold(Number(log.durationSeconds) || 0);
    return [weight, `${hold} hold`].filter(Boolean).join(" · ");
  }

  return [weight, `${log.reps || 0} reps`].filter(Boolean).join(" · ");
}

function formatLastDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function SessionFlow({
  workout,
  mode,
  completedWorkouts,
  onComplete,
  onCancel,
}: SessionFlowProps) {
  const isLive = mode === "live";
  const lastByName = useMemo(
    () => lastPerformanceMap(completedWorkouts),
    [completedWorkouts]
  );

  const [index, setIndex] = useState(0);
  const [onList, setOnList] = useState(true);
  const [motion, setMotion] = useState<"forward" | "back">("forward");
  const [logsById, setLogsById] = useState<Record<string, SetLog[]>>(() => {
    const initial: Record<string, SetLog[]> = {};
    workout.exercises.forEach(exercise => {
      initial[exercise.id] = buildSetLogs(
        exercise,
        lastByName.get(exercise.name.trim())
      );
    });
    return initial;
  });
  const [duration, setDuration] = useState(0);
  const [rest, setRest] = useState<number | null>(null);
  const [holdRemaining, setHoldRemaining] = useState<number | null>(null);
  const [holdingSet, setHoldingSet] = useState<number | null>(null);

  const exercises = workout.exercises;
  const exercise = exercises[index];
  const logs = exercise ? logsById[exercise.id] ?? [] : [];
  const last = exercise
    ? lastByName.get(exercise.name.trim())
    : undefined;
  const timed = exercise ? isTimedExercise(exercise) : false;
  const showWeight =
    Number(exercise?.weight) > 0 ||
    Number(last?.exercise.weight) > 0 ||
    logs.some(log => Number(log.weight) > 0);
  const isLastExercise = index === exercises.length - 1;
  const completedSets = logs.filter(log => log.completed).length;
  const currentSetIndex = logs.findIndex(log => !log.completed);
  const anySetDone = Object.values(logsById).some(setLogs =>
    setLogs.some(log => log.completed)
  );

  useEffect(() => {
    if (!isLive) return;
    const timer = setInterval(() => setDuration(value => value + 1), 1000);
    return () => clearInterval(timer);
  }, [isLive]);

  useEffect(() => {
    if (rest === null || rest <= 0) {
      if (rest === 0) setRest(null);
      return;
    }
    const timer = setTimeout(
      () => setRest(value => (value === null ? value : value - 1)),
      1000
    );
    return () => clearTimeout(timer);
  }, [rest]);

  useEffect(() => {
    if (holdRemaining === null || holdRemaining <= 0) return;
    const timer = setTimeout(
      () => setHoldRemaining(value => (value === null ? value : value - 1)),
      1000
    );
    return () => clearTimeout(timer);
  }, [holdRemaining]);

  const startRestIfNeeded = useCallback(
    (setIndex: number, nextLogs: SetLog[]) => {
      if (!isLive) return;
      const remainingSets = nextLogs.filter(
        (log, logIndex) => logIndex !== setIndex && !log.completed
      ).length;
      if (remainingSets > 0) setRest(REST_SECONDS);
    },
    [isLive]
  );

  const finishHold = useCallback(() => {
    if (!exercise || holdingSet === null) return;
    const setIndex = holdingSet;
    const currentLogs = logsById[exercise.id] ?? [];
    if (currentLogs[setIndex]?.completed) return;
    const nextLogs = currentLogs.map((log, logIndex) =>
      logIndex === setIndex ? { ...log, completed: true } : log
    );
    setLogsById(current => ({ ...current, [exercise.id]: nextLogs }));
    setHoldRemaining(null);
    setHoldingSet(null);
    startRestIfNeeded(setIndex, nextLogs);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(200);
    }
  }, [exercise, holdingSet, logsById, startRestIfNeeded]);

  useEffect(() => {
    if (holdRemaining !== 0) return;
    finishHold();
  }, [holdRemaining, finishHold]);

  const updateLog = (setIndex: number, updates: Partial<SetLog>) => {
    if (!exercise) return;
    setLogsById(current => ({
      ...current,
      [exercise.id]: (current[exercise.id] ?? []).map((log, logIndex) =>
        logIndex === setIndex ? { ...log, ...updates } : log
      ),
    }));
  };

  const toggleSet = (setIndex: number) => {
    if (!exercise) return;
    const log = logs[setIndex];
    if (!log) return;

    if (log.completed) {
      updateLog(setIndex, { completed: false });
      setRest(null);
      return;
    }

    const nextLogs = logs.map((item, logIndex) =>
      logIndex === setIndex ? { ...item, completed: true } : item
    );
    setLogsById(current => ({ ...current, [exercise.id]: nextLogs }));
    startRestIfNeeded(setIndex, nextLogs);
  };

  const addSet = () => {
    if (!exercise) return;
    const template = logs[logs.length - 1] ?? {
      weight: exercise.weight,
      reps: exercise.reps,
      durationSeconds: exercise.durationSeconds ?? 30,
      completed: false,
    };
    setLogsById(current => ({
      ...current,
      [exercise.id]: [
        ...(current[exercise.id] ?? []),
        { ...template, completed: false },
      ],
    }));
  };

  const completeAll = () => {
    if (!exercise) return;
    setLogsById(current => ({
      ...current,
      [exercise.id]: (current[exercise.id] ?? []).map(log => ({
        ...log,
        completed: true,
      })),
    }));
    setRest(null);
  };

  const clearTimers = () => {
    setRest(null);
    setHoldRemaining(null);
    setHoldingSet(null);
  };

  const goTo = (nextIndex: number) => {
    clearTimers();
    setMotion(onList || nextIndex >= index ? "forward" : "back");
    setIndex(nextIndex);
    setOnList(false);
  };

  const openList = () => {
    clearTimers();
    setMotion("back");
    setOnList(true);
  };

  const continueIndex = exercises.findIndex(item => {
    const itemLogs = logsById[item.id] ?? [];
    return itemLogs.some(log => !log.completed);
  });

  const saveWorkout = () => {
    onComplete({
      exercises: exercises.map(item =>
        collapseSetLogs(item, logsById[item.id] ?? [])
      ),
      duration: isLive ? duration : undefined,
    });
  };

  if (!exercise) {
    return (
      <div className="flex min-h-[80dvh] flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">No exercises in this workout</p>
        <Button onClick={onCancel}>Close</Button>
      </div>
    );
  }

  const shellClass =
    "relative -mx-4 -mt-4 flex min-h-dvh flex-col px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]";

  if (onList) {
    const allDone =
      exercises.length > 0 &&
      exercises.every(item => {
        const itemLogs = logsById[item.id] ?? [];
        return itemLogs.length > 0 && itemLogs.every(log => log.completed);
      });
    const nextIndex = continueIndex === -1 ? 0 : continueIndex;

    return (
      <div className={shellClass}>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X size={24} />
          </Button>
          <p className="text-sm text-zinc-400">{workout.name}</p>
          <p className="w-12 text-right font-mono text-sm text-zinc-400">
            {isLive ? formatClock(duration) : ""}
          </p>
        </div>

        <div
          key="list"
          className={cn(
            "mt-6 flex-1 space-y-3",
            motion === "back" ? "animate-session-back" : "animate-session-forward"
          )}
        >
          <h1 className="text-3xl font-bold tracking-tight">Exercises</h1>
          {exercises.map((item, itemIndex) => {
            const itemLogs = logsById[item.id] ?? [];
            const done = itemLogs.filter(log => log.completed).length;
            const total = itemLogs.length;
            const complete = total > 0 && done === total;
            const previous = lastByName.get(item.name.trim());

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(itemIndex)}
                className={cn(
                  "press group flex w-full items-center gap-3 rounded-3xl border px-4 py-4 text-left transition-colors duration-150",
                  complete
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-zinc-800 bg-zinc-900 active:bg-zinc-800"
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors duration-200",
                    complete
                      ? "animate-pop border-green-500 bg-green-500 text-white"
                      : "border-zinc-600 text-zinc-300"
                  )}
                >
                  {complete ? <Check size={18} /> : itemIndex + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-semibold">{item.name}</p>
                  <p className="mt-1 text-sm text-zinc-300">
                    Do {formatExerciseSummary(item)}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {previous
                      ? `Last ${formatExerciseSummary(previous.exercise)} · ${formatLastDate(
                          previous.completedAt
                        )}`
                      : "First time"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {done}/{total} sets
                  </p>
                </div>
                <ChevronRight
                  size={20}
                  className="shrink-0 text-zinc-500 transition-transform duration-150 group-active:translate-x-0.5"
                />
              </button>
            );
          })}
        </div>

        <div className="sticky bottom-0 mt-4 space-y-3 bg-gradient-to-t from-black via-black/90 to-transparent pt-6">
          {!allDone && (
            <Button
              size="lg"
              className="h-14 w-full"
              onClick={() => goTo(nextIndex)}
            >
              {anySetDone ? "Continue" : "Start first exercise"}
            </Button>
          )}
          <Button
            size="lg"
            className="h-14 w-full"
            variant={allDone ? "primary" : "secondary"}
            onClick={saveWorkout}
          >
            Finish workout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={openList}>
          <List size={22} />
        </Button>
        <button
          type="button"
          className="press rounded-lg px-2 py-1 text-center"
          onClick={openList}
        >
          <p className="text-sm text-zinc-400">{workout.name}</p>
          <div className="mt-1 flex justify-center gap-1.5">
            {exercises.map((item, itemIndex) => (
              <span
                key={item.id}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  itemIndex === index
                    ? "w-5 bg-blue-400"
                    : (logsById[item.id] ?? []).every(log => log.completed) &&
                      (logsById[item.id] ?? []).length > 0
                    ? "w-1.5 bg-green-500"
                    : "w-1.5 bg-zinc-700"
                )}
              />
            ))}
          </div>
        </button>
        <p className="w-12 text-right font-mono text-sm text-zinc-400">
          {isLive ? formatClock(duration) : ""}
        </p>
      </div>

      <div
        key={exercise.id}
        className={cn(
          "mt-8 flex-1 space-y-5",
          motion === "back" ? "animate-session-back" : "animate-session-forward"
        )}
      >
        <h1 className="text-4xl font-bold leading-tight tracking-tight">
          {exercise.name}
        </h1>

        <div className="rounded-3xl bg-zinc-900 px-5 py-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-zinc-500">Do</span>
            <span className="text-xl font-semibold">
              {formatExerciseSummary(exercise)}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-zinc-800 pt-3">
            <span className="text-sm text-zinc-500">Last time</span>
            <span className="text-right text-lg text-zinc-300">
              {last
                ? `${formatExerciseSummary(last.exercise)} · ${formatLastDate(
                    last.completedAt
                  )}`
                : "First time"}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {logs.map((log, setIndex) => {
            const isCurrent =
              setIndex === (currentSetIndex === -1 ? logs.length - 1 : currentSetIndex);
            const collapsed = !isCurrent;

            if (collapsed) {
              return (
                <button
                  key={setIndex}
                  type="button"
                  onClick={() => log.completed && toggleSet(setIndex)}
                  className={cn(
                    "press flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors duration-200",
                    log.completed
                      ? "border-green-500/30 bg-green-500/5 text-zinc-300"
                      : "border-zinc-800 bg-zinc-900/50 text-zinc-500"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
                      log.completed
                        ? "animate-pop border-green-500 bg-green-500 text-white"
                        : "border-zinc-600"
                    )}
                  >
                    {log.completed ? <Check size={16} /> : setIndex + 1}
                  </span>
                  <span className="text-sm font-medium">
                    {formatSetSummary(log, timed)}
                  </span>
                </button>
              );
            }

            return (
              <div
                key={setIndex}
                className={cn(
                  "rounded-3xl border px-4 py-5 transition-colors duration-200",
                  log.completed
                    ? "border-green-500/40 bg-green-500/5"
                    : "border-blue-500/40 bg-zinc-900"
                )}
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm uppercase tracking-wide text-zinc-400">
                    Set {setIndex + 1} of {logs.length}
                  </p>
                  {log.completed && (
                    <span className="text-sm font-medium text-green-400">
                      Done
                    </span>
                  )}
                </div>

                {timed ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {showWeight && (
                        <GymNumber
                          label="lbs"
                          value={log.weight}
                          onChange={value => updateLog(setIndex, { weight: value })}
                        />
                      )}
                      {holdingSet !== setIndex && (
                        <GymNumber
                          label="sec"
                          value={log.durationSeconds ?? 30}
                          onChange={value =>
                            updateLog(setIndex, { durationSeconds: value })
                          }
                        />
                      )}
                    </div>
                    {isLive && holdingSet === setIndex && holdRemaining !== null ? (
                      <div className="animate-pop rounded-3xl bg-blue-600/10 py-8 text-center">
                        <p className="font-mono text-6xl font-bold text-blue-400">
                          {formatClock(holdRemaining)}
                        </p>
                        <Button
                          variant="secondary"
                          className="mt-6"
                          onClick={() => {
                            setHoldingSet(null);
                            setHoldRemaining(null);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="lg"
                        className="w-full"
                        variant={log.completed ? "secondary" : "primary"}
                        onClick={() => {
                          if (!isLive || log.completed) {
                            toggleSet(setIndex);
                            return;
                          }
                          setHoldingSet(setIndex);
                          setHoldRemaining(Number(log.durationSeconds) || 30);
                          setRest(null);
                        }}
                      >
                        {log.completed
                          ? "Undo set"
                          : isLive
                          ? `Start ${Number(log.durationSeconds) || 0}s hold`
                          : "Mark set done"}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <GymNumber
                        label="lbs"
                        value={log.weight}
                        onChange={value => updateLog(setIndex, { weight: value })}
                      />
                      <GymNumber
                        label="reps"
                        value={log.reps}
                        onChange={value => updateLog(setIndex, { reps: value })}
                      />
                    </div>
                    <Button
                      size="lg"
                      className="w-full"
                      variant={log.completed ? "secondary" : "primary"}
                      onClick={() => toggleSet(setIndex)}
                    >
                      {log.completed ? "Undo set" : "Mark set done"}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={addSet}
            className="press flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm text-zinc-500 active:text-zinc-300"
          >
            <Plus size={16} />
            Add set
          </button>
        </div>
      </div>

      <div className="sticky bottom-0 mt-4 space-y-3 bg-gradient-to-t from-black via-black/90 to-transparent pt-6">
        {!isLive && completedSets < logs.length && (
          <Button variant="secondary" className="w-full" onClick={completeAll}>
            Mark all sets done
          </Button>
        )}
        <div className="grid grid-cols-[auto_1fr] gap-3">
          <Button
            variant="secondary"
            className="h-14 px-4"
            onClick={() => (index === 0 ? openList() : goTo(index - 1))}
          >
            <ChevronLeft size={22} />
          </Button>
          <Button
            size="lg"
            className="h-14 w-full"
            onClick={() => {
              if (isLastExercise) {
                saveWorkout();
                return;
              }
              goTo(index + 1);
            }}
          >
            {isLastExercise ? (
              "Finish workout"
            ) : (
              <span className="flex items-center gap-2">
                Next exercise
                <ChevronRight size={20} />
              </span>
            )}
          </Button>
        </div>
        {!isLastExercise && (
          <Button variant="secondary" className="w-full" onClick={saveWorkout}>
            Finish workout
          </Button>
        )}
      </div>

      {rest !== null && (
        <div className="animate-rest-in fixed inset-0 z-50 flex flex-col bg-zinc-950 px-6 pt-16 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <p className="text-center text-sm uppercase tracking-[0.2em] text-blue-300">
            Rest
          </p>
          <div className="flex flex-1 flex-col items-center justify-center">
            <p className="font-mono text-[6.5rem] font-bold leading-none text-blue-400">
              {formatClock(rest)}
            </p>
            <p className="mt-6 text-center text-xl text-zinc-200">
              {exercise.name}
            </p>
            <p className="mt-1 text-zinc-500">
              Set {Math.min(completedSets + 1, logs.length)} of {logs.length} next
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              className="h-14"
              onClick={() => setRest(null)}
            >
              Skip rest
            </Button>
            <Button
              variant="secondary"
              className="h-14"
              onClick={() => setRest(value => (value ?? 0) + 15)}
            >
              +15s
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
