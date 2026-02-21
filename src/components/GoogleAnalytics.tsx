"use client";

declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
    }
}

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Inner component that uses useSearchParams (needs Suspense boundary)
function PageViewTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!GA_MEASUREMENT_ID) return;
        const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
        window.gtag?.('config', GA_MEASUREMENT_ID, {
            page_path: url,
        });
    }, [pathname, searchParams]);

    return null;
}

// Custom event helper — use from anywhere:
//   import { trackEvent } from '@/components/GoogleAnalytics';
//   trackEvent('calculate_price', { collection: 'xxx', total: 1234 });
export function trackEvent(action: string, params?: Record<string, any>) {
    if (!GA_MEASUREMENT_ID) return;
    window.gtag?.('event', action, params);
}

export default function GoogleAnalytics() {
    if (!GA_MEASUREMENT_ID) return null;

    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script
                id="google-analytics"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${GA_MEASUREMENT_ID}', {
                            page_path: window.location.pathname,
                            send_page_view: true
                        });
                    `,
                }}
            />
            <Suspense fallback={null}>
                <PageViewTracker />
            </Suspense>
        </>
    );
}
