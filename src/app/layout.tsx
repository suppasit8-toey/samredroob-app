import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
    title: "SAMREDROOB - Premium Curtains & Wallpaper",
    description: "Calculate prices and browse our premium collection.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                    <Header />
                    <main style={{ flex: 1 }}>
                        {children}
                    </main>
                    <Footer />
                    <BottomNav />
                </div>
            </body>
        </html>
    );
}
