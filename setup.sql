-- ISOLA database setup
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Rooms table: pairs two users
create table if not exists public.rooms (
  id uuid default gen_random_uuid() primary key,
  invite_code text unique not null,
  user1_id uuid,
  user2_id uuid,
  created_at timestamptz default now()
);

-- Heartbeats table: rolling BPM history
create table if not exists public.heartbeats (
  id bigint generated always as identity primary key,
  room_id uuid references public.rooms(id) on delete cascade,
  user_id uuid not null,
  bpm integer not null,
  created_at timestamptz default now()
);

-- Index for fast queries by room
create index if not exists idx_heartbeats_room on public.heartbeats(room_id, created_at desc);

-- Enable Row Level Security
alter table public.rooms enable row level security;
alter table public.heartbeats enable row level security;

-- RLS policies: allow all operations for now (anon key)
-- In production you'd tighten these to authenticated users only
create policy "Allow all room operations" on public.rooms
  for all using (true) with check (true);

create policy "Allow all heartbeat operations" on public.heartbeats
  for all using (true) with check (true);

-- Memories table: saved photo memories
create table if not exists public.memories (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.rooms(id) on delete cascade,
  user_id uuid not null,
  title text not null default 'Untitled moment',
  photo_date timestamptz,
  bpm_left integer,
  bpm_right integer,
  created_at timestamptz default now()
);

alter table public.memories enable row level security;

create policy "Allow all memory operations" on public.memories
  for all using (true) with check (true);

-- Enable Realtime for heartbeats table
alter publication supabase_realtime add table public.heartbeats;
