"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Send, Store, ShoppingBag, Info, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

interface QuotationItem {
    id: string; // Cart Item ID
    collection: {
        name: string;
        name_en?: string;
        unit: string;
        price_per_unit: number;
    };
    width: number;
    height: number;
    currentTotal: number;
    unitPrice: number;
    selectedVariant?: {
        id: number;
        name: string;
        image_url?: string;
    };
}

interface QuotationRequest {
    id: number;
    reference_code: string;
    name: string;
    phone: string; // We might mask this for public view
    email: string; // We might mask this for public view
    items: QuotationItem[];
    total_amount: number;
    price_mode: 'shop' | 'platform';
    status: string;
    created_at: string;
}

export default function SharedQuotationPage() {
    const { language } = useLanguage();
    const params = useParams();
    const id = params?.id; // This is now the reference code

    const [quotation, setQuotation] = useState<QuotationRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const t = {
        th: {
            loading: 'กำลังโหลดใบเสนอราคา...',
            errorTitle: 'เกิดข้อผิดพลาด',
            errorMessage: 'ไม่พบใบเสนอราคาที่คุณต้องการ หรือรายการอาจถูกลบไปแล้ว',
            backToHome: 'กลับหน้าหลัก',
            quotation: 'ใบเสนอราคา',
            refCode: 'รหัสอ้างอิง:',
            customer: 'คุณ:',
            items: 'รายการสินค้า',
            shopPrice: 'ราคาหน้าร้าน',
            platformPrice: 'ราคาแพลตฟอร์ม',
            code: 'รหัส:',
            size: 'ขนาด:',
            totalAmount: 'ราคารวมทั้งหมด',
            includePlatformFee: 'ราคานี้รวมค่าธรรมเนียมแพลตฟอร์มแล้ว',
            specMaterial: 'สเปค/วัสดุ:',
            interestedTitle: 'สนใจสั่งทำรายการนี้?',
            interestedDesc: 'แอด LINE เพื่อยืนยันการสั่งซื้อกับแอดมินได้เลย',
            orderViaLine: 'ติดต่อสั่งทำทาง LINE',
            calculateAgain: 'คำนวณราคาใหม่ / ดูสินค้าอื่นๆ',
            unitCm: 'ซม.'
        },
        en: {
            loading: 'Loading quotation...',
            errorTitle: 'Error',
            errorMessage: 'Quotation not found or may have been deleted.',
            backToHome: 'Back to Home',
            quotation: 'Quotation',
            refCode: 'Reference Code:',
            customer: 'Customer:',
            items: 'Items',
            shopPrice: 'Store Price',
            platformPrice: 'Platform Price',
            code: 'Code:',
            size: 'Size:',
            totalAmount: 'Total Amount',
            includePlatformFee: 'Includes platform fee',
            specMaterial: 'Spec/Material:',
            interestedTitle: 'Interested in ordering?',
            interestedDesc: 'Add LINE to confirm your order with admin.',
            orderViaLine: 'Order via LINE',
            calculateAgain: 'Calculate Again / View Other Products',
            unitCm: 'cm'
        }
    };

    useEffect(() => {
        const fetchQuotation = async () => {
            if (!id || !supabase) return;

            try {
                // Try to fetch by reference_code first (new system)
                let query = supabase
                    .from('quotation_requests')
                    .select('*');

                // If it looks like a ref code (6 chars), query reference_code
                // precise check might be needed if we support legacy IDs in same route, but for now assuming new links use ref code.
                // Actually, let's try reference_code first.

                const { data, error } = await query
                    .eq('reference_code', id)
                    .single();

                if (!error && data) {
                    setQuotation(data);
                } else {
                    // Fallback check for legacy integer IDs if needed, or if error
                    // For now, let's strict match reference code for new items.
                    // If we want to support old links (integer), we'd check if 'id' is numeric.
                    if (!isNaN(Number(id))) {
                        const { data: legacyData, error: legacyError } = await supabase
                            .from('quotation_requests')
                            .select('*')
                            .eq('id', id)
                            .single();

                        if (legacyError) throw legacyError;
                        setQuotation(legacyData);
                    } else {
                        throw error;
                    }
                }
            } catch (err) {
                console.error('Error fetching quotation:', err);
                setError(t[language].errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchQuotation();
    }, [id, language]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">{t[language].loading}</p>
                </div>
            </div>
        );
    }

    if (error || !quotation) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        <AlertCircle size={24} />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">{t[language].errorTitle}</h1>
                    <p className="text-gray-500 mb-6">{error || t[language].errorMessage}</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft size={18} /> {t[language].backToHome}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '3rem 1rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
            <div className="mb-8 text-center">
                <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-mitr)', margin: '0 0 0.5rem 0' }}>{t[language].quotation}</h1>
                <p className="text-gray-500">{t[language].refCode} #{quotation?.reference_code || quotation?.id}</p>
                <div className="mt-2 inline-block bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                    {t[language].customer} {quotation?.name}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <div className="font-semibold text-gray-700">{t[language].items}</div>
                    <div className="text-sm font-medium px-3 py-1 rounded-full bg-white border border-gray-200 flex items-center gap-2">
                        {quotation.price_mode === 'shop' ? (
                            <><Store size={14} /> {t[language].shopPrice}</>
                        ) : (
                            <><ShoppingBag size={14} className="text-orange-500" /> {t[language].platformPrice}</>
                        )}
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <tbody className="divide-y divide-gray-100">
                            {quotation.items.map((item, index) => (
                                <tr key={index}>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                            {language === 'en' && item.collection.name_en ? item.collection.name_en : item.collection.name}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                            {item.selectedVariant && (
                                                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded mr-2 mb-1">
                                                    {t[language].code} {item.selectedVariant.name}
                                                </span>
                                            )}
                                            <span className="block sm:inline">{t[language].size} {item.width} x {item.height} {t[language].unitCm}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600, fontSize: '1.1rem' }}>
                                        ฿{item.currentTotal.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot style={{ backgroundColor: '#f9fafb', borderTop: '1px solid #e5e5e5' }}>
                            <tr>
                                <td style={{ padding: '1.5rem', textAlign: 'right', fontWeight: 600, fontSize: '1.2rem' }}>
                                    {t[language].totalAmount}
                                </td>
                                <td style={{ padding: '1.5rem', textAlign: 'right', fontWeight: 700, fontSize: '1.5rem', color: 'black' }}>
                                    ฿{quotation.total_amount.toLocaleString()}
                                </td>
                            </tr>
                            {quotation.price_mode === 'platform' && (
                                <tr>
                                    <td colSpan={2} style={{ padding: '0.5rem 1.5rem 1.5rem', textAlign: 'right', color: '#f97316', fontSize: '0.85rem' }}>
                                        <span className="inline-flex items-center gap-1">
                                            <Info size={12} /> {t[language].includePlatformFee}
                                        </span>
                                    </td>
                                </tr>
                            )}
                        </tfoot>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                    {quotation.items.map((item, index) => (
                        <div key={index} className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="font-semibold text-lg">
                                    {language === 'en' && item.collection.name_en ? item.collection.name_en : item.collection.name}
                                </div>
                                <div className="font-bold text-gray-900">฿{item.currentTotal.toLocaleString()}</div>
                            </div>

                            <div className="text-sm text-gray-500 mb-2">
                                {item.width} x {item.height} {t[language].unitCm}
                            </div>

                            {item.selectedVariant && (
                                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                                    <span className="text-gray-500 block text-xs mb-1">{t[language].specMaterial}</span>
                                    <span className="font-medium text-gray-700">{item.selectedVariant.name}</span>
                                </div>
                            )}
                        </div>
                    ))}
                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-gray-700">{t[language].totalAmount}</span>
                            <span className="font-bold text-xl text-black">฿{quotation.total_amount.toLocaleString()}</span>
                        </div>
                        {quotation.price_mode === 'platform' && (
                            <div className="text-right text-xs text-orange-500 flex justify-end items-center gap-1">
                                <Info size={12} /> {t[language].includePlatformFee}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div style={{ backgroundColor: '#F0FDF4', padding: '2rem', borderRadius: '16px', border: '1px solid #BBF7D0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#166534', marginBottom: '0.5rem' }}>{t[language].interestedTitle}</h3>
                    <p style={{ color: '#166534', opacity: 0.8, marginBottom: '1.5rem' }}>{t[language].interestedDesc}</p>

                    <a
                        href="https://lin.ee/FQdVms5"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            backgroundColor: '#06C755', // LINE Green
                            color: 'white',
                            padding: '1rem 2rem',
                            borderRadius: '50px',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(6, 199, 85, 0.3)',
                        }}
                    >
                        <Send size={20} /> {t[language].orderViaLine}
                    </a>
                </div>

                <div className="text-center">
                    <Link
                        href="/calculator"
                        style={{
                            display: 'inline-block',
                            color: '#666',
                            textDecoration: 'none',
                            fontWeight: 500,
                            padding: '1rem'
                        }}
                    >
                        {t[language].calculateAgain}
                    </Link>
                </div>
            </div>
        </div>
    );
}
