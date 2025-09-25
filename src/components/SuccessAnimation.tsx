import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SuccessAnimationProps {
  character: string;
  level: number;
  attempts: number;
  onNextLevel: () => void;
  onRetry: () => void;
  isGameComplete?: boolean;
}

const SuccessAnimation = ({ 
  character, 
  level, 
  attempts, 
  onNextLevel, 
  onRetry, 
  isGameComplete 
}: SuccessAnimationProps) => {
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const graffiti = [
    "🎉 ENTRY GRANTED! 🎉",
    "✨ SMOOTH TALKER! ✨", 
    "🔥 PERSUASION MASTER! 🔥",
    "💫 DOOR UNLOCKED! 💫",
    "🏆 VICTORY! 🏆"
  ];

  return (
    <Card className="p-8 text-center bg-gradient-to-br from-accent/20 to-primary/20 border-accent">
      {showAnimation ? (
        <div className="space-y-4">
          <div className="success-graffiti text-6xl animate-bounce">
            {graffiti[level - 1]}
          </div>
          <div className="text-2xl font-bold text-accent animate-pulse">
            {character} lets you in!
          </div>
          <div className="text-muted-foreground">
            Completed in {attempts} attempt{attempts !== 1 ? 's' : ''}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-4xl">🎉</div>
          <h2 className="text-2xl font-bold text-accent">
            Level {level} Complete!
          </h2>
          <p className="text-muted-foreground">
            You successfully convinced {character} to let you in after {attempts} attempt{attempts !== 1 ? 's' : ''}!
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={onRetry}
              variant="outline"
              className="bg-secondary hover:bg-secondary/80"
            >
              Try Again
            </Button>
            
            {!isGameComplete ? (
              <Button 
                onClick={onNextLevel}
                className="bg-primary hover:bg-primary/90"
              >
                Next Level →
              </Button>
            ) : (
              <Button 
                onClick={onNextLevel}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Enter Leaderboard! 🏆
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default SuccessAnimation;