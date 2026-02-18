"use client";

import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from 'next/link';
import {
    LayoutDashboard,
    Package,
    Calculator,
    LogOut,
    Home,
    Menu,
    X,
    ChevronRight,
    List,
    FolderOpen,
    Image as ImageIcon,
    MessageSquare,
    Tag,
} from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to FALSE on mobile to prevent overlap

    // Allow access to login page without auth
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    useEffect(() => {
        const checkUser = async () => {
            // ... Authentication check logic remains same ...
            if (!supabase) {
                setLoading(false);
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push("/admin/login");
                return;
            }
            setLoading(false);
        };

        checkUser();

        // Auto-open sidebar on larger screens
        const handleResize = () => {
            if (window.innerWidth >= 768) { // md breakpoint
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);

    }, [router, pathname]);

    const handleSignOut = async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
        router.push("/admin/login");
    };

    const navItems = [
        { name: 'ภาพรวม', href: '/admin', icon: <LayoutDashboard size={20} /> },
        { name: 'หมวดหมู่สินค้า', href: '/admin/categories', icon: <List size={20} /> },
        { name: 'แบรนด์', href: '/admin/brands', icon: <List size={20} /> },
        { name: 'คอลเลกชัน', href: '/admin/collections', icon: <FolderOpen size={20} /> },
        { name: 'ผลงาน', href: '/admin/portfolio', icon: <ImageIcon size={20} /> },
        { name: 'รีวิว', href: '/admin/reviews', icon: <MessageSquare size={20} /> },
        { name: 'โปรโมชั่น', href: '/admin/promotions', icon: <Tag size={20} /> },
        { name: 'สร้างใบเสนอราคา', href: '/admin/quotations/create', icon: <Package size={20} /> },
        { name: 'ตั้งค่าราคา', href: '/admin/pricing', icon: <Calculator size={20} /> },
    ];

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#f8f9fa] overflow-hidden font-sans">

            {/* Mobile Sidebar Overlay (Backdrop) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed md:static inset-y-0 left-0 z-50 
                    w-[260px] bg-white border-r border-gray-100 shadow-xl md:shadow-none
                    transition-transform duration-300 ease-in-out
                    flex flex-col
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                <div className="h-16 flex items-center px-6 border-b border-gray-50 shrink-0">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md mr-3 shrink-0">
                        A
                    </div>
                    <div className="truncate">
                        <h1 className="font-bold text-base text-gray-900 leading-tight">Admin</h1>
                        <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">Control Panel</p>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        className="ml-auto md:hidden p-1 text-gray-400 hover:text-black"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => {
                                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                                }}
                                className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? "bg-black text-white shadow-md shadow-black/10"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    <span className="font-medium text-[14px]">{item.name}</span>
                                </div>
                                {isActive && <ChevronRight size={16} className="opacity-50" />}
                            </Link>
                        );
                    })}

                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <Link
                            href="/"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black transition-all duration-200"
                            target="_blank"
                        >
                            <Home size={20} />
                            <span className="font-medium text-[14px]">ไปที่หน้าเว็บไซต์</span>
                        </Link>
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-50 shrink-0">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium text-[14px]">ออกจากระบบ</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
                {/* Top Header */}
                <header className="h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 flex justify-between items-center sticky top-0 z-30 w-full shadow-sm">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg hover:text-black transition"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>

                        <div>
                            <h2 className="text-lg font-bold text-gray-900 leading-tight">
                                {navItems.find(i => i.href === pathname)?.name || 'Dashboard'}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold uppercase tracking-wide">Online</span>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 text-xs font-bold text-gray-600">
                            A
                        </div>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto bg-[#f8f9fa] p-4 md:p-6 pb-20">
                    <div className="max-w-6xl mx-auto w-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
