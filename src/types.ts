export enum Tabs {
  home = "home",
  history = "history",
  progress = "progress",
  settings = "settings",
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number | "";
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  notes?: string;
  completed?: boolean;
  completedAt?: string;
}

export interface WeighIn {
  id: string;
  weight: number;
  date: string;
  notes?: string;
}
