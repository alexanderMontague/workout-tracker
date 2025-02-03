import { useCallback, useEffect, useState } from "react";
import { StorageService } from "../lib/services/storage-service";
import type { Workout, Exercise, CompletedWorkout } from "../types";
import { v4 as uuid } from "uuid";
import { STRETCH_TEMPLATE_ID } from "../types";

export function useWorkouts() {
  const [templates, setTemplates] = useState<Workout[]>([]);
  const [completedWorkouts, setCompletedWorkouts] = useState<
    CompletedWorkout[]
  >([]);
  const [nextWorkout, setNextWorkout] = useState<Workout | null>(null);
  const storage = StorageService.getInstance();

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
  }, [storage.workouts]);

  const addWorkout = useCallback(
    async ({ name, exercises }: { name: string; exercises: Exercise[] }) => {
      const newWorkout: Workout = {
        id: uuid(),
        name,
        exercises,
      };

      try {
        await storage.workouts.saveTemplate(newWorkout);
        await loadTemplates();
      } catch (error) {
        console.error("Failed to save workout:", error);
      }
    },
    [storage.workouts, loadTemplates]
  );

  const updateWorkout = useCallback(
    async (
      id: string,
      { name, exercises }: { name: string; exercises: Exercise[] }
    ) => {
      const workoutToUpdate = templates.find(w => w.id === id);
      if (!workoutToUpdate) return;

      const updatedWorkout = { ...workoutToUpdate, name, exercises };

      try {
        await storage.workouts.saveTemplate(updatedWorkout);
        await loadTemplates();
      } catch (error) {
        console.error("Failed to update workout:", error);
      }
    },
    [templates, storage.workouts, loadTemplates]
  );

  const deleteWorkout = useCallback(
    async (id: string) => {
      try {
        await storage.workouts.deleteTemplate(id);
        await loadTemplates();
      } catch (error) {
        console.error("Failed to delete workout:", error);
      }
    },
    [storage.workouts, loadTemplates]
  );

  const completeWorkout = useCallback(
    async (workout: Workout) => {
      const completedWorkout: CompletedWorkout = {
        ...workout,
        id: uuid(),
        templateId: workout.id,
        completedAt: new Date().toISOString(),
      };

      try {
        await storage.workouts.saveCompleted(completedWorkout);
        await loadTemplates();
      } catch (error) {
        console.error("Failed to save completed workout:", error);
      }
    },
    [storage.workouts, loadTemplates]
  );

  const completeStretch = useCallback(
    async ({ duration, notes }: { duration: number; notes: string }) => {
      const completedStretch: CompletedWorkout = {
        id: uuid(),
        templateId: STRETCH_TEMPLATE_ID,
        name: "Stretch Session",
        exercises: [],
        completedAt: new Date().toISOString(),
        duration,
        notes,
      };

      try {
        await storage.workouts.saveCompleted(completedStretch);
        await loadTemplates();
      } catch (error) {
        console.error("Failed to save completed stretch:", error);
      }
    },
    [storage.workouts, loadTemplates]
  );

  const updateTemplateOrder = async (newOrder: Workout[]) => {
    await storage.workouts.setAllTemplates(newOrder);
    const nextWorkout = await storage.workouts.getNextWorkout();
    setTemplates(newOrder);
    setNextWorkout(nextWorkout);
  };

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    templates,
    completedWorkouts,
    nextWorkout,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    completeWorkout,
    loadTemplates,
    updateTemplateOrder,
    completeStretch,
  };
}
