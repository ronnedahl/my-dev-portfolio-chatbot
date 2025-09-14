import React from 'react';
import ErrorDisplay from '../components/ErrorDisplay';

const NotFoundPage: React.FC = () => {
    const reasons = [
        'URL:en är felstavad',
        'Sidan har flyttats eller tagits bort',
        'Du följde en trasig länk'
    ];

    return (
        <ErrorDisplay
            code="404"
            title="Oops! Sidan hittades inte"
            description="Den sida du söker verkar inte existera."
            reasons={reasons}
        />
    );
};

export default NotFoundPage;