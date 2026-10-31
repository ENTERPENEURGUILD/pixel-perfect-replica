create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  prompt text not null,
  model_id text not null,
  aspect text,
  image_url text not null,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.generations to authenticated;
grant all on public.generations to service_role;

alter table public.generations enable row level security;

create policy "Users can read own generations"
  on public.generations for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own generations"
  on public.generations for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own generations"
  on public.generations for delete to authenticated
  using (auth.uid() = user_id);

create index generations_user_created_idx
  on public.generations (user_id, created_at desc);

create or replace function public.spend_credits(cost numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
     set credits = credits - cost
   where id = auth.uid()
     and credits >= cost;
  if not found then
    raise exception 'Not enough credits';
  end if;
end;
$$;

revoke all on function public.spend_credits(numeric) from public, anon;
grant execute on function public.spend_credits(numeric) to authenticated;

-- Private 'generations' bucket: users may upload into and read only their own folder.
create policy "Users can upload to own generation folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'generations'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read own generation files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'generations'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own generation files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'generations'
    and (storage.foldername(name))[1] = auth.uid()::text
  );