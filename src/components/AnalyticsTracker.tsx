"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const initialized = useRef(false);

    useEffect(() => {
        // Prevent double tracking in React Strict Mode
        if (initialized.current) return;
        initialized.current = true;

        const trackVisit = async () => {
            if (!supabase) return;

            // Simple session-based deduplication for "Visits"
            // We use sessionStorage which clears when the tab is closed.
            // If we want "Daily Unique Visitors", we might use localStorage with a date check.
            // Let's go with "Daily Unique" per device/browser using localStorage.

            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const lastVisit = localStorage.getItem('last_visit_date');

            if (lastVisit === today) {
                // Already visited today
                return;
            }

            try {
                const { error } = await supabase
                    .from('analytics_events')
                    .insert([
                        {
                            event_type: 'visit',
                            page_path: pathname,
                            metadata: {
                                referrer: document.referrer,
                                user_agent: navigator.userAgent
                            }
                        }
                    ]);

                if (!error) {
                    localStorage.setItem('last_visit_date', today);
                    console.log('Visit tracked');
                } else {
                    console.error('Error tracking visit:', error);
                }
            } catch (err) {
                console.error('Failed to track visit:', err);
            }
        };

        trackVisit();
    }, []);

    return null; // This component renders nothing
}
