-- Storage RLS Policies

-- Company Logos: Anyone can view, authenticated users (admins) can upload
create policy "Public Access to Company Logos"
  on storage.objects for select
  using (bucket_id = 'company-logos');

create policy "Authenticated users can upload logos"
  on storage.objects for insert
  with check (bucket_id = 'company-logos' and auth.role() = 'authenticated');

create policy "Authenticated users can update logos"
  on storage.objects for update
  using (bucket_id = 'company-logos' and auth.role() = 'authenticated');

-- Avatars: Anyone can view, authenticated users can upload their own
create policy "Public Access to Avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Authenticated users can update avatars"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- Leave Attachments: Only authenticated users can view and upload
create policy "Authenticated users can view leave attachments"
  on storage.objects for select
  using (bucket_id = 'leave-attachments' and auth.role() = 'authenticated');

create policy "Authenticated users can upload leave attachments"
  on storage.objects for insert
  with check (bucket_id = 'leave-attachments' and auth.role() = 'authenticated');

create policy "Authenticated users can update leave attachments"
  on storage.objects for update
  using (bucket_id = 'leave-attachments' and auth.role() = 'authenticated');
