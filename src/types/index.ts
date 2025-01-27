export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface MedicalDocument {
  id: string;
  user_id: string;
  title: string;
  type: 'prescription' | 'test_result' | 'vaccination' | 'report';
  file_url: string;
  created_at: string;
  expires_at?: string;
  shared_with?: string[];
  metadata?: {
    doctor?: string;
    hospital?: string;
    patient?: string;
    date?: string;
  };
}

export interface ShareableLink {
  id: string;
  document_id: string;
  expires_at: string;
  accessed_at?: string;
  created_at: string;
}