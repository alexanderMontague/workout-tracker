import type { Workout, CompletedWorkout } from "../../types";
import type { StorageAdapter } from "../storage/types";

export class WorkoutRepository {
  private static TEMPLATES_KEY = "workout-templates";
  private static COMPLETED_KEY = "completed-workouts";

  constructor(private storage: StorageAdapter) {}

  // Template methods
  async getAllTemplates(): Promise<Workout[]> {
    const templates = await this.storage.getItem<Workout[]>(
      WorkoutRepository.TEMPLATES_KEY
    );
    return templates || [];
  }

  async saveTemplate(workout: Workout): Promise<void> {
    const templates = await this.getAllTemplates();
    const existingIndex = templates.findIndex(w => w.id === workout.id);

    if (existingIndex >= 0) {
      templates[existingIndex] = workout;
    } else {
      templates.push(workout);
    }

    await this.storage.setItem(WorkoutRepository.TEMPLATES_KEY, templates);
  }

  async setAllTemplates(templates: Workout[]): Promise<void> {
    await this.storage.setItem(WorkoutRepository.TEMPLATES_KEY, templates);
  }

  async deleteTemplate(id: string): Promise<void> {
    const templates = await this.getAllTemplates();
    const filtered = templates.filter(w => w.id !== id);
    await this.storage.setItem(WorkoutRepository.TEMPLATES_KEY, filtered);
  }

  // Completed workout methods
  async getAllCompleted(): Promise<CompletedWorkout[]> {
    const completed = await this.storage.getItem<CompletedWorkout[]>(
      WorkoutRepository.COMPLETED_KEY
    );
    return completed || [];
  }

  async saveCompleted(workout: CompletedWorkout): Promise<void> {
    const completed = await this.getAllCompleted();
    completed.push(workout);
    await this.storage.setItem(WorkoutRepository.COMPLETED_KEY, completed);
  }

  // Import/Export methods
  async import(data: { templates: Workout[]; completed: CompletedWorkout[] }) {
    await this.storage.setItem(WorkoutRepository.TEMPLATES_KEY, data.templates);
    await this.storage.setItem(WorkoutRepository.COMPLETED_KEY, data.completed);
  }

  async clearTemplates(): Promise<void> {
    await this.storage.removeItem(WorkoutRepository.TEMPLATES_KEY);
  }

  async clearCompleted(): Promise<void> {
    await this.storage.removeItem(WorkoutRepository.COMPLETED_KEY);
  }

  async getNextWorkout(): Promise<Workout | null> {
    const templates = await this.getAllTemplates();
    if (templates.length === 0) return null;

    const completed = await this.getAllCompleted();
    if (completed.length === 0) return templates[0];

    const lastCompleted = completed[completed.length - 1];
    const currentIndex = templates.findIndex(
      t => t.id === lastCompleted.templateId
    );

    // Get next workout, wrapping around to beginning if needed
    const nextIndex = (currentIndex + 1) % templates.length;
    return templates[nextIndex];
  }
}
