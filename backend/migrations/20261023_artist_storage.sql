-- Segunda etapa: bucket privado dedicado. Não altera policies de outros buckets.
begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('artist-media','artist-media',false,10485760,array['image/webp','application/pdf']);
-- Impede acesso deste bucket mesmo se houver policy permissiva global.
-- Para outros buckets, a expressão true preserva as regras existentes.
create policy artist_media_browser_deny on storage.objects as restrictive
for all to anon, authenticated
using (bucket_id <> 'artist-media')
with check (bucket_id <> 'artist-media');
commit;
