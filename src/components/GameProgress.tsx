import { GameProgress as GameProgressType } from '@/types/game';

interface GameProgressProps {
  progress: GameProgressType;
}

const GameProgress = ({ progress }: GameProgressProps) => {
  const completedCount = progress.completedLevels.filter(Boolean).length;
  const progressPercentage = (completedCount / 5) * 100;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-foreground">Game Progress</h3>
        <span className="text-sm text-muted-foreground">
          {completedCount}/5 Levels Complete
        </span>
      </div>
      
      <div className="level-progress">
        <div 
          className="level-progress-fill" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <div className="flex justify-between text-sm">
        {[1, 2, 3, 4, 5].map((level) => (
          <div 
            key={level} 
            className={`text-center ${
              progress.completedLevels[level - 1] 
                ? 'text-primary font-bold' 
                : progress.currentLevel === level 
                  ? 'text-accent font-semibold' 
                  : 'text-muted-foreground'
            }`}
          >
            <div className="text-lg">
              {progress.completedLevels[level - 1] ? '✓' : level}
            </div>
            <div className="text-xs">
              {progress.attempts[level - 1] > 0 && `${progress.attempts[level - 1]} tries`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameProgress;