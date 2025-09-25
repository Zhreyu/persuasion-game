import { supabase } from '@/lib/supabase';
import { LeaderboardEntry } from '@/types/game';

export interface SupabaseLeaderboardEntry {
  id: string;
  name: string;
  completion_time: number;
  total_attempts: number;
  completed_at: string;
  created_at: string;
}

// Convert Supabase entry to our app's LeaderboardEntry format
const convertFromSupabase = (entry: SupabaseLeaderboardEntry): LeaderboardEntry => ({
  name: entry.name,
  completionTime: entry.completion_time,
  totalAttempts: entry.total_attempts,
  completedAt: new Date(entry.completed_at)
});

// Convert our app's LeaderboardEntry to Supabase format
const convertToSupabase = (entry: LeaderboardEntry) => ({
  name: entry.name,
  completion_time: entry.completionTime,
  total_attempts: entry.totalAttempts,
  completed_at: entry.completedAt.toISOString()
});

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('total_attempts', { ascending: true })
      .order('completion_time', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }

    return data ? data.map(convertFromSupabase) : [];
  } catch (error) {
    console.error('Failed to fetch leaderboard from Supabase:', error);
    // Fallback to localStorage if Supabase fails
    return getLeaderboardFromLocalStorage();
  }
};

export const addToLeaderboard = async (entry: LeaderboardEntry): Promise<void> => {
  try {
    const { error } = await supabase
      .from('leaderboard')
      .insert([convertToSupabase(entry)]);

    if (error) {
      console.error('Error adding to leaderboard:', error);
      throw error;
    }

    // Also save to localStorage as backup
    addToLeaderboardLocalStorage(entry);
  } catch (error) {
    console.error('Failed to add to leaderboard in Supabase:', error);
    // Fallback to localStorage if Supabase fails
    addToLeaderboardLocalStorage(entry);
    throw error;
  }
};

// LocalStorage fallback functions
const getLeaderboardFromLocalStorage = (): LeaderboardEntry[] => {
  const saved = localStorage.getItem('persuasion-game-leaderboard');
  return saved ? JSON.parse(saved) : [];
};

const addToLeaderboardLocalStorage = (entry: LeaderboardEntry): void => {
  const leaderboard = getLeaderboardFromLocalStorage();
  leaderboard.push(entry);
  leaderboard.sort((a, b) => a.totalAttempts - b.totalAttempts || a.completionTime - b.completionTime);
  localStorage.setItem('persuasion-game-leaderboard', JSON.stringify(leaderboard));
};

// Check if we're online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Sync local data to Supabase when coming back online
export const syncLocalDataToSupabase = async (): Promise<void> => {
  if (!isOnline()) return;

  try {
    const localEntries = getLeaderboardFromLocalStorage();
    if (localEntries.length === 0) return;

    // Get current Supabase entries to avoid duplicates
    const supabaseEntries = await getLeaderboard();
    const supabaseNames = new Set(supabaseEntries.map(e => e.name));

    // Find entries that don't exist in Supabase
    const newEntries = localEntries.filter(entry => !supabaseNames.has(entry.name));

    // Add new entries to Supabase
    for (const entry of newEntries) {
      try {
        await addToLeaderboard(entry);
      } catch (error) {
        console.error('Failed to sync entry:', entry.name, error);
      }
    }

    // Clear localStorage after successful sync
    localStorage.removeItem('persuasion-game-leaderboard');
  } catch (error) {
    console.error('Failed to sync local data to Supabase:', error);
  }
};
