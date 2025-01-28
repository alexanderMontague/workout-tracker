import { useCallback, useEffect, useState } from "react";
import { StorageService } from "../lib/services/storage-service";
import { CompletedWorkout } from "../types";
import { Workout } from "../types";

export function useWorkouts() {
  const [templates, setTemplates] = useState<Workout[]>([]);
  const [completedWorkouts, setCompletedWorkouts] = useState<
    CompletedWorkout[]
  >([]);

  const loadWorkouts = useCallback(async () => {
    try {
      const storage = StorageService.getInstance();
      const savedTemplates = await storage.workouts.getAllTemplates();
      const savedCompletedWorkouts = await storage.workouts.getAllCompleted();
      setTemplates(savedTemplates);
      setCompletedWorkouts(savedCompletedWorkouts);
    } catch (error) {
      console.error("Failed to load workouts:", error);
    }
  }, []);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  return { templates, completedWorkouts };
}
