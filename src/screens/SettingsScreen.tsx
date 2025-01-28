import { Card, Button } from "../components";
import { Edit2, Trash2 } from "lucide-react";
import type { Workout } from "../types";
import { StorageService } from "../lib/services/storage-service";

interface SettingsScreenProps {
  workouts: Workout[];
  onEditWorkout: (workout: Workout) => void;
  onDeleteWorkout: (id: string) => void;
  loadWorkouts: () => void;
}

export function SettingsScreen({
  workouts,
  onEditWorkout,
  onDeleteWorkout,
  loadWorkouts,
}: SettingsScreenProps) {
  const storage = StorageService.getInstance();

  const handleClearStorage = async () => {
    await storage.workouts.clear();
    loadWorkouts();
  };

  const handleExportStorage = async () => {
    const templates = await storage.workouts.getAllTemplates();
    const completed = await storage.workouts.getAllCompleted();
    const data = JSON.stringify({ templates, completed }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "workouts.json";
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
        loadWorkouts();
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
        {workouts.length === 0 ? (
          <Card>
            <p className="text-zinc-400">No workouts created yet</p>
          </Card>
        ) : (
          workouts.map(workout => (
            <Card key={workout.id} className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{workout.name}</h3>
                  <p className="text-sm text-zinc-400">
                    {workout.exercises.length} exercise
                    {workout.exercises.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditWorkout(workout)}
                  >
                    <Edit2 size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (
                        confirm("Are you sure you want to delete this workout?")
                      ) {
                        onDeleteWorkout(workout.id);
                      }
                    }}
                  >
                    <Trash2 size={18} className="text-red-400" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1 text-sm text-zinc-400">
                {workout.exercises.map(exercise => (
                  <div key={exercise.id}>
                    <p>
                      • {exercise.name}: {exercise.sets}x{exercise.reps} @{" "}
                      {exercise.weight}lbs
                    </p>
                    {exercise.notes && (
                      <p className="ml-4 text-xs text-zinc-500">
                        {exercise.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))
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
          onClick={handleClearStorage}
        >
          Clear LocalStorage
        </Button>
      </div>
    </div>
  );
}
