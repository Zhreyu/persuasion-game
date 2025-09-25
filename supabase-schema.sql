-- Create the leaderboard table
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    completion_time INTEGER NOT NULL,
    total_attempts INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_ranking 
ON public.leaderboard (total_attempts ASC, completion_time ASC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (read and insert)
CREATE POLICY "Allow public read access" ON public.leaderboard
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON public.leaderboard
    FOR INSERT WITH CHECK (true);

-- Optional: Create a view for the top 100 leaderboard entries
CREATE OR REPLACE VIEW public.leaderboard_top_100 AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY total_attempts ASC, completion_time ASC) as rank,
    name,
    completion_time,
    total_attempts,
    completed_at
FROM public.leaderboard
ORDER BY total_attempts ASC, completion_time ASC
LIMIT 100;
