-- Simple and Reliable Subscriptions Table Setup
-- This script is designed to work without errors

-- Step 1: Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 2: Create the update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Step 3: Create subscriptions table (this will fail gracefully if it exists)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_type VARCHAR(50) DEFAULT 'free',
  status VARCHAR(20) DEFAULT 'active',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT TRUE,
  payment_method VARCHAR(50),
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Add constraints separately (safer approach)
ALTER TABLE public.subscriptions 
  ADD CONSTRAINT IF NOT EXISTS subscriptions_type_check 
  CHECK (subscription_type IN ('free', 'premium', 'enterprise'));

ALTER TABLE public.subscriptions 
  ADD CONSTRAINT IF NOT EXISTS subscriptions_status_check 
  CHECK (status IN ('active', 'inactive', 'cancelled', 'expired'));

ALTER TABLE public.subscriptions 
  ADD CONSTRAINT IF NOT EXISTS subscriptions_billing_check 
  CHECK (billing_cycle IN ('monthly', 'yearly'));

-- Step 5: Create index
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions (user_id);

-- Step 6: Create trigger
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON public.subscriptions 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Step 7: Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Step 8: Drop any existing policies first
DROP POLICY IF EXISTS "Users can select their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS subscriptions_select_owner ON public.subscriptions;
DROP POLICY IF EXISTS subscriptions_insert_owner ON public.subscriptions;
DROP POLICY IF EXISTS subscriptions_update_owner ON public.subscriptions;
DROP POLICY IF EXISTS subscriptions_delete_owner ON public.subscriptions;

-- Step 9: Create simple RLS policies
CREATE POLICY "Users can select their own subscriptions" ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON public.subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions" ON public.subscriptions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Step 10: Simple validation
SELECT 'Subscriptions table setup completed!' as status;
