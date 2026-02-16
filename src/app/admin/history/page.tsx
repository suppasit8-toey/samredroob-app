"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Clock, ArrowLeft, Search } from 'lucide-react';
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
    const [deleting, setDeleting] = useState(false);

    const fetchHistory = async () => {
        if (!supabase) return;
        setLoading(true);

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

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleClearHistory = async () => {
        if (!confirm('คุณต้องการลบประวัติการคำนวณทั้งหมดใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
            return;
        }

        if (!supabase) return;
        setDeleting(true);

        try {
            const { error } = await supabase
                .from('analytics_events')
                .delete()
                .eq('event_type', 'calculate');

            if (error) throw error;

            alert('ลบประวัติเรียบร้อยแล้ว');
            fetchHistory(); // Refresh list
        } catch (error) {
            console.error('Error clearing history:', error);
            alert('เกิดข้อผิดพลาดในการลบประวัติ');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">ประวัติการคำนวณ</h1>
                        <p className="text-gray-500 text-sm">รายการคำนวณราคาล่าสุด 50 รายการ</p>
                    </div>
                </div>

                {events.length > 0 && (
                    <button
                        onClick={handleClearHistory}
                        disabled={deleting}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        <Trash2 size={16} />
                        {deleting ? 'กำลังลบ...' : 'ล้างประวัติ'}
                    </button>
                )}
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
