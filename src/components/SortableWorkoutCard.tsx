import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Workout } from "../types";
import { Card, Badge } from ".";
import { Edit2, GripVertical, Trash2 } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../utils/cn";
import { formatExerciseSummary } from "../utils/exercise";

export function SortableWorkoutCard({
  workout,
  onEdit,
  onDelete,
  onStart,
  isNextWorkout,
  showExercises = false,
}: {
  workout: Workout;
  onEdit: (workout: Workout) => void;
  onDelete: (id: string) => void;
  onStart?: (workout: Workout, mode: "live" | "log") => void;
  isNextWorkout: boolean;
  showExercises?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: workout.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card cardRef={setNodeRef} style={style} className={cn("space-y-4")}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <button
            className="touch-none p-1 hover:bg-zinc-100 rounded"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={18} className="text-zinc-400" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{workout.name}</h3>
              {isNextWorkout && (
                <Badge variant="primary" className="text-xs ml-3">
                  Up next
                </Badge>
              )}
            </div>
            <p className="text-sm text-zinc-400">
              {workout.exercises.length}{" "}
              {workout.exercises.length === 1 ? "exercise" : "exercises"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(workout)}>
            <Edit2 size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Are you sure you want to delete this workout?")) {
                onDelete(workout.id);
              }
            }}
          >
            <Trash2 size={18} className="text-red-400" />
          </Button>
        </div>
      </div>

      {showExercises && (
        <div className="space-y-1 text-sm text-zinc-400">
          {workout.exercises.map(exercise => (
            <div key={exercise.id}>
              <p>
                • {exercise.name}: {formatExerciseSummary(exercise)}
              </p>
              {exercise.notes && (
                <p className="ml-4 text-xs text-zinc-500">{exercise.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {onStart && (
        <div className="grid grid-cols-2 gap-3">
          <Button
            className="w-full"
            onClick={() => onStart(workout, "live")}
          >
            Start live
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => onStart(workout, "log")}
          >
            Log after
          </Button>
        </div>
      )}
    </Card>
  );
}
