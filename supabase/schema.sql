-- 1. The table (exactly as specified in the brief)
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  body text check (char_length(body) <= 280),
  created_at timestamptz default now()
);

-- 2. Row Level Security: anyone with the anon key can read and write posts,
--    but nobody can edit or delete them. The insert policy repeats the
--    280-character rule and blocks empty posts.
alter table posts enable row level security;

create policy "Anyone can read posts"
  on posts for select
  to anon, authenticated
  using (true);

create policy "Anyone can share a post"
  on posts for insert
  to anon, authenticated
  with check (body is not null and char_length(btrim(body)) between 1 and 280);

-- 3. Turn on Realtime for the table
alter publication supabase_realtime add table posts;
