"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Package,
    Calculator,
    TrendingUp,
    Users,
    ArrowRight,
    Clock,
    AlertCircle,
    FileText
} from 'lucide-react';

export default function AdminPage() {
    const [stats, setStats] = useState({
        productsCount: 0,
        calculationsToday: 0,
        visitsToday: 0
    });

    // Marketing Data State
    const [marketingData, setMarketingData] = useState<{
        sources: Record<string, number>;
        devices: Record<string, number>;
        pages: Record<string, number>;
    } | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (!supabase) return;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayISO = today.toISOString();

            // 1. Count Products
            const { count: productsCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true });

            // 2. Count Calculations Today
            const { count: calculationsToday } = await supabase
                .from('analytics_events')
                .select('*', { count: 'exact', head: true })
                .eq('event_type', 'calculate')
                .gte('created_at', todayISO);

            // 3. Fetch Visits Today (Detailed)
            const { data: visits } = await supabase
                .from('analytics_events')
                .select('page_path, metadata')
                .eq('event_type', 'visit')
                // .gte('created_at', todayISO); // Use this for Today only
                .limit(100); // For dev/demo purposes, assume all time or recent 100 to show data if today is empty

            const visitsCount = visits?.length || 0;

            // Process Marketing Data
            const sources: Record<string, number> = {};
            const devices: Record<string, number> = {};
            const pages: Record<string, number> = {};

            visits?.forEach((v: any) => {
                // Source
                let source = 'Direct / Unknown';
                const referrer = v.metadata?.referrer || '';
                if (referrer.includes('google')) source = 'Google Search';
                else if (referrer.includes('facebook')) source = 'Facebook';
                else if (referrer.includes('instagram')) source = 'Instagram';
                else if (referrer.includes('line')) source = 'Line';
                else if (referrer.includes('twitter') || referrer.includes('x.com')) source = 'Twitter';
                sources[source] = (sources[source] || 0) + 1;

                // Device
                let device = 'Desktop';
                const ua = (v.metadata?.user_agent || '').toLowerCase();
                if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) device = 'Mobile';
                devices[device] = (devices[device] || 0) + 1;

                // Page
                const page = v.page_path || '/';
                pages[page] = (pages[page] || 0) + 1;
            });

            setStats({
                productsCount: productsCount || 0,
                calculationsToday: calculationsToday || 0,
                visitsToday: visitsCount
            });

            setMarketingData({ sources, devices, pages });
        };

        fetchStats();
    }, []);

    // Mock Data for Dashboard (Updated with real values)
    const statCards = [
        {
            label: 'สินค้าทั้งหมด',
            value: stats.productsCount.toString(),
            icon: <Package size={24} className="text-blue-600" />,
            bg: 'bg-blue-50',
            trend: 'Live',
            trendUp: true
        },
        {
            label: 'คำนวณราคา (วันนี้)',
            value: stats.calculationsToday.toString(),
            icon: <Calculator size={24} className="text-purple-600" />,
            bg: 'bg-purple-50',
            trend: 'Today',
            trendUp: true
        },
        {
            label: 'ผู้เข้าชม (รวม)',
            value: stats.visitsToday.toString(),
            icon: <Users size={24} className="text-green-600" />,
            bg: 'bg-green-50',
            trend: 'All Time',
            trendUp: true
        },
    ];

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                {stat.icon}
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${stat.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.label}</h3>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Marketing Insights */}
            {marketingData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Sources */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingUp size={18} className="text-blue-500" /> แหล่งที่มา (Traffic Source)
                        </h3>
                        <div className="space-y-3">
                            {Object.entries(marketingData.sources).map(([source, count]) => (
                                <div key={source} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">{source}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full"
                                                style={{ width: `${(count / stats.visitsToday) * 100}%` }}
                                            />
                                        </div>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Devices */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Users size={18} className="text-purple-500" /> อุปกรณ์ (Devices)
                        </h3>
                        <div className="space-y-3">
                            {Object.entries(marketingData.devices).map(([device, count]) => (
                                <div key={device} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">{device}</span>
                                    <span className="font-medium bg-gray-50 px-2 py-1 rounded">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Pages */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Package size={18} className="text-green-500" /> หน้ายอดนิยม (Top Pages)
                        </h3>
                        <div className="space-y-3">
                            {Object.entries(marketingData.pages)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 5)
                                .map(([page, count]) => (
                                    <div key={page} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600 truncate max-w-[180px]" title={page}>{page}</span>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">เมนูลัด (Quick Actions)</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/admin/products" className="group p-4 rounded-xl border border-gray-100 hover:border-black hover:bg-gray-50 transition-all duration-200 flex items-center gap-4">
                            <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                                <Package size={24} className="text-gray-600 group-hover:text-black" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">จัดการสินค้า</h4>
                                <p className="text-sm text-gray-500">เพิ่ม ลบ หรือแก้ไขข้อมูลสินค้า</p>
                            </div>
                            <ArrowRight size={18} className="ml-auto text-gray-300 group-hover:text-black transform group-hover:translate-x-1 transition-all" />
                        </Link>

                        <Link href="/admin/pricing" className="group p-4 rounded-xl border border-gray-100 hover:border-black hover:bg-gray-50 transition-all duration-200 flex items-center gap-4">
                            <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                                <Calculator size={24} className="text-gray-600 group-hover:text-black" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">ตั้งค่าราคา</h4>
                                <p className="text-sm text-gray-500">กำหนด VAT และค่าบริการต่างๆ</p>
                            </div>
                            <ArrowRight size={18} className="ml-auto text-gray-300 group-hover:text-black transform group-hover:translate-x-1 transition-all" />
                        </Link>

                        <Link href="/admin/history" className="group p-4 rounded-xl border border-gray-100 hover:border-black hover:bg-gray-50 transition-all duration-200 flex items-center gap-4">
                            <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                                <Clock size={24} className="text-gray-600 group-hover:text-black" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">ประวัติการคำนวณ</h4>
                                <p className="text-sm text-gray-500">ดูรายการที่ลูกค้ากดคำนวณ</p>
                            </div>
                            <ArrowRight size={18} className="ml-auto text-gray-300 group-hover:text-black transform group-hover:translate-x-1 transition-all" />
                        </Link>

                        <Link href="/admin/quotations" className="group p-4 rounded-xl border border-gray-100 hover:border-black hover:bg-gray-50 transition-all duration-200 flex items-center gap-4">
                            <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                                <FileText size={24} className="text-gray-600 group-hover:text-black" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">คำขอใบเสนอราคา</h4>
                                <p className="text-sm text-gray-500">ดูรายการที่ลูกค้าติดต่อเข้ามา</p>
                            </div>
                            <ArrowRight size={18} className="ml-auto text-gray-300 group-hover:text-black transform group-hover:translate-x-1 transition-all" />
                        </Link>
                    </div>
                </div>

                {/* Notifications / Updates */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">การแจ้งเตือน</h3>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="mt-1">
                                <AlertCircle size={16} className="text-orange-500" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-800 font-medium">สต็อกผ้าเหลือน้อย</p>
                                <p className="text-xs text-gray-500 mt-1">ผ้า Dimout รหัส D-001 ใกล้หมดแล้ว</p>
                            </div>
                        </div>
                        <div className="w-full h-px bg-gray-50"></div>
                        <div className="flex gap-3">
                            <div className="mt-1">
                                <Clock size={16} className="text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-800 font-medium">อัปเดตระบบล่าสุด</p>
                                <p className="text-xs text-gray-500 mt-1">เมื่อ 2 ชม. ที่แล้ว</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
