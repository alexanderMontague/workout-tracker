import { useState } from "react";
import { Layout } from "./components";
import { HomeScreen } from "./screens/HomeScreen";
import { AddWorkoutScreen } from "./screens/AddWorkoutScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { ActiveWorkoutScreen } from "./screens/ActiveWorkoutScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { ProgressScreen } from "./screens/ProgressScreen";
import {
  Tabs,
  type CompletedWorkout,
  type Exercise,
  type Workout,
  type WorkoutSessionMode,
} from "./types";
import { useWorkouts } from "./hooks/useWorkouts";

interface WorkoutSession {
  mode: WorkoutSessionMode;
  workout: Workout | CompletedWorkout;
}

function App() {
  const {
    addWorkout,
    updateWorkout,
    completeWorkout,
    updateCompletedWorkout,
    deleteCompletedWorkout,
    completedWorkouts,
  } = useWorkouts();

  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.home);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [session, setSession] = useState<WorkoutSession | null>(null);

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

  const handleSaveSession = async (result: {
    exercises: Exercise[];
    duration?: number;
    completedAt?: string;
    notes?: string;
  }) => {
    if (!session) return;

    if (session.mode === "edit") {
      const existing = session.workout as CompletedWorkout;
      await updateCompletedWorkout({
        ...existing,
        exercises: result.exercises,
        completedAt: result.completedAt ?? existing.completedAt,
        duration: result.duration ?? existing.duration,
        notes: result.notes,
      });
    } else {
      await completeWorkout(
        {
          ...session.workout,
          exercises: result.exercises,
          notes: result.notes,
        },
        {
          duration: result.duration,
          completedAt: result.completedAt,
          notes: result.notes,
        }
      );
    }

    setSession(null);
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      hideNav={!!session}
    >
      {session ? (
        <ActiveWorkoutScreen
          workout={session.workout}
          mode={session.mode}
          completedWorkouts={completedWorkouts}
          onComplete={handleSaveSession}
          onCancel={() => setSession(null)}
          onDelete={
            session.mode === "edit"
              ? async () => {
                  await deleteCompletedWorkout(session.workout.id);
                  setSession(null);
                }
              : undefined
          }
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
              onEditWorkout={workout => {
                setEditingWorkout(workout);
                setIsAddingWorkout(true);
              }}
              onStartWorkout={(workout, mode) =>
                setSession({ workout, mode })
              }
            />
          )}

          {activeTab === Tabs.history && (
            <HistoryScreen
              onEditWorkout={workout =>
                setSession({ workout, mode: "edit" })
              }
            />
          )}

          {activeTab === Tabs.progress && <ProgressScreen />}

          {activeTab === Tabs.settings && <SettingsScreen />}
        </>
      )}
    </Layout>
  );
}

export default App;
