-- Waitlist / beta testers table
-- Stores emails of people interested in testing OPE_SQUAD

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nome TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast email lookup
CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist (email);

-- Only service role can read and write (no public access)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
