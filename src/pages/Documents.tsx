import React, { useState, useEffect } from 'react';
import { Plus, FileText, Download, Share2, Trash2, Lock, QrCode, X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { supabase, checkSupabaseConnection } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { QRCodeSVG } from 'qrcode.react';
import type { MedicalDocument } from '../types';

function Documents() {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<MedicalDocument | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeDocuments = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        // Check Supabase connection first
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          throw new Error('Unable to connect to the database. Please try again later.');
        }

        const { data, error: fetchError } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setDocuments(data || []);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching documents');
        console.error('Error fetching documents:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDocuments();
  }, [user]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !user) return;

    const file = event.target.files[0];
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('medical-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);

      const { error: dbError } = await supabase.from('documents').insert({
        user_id: user.id,
        title: file.name,
        type: 'report',
        file_url: data.path,
        expires_at: expiresAt.toISOString()
      });

      if (dbError) throw dbError;
      const initializeDocuments = async () => {
        if (!user) return;
    
        setIsLoading(true);
        setError(null);
    
        try {
          const isConnected = await checkSupabaseConnection();
          if (!isConnected) {
            throw new Error('Unable to connect to the database. Please try again later.');
          }
    
          const { data, error: fetchError } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
    
          if (fetchError) throw fetchError;
          setDocuments(data || []);
        } catch (err: any) {
          setError(err.message || 'An error occurred while fetching documents');
          console.error('Error fetching documents:', err);
        } finally {
          setIsLoading(false);
        }
      };
    
      initializeDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Error uploading document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      const initializeDocuments = async () => {
        if (!user) return;
    
        setIsLoading(true);
        setError(null);
    
        try {
          const isConnected = await checkSupabaseConnection();
          if (!isConnected) {
            throw new Error('Unable to connect to the database. Please try again later.');
          }
    
          const { data, error: fetchError } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
    
          if (fetchError) throw fetchError;
          setDocuments(data || []);
        } catch (err: any) {
          setError(err.message || 'An error occurred while fetching documents');
          console.error('Error fetching documents:', err);
        } finally {
          setIsLoading(false);
        }
      };
    
      initializeDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document. Please try again.');
    }
  };

  const handleDownload = async (fileUrl: string, title: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('medical-documents')
        .download(fileUrl);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = title;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error downloading document. Please try again.');
    }
  };

  const generateQRCode = (document: MedicalDocument) => {
    setSelectedDocument(document);
    setShowQRModal(true);
  };

  const QRModal = () => {
    if (!selectedDocument) return null;

    const qrData = JSON.stringify({
      id: selectedDocument.id,
      title: selectedDocument.title,
      type: selectedDocument.type,
      created_at: selectedDocument.created_at,
      patient_id: user?.id,
      patient_name: user?.full_name
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Document QR Code</h3>
            <button
              onClick={() => setShowQRModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex justify-center mb-4">
            <QRCodeSVG value={qrData} size={200} level="H" />
          </div>
          <p className="text-sm text-gray-500 text-center">
            Scan this QR code to access the document information
          </p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 max-w-2xl mx-auto mt-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical Documents</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your medical records securely
          </p>
        </div>
        <div>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          <label
            htmlFor="file-upload"
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Plus className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Document'}
          </label>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by uploading your first medical document
            </p>
            <div className="mt-6">
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </label>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {documents.map((doc) => {
              const expiresAt = new Date(doc.expires_at || '');
              const isExpired = expiresAt < new Date();

              return (
                <li key={doc.id} className="p-4 sm:px-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="font-medium text-blue-600 truncate">{doc.title}</p>
                        {isExpired && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            <Lock className="h-3 w-3 mr-1" />
                            Expired
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-col sm:flex-row sm:gap-4 text-sm text-gray-500">
                        <p>Type: {doc.type}</p>
                        <p>Uploaded: {format(new Date(doc.created_at), 'MMM d, yyyy')}</p>
                        {doc.expires_at && (
                          <p>
                            Expires: {format(new Date(doc.expires_at), 'MMM d, yyyy HH:mm')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => generateQRCode(doc)}
                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="Generate QR Code"
                      >
                        <QrCode className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDownload(doc.file_url, doc.title)}
                        disabled={isExpired}
                        className={`inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          isExpired ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title="Download"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {showQRModal && <QRModal />}
    </div>
  );
}

export default Documents;