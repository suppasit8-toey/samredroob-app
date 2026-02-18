"use client";

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { Trash2, ArrowLeft, Send, Store, ShoppingBag, Info, BookOpen, Images, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';
import { calculatePrice } from '@/utils/pricing';
import { supabase } from '@/lib/supabase';
import { ProductVariant } from '@/lib/types';
import CatalogModal from '@/components/CatalogModal';

export default function QuotationPage() {
    const { language } = useLanguage();
    const { items, removeFromCart, updateItem } = useCart();
    const [priceMode, setPriceMode] = useState<'shop' | 'platform'>('shop');

    const t = {
        th: {
            backToCalculator: 'กลับไปหน้าคำนวณ',
            quotation: 'ใบเสนอราคา',
            quotationSub: 'รายการสินค้าที่คุณเลือกไว้ พร้อมส่งขอใบเสนอราคา',
            remarks: '📋 หมายเหตุ / เงื่อนไข',
            remark1: 'ราคาที่แสดงเป็นราคาประเมินเบื้องต้น อาจมีการเปลี่ยนแปลงตามขนาดจริงและหน้างาน',
            remark2: 'ราคายังไม่รวมภาษีมูลค่าเพิ่ม (VAT 7%)',
            remark3: 'ราคายังไม่รวมค่าบริการติดตั้งและค่าจัดส่ง',
            remark4: 'ระยะเวลาผลิตสินค้าประมาณ 7-14 วันทำการ หลังยืนยันการสั่งซื้อ',
            orderChannels: '🛒 ช่องทางการสั่งซื้อ',
            priceDiff: 'ราคาอาจแตกต่างตามช่องทาง',
            shop: 'หน้าร้าน',
            platform: 'แพลตฟอร์ม',
            platformFee: 'มีค่าธรรมเนียมเพิ่มเติม',
            product: 'สินค้า',
            code: 'รหัสสินค้า',
            size: 'ขนาด (กxส)',
            qty: 'จำนวน',
            estPrice: 'ราคาประเมิน',
            changeAll: '-- เปลี่ยนทั้งหมด --',
            select: '-- เลือก --',
            viewCatalog: 'ดู Catalog',
            viewPortfolio: 'ดูตัวอย่าง',
            pricePerUnit: 'บาท',
            pricePerSet: 'ราคา /ชุด',
            overLimit: 'เกินเงื่อนไข',
            totalShop: 'ราคารวมทั้งหมด (หน้าร้าน)',
            totalPlatform: 'ราคารวมทั้งหมด (Platform)',
            excludeVat: '* ราคาเฉพาะค่าสินค้า ยังไม่รวมค่าจัดส่งและค่าติดตั้ง',
            sendRequest: 'ส่งข้อมูลเพื่อขอใบเสนอราคาฉบับเต็มจากทางร้าน',
            requestQuotation: 'ขอใบเสนอราคา',
            contactInfo: 'ข้อมูลติดต่อ',
            name: 'ชื่อ',
            namePlaceholder: 'กรอกชื่อของคุณ',
            phone: 'เบอร์โทรศัพท์',
            phonePlaceholder: 'กรอกเบอร์โทรศัพท์ (10 หลัก)',
            email: 'อีเมล (ถ้ามี)',
            emailPlaceholder: 'example@email.com',
            cancel: 'ยกเลิก',
            confirm: 'ยืนยันส่งข้อมูล',
            sending: 'กำลังส่ง...',
            successTitle: 'ส่งข้อมูลเรียบร้อยแล้ว',
            successMessage: 'ทางร้านได้รับข้อมูลของคุณแล้ว และจะติดต่อกลับโดยเร็วที่สุด',
            refCode: 'รหัสอ้างอิง:',
            close: 'ปิดหน้าต่าง',
            changeGroup: 'เปลี่ยนทั้งกลุ่ม:',
            specMaterial: 'เลือกสเปค/วัสดุ',
            totalApprox: 'ราคารวมโดยประมาณ',
            itemsCount: 'รายการ',
            // New keys
            sendLine: 'ส่งลิ้งให้แอดมินทาง LINE (ตอบไว)',
            sendLineSub: 'เพื่อความรวดเร็ว กดปุ่มด้านบนแล้วส่งลิ้งใบเสนอราคาให้แอดมินได้เลยครับ',
            shareLink: 'ลิ้งใบเสนอราคาของคุณ (แชร์ได้)',
            copy: 'คัดลอก',
            copied: 'คัดลอกลิ้งเรียบร้อย',
            ok: 'ตกลง',
            catalogTitle: 'แคตตาล็อกสินค้า'
        },
        en: {
            backToCalculator: 'Back to Calculator',
            quotation: 'Quotation',
            quotationSub: 'Your selected items, ready for quotation request',
            remarks: '📋 Remarks / Conditions',
            remark1: 'Prices shown are estimated and may change based on actual measurements and site conditions.',
            remark2: 'Prices exclude VAT 7%.',
            remark3: 'Prices exclude installation and delivery fees.',
            remark4: 'Production time is approximately 7-14 working days after order confirmation.',
            orderChannels: '🛒 Order Channels',
            priceDiff: 'Prices may vary by channel',
            shop: 'Store',
            platform: 'Platform',
            platformFee: 'Additional fees apply',
            product: 'Product',
            code: 'Code',
            size: 'Size (WxH)',
            qty: 'Qty',
            estPrice: 'Est. Price',
            changeAll: '-- Change All --',
            select: '-- Select --',
            viewCatalog: 'View Catalog',
            viewPortfolio: 'View Portfolio',
            pricePerUnit: 'THB',
            pricePerSet: 'Price / Set',
            overLimit: 'Exceeds Limit',
            totalShop: 'Total (Store)',
            totalPlatform: 'Total (Platform)',
            excludeVat: '* Price for products only, excludes delivery and installation.',
            sendRequest: 'Send information to request a full quotation from the store',
            requestQuotation: 'Request Quotation',
            contactInfo: 'Contact Information',
            name: 'Name',
            namePlaceholder: 'Enter your name',
            phone: 'Phone Number',
            phonePlaceholder: 'Enter phone number (10 digits)',
            email: 'Email (Optional)',
            emailPlaceholder: 'example@email.com',
            cancel: 'Cancel',
            confirm: 'Submit Request',
            sending: 'Sending...',
            successTitle: 'Request Sent Successfully',
            successMessage: 'We have received your request and will contact you back shortly.',
            refCode: 'Reference Code:',
            close: 'Close',
            changeGroup: 'Change Group:',
            specMaterial: 'Select Spec/Material',
            totalApprox: 'Approximate Total',
            itemsCount: 'items',
            // New keys
            sendLine: 'Send link to Admin via LINE (Fast Response)',
            sendLineSub: 'For faster service, click above to send your quotation link to our admin.',
            shareLink: 'Your Quotation Link (Shareable)',
            copy: 'Copy',
            copied: 'Link copied',
            ok: 'OK',
            catalogTitle: 'Product Catalog'
        }
    };

    // Variant State
    const [variantsMap, setVariantsMap] = useState<Record<number, ProductVariant[]>>({});
    const [catalogMap, setCatalogMap] = useState<Record<number, string | null>>({});
    const [portfolioMap, setPortfolioMap] = useState<Record<number, string | null>>({});
    const [brandMap, setBrandMap] = useState<Record<number, { name: string; logo_url?: string } | null>>({});

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
                    .select(`
                        id,
                        catalog_url,
                        portfolio_url,
                        product_brands (
                            name,
                            logo_url
                        )
                    `)
                    .in('id', collectionIds);

                if (!colError && collections) {
                    const cMap: Record<number, string | null> = {};
                    const pMap: Record<number, string | null> = {};
                    const bMap: Record<number, { name: string; logo_url?: string } | null> = {};

                    collections.forEach((c: any) => {
                        cMap[c.id] = c.catalog_url || null;
                        pMap[c.id] = c.portfolio_url || null;
                        if (c.product_brands) {
                            bMap[c.id] = {
                                name: c.product_brands.name,
                                logo_url: c.product_brands.logo_url
                            };
                        } else {
                            bMap[c.id] = null;
                        }
                    });
                    setCatalogMap(cMap);
                    setPortfolioMap(pMap);
                    setBrandMap(bMap);
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

        const res = calculatePrice(item.collection, Number(item.width), Number(item.height), priceToUse, priceMode === 'platform');
        const qty = item.quantity || 1;
        return {
            ...item,
            currentTotal: res.total * qty,
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
                        <ArrowLeft size={14} /> {t[language].backToCalculator}
                    </Link>
                    <h1 style={{
                        fontSize: '2.2rem',
                        fontWeight: 700,
                        color: 'white',
                        fontFamily: 'var(--font-mitr)',
                        margin: '0 0 0.4rem',
                        letterSpacing: '-0.01em',
                    }}>{t[language].quotation}</h1>
                    <p style={{
                        color: 'rgba(255,255,255,0.45)',
                        fontSize: '0.9rem',
                        margin: 0,
                    }}>{t[language].quotationSub}</p>
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
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t[language].remarks}</span>
                        {showRemarks ? <ChevronUp size={18} color="#999" /> : <ChevronDown size={18} color="#999" />}
                    </button>

                    {showRemarks && (
                        <div style={{ padding: '0 1.25rem 1.25rem', fontSize: '0.85rem', color: '#666', borderTop: '1px solid #f5f5f5' }}>
                            <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '1rem' }}>
                                <li>{t[language].remark1}</li>
                                <li>{t[language].remark2}</li>
                                <li>{t[language].remark3}</li>
                                <li>{t[language].remark4}</li>
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
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111', marginBottom: '0.15rem' }}>{t[language].orderChannels}</div>
                        <div style={{ color: '#999', fontSize: '0.8rem' }}>{t[language].priceDiff}</div>
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
                                <Store size={15} /> {t[language].shop}
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
                                <ShoppingBag size={15} /> {t[language].platform}
                            </button>
                        </div>
                        {priceMode === 'platform' && (
                            <p style={{ fontSize: '0.7rem', color: '#f97316', display: 'flex', gap: '0.25rem', justifyContent: 'flex-end', margin: 0 }}>
                                <Info size={11} style={{ marginTop: '1px' }} /> {t[language].platformFee}
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
                                        <th style={{ padding: '1.25rem', fontWeight: 600, color: '#444' }}>{t[language].product}</th>
                                        <th style={{ padding: '1.25rem', fontWeight: 600, color: '#444' }}>{t[language].code}</th>
                                        <th style={{ padding: '1.25rem', fontWeight: 600, color: '#444' }}>{t[language].size}</th>
                                        <th style={{ padding: '1.25rem', fontWeight: 600, color: '#444', textAlign: 'center' }}>{t[language].qty}</th>
                                        <th style={{ padding: '1.25rem', fontWeight: 600, color: '#444', textAlign: 'right' }}>{t[language].estPrice}</th>
                                        <th style={{ padding: '1.25rem', fontWeight: 600, color: '#444', width: '50px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Group items by collection for Batch Selection */}
                                    {(() => {
                                        // Grouping logic
                                        const groups: Record<number, typeof calculatedItems> = {};
                                        calculatedItems.forEach(item => {
                                            if (!groups[item.collection.id]) {
                                                groups[item.collection.id] = [];
                                            }
                                            groups[item.collection.id].push(item);
                                        });

                                        return Object.entries(groups).map(([collectionIdStr, groupItems]) => {
                                            const collectionId = Number(collectionIdStr);
                                            const collectionVariants = variantsMap[collectionId] || [];
                                            const isMultiple = groupItems.length > 1;
                                            const firstItem = groupItems[0]; // For collection name/info

                                            return (
                                                <React.Fragment key={collectionId}>
                                                    {/* Collection Group Header (Only if multiple items) */}
                                                    {isMultiple && (
                                                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e5e5' }}>
                                                            <td colSpan={6} style={{ padding: '1rem 1.25rem' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                            <span style={{ fontSize: '1.2rem' }}>📦</span>
                                                                            {brandMap[collectionId] && (
                                                                                <span className="flex items-center gap-1 text-xs font-semibold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                                                                    {brandMap[collectionId]?.logo_url && <img src={brandMap[collectionId]!.logo_url} className="w-4 h-4 object-contain" alt="" />}
                                                                                    {brandMap[collectionId]?.name}
                                                                                </span>
                                                                            )}
                                                                            <span style={{ fontWeight: 600, fontSize: '1rem', color: '#1e293b' }}>
                                                                                {language === 'en' && firstItem.collection.name_en ? firstItem.collection.name_en : firstItem.collection.name} ({groupItems.length} {t[language].itemsCount})
                                                                            </span>
                                                                        </div>
                                                                        {catalogMap[collectionId] && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setViewingCatalogUrl(catalogMap[collectionId]!)}
                                                                                className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1 bg-blue-50 px-2 py-1 rounded"
                                                                            >
                                                                                <BookOpen size={12} /> {t[language].viewCatalog}
                                                                            </button>
                                                                        )}
                                                                    </div>

                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>{t[language].changeGroup}</span>
                                                                        <select
                                                                            onChange={(e) => {
                                                                                const variantId = Number(e.target.value);
                                                                                const variant = collectionVariants.find(v => v.id === variantId);
                                                                                // Update all items in this group
                                                                                if (updateItem) {
                                                                                    groupItems.forEach(item => {
                                                                                        updateItem(item.id, { selectedVariant: variant });
                                                                                    });
                                                                                }
                                                                            }}
                                                                            className="text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer px-3 py-1.5"
                                                                            style={{ minWidth: '180px' }}
                                                                        >
                                                                            <option value="">{t[language].changeAll}</option>
                                                                            {collectionVariants.map(variant => (
                                                                                <option key={variant.id} value={variant.id}>
                                                                                    {variant.name}{variant.description ? ` - ${variant.description}` : ''}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}

                                                    {/* Items Rows */}
                                                    {groupItems.map((item, index) => {
                                                        const isError = item.currentTotal === 0;
                                                        // If multiple, show simplified item name (since group header handles collection name)
                                                        // Actually, keep full name for clarity or use "Item X" logic? 
                                                        // Let's keep item name but maybe indent slightly if grouped?

                                                        return (
                                                            <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0', backgroundColor: isMultiple ? '#ffffff' : undefined }}>
                                                                <td style={{ padding: '1.25rem', paddingLeft: isMultiple ? '2.5rem' : '1.25rem' }}>
                                                                    <div style={{ fontWeight: 600, fontSize: '1rem', color: isMultiple ? '#334155' : '#111' }}>
                                                                        {brandMap[item.collection.id] && (
                                                                            <span className="inline-flex items-center gap-1 mr-2 px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500 font-normal border border-gray-200">
                                                                                {brandMap[item.collection.id]?.logo_url && <img src={brandMap[item.collection.id]!.logo_url} className="w-3 h-3 object-contain" alt="" />}
                                                                                {brandMap[item.collection.id]?.name}
                                                                            </span>
                                                                        )}
                                                                        {language === 'en' && item.collection.name_en ? item.collection.name_en : item.collection.name}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem' }}>
                                                                        {item.unitPrice > 0 ? (
                                                                            `${item.unitPrice.toLocaleString()} ${t[language].pricePerUnit}/${item.collection.unit}`
                                                                        ) : (
                                                                            t[language].pricePerSet
                                                                        )}
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
                                                                            <option value="">{t[language].select}</option>
                                                                            {collectionVariants.map(variant => (
                                                                                <option key={variant.id} value={variant.id}>
                                                                                    {variant.name}{variant.description ? ` - ${variant.description}` : ''}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    ) : (
                                                                        <span className="text-gray-400 text-sm">-</span>
                                                                    )}

                                                                    {/* Show catalog button individually ONLY if not grouped (grouped handles it in header) */}
                                                                    {!isMultiple && (
                                                                        <div className="flex flex-col gap-2 mt-3">
                                                                            {catalogMap[item.collection.id] && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setViewingCatalogUrl(catalogMap[item.collection.id]!)}
                                                                                    className="w-full py-1.5 px-3 rounded text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 flex items-center justify-center gap-2 font-medium transition-colors"
                                                                                >
                                                                                    <BookOpen size={14} /> {t[language].viewCatalog}
                                                                                </button>
                                                                            )}
                                                                            {portfolioMap[item.collection.id] && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setViewingCatalogUrl(portfolioMap[item.collection.id]!)}
                                                                                    className="w-full py-1.5 px-3 rounded text-xs bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-800 flex items-center justify-center gap-2 font-medium transition-colors"
                                                                                >
                                                                                    <Images size={14} /> {t[language].viewPortfolio}
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td style={{ padding: '1.25rem', color: '#666' }}>
                                                                    {item.width} x {item.height} {language === 'en' ? 'cm' : 'ซม.'}
                                                                </td>
                                                                <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <button
                                                                            onClick={() => updateItem && updateItem(item.id, { quantity: Math.max(1, (item.quantity || 1) - 1) })}
                                                                            className="p-1 rounded-md hover:bg-gray-100 text-gray-500 disabled:opacity-30"
                                                                            disabled={(item.quantity || 1) <= 1}
                                                                        >
                                                                            <Minus size={16} />
                                                                        </button>
                                                                        <span className="w-8 text-center font-medium">{item.quantity || 1}</span>
                                                                        <button
                                                                            onClick={() => updateItem && updateItem(item.id, { quantity: (item.quantity || 1) + 1 })}
                                                                            className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
                                                                        >
                                                                            <Plus size={16} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                                <td style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600, fontSize: '1.1rem' }}>
                                                                    {isError ? (
                                                                        <span style={{ color: '#ef4444' }}>{t[language].overLimit}</span>
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
                                                        );
                                                    })}
                                                </React.Fragment>
                                            );
                                        });
                                    })()}
                                </tbody>
                                <tfoot style={{ backgroundColor: '#f9fafb', borderTop: '1px solid #e5e5e5' }}>
                                    <tr>
                                        <td colSpan={4} style={{ padding: '1.5rem', textAlign: 'right', fontWeight: 600, fontSize: '1.2rem' }}>
                                            {priceMode === 'platform' ? t[language].totalPlatform : t[language].totalShop}
                                        </td>
                                        <td style={{ padding: '1.5rem', textAlign: 'right', fontWeight: 700, fontSize: '1.5rem', color: 'black' }}>
                                            ฿{totalEstimate.toLocaleString()}
                                        </td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td colSpan={6} style={{ padding: '0.75rem 1.5rem', textAlign: 'right', color: '#ff4d4f', fontSize: '0.9rem', borderTop: '1px dashed #e5e5e5' }}>
                                            {t[language].excludeVat}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden flex flex-col gap-4">
                            {(() => {
                                // Mobile Grouping Logic
                                const groups: Record<number, typeof calculatedItems> = {};
                                calculatedItems.forEach(item => {
                                    if (!groups[item.collection.id]) {
                                        groups[item.collection.id] = [];
                                    }
                                    groups[item.collection.id].push(item);
                                });

                                return Object.entries(groups).map(([collectionIdStr, groupItems]) => {
                                    const collectionId = Number(collectionIdStr);
                                    const collectionVariants = variantsMap[collectionId] || [];
                                    const isMultiple = groupItems.length > 1;
                                    const firstItem = groupItems[0];

                                    return (
                                        <div key={collectionId} className="flex flex-col gap-3">
                                            {isMultiple && (
                                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-lg">📦</span>
                                                        {brandMap[collectionId] && (
                                                            <span className="flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-200">
                                                                {brandMap[collectionId]?.logo_url && <img src={brandMap[collectionId]!.logo_url} className="w-4 h-4 object-contain" alt="" />}
                                                                {brandMap[collectionId]?.name}
                                                            </span>
                                                        )}
                                                        <span className="font-semibold text-gray-700 text-sm">
                                                            {language === 'en' && firstItem.collection.name_en ? firstItem.collection.name_en : firstItem.collection.name} ({groupItems.length})
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500 whitespace-nowrap">{t[language].changeGroup}</span>
                                                        <select
                                                            onChange={(e) => {
                                                                const variantId = Number(e.target.value);
                                                                const variant = collectionVariants.find(v => v.id === variantId);
                                                                if (updateItem) {
                                                                    groupItems.forEach(item => {
                                                                        updateItem(item.id, { selectedVariant: variant });
                                                                    });
                                                                }
                                                            }}
                                                            className="w-full text-xs bg-white border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        >
                                                            <option value="">{t[language].select}</option>
                                                            {collectionVariants.map(variant => (
                                                                <option key={variant.id} value={variant.id}>
                                                                    {variant.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            )}

                                            {groupItems.map(item => {
                                                const isError = item.currentTotal === 0;
                                                return (
                                                    <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm relative">
                                                        <div className="flex justify-between items-start mb-2 pr-8">
                                                            <div>
                                                                {brandMap[item.collection.id] && (
                                                                    <div className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-0.5">
                                                                        {brandMap[item.collection.id]?.logo_url && <img src={brandMap[item.collection.id]!.logo_url} className="w-3 h-3 object-contain" alt="" />}
                                                                        {brandMap[item.collection.id]?.name}
                                                                    </div>
                                                                )}
                                                                <div className="font-semibold text-lg leading-tight">{language === 'en' && item.collection.name_en ? item.collection.name_en : item.collection.name}</div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="absolute top-4 right-4 text-red-500 p-1 bg-red-50 rounded-full"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>

                                                        <div className="text-sm text-gray-500 mb-3 flex items-center justify-between">
                                                            <span>
                                                                {item.width} x {item.height} {language === 'en' ? 'cm' : 'ซม.'} • {item.unitPrice > 0 ? `${item.unitPrice.toLocaleString()} ${t[language].pricePerUnit}/${item.collection.unit}` : t[language].pricePerSet}
                                                            </span>

                                                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200">
                                                                <button
                                                                    onClick={() => updateItem && updateItem(item.id, { quantity: Math.max(1, (item.quantity || 1) - 1) })}
                                                                    className="p-1 rounded bg-white hover:bg-gray-100 text-gray-500 shadow-sm disabled:opacity-50"
                                                                    disabled={(item.quantity || 1) <= 1}
                                                                >
                                                                    <Minus size={14} />
                                                                </button>
                                                                <span className="w-6 text-center text-sm font-medium">{item.quantity || 1}</span>
                                                                <button
                                                                    onClick={() => updateItem && updateItem(item.id, { quantity: (item.quantity || 1) + 1 })}
                                                                    className="p-1 rounded bg-white hover:bg-gray-100 text-gray-500 shadow-sm"
                                                                >
                                                                    <Plus size={14} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Variant Selection */}
                                                        <div className="mb-3">
                                                            <label className="text-xs font-semibold text-gray-500 mb-1 block">{t[language].specMaterial}</label>
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
                                                                    <option value="">{t[language].select}</option>
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

                                                        {/* Action Buttons (Show if not multiple, or just keep them?) - keeping for mobile convenience */}
                                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                                            {catalogMap[item.collection.id] && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setViewingCatalogUrl(catalogMap[item.collection.id]!)}
                                                                    className="py-1.5 px-3 rounded text-xs bg-blue-50 text-blue-600 font-medium flex items-center justify-center gap-1"
                                                                >
                                                                    <BookOpen size={14} /> {t[language].viewCatalog}
                                                                </button>
                                                            )}
                                                            {portfolioMap[item.collection.id] && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setViewingCatalogUrl(portfolioMap[item.collection.id]!)}
                                                                    className="py-1.5 px-3 rounded text-xs bg-purple-50 text-purple-600 font-medium flex items-center justify-center gap-1"
                                                                >
                                                                    <Images size={14} /> {t[language].viewPortfolio}
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Price and Error */}
                                                        <div className="flex justify-between items-end border-t border-gray-50 pt-3 mt-1">
                                                            <div className="text-xs text-gray-400">{t[language].totalApprox} ({priceMode === 'platform' ? 'Platform' : t[language].shop})</div>
                                                            <div className="text-xl font-bold text-gray-900">
                                                                {isError ? (
                                                                    <span className="text-red-500 text-base">{t[language].overLimit}</span>
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
                                        </div>
                                    );
                                });
                            })()}

                            {/* Mobile Total */}
                            <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2 border border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-700">{t[language].totalApprox}</span>
                                    <span className="font-bold text-xl text-black">{totalEstimate.toLocaleString()} {t[language].pricePerUnit}</span>
                                </div>
                                <div className="text-right text-xs text-red-500">
                                    {t[language].excludeVat}
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
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>{t[language].sendRequest}</p>
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
                                    <Send size={18} /> {t[language].requestQuotation}
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
                                    Or add LINE: @samredroob
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
                        <p style={{ color: '#999', fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 500 }}>{language === 'th' ? 'ยังไม่มีรายการสินค้าในใบเสนอราคา' : 'No items in quotation'}</p>
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
                            {t[language].backToCalculator}
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
                            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mitr)', marginBottom: '1.5rem', textAlign: 'center' }}>{t[language].contactInfo}</h2>

                            <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>{t[language].name} *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}
                                        placeholder={t[language].namePlaceholder}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>{t[language].phone} *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={e => {
                                            const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                            setFormData({ ...formData, phone: value });
                                        }}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}
                                        placeholder={t[language].phonePlaceholder}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>{t[language].email}</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}
                                        placeholder={t[language].emailPlaceholder}
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
                                        {t[language].cancel}
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
                                        {submitting ? t[language].sending : t[language].confirm}
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
                            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mitr)', marginBottom: '0.75rem', color: '#06C755' }}>{t[language].successTitle}</h2>

                            {lastReferenceCode && (
                                <div className="bg-gray-100 rounded-lg py-2 px-4 mb-4 inline-block">
                                    <span className="text-gray-500 text-sm">{t[language].refCode}</span>
                                    <span className="text-xl font-bold ml-2 text-black">#{lastReferenceCode}</span>
                                </div>
                            )}
                            <p style={{ color: '#666', marginBottom: '1rem' }}>{t[language].successMessage}</p>

                            <div className="mb-6">
                                <a
                                    href="https://lin.ee/FQdVms5"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                        if (lastReferenceCode) {
                                            navigator.clipboard.writeText(`${window.location.origin}/quotation/${lastReferenceCode}`);
                                            // Optional: Show a toast or small alert that link is copied, but user asked for auto-copy.
                                            // The alert might block the new tab opening in some browsers, but usually fine in onClick.
                                            // Let's just copy silently or maybe use a small timeout if needed, but synchronous writeText is standard.
                                            alert(t[language].copied);
                                        }
                                    }}
                                    className="inline-flex items-center gap-2 bg-[#06C755] text-white px-4 py-3 rounded-xl font-bold hover:bg-[#05b64d] transition-colors w-full justify-center shadow-lg shadow-green-100"
                                >
                                    <Send size={20} />
                                    {t[language].sendLine}
                                </a>
                                <p className="text-xs text-gray-400 mt-2 text-center">{t[language].sendLineSub}</p>
                            </div>

                            {/* Share Link Section */}
                            {lastReferenceCode && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 text-left">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">{t[language].shareLink}</label>
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
                                                alert(t[language].copied);
                                            }}
                                            className="bg-black text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
                                        >
                                            {t[language].copy}
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
                                {t[language].ok}
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
                title={t[language].catalogTitle}
            />
        </div>
    );
}
