import { useNavigate } from 'react-router-dom';
import { APIError } from '../utils/api';

interface UseErrorHandlerReturn {
    handleError: (error: Error | APIError | unknown) => void;
    navigateToError: (errorType: '404' | '500') => void;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
    const navigate = useNavigate();

    const handleError = (error: Error | APIError | unknown): void => {
        console.error('Error handled by useErrorHandler:', error);

        if (error instanceof APIError) {
            switch (error.status) {
                case 404:
                    navigate('/404', { replace: true });
                    break;
                case 500:
                case 502:
                case 503:
                case 504:
                    navigate('/500', { replace: true });
                    break;
                case 429:
                    
                    console.warn('Rate limit exceeded');
                    break;
                default:
                   
                    console.error('API Error:', error.message);
            }
            return;
        }

        if (error instanceof TypeError && error.message.includes('fetch')) {
            navigate('/500', { replace: true });
            return;
        }

        if (error instanceof Error) {
            console.error('Generic error:', error.message);
        } else {
            console.error('Unknown error:', error);
        }
    };

    const navigateToError = (errorType: '404' | '500'): void => {
        navigate(`/${errorType}`, { replace: true });
    };

    return {
        handleError,
        navigateToError
    };
};