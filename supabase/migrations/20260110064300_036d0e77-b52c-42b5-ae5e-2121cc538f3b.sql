-- Create subscription status enum
CREATE TYPE public.subscription_tier AS ENUM ('free', 'pro');

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    tier subscription_tier NOT NULL DEFAULT 'free',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create usage tracking table for rate limiting
CREATE TABLE public.usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    feature TEXT NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    date_bucket DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Create index for efficient querying
CREATE INDEX idx_usage_tracking_user_feature_date ON public.usage_tracking(user_id, feature, date_bucket);
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON public.user_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS policies for usage_tracking
CREATE POLICY "Users can view their own usage"
ON public.usage_tracking
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
ON public.usage_tracking
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to get user subscription tier (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.get_user_tier(user_uuid UUID)
RETURNS subscription_tier
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT tier FROM public.user_subscriptions 
     WHERE user_id = user_uuid 
     AND (expires_at IS NULL OR expires_at > now())),
    'free'::subscription_tier
  )
$$;

-- Function to check daily usage count
CREATE OR REPLACE FUNCTION public.get_daily_usage_count(user_uuid UUID, feature_name TEXT)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.usage_tracking
  WHERE user_id = user_uuid
  AND feature = feature_name
  AND date_bucket = CURRENT_DATE
$$;

-- Function to record usage
CREATE OR REPLACE FUNCTION public.record_usage(user_uuid UUID, feature_name TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.usage_tracking (user_id, feature, date_bucket)
  VALUES (user_uuid, feature_name, CURRENT_DATE)
$$;

-- Trigger to create subscription on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, tier)
  VALUES (NEW.id, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- Update trigger for subscriptions
CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();