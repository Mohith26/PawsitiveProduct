import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  completed: number;
  total: number;
}

export function ProgressBar({ completed, total }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{completed} of {total} lessons</span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <Progress value={percentage} />
    </div>
  );
}
