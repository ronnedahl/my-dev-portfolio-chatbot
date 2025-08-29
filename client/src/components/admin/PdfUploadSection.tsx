import React, { useState, useRef, ChangeEvent, MouseEvent } from 'react';
import { StatusMessageType, LoadSuccessResponse, ErrorResponse } from '../../types/admin.types';

interface PdfUploadSectionProps {
  setStatusMessage: (message: StatusMessageType) => void;
  apiBaseUrl: string;
}

const PdfUploadSection: React.FC<PdfUploadSectionProps> = ({ setStatusMessage, apiBaseUrl }) => {
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string>('No file chosen');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedPdf(file);
      setPdfFilename(file.name);
      setStatusMessage({ text: '', type: '' });
    } else {
      setSelectedPdf(null);
      setPdfFilename('No file chosen');
      if (file) {
        setStatusMessage({ text: 'Invalid file type. Please select a PDF.', type: 'error' });
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileLabelClick = (): void => {
    fileInputRef.current?.click();
  };

  const handlePdfSubmit = async (e: MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    if (!selectedPdf) {
      setStatusMessage({ text: 'Please choose a PDF file to upload.', type: 'error' });
      return;
    }
    setIsLoading(true);
    setStatusMessage({ text: `Uploading ${selectedPdf.name}...`, type: 'info' });

    const formData = new FormData();
    formData.append('type', 'pdf');
    formData.append('file', selectedPdf);

    try {
      const response = await fetch(`${apiBaseUrl}/api/load-documents`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error((result as ErrorResponse).error || `HTTP error! status: ${response.status}`);
      }

      setStatusMessage({ text: (result as LoadSuccessResponse).message || `PDF file '${selectedPdf.name}' uploaded successfully!`, type: 'success' });
      setSelectedPdf(null);
      setPdfFilename('No file chosen');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('PDF upload error:', error);
      const message = error instanceof Error ? error.message : 'An unknown network error occurred';
      setStatusMessage({ text: `Error uploading PDF: ${message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mb-8 rounded-lg bg-gray-800 p-6 shadow-md">
      <h2 className="mb-5 inline-block border-b-2 border-blue-500 pb-2 text-xl font-semibold text-white">
        Upload PDF File
      </h2>
      <div className="mb-4 items-center sm:flex">
        <input
          type="file"
          id="pdf-input"
          accept=".pdf"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <label
          htmlFor="pdf-input"
          onClick={handleFileLabelClick}
          role="button"
          className="mb-2 inline-block cursor-pointer rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-gray-200 transition duration-150 ease-in-out hover:bg-gray-500 sm:mb-0 sm:mr-4"
        >
          Choose PDF File
        </label>
        <span className="block text-sm italic text-gray-400 sm:inline">
          {pdfFilename}
        </span>
      </div>
      <button
        type="button"
        onClick={handlePdfSubmit}
        disabled={isLoading || !selectedPdf}
        className="inline-block w-full rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition duration-150 ease-in-out hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {isLoading ? 'Uploading...' : 'Upload PDF'}
      </button>
    </section>
  );
};

export default PdfUploadSection;