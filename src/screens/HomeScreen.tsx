import { Card, Button, SortableWorkoutCard } from "../components";
import { Plus, AlarmClock } from "lucide-react";
import type { Workout } from "../types";
import { useWorkouts } from "../hooks/useWorkouts";
import { useState } from "react";
import { StretchScreen } from "./StretchScreen";
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

interface HomeScreenProps {
  onAddWorkout: () => void;
  onEditWorkout: (workout: Workout) => void;
  onStartWorkout: (workout: Workout, mode: "live" | "log") => void;
}

export function HomeScreen({
  onAddWorkout,
  onEditWorkout,
  onStartWorkout,
}: HomeScreenProps) {
  const { templates, nextWorkout, deleteWorkout, updateTemplateOrder } =
    useWorkouts();
  const [isStretchMode, setIsStretchMode] = useState(false);

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
      const oldIndex = templates.findIndex(workout => workout.id === active.id);
      const newIndex = templates.findIndex(workout => workout.id === over.id);
      updateTemplateOrder(arrayMove(templates, oldIndex, newIndex));
    }
  };

  if (isStretchMode) {
    return <StretchScreen onClose={() => setIsStretchMode(false)} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Workouts</h1>
        <p className="text-zinc-400">
          {templates.length > 0
            ? "Pick a routine, or drag to change what's up next"
            : "Create a routine to get started"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card
          className="flex flex-col items-center justify-center text-center p-4 hover:border-blue-500/50 transition-colors cursor-pointer"
          onClick={onAddWorkout}
        >
          <Plus className="mb-2 text-blue-400" size={24} />
          <span className="font-medium">Add Workout</span>
          <span className="text-sm text-zinc-400">Create routine</span>
        </Card>

        <Card
          className="flex flex-col items-center justify-center text-center p-4 hover:border-blue-500/50 transition-colors cursor-pointer"
          onClick={() => setIsStretchMode(true)}
        >
          <AlarmClock className="mb-2 text-blue-400" size={24} />
          <span className="font-medium">Stretch</span>
          <span className="text-sm text-zinc-400">Time & Track</span>
        </Card>
      </div>

      {templates.length === 0 ? (
        <Card>
          <div className="text-center py-4">
            <p className="text-zinc-400">No workouts yet</p>
            <Button onClick={onAddWorkout} className="mt-4">
              Create Your First Workout
            </Button>
          </div>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={templates.map(workout => workout.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {templates.map(workout => (
                <SortableWorkoutCard
                  key={workout.id}
                  workout={workout}
                  onEdit={onEditWorkout}
                  onDelete={deleteWorkout}
                  onStart={onStartWorkout}
                  isNextWorkout={nextWorkout?.id === workout.id}
                  showExercises={nextWorkout?.id === workout.id}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
