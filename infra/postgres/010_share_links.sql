create table if not exists share_links (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid not null references dashboards(id) on delete cascade,
  owner_id uuid not null,
  token text not null unique,
  status text not null default 'active' check (status in ('active', 'revoked')),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists idx_share_links_dashboard_id on share_links(dashboard_id);
create index if not exists idx_share_links_owner_id on share_links(owner_id);
create index if not exists idx_share_links_token on share_links(token);

create unique index if not exists idx_share_links_one_active_per_dashboard
  on share_links(dashboard_id)
  where status = 'active';
