CREATE TABLE app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN (
    'customer', 'supplier', 'staff', 'admin', 'finance_partner',
    'material_partner', 'logistics', 'inspector'
  )),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'locked', 'disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX app_users_email_unique_ci ON app_users (lower(email));

CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  account_id UUID UNIQUE REFERENCES app_users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE vendors (
  id TEXT PRIMARY KEY,
  account_id UUID UNIQUE REFERENCES app_users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  audit_score TEXT,
  profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE staff (
  id TEXT PRIMARY KEY,
  account_id UUID UNIQUE REFERENCES app_users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  title TEXT,
  profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  created_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
  status TEXT NOT NULL,
  search_location TEXT,
  search_radius_km INTEGER CHECK (search_radius_km IS NULL OR search_radius_km > 0),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX projects_customer_id_idx ON projects (customer_id);
CREATE INDEX projects_status_idx ON projects (status);

CREATE TABLE project_drawings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  drawing_number TEXT NOT NULL,
  ordinal INTEGER NOT NULL DEFAULT 0 CHECK (ordinal >= 0),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (project_id, drawing_number)
);

CREATE TABLE project_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drawing_id UUID NOT NULL REFERENCES project_drawings(id) ON DELETE CASCADE,
  stage_id INTEGER NOT NULL CHECK (stage_id > 0),
  name TEXT NOT NULL,
  raw_scope TEXT,
  manufacturing_scope TEXT,
  finishing_scope TEXT,
  production_status TEXT NOT NULL DEFAULT 'pending',
  selected_vendor_id TEXT REFERENCES vendors(id) ON DELETE SET NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (drawing_id, stage_id)
);

CREATE TABLE vendor_machines (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  process TEXT NOT NULL,
  hourly_rate NUMERIC(14, 2) CHECK (hourly_rate IS NULL OR hourly_rate >= 0),
  availability_status TEXT NOT NULL DEFAULT 'idle',
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX vendor_machines_vendor_id_idx ON vendor_machines (vendor_id);
CREATE INDEX vendor_machines_process_idx ON vendor_machines (process);

CREATE TABLE vendor_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID NOT NULL REFERENCES project_processes(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  quoted_price NUMERIC(14, 2) NOT NULL CHECK (quoted_price >= 0),
  lead_time_days INTEGER NOT NULL CHECK (lead_time_days > 0),
  status TEXT NOT NULL DEFAULT 'submitted',
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (process_id, vendor_id)
);

CREATE TABLE project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
  storage_provider TEXT NOT NULL,
  storage_key TEXT NOT NULL UNIQUE,
  original_filename TEXT NOT NULL,
  media_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
  sha256 TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX project_documents_project_id_idx ON project_documents (project_id);

CREATE TABLE project_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX project_events_project_time_idx ON project_events (project_id, created_at DESC);
