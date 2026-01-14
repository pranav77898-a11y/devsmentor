-- CRITICAL: Remove the insecure INSERT policy that allows users to create their own subscriptions
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.user_subscriptions;

-- Create a secure INSERT policy - only the trigger/system can create subscriptions
CREATE POLICY "System can create subscriptions" 
ON public.user_subscriptions 
FOR INSERT 
WITH CHECK (false);

-- Create restrictive UPDATE policy - regular users cannot update subscriptions
CREATE POLICY "System only can update subscriptions" 
ON public.user_subscriptions 
FOR UPDATE 
USING (false);

-- Add DELETE policy for profiles (GDPR compliance)
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add DELETE policy for user progress
CREATE POLICY "Users can delete their own progress" 
ON public.user_progress 
FOR DELETE 
USING (auth.uid() = user_id);