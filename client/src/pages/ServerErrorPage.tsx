import React from 'react';
import { IoRefreshOutline, IoChatbubbleOutline, IoMailOutline } from 'react-icons/io5';
import ErrorDisplay from '../components/ErrorDisplay';

const ServerErrorPage: React.FC = () => {
    const reasons = [
        'Servern är tillfälligt otillgänglig',
        'Databasfel eller konfigurationsproblem',
        'Underhållsarbete pågår',
        'Hög belastning på systemet'
    ];

    const actions = [
        {
            label: 'Försök igen',
            onClick: () => window.location.reload(),
            icon: IoRefreshOutline,
            variant: 'primary' as const
        },
        {
            label: 'Tillbaka till chatten',
            href: '/chat',
            icon: IoChatbubbleOutline,
            variant: 'secondary' as const
        },
        {
            label: 'Rapportera problem',
            onClick: () => window.open('mailto:support@peterbot.dev?subject=Server Error 500', '_blank'),
            icon: IoMailOutline,
            variant: 'tertiary' as const
        }
    ];

    return (
        <ErrorDisplay
            code="500"
            title="Serverfel uppstod"
            description="Något gick fel på vår server. Vi arbetar på att lösa problemet."
            reasons={reasons}
            actions={actions}
            footerMessage="Problemet är vanligtvis tillfälligt. Försök igen om en stund."
        />
    );
};

export default ServerErrorPage;