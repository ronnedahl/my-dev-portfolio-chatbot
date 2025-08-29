import React, { useState } from 'react';
import { IoBarChart, IoTrash, IoRefresh } from 'react-icons/io5';
import { getCacheStats, clearCache, cleanupCache } from '../../utils/api';
import { StatusMessageType, CacheStats, CleanupResult } from '../../types/admin.types';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface CacheManagementProps {
  setStatusMessage: (message: StatusMessageType) => void;
}

const CacheManagement: React.FC<CacheManagementProps> = ({ setStatusMessage }) => {
  const [isLoading, setIsLoading] = useState({
    stats: false,
    clear: false,
    cleanup: false
  });
  
  const { user, getToken } = useAuth();
  const navigate = useNavigate();

  const withAuth = async <T,>(operation: (token: string) => Promise<T>): Promise<T | null> => {
    if (!user) {
      setStatusMessage({
        text: 'Du måste vara inloggad för att använda admin-funktioner',
        type: 'error'
      });
      navigate('/login');
      return null;
    }

    const token = await getToken();
    if (!token) {
      setStatusMessage({
        text: 'Kunde inte hämta autentiseringstoken',
        type: 'error'
      });
      return null;
    }

    return operation(token);
  };

  const handleCacheStats = async () => {
    setIsLoading(prev => ({ ...prev, stats: true }));
    try {
      const stats = await withAuth(getCacheStats);
      if (stats) {
        const cacheStats = stats as CacheStats;
        setStatusMessage({
          text: `Cache stats: ${cacheStats.size} items, ${cacheStats.totalSize} bytes`,
          type: 'info'
        });
      }
    } catch (error) {
      setStatusMessage({
        text: 'Failed to get cache stats',
        type: 'error'
      });
    } finally {
      setIsLoading(prev => ({ ...prev, stats: false }));
    }
  };

  const handleClearCache = async () => {
    setIsLoading(prev => ({ ...prev, clear: true }));
    try {
      const result = await withAuth(clearCache);
      if (result) {
        setStatusMessage({
          text: 'Cache cleared successfully',
          type: 'success'
        });
      }
    } catch (error) {
      setStatusMessage({
        text: 'Failed to clear cache',
        type: 'error'
      });
    } finally {
      setIsLoading(prev => ({ ...prev, clear: false }));
    }
  };

  const handleCleanupCache = async () => {
    setIsLoading(prev => ({ ...prev, cleanup: true }));
    try {
      const result = await withAuth(cleanupCache);
      if (result) {
        const cleanupResult = result as CleanupResult;
        setStatusMessage({
          text: `Cleaned up ${cleanupResult.removed} expired items`,
          type: 'success'
        });
      }
    } catch (error) {
      setStatusMessage({
        text: 'Failed to cleanup cache',
        type: 'error'
      });
    } finally {
      setIsLoading(prev => ({ ...prev, cleanup: false }));
    }
  };

  return (
    <section className="mb-8 rounded-lg bg-gray-800 p-6 shadow-md">
      <h2 className="mb-5 inline-block border-b-2 border-blue-500 pb-2 text-xl font-semibold text-white">
        <IoBarChart className="inline mr-2" />
        Cache Management
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

export default CacheManagement;