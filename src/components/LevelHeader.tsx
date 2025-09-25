import { Character } from '@/types/game';
import { Card } from '@/components/ui/card';
import { Home, Castle, Cpu, Palette, ShieldCheck } from 'lucide-react';

interface LevelHeaderProps {
  character: Character;
  level: number;
  attempts: number;
  showHint: boolean;
  onToggleHint: () => void;
}

const LevelHeader = ({ character, level, attempts, showHint, onToggleHint }: LevelHeaderProps) => {
  const levelIcons = {
    1: Home,
    2: Castle,
    3: Cpu,
    4: Palette,
    5: ShieldCheck
  };

  const LevelIcon = levelIcons[level as keyof typeof levelIcons];

  return (
    <div className="space-y-4 mb-6">
      <Card className="level-header-bg p-6 border-2 border-primary/20">
        <div className="relative text-center">
          {LevelIcon && (
            <LevelIcon className="level-icon" />
          )}
          <div className="flex items-center justify-center gap-3 mb-2">
            {LevelIcon && <LevelIcon className="w-8 h-8 text-primary" />}
            <h1 className="text-3xl font-bold text-foreground">
              Level {level}: {character.name}
            </h1>
          </div>
          <p className="text-muted-foreground text-lg mb-3">{character.description}</p>
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <span className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium shadow-lg">
              {character.difficulty.toUpperCase()}
            </span>
            <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm">
              Attempts: {attempts}
            </span>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-secondary/50">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-secondary-foreground">💡 Hint Available</h3>
          <button
            onClick={onToggleHint}
            className="px-3 py-1 bg-accent text-accent-foreground rounded-md text-sm hover:bg-accent/80 transition-colors"
          >
            {showHint ? 'Hide' : 'Show'} Hint
          </button>
        </div>
        
        {showHint && (
          <div className="mt-3 p-3 bg-background rounded-md">
            <p className="text-foreground text-sm">{character.hint}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LevelHeader;