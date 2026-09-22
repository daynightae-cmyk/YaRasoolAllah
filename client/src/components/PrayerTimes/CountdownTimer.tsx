import { useEffect, useState } from "react";
import { getTimeUntil } from "@/lib/utils";

interface CountdownTimerProps {
  targetTime: Date;
}

export function CountdownTimer({ targetTime }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      setTimeRemaining(getTimeUntil(targetTime));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  return (
    <div className="text-2xl font-bold font-mono">
      {timeRemaining}
    </div>
  );
}
