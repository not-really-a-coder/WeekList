'use client';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function CookieConsent() {
    useEffect(() => {
        // Global Debug: Clear LocalStorage via URL detection
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.has('ClearLocalStorage')) {
                localStorage.clear();

                toast("System Reset", {
                    description: "Local storage has been cleared.",
                    duration: 5000,
                });

                // Remove the parameter from the URL cleanly
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);

                // Force reload to clear application state
                setTimeout(() => window.location.reload(), 1000);
            }
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
