import type { Exercise } from "../types";

export function isTimedExercise(exercise: Pick<Exercise, "tracking">): boolean {
  return exercise.tracking === "time";
}

export function formatHold(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return remaining === 0 ? `${minutes}m` : `${minutes}m ${remaining}s`;
}

export function formatClock(seconds: number): string {
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

function formatWeight(weight: Exercise["weight"]): string {
  return typeof weight === "number" && weight > 0 ? ` @ ${weight}lbs` : "";
}

export function parseNumberInput(value: string): number | "" {
  const cleaned = value.replace(/[^0-9]/g, "");
  if (cleaned === "") return "";
  const parsed = parseInt(cleaned, 10);
  return Number.isNaN(parsed) ? "" : parsed;
}

export function formatExerciseSummary(exercise: Exercise): string {
  const sets = exercise.sets || 0;

  if (isTimedExercise(exercise)) {
    const hold =
      typeof exercise.durationSeconds === "number"
        ? exercise.durationSeconds
        : 0;
    return `${sets}×${formatHold(hold)} hold${formatWeight(exercise.weight)}`;
  }

  return `${sets}x${exercise.reps}${formatWeight(exercise.weight)}`;
}
