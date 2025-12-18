import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TimerProps {
  startedAt: string | null;
  durationSeconds: number;
  onTimeUp: () => void;
}

export const Timer = ({ startedAt, durationSeconds, onTimeUp }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(durationSeconds);

  useEffect(() => {
    if (!startedAt) {
      setTimeLeft(durationSeconds);
      return;
    }

    const calculateTimeLeft = () => {
      const startTime = new Date(startedAt).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, durationSeconds - elapsed);
      return remaining;
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, durationSeconds, onTimeUp]);

  const percentage = (timeLeft / durationSeconds) * 100;
  const isLow = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-24 h-24">
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={isCritical ? 'hsl(var(--destructive))' : isLow ? 'hsl(var(--accent))' : 'hsl(var(--primary))'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.83} 283`}
            className="transition-all duration-1000"
          />
        </svg>
        {/* Time display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className={cn(
              "text-2xl font-bold transition-colors duration-300",
              isCritical ? "text-destructive animate-pulse" : isLow ? "text-accent" : "text-foreground"
            )}
          >
            {timeLeft}
          </span>
        </div>
      </div>
      <span className="text-sm text-muted-foreground">seconds left</span>
    </div>
  );
};
