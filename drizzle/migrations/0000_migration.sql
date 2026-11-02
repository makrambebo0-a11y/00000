create table public.hymns (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 150),
  singer text check (char_length(singer) <= 100),
  lyrics text check (char_length(lyrics) <= 10000),
  audio_path text,
  created_at timestamptz not null default now()
);
grant select, insert on public.hymns to anon, authenticated;
grant all on public.hymns to service_role;
alter table public.hymns enable row level security;
create policy "anyone reads hymns" on public.hymns for select using (true);
create policy "anyone adds hymns" on public.hymns for insert with check (true);
create policy "anyone uploads hymn audio" on storage.objects for insert to anon, authenticated with check (bucket_id = 'hymns');