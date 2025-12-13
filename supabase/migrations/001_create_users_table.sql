-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  player_name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  google_sub TEXT,
  CONSTRAINT player_name_not_empty CHECK (LENGTH(player_name) > 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_player_name ON public.users(player_name);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Anyone can read public player names (for uniqueness validation)
CREATE POLICY "Anyone can read player names" ON public.users
  FOR SELECT USING (true);

-- Only auth system can insert new users
CREATE POLICY "Service role can insert users" ON public.users
  FOR INSERT WITH CHECK (true);

-- Update RLS on palettes table to ensure user isolation
ALTER TABLE public.palettes ENABLE ROW LEVEL SECURITY;

-- Users can see their own palettes
CREATE POLICY IF NOT EXISTS "Users can view their own palettes" ON public.palettes
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create palettes
CREATE POLICY IF NOT EXISTS "Users can create palettes" ON public.palettes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own palettes
CREATE POLICY IF NOT EXISTS "Users can update their own palettes" ON public.palettes
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own palettes
CREATE POLICY IF NOT EXISTS "Users can delete their own palettes" ON public.palettes
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on users table
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Create function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, player_name)
  VALUES (NEW.id, NEW.email, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to call handle_new_user on auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
