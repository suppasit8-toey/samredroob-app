import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";

import { CartProvider } from "@/context/CartContext";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const kanit = Kanit({
    subsets: ["thai", "latin"],
    weight: ["200", "300", "400", "500", "600", "700"],
    variable: "--font-kanit",
    display: 'swap',
});

export const metadata: Metadata = {
    title: "สำเร็จรูป-Samredroob - ผ้าม่านและวอลเปเปอร์เกรดพรีเมียม",
    description: "คำนวณราคาและเลือกชมสินค้าคุณภาพเยี่ยมของเรา",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="th">
            <body className={`${kanit.variable} ${kanit.className} antialiased`}>
                <GoogleAnalytics />
                <CartProvider>
                    {children}
                </CartProvider>
            </body>
        </html>
    );
}
