export enum Tabs {
  home = "home",
  history = "history",
  progress = "progress",
  settings = "settings",
}

// Base types for workout templates
export interface Exercise {
  id: string;
  name: string;
  sets: number | "";
  reps: number | "";
  weight: number | "";
  completed?: boolean;
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  notes?: string;
}

export interface CompletedWorkout extends Workout {
  completedAt: string;
}

export interface WeighIn {
  id: string;
  weight: number;
  date: string;
  notes?: string;
}
