import { LocalStorageAdapter } from "../storage/local-storage";
import { WorkoutRepository } from "../repositories/workout-repository";

export class StorageService {
  private static instance: StorageService;
  public workouts: WorkoutRepository;

  private constructor() {
    const storage = new LocalStorageAdapter({ namespace: "workout-tracker" });
    this.workouts = new WorkoutRepository(storage);
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }
}
