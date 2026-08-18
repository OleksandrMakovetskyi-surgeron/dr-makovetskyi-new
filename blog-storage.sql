-- Storage для фото/відео блогу

insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do update set public = true;

drop policy if exists "public read site media" on storage.objects;
create policy "public read site media"
on storage.objects
for select
to public
using (bucket_id = 'site-media');

drop policy if exists "admin upload site media" on storage.objects;
create policy "admin upload site media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'site-media'
  and public.is_admin()
);

drop policy if exists "admin update site media" on storage.objects;
create policy "admin update site media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'site-media'
  and public.is_admin()
)
with check (
  bucket_id = 'site-media'
  and public.is_admin()
);

drop policy if exists "admin delete site media" on storage.objects;
create policy "admin delete site media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'site-media'
  and public.is_admin()
);
