export interface Character {
  id: number;
  name: string;
  description: string;
  personality: string;
  hint: string;
  theme: string;
  prompt: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'master';
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface GameProgress {
  currentLevel: number;
  completedLevels: boolean[];
  attempts: number[];
  isGameComplete: boolean;
}

export interface LeaderboardEntry {
  name: string;
  completionTime: number;
  totalAttempts: number;
  completedAt: Date;
}