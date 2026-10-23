-- Revisar e aplicar ANTES do backend novo. Não executa o bootstrap legado.
begin;
create table public.artist_media (
  id uuid primary key,
  artist_id bigint not null references public.artistas(id) on delete cascade,
  kind text not null check (kind in ('photo','gallery','portfolio')),
  object_path text not null unique,
  thumbnail_path text,
  name text not null check (length(name) between 1 and 120),
  mime text not null check (mime in ('image/webp','application/pdf')),
  size integer not null check (size between 1 and 10485760),
  width integer, height integer,
  created_at timestamptz not null default now()
);
create index artist_media_artist_idx on public.artist_media(artist_id, created_at);
create table public.artist_media_cleanup (
  id uuid primary key default gen_random_uuid(),
  paths text[] not null,
  created_at timestamptz not null default now()
);
create table public.artist_events (
  id uuid primary key default gen_random_uuid(),
  artist_id bigint not null references public.artistas(id) on delete cascade,
  titulo text not null check (length(titulo) between 2 and 160),
  descricao text check (length(descricao) <= 2000),
  starts_at timestamptz not null,
  local text not null check (length(local) between 2 and 200),
  cidade text not null check (length(cidade) between 2 and 120),
  link text check (length(link) <= 2048),
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);
create index artist_events_future_idx on public.artist_events(artist_id, starts_at) where is_public;
create table public.artist_profile_stats (
  artist_id bigint primary key references public.artistas(id) on delete cascade,
  views bigint not null default 0 check (views >= 0)
);
create table public.artist_view_sessions (
  artist_id bigint not null references public.artistas(id) on delete cascade,
  session_hash text not null check (session_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  primary key (artist_id, session_hash)
);
create index artist_view_sessions_age_idx on public.artist_view_sessions(created_at);

-- Nenhum acesso direto do browser às novas tabelas. API usa Secret no servidor.
alter table public.artist_media enable row level security;
alter table public.artist_media_cleanup enable row level security;
alter table public.artist_events enable row level security;
alter table public.artist_profile_stats enable row level security;
alter table public.artist_view_sessions enable row level security;
revoke all on public.artist_media, public.artist_media_cleanup, public.artist_events,
  public.artist_profile_stats, public.artist_view_sessions from public, anon, authenticated;
grant select, insert, update, delete on public.artist_media, public.artist_media_cleanup,
  public.artist_events, public.artist_profile_stats, public.artist_view_sessions to service_role;

create function public.attach_artist_media(p_artist_id bigint, p_rows jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare kind_name text; current_count integer; new_count integer;
begin
  perform 1 from public.artistas where id=p_artist_id for update;
  if not found then raise exception 'artist_not_found'; end if;
  if jsonb_typeof(p_rows)<>'array' or jsonb_array_length(p_rows)>10 then
    raise exception 'invalid_media_batch'; end if;
  foreach kind_name in array array['photo','gallery','portfolio'] loop
    select count(*) into current_count from public.artist_media where artist_id=p_artist_id and kind=kind_name;
    select count(*) into new_count from jsonb_array_elements(p_rows) r where r->>'kind'=kind_name;
   if current_count + new_count >
   (case when kind_name = 'gallery' then 8 else 1 end)
then
  raise exception 'media_limit';
end if;
  end loop;
  if exists(select 1 from jsonb_array_elements(p_rows) r
      where (r->>'artist_id')::bigint<>p_artist_id
      or r->>'object_path' not like 'artistas/'||p_artist_id||'/%'
      or (r->>'thumbnail_path' is not null and r->>'thumbnail_path' not like 'artistas/'||p_artist_id||'/%')) then
    raise exception 'invalid_media_owner'; end if;
  insert into public.artist_media(id,artist_id,kind,object_path,thumbnail_path,name,mime,size,width,height)
    select id,artist_id,kind,object_path,thumbnail_path,name,mime,size,width,height
    from jsonb_to_recordset(p_rows) as x(id uuid,artist_id bigint,kind text,object_path text,
      thumbnail_path text,name text,mime text,size integer,width integer,height integer);
  update public.artistas set foto_url='/artistas/'||p_artist_id||'/arquivos/'||(r->>'id')||'?thumbnail=1'
    from jsonb_array_elements(p_rows) r where public.artistas.id=p_artist_id and r->>'kind'='photo';
end $$;

create function public.delete_artist_media(p_artist_id bigint, p_media_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from public.artistas where id=p_artist_id for update;
  update public.artistas set foto_url=null where id=p_artist_id
    and foto_url like '/artistas/'||p_artist_id||'/arquivos/'||p_media_id||'%';
  delete from public.artist_media where id=p_media_id and artist_id=p_artist_id;
end $$;

create function public.record_artist_view(p_artist_id bigint, p_session_hash text)
returns bigint language plpgsql security definer set search_path = '' as $$
declare inserted integer; total bigint;
begin
  perform 1 from public.artistas where id=p_artist_id and status='Aprovado' for update;
  if not found then return null; end if;
  if p_session_hash !~ '^[a-f0-9]{64}$' then raise exception 'invalid_session'; end if;
  insert into public.artist_view_sessions(artist_id,session_hash) values(p_artist_id,p_session_hash)
    on conflict do nothing;
  get diagnostics inserted = row_count;
  if inserted=1 then
    insert into public.artist_profile_stats(artist_id,views) values(p_artist_id,1)
      on conflict(artist_id) do update set views=public.artist_profile_stats.views+1;
  end if;
  select views into total from public.artist_profile_stats where artist_id=p_artist_id;
  return coalesce(total,0);
end $$;
revoke all on function public.attach_artist_media(bigint,jsonb),
  public.record_artist_view(bigint,text), public.delete_artist_media(bigint,uuid) from public, anon, authenticated;
grant execute on function public.attach_artist_media(bigint,jsonb),
  public.record_artist_view(bigint,text), public.delete_artist_media(bigint,uuid) to service_role;
commit;
