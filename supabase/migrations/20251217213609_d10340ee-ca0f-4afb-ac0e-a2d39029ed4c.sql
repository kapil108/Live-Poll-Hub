-- Add created_by column to polls table
ALTER TABLE public.polls ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow all operations on polls" ON public.polls;
DROP POLICY IF EXISTS "Allow all operations on questions" ON public.questions;

-- Create proper RLS policies for polls
CREATE POLICY "Anyone can view polls" ON public.polls
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create polls" ON public.polls
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Poll owners can update their polls" ON public.polls
FOR UPDATE TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Poll owners can delete their polls" ON public.polls
FOR DELETE TO authenticated
USING (auth.uid() = created_by);

-- Create proper RLS policies for questions
CREATE POLICY "Anyone can view questions" ON public.questions
FOR SELECT USING (true);

CREATE POLICY "Poll owners can create questions" ON public.questions
FOR INSERT TO authenticated
WITH CHECK (
  poll_id IN (SELECT id FROM public.polls WHERE created_by = auth.uid())
);

CREATE POLICY "Poll owners can update questions" ON public.questions
FOR UPDATE TO authenticated
USING (
  poll_id IN (SELECT id FROM public.polls WHERE created_by = auth.uid())
)
WITH CHECK (
  poll_id IN (SELECT id FROM public.polls WHERE created_by = auth.uid())
);

CREATE POLICY "Poll owners can delete questions" ON public.questions
FOR DELETE TO authenticated
USING (
  poll_id IN (SELECT id FROM public.polls WHERE created_by = auth.uid())
);