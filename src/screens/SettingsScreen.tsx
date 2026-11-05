import { Button } from "../components";
import { StorageService } from "../lib/services/storage-service";
import { useWorkouts } from "../hooks/useWorkouts";

export function SettingsScreen() {
  const { templates, completedWorkouts, loadTemplates } = useWorkouts();
  const storage = StorageService.getInstance();

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
        <p className="text-zinc-400">Backup and reset your data</p>
      </div>

      <div className="space-y-4">
        <Button
          variant="primary"
          className="w-full"
          onClick={handleExportStorage}
        >
          Export Workout Data
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleImportStorage}
        >
          Import Workout Data
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
          onClick={() => {
            if (confirm("This will delete all workouts and history. Continue?")) {
              handleClearStorage("all");
            }
          }}
        >
          Clear All LocalStorage
        </Button>
      </div>
    </div>
  );
}
