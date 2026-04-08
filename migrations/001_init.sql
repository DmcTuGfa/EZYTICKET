create sequence if not exists ticket_seq start 1;
create sequence if not exists activity_seq start 1;

create table if not exists tickets (
  id text primary key default ('TKT-' || lpad(nextval('ticket_seq')::text, 3, '0')),
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
  id text primary key default ('ACT-' || lpad(nextval('activity_seq')::text, 3, '0')),
  ticket_id text not null references tickets(id) on delete cascade,
  type text not null,
  description text not null,
  timestamp timestamptz not null default now(),
  user_name text not null,
  previous_value text,
  new_value text
);
