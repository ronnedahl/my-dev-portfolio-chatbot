import React from 'react';
import { IoRefreshOutline, IoChatbubbleOutline, IoMailOutline } from 'react-icons/io5';
import ErrorDisplay from '../components/ErrorDisplay';

const ServerErrorPage: React.FC = () => {
    const reasons = [
        'The server is temporarily unavailable',
        'Database error or configuration issue',
        'Maintenance is in progress',
        'High load on the system'
    ];

    const actions = [
        {
            label: 'Try again',
            onClick: () => window.location.reload(),
            icon: IoRefreshOutline,
            variant: 'primary' as const
        },
        {
            label: 'Back to chat',
            href: '/chat',
            icon: IoChatbubbleOutline,
            variant: 'secondary' as const
        },
        {
            label: 'Report issue',
            onClick: () => window.open('mailto:support@peterbot.dev?subject=Server Error 500', '_blank'),
            icon: IoMailOutline,
            variant: 'tertiary' as const
        }
    ];

    return (
        <ErrorDisplay
            code="500"
            title="Server error"
            description="Something went wrong on our server. We're working on a fix."
            reasons={reasons}
            actions={actions}
            footerMessage="The issue is usually temporary. Please try again in a moment."
        />
    );
};

export default ServerErrorPage;
