import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LeaderboardEntry } from '@/types/game';
import { formatTime } from '@/utils/gameLogic';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  onAddEntry: (name: string) => void;
  onBackToGame: () => void;
  showNameInput: boolean;
  isLoading?: boolean;
}

const Leaderboard = ({ entries, onAddEntry, onBackToGame, showNameInput, isLoading = false }: LeaderboardProps) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddEntry(name.trim());
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          🏆 The Forbidden Leaderboard 🏆
        </h1>
        <p className="text-muted-foreground">
          "This place has never had rules... but legends live here."
        </p>
      </div>

      {showNameInput && (
        <Card className="p-6 bg-accent/10 border-accent">
          <h2 className="text-2xl font-bold text-center mb-4 text-accent">
            Congratulations, Master Persuader!
          </h2>
          <p className="text-center text-muted-foreground mb-4">
            You've conquered all 5 levels! Enter your name to join the forbidden leaderboard:
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your legendary name..."
              className="text-center text-lg"
              maxLength={20}
            />
            <div className="flex gap-4 justify-center">
              <Button 
                type="submit" 
                disabled={!name.trim()}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Join the Legends
              </Button>
              <Button 
                type="button" 
                onClick={onBackToGame}
                variant="outline"
              >
                Maybe Later
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 text-center">Hall of Fame</h3>
        
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
            Loading legendary scores...
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground italic">
            "No one has conquered all levels yet... <br />
            The doors remain locked to all who dare approach."
            <br /><br />
            🚪💀🔒
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <div 
                key={index} 
                className={`flex justify-between items-center p-3 rounded-lg ${
                  index === 0 ? 'bg-accent/20 border border-accent' : 
                  index === 1 ? 'bg-secondary/50' : 
                  index === 2 ? 'bg-muted/50' : 'bg-background'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold w-8">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                  </span>
                  <span className="font-semibold">{entry.name}</span>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div>{entry.totalAttempts} attempts</div>
                  <div>{formatTime(entry.completionTime)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="text-center">
        <Button 
          onClick={onBackToGame}
          variant="outline"
          className="bg-secondary hover:bg-secondary/80"
        >
          ← Back to Game
        </Button>
      </div>
    </div>
  );
};

export default Leaderboard;