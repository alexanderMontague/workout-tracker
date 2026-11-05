export enum Tabs {
  home = "home",
  history = "history",
  progress = "progress",
  settings = "settings",
}

export type ExerciseTracking = "reps" | "time";
export type WorkoutSessionMode = "live" | "log" | "edit";

export interface SetLog {
  weight: number | "";
  reps: number | "";
  durationSeconds?: number | "";
  completed: boolean;
}

// Base types for workout templates
export interface Exercise {
  id: string;
  name: string;
  tracking?: ExerciseTracking;
  sets: number | "";
  reps: number | "";
  durationSeconds?: number | "";
  weight: number | "";
  completed?: boolean;
  notes?: string;
  setLogs?: SetLog[];
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  notes?: string;
}

export interface CompletedWorkout extends Workout {
  templateId: string;
  completedAt: string;
  duration?: number;
}

export const STRETCH_TEMPLATE_ID = "stretch-template";
