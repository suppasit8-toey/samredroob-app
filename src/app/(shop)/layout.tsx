import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { LanguageProvider } from "@/contexts/LanguageContext";

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <LanguageProvider>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <AnalyticsTracker />
                <Header />
                <main style={{ flex: 1 }}>
                    {children}
                </main>
                <Footer />
                <BottomNav />
            </div>
        </LanguageProvider>
    );
}
