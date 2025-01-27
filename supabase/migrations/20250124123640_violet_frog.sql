/*
  # Initial Schema Setup for Medical Documentation System

  1. New Tables
    - `users`
      - Stores user profile information
      - Contains basic user details and preferences
    - `documents`
      - Stores medical document metadata
      - Links to actual files stored in Supabase storage
    - `shared_links`
      - Manages temporary access links for document sharing
      - Includes expiration and access tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for secure data access
    - Implement document ownership checks
*/

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Documents table
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('prescription', 'test_result', 'vaccination', 'report')),
  file_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Shared links table
CREATE TABLE shared_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) NOT NULL,
  created_by uuid REFERENCES users(id) NOT NULL,
  expires_at timestamptz NOT NULL,
  accessed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Documents policies
CREATE POLICY "Users can CRUD own documents"
  ON documents
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Shared links policies
CREATE POLICY "Users can create shared links for own documents"
  ON shared_links
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM documents
    WHERE documents.id = document_id
    AND documents.user_id = auth.uid()
  ));

CREATE POLICY "Users can view own shared links"
  ON shared_links
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_id
      AND documents.user_id = auth.uid()
    )
  );

-- Function to clean up expired shared links
CREATE OR REPLACE FUNCTION cleanup_expired_links()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM shared_links
  WHERE expires_at < now();
END;
$$;