-- Tier 1 sessions: issued after OTP verification or a password login.
-- We store only a hash of the token; the raw token lives in an httpOnly cookie.
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX sessions_account_id_idx ON sessions (account_id);
CREATE INDEX sessions_expires_at_idx ON sessions (expires_at);

-- Tier 0 soft gate: one-time codes sent to an email or phone. No password
-- required at this tier -- this is the "keep creepers away" check, not a wall.
CREATE TABLE otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'signup',
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX otp_codes_contact_idx ON otp_codes (lower(contact));
