"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Clock, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';

interface AnalyticsEvent {
    id: number;
    event_type: string;
    created_at: string;
    metadata: {
        item_count?: number;
        total_amount?: number;
        price_mode?: string;
        width?: number;
        height?: number;
        category_name?: string;
        top_product?: string;
    };
}

export default function HistoryPage() {
    const [events, setEvents] = useState<AnalyticsEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!supabase) return;

            const { data, error } = await supabase
                .from('analytics_events')
                .select('*')
                .eq('event_type', 'calculate')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Error fetching history:', error);
            } else {
                setEvents(data || []);
            }
            setLoading(false);
        };

        fetchHistory();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">ประวัติการคำนวณ</h1>
                    <p className="text-gray-500 text-sm">รายการคำนวณราคาล่าสุด 50 รายการ</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
                                <th className="p-4 font-semibold">เวลา</th>
                                <th className="p-4 font-semibold">หมวดหมู่</th>
                                <th className="p-4 font-semibold">ขนาด (กxส)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td>
                                </tr>
                            ) : events.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-gray-500">ไม่พบข้อมูล</td>
                                </tr>
                            ) : (
                                events.map((event) => (
                                    <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-gray-600 whitespace-nowrap">
                                            {new Date(event.created_at).toLocaleString('th-TH')}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {event.metadata.category_name || '-'}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {event.metadata.width ? `${event.metadata.width} x ${event.metadata.height} ซม.` : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
