INSERT INTO storage.buckets (id, name, public) VALUES ('provider-documents', 'provider-documents', false);

CREATE POLICY "Users manage own provider docs"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'provider-documents' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'provider-documents' AND (storage.foldername(name))[1] = auth.uid()::text);