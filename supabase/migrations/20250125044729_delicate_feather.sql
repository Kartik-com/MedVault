/*
  # Add storage bucket for medical documents

  1. New Storage
    - Creates medical-documents bucket for storing user files
  2. Security
    - Enable policies for authenticated users to manage their own files
    - Prevent unauthorized access to files
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-documents', 'medical-documents', false);

-- Policy to allow users to upload their own files
CREATE POLICY "Users can upload their own medical documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'medical-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy to allow users to read their own files
CREATE POLICY "Users can read their own medical documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy to allow users to delete their own files
CREATE POLICY "Users can delete their own medical documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'medical-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);