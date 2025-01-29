import { useState } from "react";
import { Layout, Card } from "./components";
import { HomeScreen } from "./screens/HomeScreen";
import { AddWorkoutScreen } from "./screens/AddWorkoutScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { ActiveWorkoutScreen } from "./screens/ActiveWorkoutScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { Tabs, type Exercise, type Workout } from "./types";
import { useWorkouts } from "./hooks/useWorkouts";

function App() {
  const { addWorkout, updateWorkout, deleteWorkout, completeWorkout } =
    useWorkouts();

  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.home);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);

  const handleAddWorkout = async (workout: {
    name: string;
    exercises: Exercise[];
  }) => {
    const success = await addWorkout(workout);
    if (success) {
      setIsAddingWorkout(false);
    }
  };

  const handleUpdateWorkout = async (workout: {
    name: string;
    exercises: Exercise[];
  }) => {
    if (!editingWorkout) return;

    const success = await updateWorkout(editingWorkout.id, workout);
    if (success) {
      setEditingWorkout(null);
      setIsAddingWorkout(false);
    }
  };

  const handleCompleteWorkout = async (workout: Workout) => {
    const success = await completeWorkout(workout);
    if (success) {
      setActiveWorkout(null);
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
              onAddWorkout={() => setIsAddingWorkout(true)}
              onStartWorkout={setActiveWorkout}
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
              onEditWorkout={workout => {
                setEditingWorkout(workout);
                setIsAddingWorkout(true);
              }}
              onDeleteWorkout={deleteWorkout}
            />
          )}
        </>
      )}
    </Layout>
  );
}

export default App;
