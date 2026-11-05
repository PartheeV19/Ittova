CREATE TABLE visitor_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  phone TEXT NOT NULL CHECK (phone ~ '^\+[1-9][0-9]{7,14}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX visitor_contacts_email_unique_ci ON visitor_contacts (lower(email));
