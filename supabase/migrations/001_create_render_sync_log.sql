-- Create render_sync_log table for storing Render.com service sync data
CREATE TABLE IF NOT EXISTS public.render_sync_log (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    render_services JSONB,
    environment TEXT,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_render_sync_log_timestamp ON public.render_sync_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_render_sync_log_environment ON public.render_sync_log(environment);
CREATE INDEX IF NOT EXISTS idx_render_sync_log_status ON public.render_sync_log(status);

-- Enable Row Level Security
ALTER TABLE public.render_sync_log ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read their own data
CREATE POLICY "Allow authenticated users to read render_sync_log" ON public.render_sync_log
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy for service role to insert data
CREATE POLICY "Allow service role to insert render_sync_log" ON public.render_sync_log
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT ON public.render_sync_log TO authenticated;
GRANT INSERT ON public.render_sync_log TO service_role;
