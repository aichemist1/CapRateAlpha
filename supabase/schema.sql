create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique,
  email text unique,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  role text not null check (role in ('owner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, workspace_id)
);

create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  street_1 text not null,
  street_2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'US',
  latitude double precision,
  longitude double precision,
  property_type text,
  highlights text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists spaces (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  name text not null,
  suite_identifier text not null,
  status text not null check (status in ('draft', 'active', 'leased', 'archived')),
  square_feet integer not null,
  use_type text not null,
  asking_rent_amount numeric(12,2) not null,
  rent_type text not null check (rent_type in ('gross', 'nnn', 'modified_gross', 'unknown')),
  rent_notes text,
  highlights text not null,
  availability_date date,
  is_divisible boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  space_id uuid not null references spaces(id) on delete cascade,
  status text not null check (status in ('draft', 'ready', 'archived')),
  loopnet_export_status text not null check (loopnet_export_status in ('draft', 'ready', 'exported')),
  headline text not null,
  description_long text not null,
  description_short text not null,
  description_loopnet text not null,
  generated_copy_version integer not null default 1,
  publication_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists landing_pages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  space_id uuid not null references spaces(id) on delete cascade,
  current_listing_id uuid not null references listings(id) on delete cascade,
  status text not null check (status in ('draft', 'live', 'expired')),
  slug text not null unique,
  canonical_url text not null,
  published_at timestamptz,
  last_unpublished_at timestamptz,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists landing_pages_one_active_per_space
  on landing_pages(space_id)
  where status != 'expired';

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  space_id uuid not null references spaces(id) on delete cascade,
  listing_id uuid references listings(id) on delete set null,
  asset_type text not null,
  source_type text not null check (source_type in ('uploaded', 'generated')),
  storage_path text not null,
  mime_type text not null,
  file_size_bytes bigint not null,
  width integer,
  height integer,
  label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  space_id uuid not null references spaces(id) on delete cascade,
  landing_page_id uuid not null references landing_pages(id) on delete cascade,
  source text not null check (source in ('landing_page', 'manual')),
  stage text not null check (stage in ('new', 'contacted', 'qualified', 'lost')),
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  message text not null,
  follow_up_date date,
  submitted_at timestamptz not null default now(),
  company_name text,
  owner_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_properties_workspace_id on properties(workspace_id);
create index if not exists idx_spaces_workspace_id on spaces(workspace_id);
create index if not exists idx_spaces_property_id on spaces(property_id);
create index if not exists idx_listings_workspace_id on listings(workspace_id);
create index if not exists idx_listings_space_id on listings(space_id);
create index if not exists idx_landing_pages_workspace_id on landing_pages(workspace_id);
create index if not exists idx_leads_workspace_id on leads(workspace_id);
create index if not exists idx_leads_space_id on leads(space_id);
create index if not exists idx_leads_landing_page_id on leads(landing_page_id);
create index if not exists idx_leads_stage on leads(stage);
