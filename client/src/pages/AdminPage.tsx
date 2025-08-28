import { useState, useEffect, useRef, ChangeEvent, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { IoArrowBack, IoBarChart, IoTrash, IoRefresh } from 'react-icons/io5';
import { getCacheStats, clearCache, cleanupCache } from '../utils/api';

// Interface for the status message state
interface StatusMessage {
  text: string;
  type: 'info' | 'success' | 'error' | '';
}

// Define the expected success response structure from the backend
interface LoadSuccessResponse {
    message: string;
    source: string;
}

// Define the expected error response structure from the backend
interface ErrorResponse {
    error: string;
}

// Get API Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''; // Fallback to empty string if not set

if (!API_BASE_URL) {
    console.warn("VITE_API_BASE_URL environment variable is not set!");
    // Optionally, you could throw an error or set a default if appropriate
}


function AdminPage(){
  // --- State (Keep existing state variables) ---
  const [textContent, setTextContent] = useState<string>('');
  const [urlContent, setUrlContent] = useState<string>('');
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string>('No file chosen');
  const [statusMessage, setStatusMessage] = useState<StatusMessage>({ text: '', type: '' });
  const [isTextLoading, setIsTextLoading] = useState<boolean>(false);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);
  const [isUrlLoading, setIsUrlLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects (Keep existing useEffect) ---
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (statusMessage.text && statusMessage.type !== 'success') { // Don't auto-clear success
      timer = setTimeout(() => {
        setStatusMessage({ text: '', type: '' });
      }, 5000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [statusMessage]);

  // --- Event Handlers (Keep existing change/click handlers) ---
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setTextContent(e.target.value);
  };
  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setUrlContent(e.target.value);
  };
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

  // --- Submission Handlers (Implement API calls) ---

  // Submit Text Content
  const handleTextSubmit = async (e: MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    const trimmedText = textContent.trim();
    if (!trimmedText) {
      setStatusMessage({ text: 'Please enter some text content.', type: 'error' });
      return;
    }
    setIsTextLoading(true);
    setStatusMessage({ text: 'Uploading text...', type: 'info' });

    const formData = new FormData();
    formData.append('type', 'text');
    formData.append('content', trimmedText);

    try {
        const response = await fetch(`${API_BASE_URL}/api/load-documents`, {
            method: 'POST',
            body: formData, // Browser sets Content-Type automatically for FormData
        });

        const result = await response.json();

        if (!response.ok) {
             // Throw an error with the message from the backend if available
            throw new Error((result as ErrorResponse).error || `HTTP error! status: ${response.status}`);
        }

        setStatusMessage({ text: (result as LoadSuccessResponse).message || 'Text content uploaded successfully!', type: 'success' });
        setTextContent(''); // Clear input on success

    } catch (error) {
        console.error('Text upload error:', error);
        const message = error instanceof Error ? error.message : 'An unknown network error occurred';
        setStatusMessage({ text: `Error uploading text: ${message}`, type: 'error' });
    } finally {
        setIsTextLoading(false);
    }
  };

  // Submit PDF File
  const handlePdfSubmit = async (e: MouseEvent<HTMLButtonElement>): Promise<void> => {
     e.preventDefault();
    if (!selectedPdf) {
      setStatusMessage({ text: 'Please choose a PDF file to upload.', type: 'error' });
      return;
    }
    setIsPdfLoading(true);
    setStatusMessage({ text: `Uploading ${selectedPdf.name}...`, type: 'info' });

    const formData = new FormData();
    formData.append('type', 'pdf'); // Add the type field
    formData.append('file', selectedPdf); // Key matches multer field name 'file'

    try {
        const response = await fetch(`${API_BASE_URL}/api/load-documents`, {
            method: 'POST',
            body: formData, // Browser sets Content-Type
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
        setIsPdfLoading(false);
    }
  };

  // Submit URL Content
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

    setIsUrlLoading(true);
    setStatusMessage({ text: `Processing content from ${url}...`, type: 'info' });

    const formData = new FormData();
    formData.append('type', 'url');
    formData.append('url', url);

    try {
        const response = await fetch(`${API_BASE_URL}/api/load-documents`, {
            method: 'POST',
            body: formData, // Browser sets Content-Type
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error((result as ErrorResponse).error || `HTTP error! status: ${response.status}`);
        }

        setStatusMessage({ text: (result as LoadSuccessResponse).message || 'Content from URL added successfully!', type: 'success' });
        setUrlContent(''); // Clear input on success

    } catch (error) {
        console.error('URL processing error:', error);
        const message = error instanceof Error ? error.message : 'An unknown network error occurred';
        setStatusMessage({ text: `Error processing URL: ${message}`, type: 'error' });
    } finally {
        setIsUrlLoading(false);
    }
  };

  // --- Helper Functions (Keep existing getStatusBgColor) ---
  const getStatusBgColor = (): string => {
    switch (statusMessage.type) {
      case 'success': return 'bg-green-600 text-green-100';
      case 'error': return 'bg-red-600 text-red-100';
      case 'info': return 'bg-blue-600 text-blue-100';
      default: return 'hidden';
    }
  };

  // --- Render (Keep existing JSX structure) ---
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 py-10 font-sans">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">

        {/* Header with back button */}
        <div className="mb-8 flex items-center justify-between">
          <Link 
            to="/chat"
            className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <IoArrowBack size={20} />
            <span>Tillbaka till chat</span>
          </Link>
          
          <h1 className="text-2xl font-bold text-white">
            Admin Panel
          </h1>
          
          <div className="w-32"></div> {/* Spacer for alignment */}
        </div>

        {/* Quick Actions Section */}
        <section className="mb-8 rounded-lg bg-gray-800 p-6 shadow-md">
          <h2 className="mb-5 inline-block border-b-2 border-blue-500 pb-2 text-xl font-semibold text-white">
            <IoBarChart className="inline mr-2" />
            Cache Management
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {/* getCacheStats implementation */}}
              className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
            >
              <IoBarChart className="mx-auto mb-2" size={24} />
              Cache Stats
            </button>
            
            <button
              onClick={() => {/* clearCache implementation */}}
              className="p-4 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
            >
              <IoTrash className="mx-auto mb-2" size={24} />
              Clear Cache
            </button>
            
            <button
              onClick={() => {/* cleanupCache implementation */}}
              className="p-4 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
            >
              <IoRefresh className="mx-auto mb-2" size={24} />
              Cleanup Cache
            </button>
          </div>
        </section>

        {/* Status Message Area */}
        {statusMessage.text && (
           <div
            className={`mb-6 rounded-md p-4 text-center font-medium ${getStatusBgColor()}`}
            role="alert"
            aria-live="polite"
          >
            {statusMessage.text}
          </div>
        )}

        {/* Upload Text Section */}
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
            disabled={isTextLoading}
            className="inline-block w-full rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition duration-150 ease-in-out hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isTextLoading ? 'Uploading...' : 'Upload Text'}
          </button>
        </section>

        {/* Upload PDF Section */}
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
            disabled={isPdfLoading || !selectedPdf}
            className="inline-block w-full rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition duration-150 ease-in-out hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
             {isPdfLoading ? 'Uploading...' : 'Upload PDF'}
          </button>
        </section>

        {/* Upload from URL Section */}
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
             disabled={isUrlLoading}
             className="inline-block w-full rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition duration-150 ease-in-out hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
           >
             {isUrlLoading ? 'Processing...' : 'Fetch and Add URL Content'} {/* Changed button text slightly */}
           </button>
         </section>

      </div>
    </div>
  );
}

export default AdminPage;