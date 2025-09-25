import { GameProgress, LeaderboardEntry } from '@/types/game';
import { getLeaderboard as getSupabaseLeaderboard, addToLeaderboard as addToSupabaseLeaderboard, syncLocalDataToSupabase } from '@/services/supabaseService';

export const STORAGE_KEYS = {
  GAME_PROGRESS: 'persuasion-game-progress',
  LEADERBOARD: 'persuasion-game-leaderboard'
};

export const getGameProgress = (): GameProgress => {
  const saved = localStorage.getItem(STORAGE_KEYS.GAME_PROGRESS);
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    currentLevel: 1,
    completedLevels: [false, false, false, false, false],
    attempts: [0, 0, 0, 0, 0],
    isGameComplete: false
  };
};

export const saveGameProgress = (progress: GameProgress): void => {
  localStorage.setItem(STORAGE_KEYS.GAME_PROGRESS, JSON.stringify(progress));
};

export const completeLevel = (level: number): GameProgress => {
  const progress = getGameProgress();
  progress.completedLevels[level - 1] = true;
  progress.currentLevel = Math.min(level + 1, 5);
  progress.isGameComplete = progress.completedLevels.every(completed => completed);
  saveGameProgress(progress);
  return progress;
};

export const incrementAttempts = (level: number): void => {
  const progress = getGameProgress();
  progress.attempts[level - 1]++;
  saveGameProgress(progress);
};

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    // Try to sync any local data first
    await syncLocalDataToSupabase();
    // Get leaderboard from Supabase
    return await getSupabaseLeaderboard();
  } catch (error) {
    console.error('Failed to get leaderboard from Supabase, falling back to localStorage:', error);
    // Fallback to localStorage
    const saved = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    return saved ? JSON.parse(saved) : [];
  }
};

export const addToLeaderboard = async (entry: LeaderboardEntry): Promise<void> => {
  try {
    await addToSupabaseLeaderboard(entry);
  } catch (error) {
    console.error('Failed to add to Supabase leaderboard, falling back to localStorage:', error);
    // Fallback to localStorage
    const leaderboard = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADERBOARD) || '[]');
    leaderboard.push(entry);
    leaderboard.sort((a, b) => a.totalAttempts - b.totalAttempts || a.completionTime - b.completionTime);
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
  }
};

export const resetGame = (): void => {
  localStorage.removeItem(STORAGE_KEYS.GAME_PROGRESS);
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};