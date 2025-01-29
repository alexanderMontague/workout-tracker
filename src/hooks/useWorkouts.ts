import { useCallback, useEffect, useState } from "react";
import { StorageService } from "../lib/services/storage-service";
import type { Workout, Exercise, CompletedWorkout } from "../types";
import { v4 as uuid } from "uuid";

export function useWorkouts() {
  const [templates, setTemplates] = useState<Workout[]>([]);
  const [completedWorkouts, setCompletedWorkouts] = useState<
    CompletedWorkout[]
  >([]);
  const [nextWorkout, setNextWorkout] = useState<Workout | null>(null);
  const storage = StorageService.getInstance();

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      const savedTemplates = await storage.workouts.getAllTemplates();
      const savedCompletedWorkouts = await storage.workouts.getAllCompleted();
      const nextWorkout = await storage.workouts.getNextWorkout();
      setTemplates(savedTemplates);
      setCompletedWorkouts(savedCompletedWorkouts);
      setNextWorkout(nextWorkout);
    } catch (error) {
      console.error("Failed to load workout data:", error);
    }
  }, []);

  const addWorkout = useCallback(
    async ({ name, exercises }: { name: string; exercises: Exercise[] }) => {
      const newWorkout: Workout = {
        id: uuid(),
        name,
        exercises,
      };

      try {
        await storage.workouts.saveTemplate(newWorkout);
        setTemplates(prev => [...prev, newWorkout]);
        return true;
      } catch (error) {
        console.error("Failed to save workout:", error);
        return false;
      }
    },
    []
  );

  const updateWorkout = useCallback(
    async (
      id: string,
      { name, exercises }: { name: string; exercises: Exercise[] }
    ) => {
      const workoutToUpdate = templates.find(w => w.id === id);
      if (!workoutToUpdate) return false;

      const updatedWorkout = { ...workoutToUpdate, name, exercises };

      try {
        await storage.workouts.saveTemplate(updatedWorkout);
        setTemplates(prev => prev.map(w => (w.id === id ? updatedWorkout : w)));
        return true;
      } catch (error) {
        console.error("Failed to update workout:", error);
        return false;
      }
    },
    [templates]
  );

  const deleteWorkout = useCallback(async (id: string) => {
    try {
      await storage.workouts.deleteTemplate(id);
      setTemplates(prev => prev.filter(w => w.id !== id));
      return true;
    } catch (error) {
      console.error("Failed to delete workout:", error);
      return false;
    }
  }, []);

  const completeWorkout = useCallback(async (workout: Workout) => {
    const completedWorkout: CompletedWorkout = {
      ...workout,
      id: uuid(),
      templateId: workout.id,
      completedAt: new Date().toISOString(),
    };

    try {
      await storage.workouts.saveCompleted(completedWorkout);
      const nextWorkout = await storage.workouts.getNextWorkout();
      setNextWorkout(nextWorkout);
      return true;
    } catch (error) {
      console.error("Failed to save completed workout:", error);
      return false;
    }
  }, []);

  return {
    templates,
    completedWorkouts,
    nextWorkout,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    completeWorkout,
    loadTemplates,
  };
}
