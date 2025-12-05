import { X } from 'lucide-react';
import { taskComponentTypes } from '../../utils/taskComponentTypes';
import { Button } from '../ui/button';
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export const TaskComponentMenu = ({ onSelect, onClose }) => {
const componentKeys = Object.keys(taskComponentTypes);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md mx-4 rounded-2xl border shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Select a Task Type</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-2">
          {componentKeys.map((type, index) => (
            <Button
              key={index}
              variant="ghost"
              className="flex flex-col items-start justify-start hover:bg-muted"
              onClick={() => {
                onSelect(type);
                onClose();
              }}
            >
              <span className="font-semibold">{taskComponentTypes[type].label}</span>
              <span className="text-sm text-muted-foreground mt-1">{taskComponentTypes[type].description}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};