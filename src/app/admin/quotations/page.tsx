"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Search, Phone, Mail, FileText, CheckCircle, Clock, ExternalLink, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface QuotationRequest {
    id: number;
    reference_code?: string;
    name: string;
    phone: string;
    email: string;
    items: any[];
    total_amount: number;
    price_mode: string;
    status: string;
    created_at: string;
}

export default function QuotationListPage() {
    const [requests, setRequests] = useState<QuotationRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        if (!supabase) return;

        const { data, error } = await supabase
            .from('quotation_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching requests:', error);
        } else {
            setRequests(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const updateStatus = async (id: number, newStatus: string) => {
        if (!supabase) return;

        const { error } = await supabase
            .from('quotation_requests')
            .update({ status: newStatus })
            .eq('id', id);

        if (!error) {
            setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
        }
    };

    const deleteRequest = async (id: number) => {
        if (!confirm('คุณต้องการลบรายการนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) return;
        if (!supabase) return;

        const { error } = await supabase
            .from('quotation_requests')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting request:', error);
            alert('ลบรายการไม่สำเร็จ');
        } else {
            setRequests(requests.filter(r => r.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">คำขอใบเสนอราคา</h1>
                    <p className="text-gray-500 text-sm">รายการลูกค้าที่ขอใบเสนอราคาจากหน้าเว็บ</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
                                <th className="p-4 font-semibold">วันที่</th>
                                <th className="p-4 font-semibold">รหัสอ้างอิง</th>
                                <th className="p-4 font-semibold">ลูกค้า</th>
                                <th className="p-4 font-semibold">เบอร์โทร / อีเมล</th>
                                <th className="p-4 font-semibold text-right">ยอดรวม</th>
                                <th className="p-4 font-semibold text-center">สถานะ</th>
                                <th className="p-4 font-semibold text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">ไม่พบคำขอใบเสนอราคา</td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-gray-600 whitespace-nowrap">
                                            {new Date(req.created_at).toLocaleString('th-TH')}
                                        </td>
                                        <td className="p-4 font-mono text-gray-600 font-medium">
                                            #{req.reference_code || req.id}
                                        </td>
                                        <td className="p-4 font-medium text-gray-900">
                                            {req.name}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            <div className="flex flex-col gap-1">
                                                <span className="flex items-center gap-2"><Phone size={14} /> {req.phone}</span>
                                                {req.email && <span className="flex items-center gap-2"><Mail size={14} /> {req.email}</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right font-medium text-green-600">
                                            ฿{req.total_amount.toLocaleString()}
                                            <span className="text-xs text-gray-400 block">
                                                ({req.price_mode === 'shop' ? 'หน้าร้าน' : 'Platform'})
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${req.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                req.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {req.status === 'completed' ? 'สำเร็จ' :
                                                    req.status === 'contacted' ? 'ติดต่อแล้ว' : 'รอติดต่อ'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <a
                                                    href={`/quotation/${req.reference_code || req.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                                                    title="ดูหน้าใบเสนอราคา (ลิ้งที่ลูกค้าเห็น)"
                                                >
                                                    <ExternalLink size={18} />
                                                </a>
                                                {req.status !== 'completed' && (
                                                    <button
                                                        onClick={() => updateStatus(req.id, 'completed')}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                                        title="ทำเครื่องหมายว่าสำเร็จ"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                {req.status === 'pending' && (
                                                    <button
                                                        onClick={() => updateStatus(req.id, 'contacted')}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                        title="ทำเครื่องหมายว่าติดต่อแล้ว"
                                                    >
                                                        <Clock size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteRequest(req.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                    title="ลบรายการ"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
}
