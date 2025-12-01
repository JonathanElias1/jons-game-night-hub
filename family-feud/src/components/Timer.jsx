import React, { useState, useEffect } from "react";
import { cls } from "../utils/helpers";

export function Timer({ seconds, onComplete, isActive }) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (!isActive) return;
    setTimeLeft(seconds);
    
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          onComplete?.();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds, isActive, onComplete]);

  if (!isActive) return null;

  const percentage = (timeLeft / seconds) * 100;
  const color = percentage > 50 ? "bg-green-500" : percentage > 25 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur-md rounded-xl p-4 min-w-[120px]">
      <div className="text-center">
        <div className="text-4xl font-black tabular-nums text-white">{timeLeft}</div>
        <div className="text-xs uppercase tracking-wider opacity-80 mt-1 text-white">seconds</div>
      </div>
      <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
        <div 
          className={cls("h-full transition-all duration-300", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}