"use client";

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Trash2, ArrowLeft, Send, Store, ShoppingBag, Info, BookOpen, Images, ChevronDown, ChevronUp } from 'lucide-react';
import { calculatePrice } from '@/utils/pricing';
import { supabase } from '@/lib/supabase';
import { ProductVariant } from '@/lib/types';
import CatalogModal from '@/components/CatalogModal';

export default function QuotationPage() {
    const { items, removeFromCart, updateItem } = useCart();
    const [priceMode, setPriceMode] = useState<'shop' | 'platform'>('shop');

    // Variant State
    const [variantsMap, setVariantsMap] = useState<Record<number, ProductVariant[]>>({});
    const [catalogMap, setCatalogMap] = useState<Record<number, string | null>>({});
    const [portfolioMap, setPortfolioMap] = useState<Record<number, string | null>>({});

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: ''
    });
    const [lastReferenceCode, setLastReferenceCode] = useState<string | null>(null);

    // Catalog State
    const [viewingCatalogUrl, setViewingCatalogUrl] = useState<string | null>(null);

    // Fetch variants for items in cart
    useEffect(() => {
        const fetchVariants = async () => {
            if (!supabase || items.length === 0) return;

            const collectionIds = [...new Set(items.map(item => item.collection.id))];

            try {
                const { data, error } = await supabase
                    .from('product_variants')
                    .select('*')
                    .in('collection_id', collectionIds)
                    .eq('in_stock', true) // Only show in-stock items
                    .order('name');

                if (error) throw error;

                if (data) {
                    const map: Record<number, ProductVariant[]> = {};
                    data.forEach(variant => {
                        if (!map[variant.collection_id]) {
                            map[variant.collection_id] = [];
                        }
                        map[variant.collection_id].push(variant);
                    });
                    setVariantsMap(map);
                }

                // Also fetch fresh collection details (for catalog_url and portfolio_url)
                const { data: collections, error: colError } = await supabase
                    .from('product_collections')
                    .select('id, catalog_url, portfolio_url')
                    .in('id', collectionIds);

                if (!colError && collections) {
                    const cMap: Record<number, string | null> = {};
                    const pMap: Record<number, string | null> = {};
                    collections.forEach(c => {
                        cMap[c.id] = c.catalog_url || null;
                        pMap[c.id] = c.portfolio_url || null;
                    });
                    setCatalogMap(cMap);
                    setPortfolioMap(pMap);
                }
            } catch (err) {
                console.error('Error fetching variants:', err);
            }
        };

        fetchVariants();
    }, [items.length]); // Re-fetch only if items length changes (e.g. added new item type)

    // Generate random 6-char alphanumeric code (A-Z, 0-9)
    const generateReferenceCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    // Calculate totals based on current mode
    const calculatedItems = items.map(item => {
        let priceToUse = item.collection.price_per_unit;
        // Use Platform price if mode is platform and price exists
        if (priceMode === 'platform') {
            if ((item.collection.price_per_unit_platform ?? 0) > 0) {
                priceToUse = item.collection.price_per_unit_platform!;
            }
        }

        const res = calculatePrice(item.collection, item.width, item.height, priceToUse);
        return {
            ...item,
            currentTotal: res.total,
            currentBreakdown: res.breakdown,
            unitPrice: priceToUse
        };
    });

    const totalEstimate = calculatedItems.reduce((sum, item) => sum + item.currentTotal, 0);

    const handleSubmitRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        if (!supabase) return;

        // Validation: Phone must be 10 digits and start with 0
        if (formData.phone.length !== 10 || !formData.phone.startsWith('0')) {
            alert('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก และขึ้นต้นด้วย 0)');
            setSubmitting(false);
            return;
        }

        try {
            const referenceCode = generateReferenceCode();

            const { data, error } = await supabase
                .from('quotation_requests')
                .insert([
                    {
                        name: formData.name,
                        phone: formData.phone,
                        email: formData.email,
                        items: calculatedItems, // Store the full items array including calculation details and selectedVariant
                        total_amount: totalEstimate,
                        price_mode: priceMode,
                        status: 'pending',
                        reference_code: referenceCode
                    }
                ])
                .select(); // Important: Select to get the returned data

            if (error) throw error;

            if (data && data.length > 0) {
                setLastReferenceCode(data[0].reference_code);
            }

            setShowModal(false);
            setShowSuccess(true);
            setFormData({ name: '', phone: '', email: '' });
        } catch (error) {
            console.error('Error submitting quotation request:', error);
            alert('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
        } finally {
            setSubmitting(false);
        }
    };

    const [showRemarks, setShowRemarks] = useState(false);

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
            {/* Hero Header */}
            <div style={{
                position: 'relative',
                textAlign: 'center',
                padding: '2.5rem 1.5rem 2.5rem',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)',
                    borderRadius: '0 0 2rem 2rem',
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <Link
                        href="/calculator"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            color: 'rgba(255,255,255,0.5)',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            marginBottom: '0.75rem',
                            transition: 'color 0.2s',
                        }}
                    >
                        <ArrowLeft size={14} /> กลับไปหน้าคำนวณ
                    </Link>
                    <h1 style={{
                        fontSize: '2.2rem',
                        fontWeight: 700,
                        color: 'white',
                        fontFamily: 'var(--font-mitr)',
                        margin: '0 0 0.4rem',
                        letterSpacing: '-0.01em',
                    }}>ใบเสนอราคา</h1>
                    <p style={{
                        color: 'rgba(255,255,255,0.45)',
                        fontSize: '0.9rem',
                        margin: 0,
                    }}>รายการสินค้าที่คุณเลือกไว้ พร้อมส่งขอใบเสนอราคา</p>
                </div>
            </div>

            <div style={{ padding: '0 1rem' }}>

                {/* Remarks Accordion */}
                <div style={{
                    background: 'white',
                    border: '1px solid #f0f0f0',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    marginTop: '-1rem',
                    marginBottom: '1.5rem',
                    position: 'relative',
                    zIndex: 2,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                }}>
                    <button
                        onClick={() => setShowRemarks(!showRemarks)}
                        style={{
                            width: '100%',
                            padding: '1rem 1.25rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#333',
                        }}
                    >
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>📋 หมายเหตุ / เงื่อนไข</span>
                        {showRemarks ? <ChevronUp size={18} color="#999" /> : <ChevronDown size={18} color="#999" />}
                    </button>

                    {showRemarks && (
                        <div style={{ padding: '0 1.25rem 1.25rem', fontSize: '0.85rem', color: '#666', borderTop: '1px solid #f5f5f5' }}>
                            <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '1rem' }}>
                                <li>ราคาที่แสดงเป็นราคาประเมินเบื้องต้น อาจมีการเปลี่ยนแปลงตามขนาดจริงและหน้างาน</li>
                                <li>ราคายังไม่รวมภาษีมูลค่าเพิ่ม (VAT 7%)</li>
                                <li>ราคายังไม่รวมค่าบริการติดตั้งและค่าจัดส่ง</li>
                                <li>ระยะเวลาผลิตสินค้าประมาณ 7-14 วันทำการ หลังยืนยันการสั่งซื้อ</li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* Price Mode Toggle */}
                <div style={{
                    marginBottom: '1.5rem',
                    background: 'white',
                    padding: '1.25rem',
                    borderRadius: '16px',
                    border: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                }}>
                    <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111', marginBottom: '0.15rem' }}>🛒 ช่องทางการสั่งซื้อ</div>
                        <div style={{ color: '#999', fontSize: '0.8rem' }}>ราคาอาจแตกต่างตามช่องทาง</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', gap: '4px', background: '#f3f3f3', padding: '3px', borderRadius: '10px' }}>
                            <button
                                type="button"
                                onClick={() => setPriceMode('shop')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: priceMode === 'shop' ? 'white' : 'transparent',
                                    color: priceMode === 'shop' ? '#111' : '#888',
                                    boxShadow: priceMode === 'shop' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <Store size={15} /> หน้าร้าน
                            </button>
                            <button
                                type="button"
                                onClick={() => setPriceMode('platform')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: priceMode === 'platform' ? 'white' : 'transparent',
                                    color: priceMode === 'platform' ? '#f97316' : '#888',
                                    boxShadow: priceMode === 'platform' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <ShoppingBag size={15} /> แพลตฟอร์ม
                            </button>
                        </div>
                        {priceMode === 'platform' && (
                            <p style={{ fontSize: '0.7rem', color: '#f97316', display: 'flex', gap: '0.25rem', justifyContent: 'flex-end', margin: 0 }}>
                                <Info size={11} style={{ marginTop: '1px' }} /> มีค่าธรรมเนียมเพิ่มเติม
                            </p>
                        )}
                    </div>
                </div>

                {items.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e5e5' }}>
                                    <tr>
                                        <th style={{ padding: '1.25rem', fontWeight: 600, color: '#444' }}>สินค้า</th>
                                        <th style={{ padding: '1.25rem', fontWeight: 600, color: '#444' }}>รหัสสินค้า</th>
                                        <th style={{ padding: '1.25rem', fontWeight: 600, color: '#444' }}>ขนาด (กxส)</th>
                                        <th style={{ padding: '1.25rem', fontWeight: 600, color: '#444', textAlign: 'right' }}>ราคาประเมิน</th>
                                        <th style={{ padding: '1.25rem', fontWeight: 600, color: '#444', width: '50px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {calculatedItems.map((item) => {
                                        const isError = item.currentTotal === 0;
                                        const collectionVariants = variantsMap[item.collection.id] || [];

                                        return (
                                            <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                <td style={{ padding: '1.25rem' }}>
                                                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{item.collection.name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem' }}>
                                                        {item.unitPrice} บาท/{item.collection.unit}
                                                    </div>

                                                    {isError && (
                                                        <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.25rem' }}>
                                                            {item.currentBreakdown}
                                                        </div>
                                                    )}


                                                </td>
                                                <td style={{ padding: '1.25rem' }}>
                                                    {/* Variant Selection */}
                                                    {collectionVariants.length > 0 ? (
                                                        <select
                                                            value={item.selectedVariant?.id || ''}
                                                            onChange={(e) => {
                                                                const variantId = Number(e.target.value);
                                                                const variant = collectionVariants.find(v => v.id === variantId);
                                                                if (updateItem) {
                                                                    updateItem(item.id, { selectedVariant: variant });
                                                                }
                                                            }}
                                                            className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 cursor-pointer px-2 py-1.5"
                                                            style={{ minWidth: '120px' }}
                                                        >
                                                            <option value="">-- เลือก --</option>
                                                            {collectionVariants.map(variant => (
                                                                <option key={variant.id} value={variant.id}>
                                                                    {variant.name}{variant.description ? ` - ${variant.description}` : ''}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">-</span>
                                                    )}

                                                    <div className="flex flex-col gap-2 mt-3">
                                                        {catalogMap[item.collection.id] && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setViewingCatalogUrl(catalogMap[item.collection.id]!)}
                                                                className="w-full py-1.5 px-3 rounded text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 flex items-center justify-center gap-2 font-medium transition-colors"
                                                            >
                                                                <BookOpen size={14} /> ดูแคตตาล็อก
                                                            </button>
                                                        )}
                                                        {portfolioMap[item.collection.id] && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setViewingCatalogUrl(portfolioMap[item.collection.id]!)}
                                                                className="w-full py-1.5 px-3 rounded text-xs bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-800 flex items-center justify-center gap-2 font-medium transition-colors"
                                                            >
                                                                <Images size={14} /> ดูตัวอย่างผลงาน
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.25rem', color: '#666' }}>
                                                    {item.width} x {item.height} ซม.
                                                </td>
                                                <td style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600, fontSize: '1.1rem' }}>
                                                    {isError ? (
                                                        <span style={{ color: '#ef4444' }}>เกินเงื่อนไข</span>
                                                    ) : (
                                                        `฿${item.currentTotal.toLocaleString()}`
                                                    )}
                                                </td>
                                                <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}
                                                        title="ลบรายการ"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                                <tfoot style={{ backgroundColor: '#f9fafb', borderTop: '1px solid #e5e5e5' }}>
                                    <tr>
                                        <td colSpan={3} style={{ padding: '1.5rem', textAlign: 'right', fontWeight: 600, fontSize: '1.2rem' }}>
                                            ราคารวมทั้งหมด ({priceMode === 'platform' ? 'Platform' : 'หน้าร้าน'})
                                        </td>
                                        <td style={{ padding: '1.5rem', textAlign: 'right', fontWeight: 700, fontSize: '1.5rem', color: 'black' }}>
                                            ฿{totalEstimate.toLocaleString()}
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td colSpan={5} style={{ padding: '0.75rem 1.5rem', textAlign: 'right', color: '#ff4d4f', fontSize: '0.9rem', borderTop: '1px dashed #e5e5e5' }}>
                                            * ราคาเฉพาะค่าสินค้า ยังไม่รวมค่าจัดส่งและค่าติดตั้ง
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden flex flex-col gap-4">
                            {calculatedItems.map((item) => {
                                const isError = item.currentTotal === 0;
                                const collectionVariants = variantsMap[item.collection.id] || [];

                                return (
                                    <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm relative">
                                        <div className="flex justify-between items-start mb-2 pr-8">
                                            <div className="font-semibold text-lg">{item.collection.name}</div>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="absolute top-4 right-4 text-red-500 p-1 bg-red-50 rounded-full"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                        <div className="text-sm text-gray-500 mb-3">
                                            {item.width} x {item.height} ซม. • {item.unitPrice} บาท/{item.collection.unit}
                                        </div>

                                        {/* Variant Selection */}
                                        <div className="mb-3">
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block">เลือกสเปค/วัสดุ</label>
                                            {collectionVariants.length > 0 ? (
                                                <select
                                                    value={item.selectedVariant?.id || ''}
                                                    onChange={(e) => {
                                                        const variantId = Number(e.target.value);
                                                        const variant = collectionVariants.find(v => v.id === variantId);
                                                        if (updateItem) {
                                                            updateItem(item.id, { selectedVariant: variant });
                                                        }
                                                    }}
                                                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-black/5"
                                                >
                                                    <option value="">-- เลือก --</option>
                                                    {collectionVariants.map(variant => (
                                                        <option key={variant.id} value={variant.id}>
                                                            {variant.name}{variant.description ? ` - ${variant.description}` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="text-sm text-gray-400">-</div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            {catalogMap[item.collection.id] && (
                                                <button
                                                    type="button"
                                                    onClick={() => setViewingCatalogUrl(catalogMap[item.collection.id]!)}
                                                    className="py-1.5 px-3 rounded text-xs bg-blue-50 text-blue-600 font-medium flex items-center justify-center gap-1"
                                                >
                                                    <BookOpen size={14} /> ดู Catalog
                                                </button>
                                            )}
                                            {portfolioMap[item.collection.id] && (
                                                <button
                                                    type="button"
                                                    onClick={() => setViewingCatalogUrl(portfolioMap[item.collection.id]!)}
                                                    className="py-1.5 px-3 rounded text-xs bg-purple-50 text-purple-600 font-medium flex items-center justify-center gap-1"
                                                >
                                                    <Images size={14} /> ดูตัวอย่าง
                                                </button>
                                            )}
                                        </div>

                                        {/* Price and Error */}
                                        <div className="flex justify-between items-end border-t border-gray-50 pt-3 mt-1">
                                            <div className="text-xs text-gray-400">ราคารวม ({priceMode === 'platform' ? 'Platform' : 'หน้าร้าน'})</div>
                                            <div className="text-xl font-bold text-gray-900">
                                                {isError ? (
                                                    <span className="text-red-500 text-base">เกินเงื่อนไข</span>
                                                ) : (
                                                    `฿${item.currentTotal.toLocaleString()}`
                                                )}
                                            </div>
                                        </div>
                                        {isError && (
                                            <div className="text-xs text-red-500 mt-1">
                                                {item.currentBreakdown}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Mobile Total */}
                            <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2 border border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-700">ราคารวมโดยประมาณ</span>
                                    <span className="font-bold text-xl text-black">{totalEstimate.toLocaleString()} บาท</span>
                                </div>
                                <div className="text-right text-xs text-red-500">
                                    * ราคาเฉพาะค่าสินค้า ยังไม่รวมค่าจัดส่งและค่าติดตั้ง
                                </div>
                            </div>
                        </div>

                        <div style={{
                            background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)',
                            padding: '2rem',
                            borderRadius: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                        }}>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>ส่งข้อมูลเพื่อขอใบเสนอราคาฉบับเต็มจากทางร้าน</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                                <button
                                    onClick={() => setShowModal(true)}
                                    style={{
                                        background: 'linear-gradient(135deg, #06C755, #05b64d)',
                                        color: 'white',
                                        padding: '0.9rem 2.5rem',
                                        borderRadius: '50px',
                                        border: 'none',
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 18px rgba(6, 199, 85, 0.35)',
                                        transition: 'transform 0.2s',
                                        fontFamily: 'var(--font-mitr)',
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Send size={18} /> ขอใบเสนอราคา
                                </button>
                                <a
                                    href="https://lin.ee/59TaAgG"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: 'rgba(255,255,255,0.45)',
                                        textDecoration: 'none',
                                        fontWeight: 400,
                                        fontSize: '0.8rem',
                                    }}
                                >
                                    หรือแอด LINE: @samredroob
                                </a>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        padding: '4rem 2rem',
                        textAlign: 'center',
                        background: 'white',
                        borderRadius: '20px',
                        border: '1px solid #f0f0f0',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                        <p style={{ color: '#999', fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 500 }}>ยังไม่มีรายการสินค้าในใบเสนอราคา</p>
                        <Link
                            href="/calculator"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                background: 'linear-gradient(135deg, #111 0%, #333 100%)',
                                color: 'white',
                                padding: '0.85rem 1.75rem',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                                fontFamily: 'var(--font-mitr)',
                            }}
                        >
                            ไปหน้าคำนวณราคา
                        </Link>
                    </div>
                )}

                {/* Request Modal */}
                {showModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '2rem',
                            width: '100%',
                            maxWidth: '400px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}>
                            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mitr)', marginBottom: '1.5rem', textAlign: 'center' }}>ข้อมูลติดต่อ</h2>

                            <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>ชื่อ - นามสกุล *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}
                                        placeholder="กรอกชื่อของคุณ"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>เบอร์โทรศัพท์ *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={e => {
                                            const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                            setFormData({ ...formData, phone: value });
                                        }}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}
                                        placeholder="08XXXXXXXX (10 หลัก)"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>อีเมล (ถ้ามี)</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}
                                        placeholder="Example@email.com"
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: '1px solid #e5e5e5',
                                            backgroundColor: 'white',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            color: '#666'
                                        }}
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            border: 'none',
                                            backgroundColor: 'black',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            opacity: submitting ? 0.7 : 1
                                        }}
                                    >
                                        {submitting ? 'กำลังส่ง...' : 'ยืนยัน'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Success Modal */}
                {items.length > 0 && showSuccess && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '2rem',
                            width: '100%',
                            maxWidth: '400px',
                            textAlign: 'center',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: '#DCFCE7',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem auto',
                                color: '#16A34A'
                            }}>
                                <Send size={32} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mitr)', marginBottom: '0.5rem' }}>ส่งข้อมูลสำเร็จ!</h2>

                            {lastReferenceCode && (
                                <div className="bg-gray-100 rounded-lg py-2 px-4 mb-4 inline-block">
                                    <span className="text-gray-500 text-sm">รหัสอ้างอิง:</span>
                                    <span className="text-xl font-bold ml-2 text-black">#{lastReferenceCode}</span>
                                </div>
                            )}
                            <p style={{ color: '#666', marginBottom: '1rem' }}>ทางร้านได้รับข้อมูลแล้ว จะรีบติดต่อกลับเพื่อส่งใบเสนอราคาให้เร็วที่สุดครับ</p>

                            <div className="mb-6">
                                <a
                                    href="https://lin.ee/FQdVms5"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-[#06C755] text-white px-4 py-3 rounded-xl font-bold hover:bg-[#05b64d] transition-colors w-full justify-center shadow-lg shadow-green-100"
                                >
                                    <Send size={20} />
                                    ส่งลิ้งให้แอดมินทาง LINE (ตอบไว)
                                </a>
                                <p className="text-xs text-gray-400 mt-2 text-center">เพื่อความรวดเร็ว กดปุ่มด้านบนแล้วส่งลิ้งใบเสนอราคาให้แอดมินได้เลยครับ</p>
                            </div>

                            {/* Share Link Section */}
                            {lastReferenceCode && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 text-left">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">ลิ้งใบเสนอราคาของคุณ (แชร์ได้)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={`${window.location.origin}/quotation/${lastReferenceCode}`}
                                            className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 select-all"
                                        />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/quotation/${lastReferenceCode}`);
                                                alert('คัดลอกลิ้งเรียบร้อย');
                                            }}
                                            className="bg-black text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
                                        >
                                            คัดลอก
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => setShowSuccess(false)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: 'black',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                ตกลง
                            </button>
                        </div>
                    </div>
                )}
            </div>{/* close padding wrapper */}

            {/* Catalog Modal */}
            <CatalogModal
                isOpen={!!viewingCatalogUrl}
                onClose={() => setViewingCatalogUrl(null)}
                url={viewingCatalogUrl}
                title="แคตตาล็อกสินค้า"
            />
        </div>
    );
}
