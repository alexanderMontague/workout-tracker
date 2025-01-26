import type { Workout } from "../../types";
import type { StorageAdapter } from "../storage/types";

export class WorkoutRepository {
  private static STORAGE_KEY = "workouts";

  constructor(private storage: StorageAdapter) {}

  async getAll(): Promise<Workout[]> {
    const workouts = await this.storage.getItem<Workout[]>(
      WorkoutRepository.STORAGE_KEY
    );
    return workouts || [];
  }

  async save(workout: Workout): Promise<void> {
    const workouts = await this.getAll();
    const existingIndex = workouts.findIndex(w => w.id === workout.id);

    if (existingIndex >= 0) {
      workouts[existingIndex] = workout;
    } else {
      workouts.push(workout);
    }

    await this.storage.setItem(WorkoutRepository.STORAGE_KEY, workouts);
  }

  async delete(id: string): Promise<void> {
    const workouts = await this.getAll();
    const filtered = workouts.filter(w => w.id !== id);
    await this.storage.setItem(WorkoutRepository.STORAGE_KEY, filtered);
  }

  async clear(): Promise<void> {
    await this.storage.removeItem(WorkoutRepository.STORAGE_KEY);
  }
}
