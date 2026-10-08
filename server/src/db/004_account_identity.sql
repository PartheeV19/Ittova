CREATE SEQUENCE account_country_code_seq START WITH 102;
CREATE SEQUENCE account_state_code_seq START WITH 1;
CREATE SEQUENCE account_district_code_seq START WITH 1;
CREATE SEQUENCE account_city_code_seq START WITH 1;
CREATE SEQUENCE account_dealer_code_seq START WITH 1;

ALTER TABLE app_users
  ADD COLUMN public_id TEXT,
  ADD COLUMN identity_codes JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN profile_data JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX app_users_public_id_unique ON app_users (public_id) WHERE public_id IS NOT NULL;

CREATE TABLE account_geo_codes (
  id BIGSERIAL PRIMARY KEY,
  level TEXT NOT NULL CHECK (level IN ('country', 'state', 'district', 'city')),
  parent_id BIGINT REFERENCES account_geo_codes(id) ON DELETE RESTRICT,
  parent_scope BIGINT NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  code TEXT NOT NULL,
  UNIQUE (level, parent_scope, normalized_name),
  UNIQUE (level, parent_scope, code)
);

INSERT INTO account_geo_codes (level, parent_scope, name, normalized_name, code)
VALUES
  ('country', 0, 'India', 'india', '100'),
  ('country', 0, 'Sri Lanka', 'sri lanka', '101');
