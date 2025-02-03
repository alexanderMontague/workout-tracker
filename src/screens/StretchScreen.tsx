import { useState } from "react";
import { Card, Button, Input } from "../components";
import { X } from "lucide-react";
import { useTimer } from "../hooks/useTimer";
import { useWorkouts } from "../hooks/useWorkouts";

interface StretchScreenProps {
  onClose: () => void;
}

export function StretchScreen({ onClose }: StretchScreenProps) {
  const [notes, setNotes] = useState("");
  const { duration, formatDuration } = useTimer();
  const { completeStretch } = useWorkouts();

  const handleComplete = async () => {
    await completeStretch({
      duration,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stretch Session</h1>
          <p className="text-sm text-zinc-400">Track your stretching routine</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X size={24} />
        </Button>
      </div>

      <div className="flex justify-center">
        <div className="text-4xl font-mono font-bold text-blue-600">
          {formatDuration()}
        </div>
      </div>

      <Card className="space-y-4">
        <Input
          label="Stretching Notes"
          placeholder="Record which stretches you did..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full bg-transparent"
          multiline
          rows={4}
        />
      </Card>

      <Button size="lg" className="w-full" onClick={handleComplete}>
        End Stretch Session
      </Button>
    </div>
  );
}
