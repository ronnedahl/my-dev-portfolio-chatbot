import React, { useState, ChangeEvent, MouseEvent } from 'react';
import { StatusMessageType, LoadSuccessResponse, ErrorResponse } from '../../types/admin.types';

interface TextUploadSectionProps {
  setStatusMessage: (message: StatusMessageType) => void;
  apiBaseUrl: string;
}

const TextUploadSection: React.FC<TextUploadSectionProps> = ({ setStatusMessage, apiBaseUrl }) => {
  const [textContent, setTextContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setTextContent(e.target.value);
  };

  const handleTextSubmit = async (e: MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    const trimmedText = textContent.trim();
    if (!trimmedText) {
      setStatusMessage({ text: 'Please enter some text content.', type: 'error' });
      return;
    }
    setIsLoading(true);
    setStatusMessage({ text: 'Uploading text...', type: 'info' });

    const formData = new FormData();
    formData.append('type', 'text');
    formData.append('content', trimmedText);

    try {
      const response = await fetch(`${apiBaseUrl}/api/load-documents`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error((result as ErrorResponse).error || `HTTP error! status: ${response.status}`);
      }

      setStatusMessage({ text: (result as LoadSuccessResponse).message || 'Text content uploaded successfully!', type: 'success' });
      setTextContent(''); // Clear input on success

    } catch (error) {
      console.error('Text upload error:', error);
      const message = error instanceof Error ? error.message : 'An unknown network error occurred';
      setStatusMessage({ text: `Error uploading text: ${message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mb-8 rounded-lg bg-gray-800 p-6 shadow-md">
      <h2 className="mb-5 inline-block border-b-2 border-blue-500 pb-2 text-xl font-semibold text-white">
        Upload Text Content
      </h2>
      <div className="mb-4">
        <label htmlFor="text-input" className="mb-2 block text-sm font-medium text-gray-300">
          Paste or type text content:
        </label>
        <textarea
          id="text-input"
          rows={8}
          placeholder="Enter text content here..."
          value={textContent}
          onChange={handleTextChange}
          className="block w-full min-h-[120px] resize-y rounded-md border border-gray-600 bg-gray-700 p-3 text-base text-gray-100 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <button
        type="button"
        onClick={handleTextSubmit}
        disabled={isLoading}
        className="inline-block w-full rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition duration-150 ease-in-out hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {isLoading ? 'Uploading...' : 'Upload Text'}
      </button>
    </section>
  );
};

export default TextUploadSection;