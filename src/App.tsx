import { useState } from "react";
import { Layout } from "./components";
import { HomeScreen } from "./screens/HomeScreen";
import { AddWorkoutScreen } from "./screens/AddWorkoutScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { ActiveWorkoutScreen } from "./screens/ActiveWorkoutScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { ProgressScreen } from "./screens/ProgressScreen";
import { Tabs, type Exercise, type Workout } from "./types";
import { useWorkouts } from "./hooks/useWorkouts";

function App() {
  const { addWorkout, updateWorkout, completeWorkout } = useWorkouts();

  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.home);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);

  const handleAddWorkout = async (workout: {
    name: string;
    exercises: Exercise[];
  }) => {
    await addWorkout(workout);
    setEditingWorkout(null);
    setIsAddingWorkout(false);
  };

  const handleUpdateWorkout = async (workout: {
    name: string;
    exercises: Exercise[];
  }) => {
    if (!editingWorkout) return;

    await updateWorkout(editingWorkout.id, workout);
    setEditingWorkout(null);
    setIsAddingWorkout(false);
  };

  const handleCompleteWorkout = async (workout: Workout) => {
    await completeWorkout(workout);
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
            setEditingWorkout(null);
            setIsAddingWorkout(false);
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

          {activeTab === Tabs.progress && <ProgressScreen />}

          {activeTab === Tabs.settings && (
            <SettingsScreen
              onEditWorkout={workout => {
                setEditingWorkout(workout);
                setIsAddingWorkout(true);
              }}
            />
          )}
        </>
      )}
    </Layout>
  );
}

export default App;
