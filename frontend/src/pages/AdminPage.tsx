import React from 'react';
import AdminHeader from '../components/admin/AdminHeader';
import StatusMessage from '../components/admin/StatusMessage';
import CacheManagement from '../components/admin/CacheManagement';
import TextUploadSection from '../components/admin/TextUploadSection';
import PdfUploadSection from '../components/admin/PdfUploadSection';
import UrlUploadSection from '../components/admin/UrlUploadSection';
import { useStatusMessage } from '../hooks/useStatusMessage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''; 
if (!API_BASE_URL) {
  console.warn("VITE_API_BASE_URL environment variable is not set!");
}

const AdminPage: React.FC = () => {
  const { statusMessage, setStatusMessage } = useStatusMessage();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 py-10 font-sans">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        
        <AdminHeader />

        <CacheManagement setStatusMessage={setStatusMessage} />

        <StatusMessage statusMessage={statusMessage} />

        <TextUploadSection 
          setStatusMessage={setStatusMessage} 
          apiBaseUrl={API_BASE_URL} 
        />
        
        <PdfUploadSection 
          setStatusMessage={setStatusMessage} 
          apiBaseUrl={API_BASE_URL} 
        />
        
        <UrlUploadSection 
          setStatusMessage={setStatusMessage} 
          apiBaseUrl={API_BASE_URL} 
        />

      </div>
    </div>
  );
};

export default AdminPage;