import { useEffect, useState } from "react";

interface PrayerCountdownProps {
  timeRemaining: number; // in minutes
}

export default function PrayerCountdown({ timeRemaining }: PrayerCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(timeRemaining * 60); // convert to seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="text-2xl font-bold font-mono">
      {hours}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </div>
  );
}
