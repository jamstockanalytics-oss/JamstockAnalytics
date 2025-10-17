-- Robust Subscriptions Table Setup for Supabase
-- This script safely creates or updates the subscriptions table with all required components

-- 1) Enable pgcrypto (safe to run)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Create helper function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 3) Create subscriptions table if it doesn't exist, or add missing columns if it does
DO $$
BEGIN
  -- Check if table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='subscriptions') THEN
    -- Create the complete table
    CREATE TABLE public.subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      subscription_type VARCHAR(50) NOT NULL CHECK (subscription_type IN ('free', 'premium', 'enterprise')),
      status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
      start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      end_date TIMESTAMP WITH TIME ZONE,
      auto_renew BOOLEAN DEFAULT TRUE,
      payment_method VARCHAR(50),
      billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
      price DECIMAL(10,2),
      currency VARCHAR(3) DEFAULT 'USD',
      stripe_subscription_id TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ELSE
    -- Table exists, add missing columns if they don't exist
    ALTER TABLE public.subscriptions
      ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS status VARCHAR(20),
      ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
      ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20) DEFAULT 'monthly',
      ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
      ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    
    -- Add constraints if they don't exist
    DO $constraint$
    BEGIN
      -- Add subscription_type constraint
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'subscriptions_subscription_type_check'
      ) THEN
        ALTER TABLE public.subscriptions 
        ADD CONSTRAINT subscriptions_subscription_type_check 
        CHECK (subscription_type IN ('free', 'premium', 'enterprise'));
      END IF;
      
      -- Add status constraint
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'subscriptions_status_check'
      ) THEN
        ALTER TABLE public.subscriptions 
        ADD CONSTRAINT subscriptions_status_check 
        CHECK (status IN ('active', 'inactive', 'cancelled', 'expired'));
      END IF;
      
      -- Add billing_cycle constraint
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'subscriptions_billing_cycle_check'
      ) THEN
        ALTER TABLE public.subscriptions 
        ADD CONSTRAINT subscriptions_billing_cycle_check 
        CHECK (billing_cycle IN ('monthly', 'yearly'));
      END IF;
    END $constraint$;
  END IF;
END $$;

-- 4) Ensure user_id has FK to auth.users(id) if column exists and FK not present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='subscriptions' AND column_name='user_id') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      WHERE tc.table_schema = 'public' AND tc.table_name = 'subscriptions' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'user_id'
    ) THEN
      ALTER TABLE public.subscriptions
        ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- 5) Create index on user_id (concurrently)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions (user_id);

-- 6) Add or replace updated_at trigger
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON public.subscriptions 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7) Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 8) Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS subscriptions_select_owner ON public.subscriptions;
DROP POLICY IF EXISTS subscriptions_insert_owner ON public.subscriptions;
DROP POLICY IF EXISTS subscriptions_update_owner ON public.subscriptions;
DROP POLICY IF EXISTS subscriptions_delete_owner ON public.subscriptions;

-- 9) Create RLS policies restricting access to owners
CREATE POLICY subscriptions_select_owner ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY subscriptions_insert_owner ON public.subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY subscriptions_update_owner ON public.subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY subscriptions_delete_owner ON public.subscriptions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 10) Add comments
COMMENT ON TABLE public.subscriptions IS 'User subscription management and billing information';
COMMENT ON COLUMN public.subscriptions.subscription_type IS 'Type of subscription (free, premium, enterprise)';
COMMENT ON COLUMN public.subscriptions.stripe_subscription_id IS 'External Stripe subscription ID for payment processing';

-- 11) Validation query to check everything was created correctly
SELECT 
  'Table Structure' as check_type,
  CASE 
    WHEN COUNT(*) = 15 THEN '✅ Complete (15 columns)'
    ELSE '❌ Incomplete (' || COUNT(*) || ' columns)'
  END as result
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'subscriptions'

UNION ALL

SELECT 
  'RLS Status' as check_type,
  CASE 
    WHEN rowsecurity THEN '✅ Enabled'
    ELSE '❌ Disabled'
  END as result
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'subscriptions'

UNION ALL

SELECT 
  'Policies Count' as check_type,
  CASE 
    WHEN COUNT(*) = 4 THEN '✅ Complete (4 policies)'
    ELSE '❌ Incomplete (' || COUNT(*) || ' policies)'
  END as result
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'subscriptions'

UNION ALL

SELECT 
  'Indexes' as check_type,
  CASE 
    WHEN COUNT(*) >= 1 THEN '✅ Present'
    ELSE '❌ Missing'
  END as result
FROM pg_indexes 
WHERE schemaname = 'public' AND tablename = 'subscriptions';

-- Success message
SELECT '🎉 Subscriptions table setup completed successfully!' as status;
