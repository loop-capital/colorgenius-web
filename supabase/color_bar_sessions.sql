-- ColorGenius Color Bar Session Table
-- Run this in Supabase SQL Editor: https://beuiayrnzbgvvqfgsenc.supabase.co/project/sql
-- Created: 2026-05-28 for Color Bar iPad production terminal

-- Main table for color bar mixing sessions
CREATE TABLE IF NOT EXISTS color_bar_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL,
    client_id UUID,
    stylist_id UUID NOT NULL,
    formula_id UUID,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    steps JSONB,
    total_cost DECIMAL(10,2),
    square_order_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Performance indexes for common queries
CREATE INDEX IF NOT EXISTS idx_color_bar_sessions_salon_id ON color_bar_sessions(salon_id);
CREATE INDEX IF NOT EXISTS idx_color_bar_sessions_client_id ON color_bar_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_color_bar_sessions_stylist_id ON color_bar_sessions(stylist_id);
CREATE INDEX IF NOT EXISTS idx_color_bar_sessions_status ON color_bar_sessions(status);
CREATE INDEX IF NOT EXISTS idx_color_bar_sessions_created_at ON color_bar_sessions(created_at DESC);

-- Description for documentation
COMMENT ON TABLE color_bar_sessions IS 'Production color bar mixing sessions for salon workstations. Tracks what was mixed, actual weights vs targets, and cost.';

-- Verify table was created
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'color_bar_sessions'
ORDER BY ordinal_position;
