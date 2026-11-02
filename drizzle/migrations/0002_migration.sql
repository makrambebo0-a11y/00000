alter table public.hymns add column status text not null default 'pending';
update public.hymns set status = 'approved';

create type public.app_role as enum ('admin');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

-- first account ever created becomes the admin
create or replace function public.first_user_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_admin after insert on auth.users
for each row execute function public.first_user_admin();

drop policy "anyone reads hymns" on public.hymns;
drop policy "anyone adds hymns" on public.hymns;
create policy "public reads approved" on public.hymns for select using (status = 'approved' or public.has_role(auth.uid(), 'admin'));
create policy "anyone submits pending" on public.hymns for insert with check (status = 'pending');
grant update, delete on public.hymns to authenticated;
create policy "admin updates" on public.hymns for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "admin deletes" on public.hymns for delete to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin deletes hymn audio" on storage.objects for delete to authenticated using (bucket_id = 'hymns' and public.has_role(auth.uid(), 'admin'));