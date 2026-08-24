-- Document vault: private Storage bucket for permit PDFs, insurance certs, etc.
-- Objects are stored under `${auth.uid()}/${property_id}/${filename}` so a
-- single owner-scoped policy covers every property without extra joins.

insert into storage.buckets (id, name, public)
values ('property-documents', 'property-documents', false)
on conflict (id) do nothing;

create policy "Users can upload documents into their own folder"
on storage.objects for insert
with check (
  bucket_id = 'property-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can view their own documents"
on storage.objects for select
using (
  bucket_id = 'property-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own documents"
on storage.objects for delete
using (
  bucket_id = 'property-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);
