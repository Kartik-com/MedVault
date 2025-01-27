import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage // Explicitly set storage to localStorage for mobile
  },
  db: {
    schema: 'public'
  }
});

// Add a simple health check function with retry mechanism
export const checkSupabaseConnection = async () => {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Supabase connection attempt ${retryCount + 1} failed:`, error);
      retryCount++;
      if (retryCount === maxRetries) {
        console.error('Supabase connection failed after max retries');
        return false;
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }
  return false;
};

// Helper function to handle file uploads with retry mechanism
export const uploadFile = async (bucket, filePath, file) => {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error(`Upload attempt ${retryCount + 1} failed:`, error);
      retryCount++;
      
      if (retryCount === maxRetries) {
        return { data: null, error };
      }
      
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }
};

// Helper function to handle file downloads with retry mechanism
export const downloadFile = async (bucket, filePath) => {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(filePath);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error(`Download attempt ${retryCount + 1} failed:`, error);
      retryCount++;
      
      if (retryCount === maxRetries) {
        return { data: null, error };
      }
      
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }
};