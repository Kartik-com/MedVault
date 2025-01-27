import React from 'react';
import { saveAs } from 'file-saver';

const FileManager = ({ files }) => {
  // Download the file structure as a .txt file
  const handleDownload = () => {
    const plainTextContent = files.join('\n'); // Ensure it's plain text
    const blob = new Blob([plainTextContent], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'file_structure.txt'); // Save as 'file_structure.txt'
  };

  // Check if a file is an image
  const isImage = (file) => {
    return file.match(/\.(jpg|jpeg|png|gif|bmp|svg)$/i);
  };

  return (
    <div className="file-manager">
      {/* Download Button */}
      <button onClick={handleDownload} className="download-btn">
        Download File Structure
      </button>

      {/* Read-Only Image Previews */}
      <div className="image-preview">
        <h3>Image Files:</h3>
        {files.filter(isImage).map((file, index) => (
          <div key={index} className="image-container">
            <p>{file}</p>
            <img 
              src={file} 
              alt={`Preview ${index}`} 
              className="image-preview" 
              style={{ maxWidth: '300px', maxHeight: '300px', objectFit: 'contain' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileManager;
