-- Create a new storage bucket for catalogs
insert into storage.buckets (id, name, public)
values ('catalogs', 'catalogs', true)
on conflict (id) do nothing;

-- Set up security policies for the 'catalogs' bucket

-- 1. Allow public read access to all files in the bucket
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'catalogs' );

-- 2. Allow authenticated users (Admins) to upload files
create policy "Authenticated Export"
  on storage.objects for insert
  with check ( bucket_id = 'catalogs' and auth.role() = 'authenticated' );

-- 3. Allow authenticated users to update files
create policy "Authenticated Update"
  on storage.objects for update
  using ( bucket_id = 'catalogs' and auth.role() = 'authenticated' );

-- 4. Allow authenticated users to delete files
create policy "Authenticated Delete"
  on storage.objects for delete
  using ( bucket_id = 'catalogs' and auth.role() = 'authenticated' );
