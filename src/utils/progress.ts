import type { CompletedWorkout, Exercise } from "../types";
import {
  formatExerciseSummary,
  formatHold,
  isTimedExercise,
} from "./exercise";

export type ProgressMetric = "weight" | "hold" | "reps";

export interface ExercisePoint {
  date: string;
  value: number;
  summary: string;
}

export interface ExerciseProgress {
  name: string;
  metric: ProgressMetric;
  points: ExercisePoint[];
  latest: Exercise;
  previous: Exercise | null;
  best: Exercise;
}

export function isLoggedExercise(exercise: Exercise): boolean {
  return exercise.completed !== false && exercise.name.trim() !== "";
}

export function metricForExercises(exercises: Exercise[]): ProgressMetric {
  const logged = exercises.filter(isLoggedExercise);
  if (logged.length === 0) return "reps";
  if (logged.every(isTimedExercise)) return "hold";
  if (logged.some(exercise => Number(exercise.weight) > 0)) return "weight";
  return "reps";
}

export function valueForExercise(
  exercise: Exercise,
  metric: ProgressMetric
): number {
  if (metric === "hold") return Number(exercise.durationSeconds) || 0;
  if (metric === "weight") return Number(exercise.weight) || 0;
  return (Number(exercise.sets) || 0) * (Number(exercise.reps) || 0);
}

function signedCount(diff: number, label: string): string {
  const sign = diff > 0 ? "+" : "-";
  return `${sign}${Math.abs(diff)} ${label}`;
}

export function formatSessionChange(
  current: Exercise,
  previous: Exercise
): string {
  const parts: string[] = [];
  const weight = (Number(current.weight) || 0) - (Number(previous.weight) || 0);
  const reps = (Number(current.reps) || 0) - (Number(previous.reps) || 0);
  const sets = (Number(current.sets) || 0) - (Number(previous.sets) || 0);
  const hold =
    (Number(current.durationSeconds) || 0) -
    (Number(previous.durationSeconds) || 0);

  if (isTimedExercise(current) || isTimedExercise(previous)) {
    if (hold) {
      const sign = hold > 0 ? "+" : "-";
      parts.push(`${sign}${formatHold(Math.abs(hold))}`);
    }
    if (sets) parts.push(signedCount(sets, sets === 1 || sets === -1 ? "set" : "sets"));
    if (weight) parts.push(signedCount(weight, "lbs"));
  } else {
    if (weight) parts.push(signedCount(weight, "lbs"));
    if (reps) parts.push(signedCount(reps, reps === 1 || reps === -1 ? "rep" : "reps"));
    if (sets) parts.push(signedCount(sets, sets === 1 || sets === -1 ? "set" : "sets"));
  }

  return parts.length ? `${parts.join(", ")} from last time` : "same as last time";
}

export function chartLabel(metric: ProgressMetric): string {
  if (metric === "hold") return "Hold time";
  if (metric === "weight") return "Weight";
  return "Total reps";
}

function sessionScore(exercise: Exercise, metric: ProgressMetric): number {
  const sets = Number(exercise.sets) || 0;
  const reps = Number(exercise.reps) || 0;
  const weight = Number(exercise.weight) || 0;
  const hold = Number(exercise.durationSeconds) || 0;

  if (metric === "hold") return hold * 1000 + sets;
  if (metric === "weight") return weight * 1_000_000 + reps * 1000 + sets;
  return sets * reps;
}

export function lastSevenDays(completedWorkouts: CompletedWorkout[]) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const count = completedWorkouts.filter(workout => {
      const completed = new Date(workout.completedAt);
      completed.setHours(0, 0, 0, 0);
      return completed.getTime() === date.getTime();
    }).length;

    return {
      key: date.toISOString(),
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      count,
    };
  });
}

export function buildExerciseProgress(
  completedWorkouts: CompletedWorkout[]
): ExerciseProgress[] {
  const grouped = new Map<string, Exercise[]>();
  const dates = new Map<string, string[]>();

  [...completedWorkouts]
    .sort(
      (a, b) =>
        new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    )
    .forEach(workout => {
      workout.exercises.filter(isLoggedExercise).forEach(exercise => {
        const name = exercise.name.trim();
        const list = grouped.get(name) ?? [];
        list.push(exercise);
        grouped.set(name, list);

        const dateList = dates.get(name) ?? [];
        dateList.push(workout.completedAt);
        dates.set(name, dateList);
      });
    });

  return [...grouped.entries()]
    .map(([name, exercises]) => {
      const metric = metricForExercises(exercises);
      const sessionDates = dates.get(name) ?? [];
      const points = exercises.map((exercise, index) => ({
        date: sessionDates[index],
        value: valueForExercise(exercise, metric),
        summary: formatExerciseSummary(exercise),
      }));
      const best = exercises.reduce((winner, exercise) =>
        sessionScore(exercise, metric) > sessionScore(winner, metric)
          ? exercise
          : winner
      );

      return {
        name,
        metric,
        points,
        latest: exercises[exercises.length - 1],
        previous: exercises.length > 1 ? exercises[exercises.length - 2] : null,
        best,
      };
    })
    .sort((a, b) => {
      const aDate = a.points[a.points.length - 1]?.date ?? "";
      const bDate = b.points[b.points.length - 1]?.date ?? "";
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
}
