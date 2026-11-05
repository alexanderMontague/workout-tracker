import type { Exercise, SetLog } from "../types";
import { isTimedExercise } from "./exercise";
import type { LastPerformance } from "./progress";

export function buildSetLogs(
  exercise: Exercise,
  last?: LastPerformance
): SetLog[] {
  if (exercise.setLogs?.length) {
    return exercise.setLogs.map(log => ({ ...log }));
  }

  const count = Math.max(1, Number(exercise.sets) || 3);
  const source = last?.exercise ?? exercise;

  return Array.from({ length: count }, () => ({
    weight: source.weight ?? 0,
    reps: source.reps ?? 0,
    durationSeconds: source.durationSeconds ?? exercise.durationSeconds ?? 30,
    completed: false,
  }));
}

export function collapseSetLogs(
  exercise: Exercise,
  logs: SetLog[]
): Exercise {
  const done = logs.filter(log => log.completed);
  const source = done[done.length - 1] ?? logs[logs.length - 1];
  const timed = isTimedExercise(exercise);

  return {
    ...exercise,
    sets: done.length || logs.length,
    reps: timed ? exercise.reps : source?.reps ?? exercise.reps,
    weight: source?.weight ?? exercise.weight,
    durationSeconds: timed
      ? source?.durationSeconds ?? exercise.durationSeconds
      : exercise.durationSeconds,
    setLogs: logs,
    completed: done.length > 0,
  };
}
