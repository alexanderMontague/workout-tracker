import { useState, useEffect } from "react";
import { Layout, Card } from "./components";
import { HomeScreen } from "./screens/HomeScreen";
import { AddWorkoutScreen } from "./screens/AddWorkoutScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { ActiveWorkoutScreen } from "./screens/ActiveWorkoutScreen";
import { Tabs, type Exercise, type Workout } from "./types";
import { StorageService } from "./lib/services/storage-service";

function App() {
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.home);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const storage = StorageService.getInstance();

  // Load workouts on mount
  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const savedWorkouts = await storage.workouts.getAll();
        setWorkouts(savedWorkouts);
      } catch (error) {
        console.error("Failed to load workouts:", error);
      }
    };
    loadWorkouts();
  }, [storage.workouts]);

  const handleAddWorkout = async ({
    name,
    exercises,
  }: {
    name: string;
    exercises: Exercise[];
  }) => {
    const newWorkout: Workout = {
      id: crypto.randomUUID(),
      name,
      exercises,
    };

    try {
      await storage.workouts.save(newWorkout);
      setWorkouts([...workouts, newWorkout]);
      setIsAddingWorkout(false);
    } catch (error) {
      console.error("Failed to save workout:", error);
    }
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setIsAddingWorkout(true);
  };

  const handleUpdateWorkout = async ({
    name,
    exercises,
  }: {
    name: string;
    exercises: Exercise[];
  }) => {
    if (!editingWorkout) return;

    const updatedWorkout = { ...editingWorkout, name, exercises };

    try {
      await storage.workouts.save(updatedWorkout);
      setWorkouts(
        workouts.map(w => (w.id === editingWorkout.id ? updatedWorkout : w))
      );
      setEditingWorkout(null);
      setIsAddingWorkout(false);
    } catch (error) {
      console.error("Failed to update workout:", error);
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    try {
      await storage.workouts.delete(id);
      setWorkouts(workouts.filter(w => w.id !== id));
    } catch (error) {
      console.error("Failed to delete workout:", error);
    }
  };

  const handleStartWorkout = (workout: Workout) => {
    setActiveWorkout(workout);
  };

  const handleCompleteWorkout = async (workout: Workout) => {
    try {
      await storage.workouts.save(workout);
      setWorkouts(workouts.map(w => (w.id === workout.id ? workout : w)));
      setActiveWorkout(null);
    } catch (error) {
      console.error("Failed to save completed workout:", error);
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeWorkout ? (
        <ActiveWorkoutScreen
          workout={activeWorkout}
          onComplete={handleCompleteWorkout}
          onCancel={() => setActiveWorkout(null)}
        />
      ) : isAddingWorkout ? (
        <AddWorkoutScreen
          workout={editingWorkout}
          onClose={() => {
            setIsAddingWorkout(false);
            setEditingWorkout(null);
          }}
          onSave={editingWorkout ? handleUpdateWorkout : handleAddWorkout}
        />
      ) : (
        <>
          {activeTab === Tabs.home && (
            <HomeScreen
              workouts={workouts}
              onAddWorkout={() => setIsAddingWorkout(true)}
              onStartWorkout={handleStartWorkout}
            />
          )}

          {activeTab === Tabs.history && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">History</h1>
              <Card>
                <p className="text-zinc-400">No workouts completed yet</p>
              </Card>
            </div>
          )}

          {activeTab === Tabs.progress && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Progress</h1>
              <Card>
                <p className="text-zinc-400">
                  Start working out to see your progress
                </p>
              </Card>
            </div>
          )}

          {activeTab === Tabs.settings && (
            <SettingsScreen
              workouts={workouts}
              onEditWorkout={handleEditWorkout}
              onDeleteWorkout={handleDeleteWorkout}
            />
          )}
        </>
      )}
    </Layout>
  );
}

export default App;
