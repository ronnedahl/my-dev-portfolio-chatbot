import React, { useState } from 'react';
import { IoBarChart, IoTrash, IoRefresh } from 'react-icons/io5';
import { StatusMessageType } from '../../types/admin.types';

interface CacheManagementDevProps {
  setStatusMessage: (message: StatusMessageType) => void;
}

const CacheManagementDev: React.FC<CacheManagementDevProps> = ({ setStatusMessage }) => {
  const [isLoading, setIsLoading] = useState({
    stats: false,
    clear: false,
    cleanup: false
  });

  const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleCacheStats = async () => {
    setIsLoading(prev => ({ ...prev, stats: true }));
    await simulateDelay(1000);
    setStatusMessage({
      text: 'Cache stats: 42 items, 2.1MB total size',
      type: 'info'
    });
    setIsLoading(prev => ({ ...prev, stats: false }));
  };

  const handleClearCache = async () => {
    setIsLoading(prev => ({ ...prev, clear: true }));
    await simulateDelay(800);
    setStatusMessage({
      text: 'Cache cleared successfully',
      type: 'success'
    });
    setIsLoading(prev => ({ ...prev, clear: false }));
  };

  const handleCleanupCache = async () => {
    setIsLoading(prev => ({ ...prev, cleanup: true }));
    await simulateDelay(1200);
    setStatusMessage({
      text: 'Cleaned up 7 expired items',
      type: 'success'
    });
    setIsLoading(prev => ({ ...prev, cleanup: false }));
  };

  return (
    <section className="mb-8 rounded-lg bg-gray-800 p-6 shadow-md">
      <h2 className="mb-5 inline-block border-b-2 border-blue-500 pb-2 text-xl font-semibold text-white">
        <IoBarChart className="inline mr-2" />
        Cache Management (Dev Mode)
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleCacheStats}
          disabled={isLoading.stats}
          className="p-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
        >
          <IoBarChart className="mx-auto mb-2" size={24} />
          {isLoading.stats ? 'Loading...' : 'Cache Stats'}
        </button>
        
        <button
          onClick={handleClearCache}
          disabled={isLoading.clear}
          className="p-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
        >
          <IoTrash className="mx-auto mb-2" size={24} />
          {isLoading.clear ? 'Clearing...' : 'Clear Cache'}
        </button>
        
        <button
          onClick={handleCleanupCache}
          disabled={isLoading.cleanup}
          className="p-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
        >
          <IoRefresh className="mx-auto mb-2" size={24} />
          {isLoading.cleanup ? 'Cleaning...' : 'Cleanup Cache'}
        </button>
      </div>
    </section>
  );
};

export default CacheManagementDev;