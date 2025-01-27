import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

function CreatePrescription() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    diagnosis: '',
    prescription: '',
    doctorName: '',
    hospitalName: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [watermark, setWatermark] = useState({
    text: '',
    opacity: 0.1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWatermarkChange = (e) => {
    const { name, value } = e.target;
    setWatermark((prev) => ({
      ...prev,
      [name]: name === 'opacity' ? parseFloat(value) : value,
    }));
  };

  const generatePrescriptionHTML = () => {
    return `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              position: relative;
              min-height: 100vh;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 60px;
              opacity: ${watermark.opacity};
              color: #000;
              pointer-events: none;
              z-index: -1;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .content {
              margin-bottom: 40px;
            }
            .footer {
              margin-top: 60px;
              text-align: right;
            }
          </style>
        </head>
        <body>
          <div class="watermark">${watermark.text}</div>
          <div class="header">
            <h2>${formData.hospitalName}</h2>
            <p>Dr. ${formData.doctorName}</p>
          </div>
          <div class="content">
            <p><strong>Patient Name:</strong> ${formData.patientName}</p>
            <p><strong>Age:</strong> ${formData.age}</p>
            <p><strong>Date:</strong> ${formData.date}</p>
            <p><strong>Diagnosis:</strong> ${formData.diagnosis}</p>
            <h3>Prescription:</h3>
            <pre>${formData.prescription}</pre>
          </div>
          <div class="footer">
            <p>Dr. ${formData.doctorName}</p>
            <p>${formData.hospitalName}</p>
          </div>
        </body>
      </html>
    `;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !formData.patientName || !formData.prescription) {
      alert('All fields are required!');
      return;
    }

    setLoading(true);
    try {
      const htmlContent = generatePrescriptionHTML();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const fileName = `prescription_${Date.now()}.html`;
      const filePath = `${user.id}/${fileName}`;

      // Upload the HTML to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('medical-documents')
        .upload(filePath, blob);

      if (uploadError) {
        throw uploadError;
      }

      // Insert document record into the database
      const { error: dbError } = await supabase.from('documents').insert([
        {
          user_id: user.id,
          title: `Prescription - ${formData.patientName}`,
          type: 'prescription',
          file_url: data.path,
          metadata: {
            doctor: formData.doctorName,
            hospital: formData.hospitalName,
            patient: formData.patientName,
            date: formData.date,
          },
        },
      ]);

      if (dbError) {
        throw dbError;
      }

      alert('Prescription saved successfully!');
      navigate('/documents');
    } catch (error) {
      console.error('Error creating prescription:', error);
      alert('Error creating prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Create Prescription
          </h3>
          <form onSubmit={handleSubmit} className="mt-5 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Patient Name */}
              <div>
                <label
                  htmlFor="patientName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Patient Name
                </label>
                <input
                  type="text"
                  name="patientName"
                  id="patientName"
                  required
                  value={formData.patientName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                />
              </div>

              {/* Age */}
              <div>
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-gray-700"
                >
                  Age
                </label>
                <input
                  type="text"
                  name="age"
                  id="age"
                  required
                  value={formData.age}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                />
              </div>

              {/* Doctor Name */}
              <div>
                <label
                  htmlFor="doctorName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Doctor Name
                </label>
                <input
                  type="text"
                  name="doctorName"
                  id="doctorName"
                  required
                  value={formData.doctorName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                />
              </div>

              {/* Hospital Name */}
              <div>
                <label
                  htmlFor="hospitalName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Hospital Name
                </label>
                <input
                  type="text"
                  name="hospitalName"
                  id="hospitalName"
                  required
                  value={formData.hospitalName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                />
              </div>
            </div>

            {/* Diagnosis */}
            <div>
              <label
                htmlFor="diagnosis"
                className="block text-sm font-medium text-gray-700"
              >
                Diagnosis
              </label>
              <textarea
                name="diagnosis"
                id="diagnosis"
                rows={2}
                required
                value={formData.diagnosis}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
              />
            </div>

            {/* Prescription */}
            <div>
              <label
                htmlFor="prescription"
                className="block text-sm font-medium text-gray-700"
              >
                Prescription
              </label>
              <textarea
                name="prescription"
                id="prescription"
                rows={6}
                required
                value={formData.prescription}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
              />
            </div>

            {/* Watermark Settings */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="text"
                  className="block text-sm font-medium text-gray-700"
                >
                  Watermark Text
                </label>
                <input
                  type="text"
                  name="text"
                  id="text"
                  value={watermark.text}
                  onChange={handleWatermarkChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="opacity"
                  className="block text-sm font-medium text-gray-700"
                >
                  Watermark Opacity
                </label>
                <input
                  type="range"
                  name="opacity"
                  id="opacity"
                  min="0"
                  max="1"
                  step="0.1"
                  value={watermark.opacity}
                  onChange={handleWatermarkChange}
                  className="mt-1 block w-full"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/documents')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? 'Saving...' : 'Save Prescription'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePrescription;
