import { Card, Button, SortableWorkoutCard } from "../components";
import type { Workout } from "../types";
import { StorageService } from "../lib/services/storage-service";
import { useWorkouts } from "../hooks/useWorkouts";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {} from "../components/SortableWorkoutCard";

export interface SettingsScreenProps {
  onEditWorkout: (workout: Workout) => void;
}

export function SettingsScreen({ onEditWorkout }: SettingsScreenProps) {
  const {
    templates,
    completedWorkouts,
    nextWorkout,
    loadTemplates,
    deleteWorkout,
    updateTemplateOrder,
  } = useWorkouts();
  const storage = StorageService.getInstance();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = templates.findIndex(w => w.id === active.id);
      const newIndex = templates.findIndex(w => w.id === over.id);

      const newOrder = arrayMove(templates, oldIndex, newIndex);
      updateTemplateOrder(newOrder);
    }
  };

  const handleClearStorage = async (type: "all" | "completed") => {
    if (type === "completed") {
      await storage.workouts.clearCompleted();
    } else if (type === "all") {
      await storage.workouts.clearTemplates();
      await storage.workouts.clearCompleted();
    }

    loadTemplates();
  };

  const handleExportStorage = async () => {
    const data = JSON.stringify(
      { templates, completed: completedWorkouts },
      null,
      2
    );
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `workouts-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportStorage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.onchange = async e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        // Validate the imported data structure
        if (
          !data.templates ||
          !Array.isArray(data.templates) ||
          !data.completed ||
          !Array.isArray(data.completed)
        ) {
          throw new Error("Invalid data format");
        }

        await storage.workouts.import(data);
        loadTemplates();
      } catch (error) {
        console.error("Import error:", error);
        alert("Failed to import workouts. Invalid file format.");
      }
    };

    input.click();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-zinc-400">Manage your workouts and preferences</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Your Workouts</h2>
        {templates.length === 0 ? (
          <Card>
            <p className="text-zinc-400">No workouts created yet</p>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={templates.map(w => w.id)}
              strategy={verticalListSortingStrategy}
            >
              {templates.map(workout => (
                <SortableWorkoutCard
                  key={workout.id}
                  workout={workout}
                  onEdit={onEditWorkout}
                  onDelete={deleteWorkout}
                  isNextWorkout={nextWorkout?.id === workout.id}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Debug</h2>
        <Button
          variant="primary"
          className="w-full"
          onClick={handleExportStorage}
        >
          Export LocalStorage
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleImportStorage}
        >
          Import LocalStorage
        </Button>
        <Button
          variant="critical"
          className="w-full"
          onClick={() => handleClearStorage("completed")}
        >
          Clear Completed Workouts
        </Button>
        <Button
          variant="critical"
          className="w-full"
          onClick={() => handleClearStorage("all")}
        >
          Clear All LocalStorage
        </Button>
      </div>
    </div>
  );
}
