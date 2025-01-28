import { useState } from "react";
import { Layout, Card } from "./components";
import { HomeScreen } from "./screens/HomeScreen";
import { AddWorkoutScreen } from "./screens/AddWorkoutScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { ActiveWorkoutScreen } from "./screens/ActiveWorkoutScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import {
  Tabs,
  type Exercise,
  type Workout,
  type CompletedWorkout,
} from "./types";
import { StorageService } from "./lib/services/storage-service";
import { v4 as uuid } from "uuid";
import { useWorkouts } from "./hooks/useWorkouts";

function App() {
  const { templates: savedTemplates } = useWorkouts();

  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.home);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [templates, setTemplates] = useState<Workout[]>(savedTemplates);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const storage = StorageService.getInstance();

  const handleAddWorkout = async ({
    name,
    exercises,
  }: {
    name: string;
    exercises: Exercise[];
  }) => {
    const newWorkout: Workout = {
      id: uuid(),
      name,
      exercises,
    };

    try {
      await storage.workouts.saveTemplate(newWorkout);
      setTemplates([...templates, newWorkout]);
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
      await storage.workouts.saveTemplate(updatedWorkout);
      setTemplates(
        templates.map(w => (w.id === editingWorkout.id ? updatedWorkout : w))
      );
      setEditingWorkout(null);
      setIsAddingWorkout(false);
    } catch (error) {
      console.error("Failed to update workout:", error);
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    try {
      await storage.workouts.deleteTemplate(id);
      setTemplates(templates.filter(w => w.id !== id));
    } catch (error) {
      console.error("Failed to delete workout:", error);
    }
  };

  const handleStartWorkout = (workout: Workout) => {
    setActiveWorkout(workout);
  };

  const handleCompleteWorkout = async (workout: Workout) => {
    const completedWorkout: CompletedWorkout = {
      ...workout,
      id: uuid(),
      completedAt: new Date().toISOString(),
    };

    try {
      await storage.workouts.saveCompleted(completedWorkout);
    } catch (error) {
      console.error("Failed to save completed workout:", error);
    }
    setActiveWorkout(null);
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
              workouts={templates}
              onAddWorkout={() => setIsAddingWorkout(true)}
              onStartWorkout={handleStartWorkout}
            />
          )}

          {activeTab === Tabs.history && <HistoryScreen />}

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
              workouts={templates}
              onEditWorkout={handleEditWorkout}
              onDeleteWorkout={handleDeleteWorkout}
              loadWorkouts={loadWorkouts}
            />
          )}
        </>
      )}
    </Layout>
  );
}

export default App;
