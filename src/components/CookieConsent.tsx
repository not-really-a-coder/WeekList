'use client';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function CookieConsent() {
    useEffect(() => {
        // Global Debug: Clear LocalStorage via URL detection
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            // legacy ClearLocalStorage logic removed

        }

        const timer = setTimeout(() => {
            const hasConsent = localStorage.getItem('weeklist-cookie-consent');
            if (!hasConsent) {
                toast("We're using cookies", {
                    id: 'cookie-consent',
                    duration: Infinity,
                    action: {
                        label: 'Okay',
                        onClick: () => localStorage.setItem('weeklist-cookie-consent', 'true'),
                    },
                    dismissible: false, // Force user to click action
                });
            }
        }, 1000); // 1 second delay to ensure layout is ready

        return () => clearTimeout(timer);
    }, []);
    return null;
}
