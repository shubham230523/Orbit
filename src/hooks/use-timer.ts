import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimer(initialSeconds: number = 1500) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => setIsActive(true), []);
  const pause = useCallback(() => setIsActive(false), []);
  const reset = useCallback((secs: number = initialSeconds) => {
    setIsActive(false);
    setSecondsLeft(secs);
  }, [initialSeconds]);

  useEffect(() => {
    if (isActive && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, secondsLeft]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return {
    secondsLeft,
    isActive,
    start,
    pause,
    reset,
    formatTime: formatTime(secondsLeft),
    progress: 1 - (secondsLeft / initialSeconds),
  };
}
