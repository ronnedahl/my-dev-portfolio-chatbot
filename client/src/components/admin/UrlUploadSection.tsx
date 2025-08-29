import React, { useState, ChangeEvent, MouseEvent } from 'react';
import { StatusMessageType, LoadSuccessResponse, ErrorResponse } from '../../types/admin.types';

interface UrlUploadSectionProps {
  setStatusMessage: (message: StatusMessageType) => void;
  apiBaseUrl: string;
}

const UrlUploadSection: React.FC<UrlUploadSectionProps> = ({ setStatusMessage, apiBaseUrl }) => {
  const [urlContent, setUrlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setUrlContent(e.target.value);
  };

  const handleUrlSubmit = async (e: MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    const url = urlContent.trim();
    if (!url) {
      setStatusMessage({ text: 'Please enter a valid URL.', type: 'error' });
      return;
    }
    try {
      new URL(url);
    } catch (_) {
      setStatusMessage({ text: 'Invalid URL format.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ text: `Processing content from ${url}...`, type: 'info' });

    const formData = new FormData();
    formData.append('type', 'url');
    formData.append('url', url);

    try {
      const response = await fetch(`${apiBaseUrl}/api/load-documents`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error((result as ErrorResponse).error || `HTTP error! status: ${response.status}`);
      }

      setStatusMessage({ text: (result as LoadSuccessResponse).message || 'Content from URL added successfully!', type: 'success' });
      setUrlContent(''); 

    } catch (error) {
      console.error('URL processing error:', error);
      const message = error instanceof Error ? error.message : 'An unknown network error occurred';
      setStatusMessage({ text: `Error processing URL: ${message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mb-8 rounded-lg bg-gray-800 p-6 shadow-md">
      <h2 className="mb-5 inline-block border-b-2 border-blue-500 pb-2 text-xl font-semibold text-white">
        Add Content from URL
      </h2>
      <div className="mb-4">
        <label htmlFor="url-input" className="mb-2 block text-sm font-medium text-gray-300">
          Enter URL:
        </label>
        <input
          type="url"
          id="url-input"
          placeholder="https://example.com/content"
          value={urlContent}
          onChange={handleUrlChange}
          className="block w-full rounded-md border border-gray-600 bg-gray-700 p-3 text-base text-gray-100 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <button
        type="button"
        onClick={handleUrlSubmit}
        disabled={isLoading}
        className="inline-block w-full rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition duration-150 ease-in-out hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {isLoading ? 'Processing...' : 'Fetch and Add URL Content'}
      </button>
    </section>
  );
};

export default UrlUploadSection;