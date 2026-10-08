-- LifeTrack database schema for Supabase (PostgreSQL)
-- Run this in the Supabase SQL editor.

-- 1. Profiles (extends built-in auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. Families (a group: partner, or a whole family)
create table families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table family_members (
  family_id uuid references families(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  role text default 'member', -- 'owner' | 'member'
  joined_at timestamptz default now(),
  primary key (family_id, profile_id)
);

-- 3. Connections (1-to-1, e.g. partner link, independent of family groups)
create table connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references profiles(id),
  recipient_id uuid references profiles(id),
  status text default 'pending', -- 'pending' | 'accepted' | 'declined'
  created_at timestamptz default now()
);

-- 4. Categories (fixed reference list: health, finance, career, family, travel, dreams...)
create table categories (
  id text primary key, -- 'health' | 'finance' | 'career' | 'family' | 'travel' | 'dreams'
  label text not null,
  icon text
);

insert into categories (id, label, icon) values
  ('health', 'Health', 'ti-heart'),
  ('finance', 'Finance', 'ti-coin'),
  ('career', 'Career / Business', 'ti-briefcase'),
  ('family', 'Family', 'ti-users'),
  ('travel', 'Travel', 'ti-plane'),
  ('dreams', 'Dreams', 'ti-star');

-- 5. Daily logs (habit tracking per category, per user, per day)
create table daily_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  category_id text references categories(id),
  log_date date not null default current_date,
  item_key text not null, -- e.g. 'workout', 'no_alcohol', 'budget_reviewed'
  completed boolean default false,
  value numeric, -- optional numeric value, e.g. sleep hours, water glasses
  created_at timestamptz default now(),
  unique (profile_id, category_id, log_date, item_key)
);

-- 6. Goals (car, house, travel, savings target, etc.)
create table goals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  family_id uuid references families(id), -- null if personal goal
  category_id text references categories(id),
  title text not null, -- 'Buy a car', 'Buy a house', 'Trip to Japan'
  target_amount numeric,
  current_amount numeric default 0,
  target_date date,
  status text default 'in_progress', -- 'in_progress' | 'achieved' | 'paused'
  created_at timestamptz default now()
);

-- 7. Finance snapshots (net worth / credit score / savings over time, for charts)
create table finance_snapshots (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  snapshot_date date not null default current_date,
  savings numeric,
  monthly_expenses numeric,
  credit_score int,
  created_at timestamptz default now()
);

-- 8. Chat: conversations and messages (only between connected users)
create table conversations (
  id uuid primary key default gen_random_uuid(),
  is_group boolean default false,
  family_id uuid references families(id),
  created_at timestamptz default now()
);

create table conversation_participants (
  conversation_id uuid references conversations(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  primary key (conversation_id, profile_id)
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  sender_id uuid references profiles(id),
  content text not null,
  created_at timestamptz default now()
);

-- RPC: securely look up a profile by email without exposing auth.users to clients
create or replace function find_profile_by_email(p_email text)
returns table (id uuid, full_name text)
language sql security definer as $$
  select p.id, p.full_name
  from profiles p
  join auth.users u on u.id = p.id
  where u.email = p_email;
$$;

-- Row Level Security: enable and restrict access to the user's own data
-- and data shared through families/connections/conversations.
alter table profiles enable row level security;
alter table daily_logs enable row level security;
alter table goals enable row level security;
alter table finance_snapshots enable row level security;
alter table messages enable row level security;
alter table conversation_participants enable row level security;

create policy "own profile" on profiles for select using (true);
create policy "manage own logs" on daily_logs for all using (auth.uid() = profile_id);
create policy "view own or family goals" on goals for select using (
  auth.uid() = profile_id
  or family_id in (select family_id from family_members where profile_id = auth.uid())
);
create policy "manage own goals" on goals for insert with check (auth.uid() = profile_id);
create policy "manage own finance" on finance_snapshots for all using (auth.uid() = profile_id);
create policy "read messages in my conversations" on messages for select using (
  conversation_id in (select conversation_id from conversation_participants where profile_id = auth.uid())
);
create policy "send messages in my conversations" on messages for insert with check (
  conversation_id in (select conversation_id from conversation_participants where profile_id = auth.uid())
);
create policy "see my conversations" on conversation_participants for select using (auth.uid() = profile_id);
