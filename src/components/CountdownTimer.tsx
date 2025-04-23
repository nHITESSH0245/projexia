
import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: string;
  onComplete?: () => void;
}

const CountdownTimer = ({ targetDate, onComplete }: CountdownTimerProps) => {
  const calculateTimeLeft = () => {
    const difference = new Date(targetDate).getTime() - new Date().getTime();
    
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isComplete: false,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isComplete: false,
      };
    } else {
      timeLeft.isComplete = true;
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.isComplete && onComplete) {
        onComplete();
      }
    }, 1000);

    return () => clearTimeout(timer);
  });

  return (
    <div className="flex flex-col items-center">
      <p className="mb-2 text-sm text-gray-500">Time Remaining:</p>
      <div className="flex space-x-3">
        <div className="countdown-container">
          <div className="countdown-value">{timeLeft.days}</div>
          <div className="countdown-label">Days</div>
        </div>
        <div className="countdown-container">
          <div className="countdown-value">{timeLeft.hours}</div>
          <div className="countdown-label">Hours</div>
        </div>
        <div className="countdown-container">
          <div className="countdown-value">{timeLeft.minutes}</div>
          <div className="countdown-label">Mins</div>
        </div>
        <div className="countdown-container">
          <div className="countdown-value">{timeLeft.seconds}</div>
          <div className="countdown-label">Secs</div>
        </div>
      </div>
      {timeLeft.isComplete && (
        <p className="mt-2 text-sm font-medium text-red-500">Deadline passed</p>
      )}
    </div>
  );
};

export default CountdownTimer;
