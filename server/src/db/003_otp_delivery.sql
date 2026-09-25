ALTER TABLE otp_codes ADD COLUMN destinations TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE otp_codes ADD COLUMN delivery_accepted_at TIMESTAMPTZ;
CREATE INDEX otp_codes_created_at_idx ON otp_codes (created_at);
CREATE INDEX otp_codes_destinations_idx ON otp_codes USING GIN (destinations);
