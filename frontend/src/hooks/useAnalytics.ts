import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const initGA = (): void => {
    if (GA_MEASUREMENT_ID) {
        ReactGA.initialize(GA_MEASUREMENT_ID);
    }
};

export const usePageTracking = (): void => {
    const location = useLocation();

    useEffect(() => {
        if (GA_MEASUREMENT_ID) {
            ReactGA.send({
                hitType: 'pageview',
                page: location.pathname + location.search,
            });
        }
    }, [location]);
};

export const trackEvent = (
    category: string,
    action: string,
    label?: string,
    value?: number
): void => {
    if (GA_MEASUREMENT_ID) {
        ReactGA.event({
            category,
            action,
            label,
            value,
        });
    }
};
