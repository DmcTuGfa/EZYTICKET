begin;

create table if not exists authorized_users (
  id serial primary key,
  email text unique not null,
  password text,
  name text,
  active boolean not null default true,
  role text default 'user',
  created_at timestamptz default now()
);

create sequence if not exists tickets_id_seq start 1;
create sequence if not exists activities_id_seq start 1;

create table if not exists tickets (
  id text primary key default ('TKT-' || lpad(nextval('tickets_id_seq')::text, 3, '0')),
  title text not null,
  description text not null,
  status text not null,
  priority text not null,
  category text not null,
  reporter text not null,
  assignee text,
  area_responsable text,
  sistema_afectado text,
  fecha_alta date,
  clasificacion_final text,
  causa_raiz text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists activities (
  id text primary key default ('ACT-' || lpad(nextval('activities_id_seq')::text, 3, '0')),
  ticket_id text not null,
  type text not null,
  description text not null,
  timestamp timestamptz not null default now(),
  user_name text not null,
  previous_value text,
  new_value text
);

create table if not exists sites (
  id bigserial primary key,
  code text unique not null,
  name text not null,
  address text,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists maintenances (
  id bigserial primary key,
  folio text unique not null,
  maintenance_type text not null check (maintenance_type in ('preventivo', 'correctivo')),
  status text not null default 'abierto' check (status in ('abierto', 'en_proceso', 'pendiente_confirmacion', 'cerrado', 'cancelado')),
  site_id bigint not null references sites(id) on delete restrict,
  title text not null,
  description text,
  reported_issue text,
  work_performed text,
  recommendations text,
  scheduled_date date,
  opened_at timestamptz not null default now(),
  completed_at timestamptz,
  requested_by_name text,
  technician_name text,
  confirmed_by_name text,
  confirmed_by_position text,
  signature_data text,
  mobile_only boolean not null default true,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists maintenance_logs (
  id bigserial primary key,
  maintenance_id bigint not null references maintenances(id) on delete cascade,
  action text not null,
  description text,
  performed_by text,
  created_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_sites_updated_at on sites;
create trigger trg_sites_updated_at before update on sites for each row execute function set_updated_at();

drop trigger if exists trg_maintenances_updated_at on maintenances;
create trigger trg_maintenances_updated_at before update on maintenances for each row execute function set_updated_at();

insert into sites (code, name, description) values
  ('FUENTES', 'Fuentes', 'Sede Fuentes'),
  ('CBB', 'CBB', 'Sede CBB'),
  ('CORTAZAR', 'Cortázar', 'Sede Cortázar')
on conflict (code) do nothing;

insert into authorized_users (email, password, name, role, active) values
  ('awesomecanal42@gmail.com', '123456', 'Usuario', 'admin', true)
on conflict (email) do update set
  password = excluded.password,
  name = excluded.name,
  role = excluded.role,
  active = excluded.active;

commit;
