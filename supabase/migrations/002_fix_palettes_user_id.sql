-- Migration: Fix palettes user_id to reference users(id) UUID

-- Step 1: Create a temporary UUID column (nullable)
ALTER TABLE public.palettes 
ADD COLUMN user_id_uuid UUID;

-- Step 2: Populate the new UUID column
-- Assign all palettes to the only user in the system (or first user if multiple)
UPDATE public.palettes 
SET user_id_uuid = (SELECT id FROM public.users LIMIT 1);

-- Step 3: Drop the old numeric user_id column
ALTER TABLE public.palettes
DROP COLUMN user_id;

-- Step 4: Rename the new UUID column to user_id
ALTER TABLE public.palettes
RENAME COLUMN user_id_uuid TO user_id;

-- Step 5: Make it NOT NULL
ALTER TABLE public.palettes
ALTER COLUMN user_id SET NOT NULL;

-- Step 6: Add foreign key constraint
ALTER TABLE public.palettes
ADD CONSTRAINT fk_palettes_user_id 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Step 7: Create index on user_id for better query performance
CREATE INDEX idx_palettes_user_id ON public.palettes(user_id);

-- Step 8: Enable RLS on palettes
ALTER TABLE public.palettes ENABLE ROW LEVEL SECURITY;

-- Step 9: Add RLS policies for palettes (drop if they exist first)
DROP POLICY IF EXISTS "Users can view their own palettes" ON public.palettes;
CREATE POLICY "Users can view their own palettes" ON public.palettes
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own palettes" ON public.palettes;
CREATE POLICY "Users can insert their own palettes" ON public.palettes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own palettes" ON public.palettes;
CREATE POLICY "Users can update their own palettes" ON public.palettes
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own palettes" ON public.palettes;
CREATE POLICY "Users can delete their own palettes" ON public.palettes
  FOR DELETE USING (auth.uid() = user_id);

