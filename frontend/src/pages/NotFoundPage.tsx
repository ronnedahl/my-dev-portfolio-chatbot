import React from 'react';
import ErrorDisplay from '../components/ErrorDisplay';

const NotFoundPage: React.FC = () => {
    const reasons = [
        'The URL is misspelled',
        'The page has been moved or removed',
        'You followed a broken link'
    ];

    return (
        <ErrorDisplay
            code="404"
            title="Oops! Page not found"
            description="The page you're looking for doesn't seem to exist."
            reasons={reasons}
        />
    );
};

export default NotFoundPage;
