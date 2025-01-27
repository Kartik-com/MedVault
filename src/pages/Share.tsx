import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Clock } from 'lucide-react';

function Share() {
  const { documentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [expiresIn, setExpiresIn] = useState('30:00');

  useEffect(() => {
    // TODO: Implement share link generation
    setLoading(false);
  }, [documentId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Share Document
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              Scan this QR code to access the document. The link will expire in{' '}
              <span className="font-medium text-gray-900">{expiresIn}</span> minutes.
            </p>
          </div>
          <div className="mt-5 flex justify-center">
            {shareUrl ? (
              <QRCodeSVG
                value={shareUrl}
                size={256}
                level="H"
                includeMargin={true}
              />
            ) : (
              <div className="flex items-center justify-center w-64 h-64 bg-gray-100 rounded-lg">
                <Clock className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
          <div className="mt-5">
            <button
              type="button"
              onClick={() => {}}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Generate New Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Share;