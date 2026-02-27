-- Tabela de waitlist / beta testers
-- Guarda emails de pessoas interessadas em testar o OPE_SQUAD

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nome TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para pesquisa rápida por email
CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist (email);

-- Apenas o service role pode ler e escrever (sem acesso público)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
