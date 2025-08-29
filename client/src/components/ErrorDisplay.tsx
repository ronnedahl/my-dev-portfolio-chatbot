import React from 'react';
import { Link } from 'react-router-dom';
import { IconType } from 'react-icons';
import { IoHomeOutline, IoChatbubbleOutline, IoArrowBackOutline } from 'react-icons/io5';
import profilfoto from '../assets/profilfoto.jpg';

interface ErrorAction {
    label: string;
    href?: string;
    onClick?: () => void;
    icon: IconType;
    variant: 'primary' | 'secondary' | 'tertiary';
}

interface ErrorDisplayProps {
    
    code: string;
   
    title: string;
   
    description: string;
   
    reasons?: string[];
   
    actions?: ErrorAction[];
  
    footerMessage?: string;
}

const defaultActions: ErrorAction[] = [
    {
        label: 'Tillbaka till chatten',
        href: '/chat',
        icon: IoChatbubbleOutline,
        variant: 'primary'
    },
    {
        label: 'Gå tillbaka',
        onClick: () => window.history.back(),
        icon: IoArrowBackOutline,
        variant: 'secondary'
    },
    {
        label: 'Hem',
        href: '/',
        icon: IoHomeOutline,
        variant: 'tertiary'
    }
];

const getButtonClasses = (variant: ErrorAction['variant']): string => {
    const baseClasses = "w-full font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2";
    
    switch (variant) {
        case 'primary':
            return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white`;
        case 'secondary':
            return `${baseClasses} bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white`;
        case 'tertiary':
            return `${baseClasses} bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-300 border border-gray-600`;
        default:
            return `${baseClasses} bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white`;
    }
};

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    code,
    title,
    description,
    reasons = [],
    actions = defaultActions,
    footerMessage = "Behöver du hjälp? Ställ en fråga i chatten!"
}) => {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
               
                <div className="mb-8">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-500 mx-auto mb-4">
                        <img 
                            src={profilfoto} 
                            alt="Peter" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
                    <p className="text-gray-400">{description}</p>
                </div>

                <div className="mb-8">
                    <div className="text-8xl font-bold text-blue-500 mb-4">{code}</div>
                    
                    {reasons.length > 0 && (
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <p className="text-gray-300 mb-4">Det kan bero på att:</p>
                            <ul className="text-sm text-gray-400 text-left space-y-2">
                                {reasons.map((reason, index) => (
                                    <li key={index} className="flex items-center">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                                        {reason}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    {actions.map((action, index) => {
                        const Icon = action.icon;
                        const buttonClasses = getButtonClasses(action.variant);

                        if (action.href) {
                            return (
                                <Link key={index} to={action.href} className={buttonClasses}>
                                    <Icon size={20} />
                                    <span>{action.label}</span>
                                </Link>
                            );
                        }

                        return (
                            <button key={index} onClick={action.onClick} className={buttonClasses}>
                                <Icon size={20} />
                                <span>{action.label}</span>
                            </button>
                        );
                    })}
                </div>

                {footerMessage && (
                    <div className="mt-8 pt-6 border-t border-gray-700">
                        <p className="text-xs text-gray-500">{footerMessage}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ErrorDisplay;