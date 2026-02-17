"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ProductCollection, Category, Brand } from '@/lib/types';
import { calculatePrice } from '@/utils/pricing';
import { Search, Plus, Trash2, Save, Copy, ExternalLink, ArrowLeft, Store, ShoppingBag, Info, BookOpen, Images, ChevronDown, ChevronUp, X, Minus } from 'lucide-react';
import Link from 'next/link';

export default function CreateQuotationDraftPage() {
    const [collections, setCollections] = useState<ProductCollection[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedCategoryForModal, setSelectedCategoryForModal] = useState<Category | null>(null);

    // Draft State
    const [draftItems, setDraftItems] = useState<any[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Form State
    const [selectedCollection, setSelectedCollection] = useState<ProductCollection | null>(null);
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [note, setNote] = useState('');

    // UI Mock States
    const [priceMode, setPriceMode] = useState<'shop' | 'platform'>('shop');
    const [showRemarks, setShowRemarks] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!supabase) return;
            setLoading(true);

            // Fetch Collections
            const { data: colData } = await supabase
                .from('product_collections')
                .select('*, product_categories(name), product_brands(name, logo_url)')
                .order('name');

            if (colData) setCollections(colData);

            // Fetch Categories (for Modal Grid)
            const { data: catData } = await supabase
                .from('product_categories')
                .select('*')
                .order('name');

            if (catData) setCategories(catData);

            setLoading(false);
        };
        fetchData();
    }, []);



    const handleAddItem = () => {
        if (!selectedCollection || !width || !height) return;

        const w = parseFloat(width);
        const h = parseFloat(height);
        const qty = quantity > 0 ? quantity : 1;

        if (isNaN(w) || isNaN(h)) return;

        // Calculate simplified price
        let priceToUse = selectedCollection.price_per_unit;
        if (priceMode === 'platform' && (selectedCollection.price_per_unit_platform ?? 0) > 0) {
            priceToUse = selectedCollection.price_per_unit_platform!;
        }

        const { total, breakdown } = calculatePrice(selectedCollection, w, h, priceToUse);

        const newItem = {
            id: Date.now().toString(), // temporary ID
            collection: selectedCollection,
            width: w,
            height: h,
            quantity: qty,
            totalPrice: total * qty,
            pricePerPiece: total, // Store unit price for calculation
            breakdown: breakdown,
            unitPrice: priceToUse, // Capture current unit price
            note: note,
            // variants will be selected by customer
        };

        setDraftItems([...draftItems, newItem]);

        // Reset form
        setSelectedCollection(null);
        setWidth('');
        setHeight('');
        setQuantity(1);
        setNote('');
        setSearchTerm('');
    };

    const handleUpdateQuantity = (index: number, newQty: number) => {
        if (newQty < 1) return;
        const newItems = [...draftItems];
        const item = newItems[index];
        item.quantity = newQty;
        item.totalPrice = item.pricePerPiece * newQty;
        setDraftItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...draftItems];
        newItems.splice(index, 1);
        setDraftItems(newItems);
    };

    const handleSaveDraft = async () => {
        if (!supabase || draftItems.length === 0) return;
        setSaving(true);

        try {
            const referenceCode = Math.random().toString(36).substring(2, 8).toUpperCase();

            const { data, error } = await supabase
                .from('quotation_drafts')
                .insert([{
                    items: draftItems,
                    customer_name: customerName,
                    reference_code: referenceCode,
                    status: 'draft'
                }])
                .select()
                .single();

            if (error) throw error;

            if (data) {
                const link = `${window.location.origin}/draft/${data.id}`;
                setGeneratedLink(link);
            }
        } catch (error) {
            console.error('Error saving draft:', error);
            alert('บันทึกไม่สำเร็จ');
        } finally {
            setSaving(false);
        }
    };

    const copyToClipboard = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            alert('คัดลอกลิ้งค์แล้ว');
        }
    };

    const handleModeChange = (mode: 'shop' | 'platform') => {
        setPriceMode(mode);

        // Recalculate all items
        const updatedItems = draftItems.map(item => {
            let priceToUse = item.collection.price_per_unit;
            if (mode === 'platform' && (item.collection.price_per_unit_platform ?? 0) > 0) {
                priceToUse = item.collection.price_per_unit_platform!;
            }

            const { total, breakdown } = calculatePrice(
                item.collection,
                item.width,
                item.height,
                priceToUse
            );

            return {
                ...item,
                pricePerPiece: total,
                totalPrice: total * item.quantity,
                breakdown: breakdown,
                unitPrice: priceToUse
            };
        });

        setDraftItems(updatedItems);
    };

    const totalEstimate = draftItems.reduce((sum, item) => sum + item.totalPrice, 0);

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', paddingBottom: '100px' }}>

            {/* Header matching Quotation Page */}
            <div style={{
                position: 'relative',
                textAlign: 'center',
                padding: '2.5rem 1.5rem 2.5rem',
                marginBottom: '1rem',
                borderRadius: '0 0 2rem 2rem',
                background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)',
                color: 'white'
            }}>
                <Link
                    href="/admin"
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
                    <ArrowLeft size={14} /> กลับไปหน้า Admin
                </Link>
                <h1 style={{
                    fontSize: '2.2rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mitr)',
                    margin: '0 0 0.4rem',
                    letterSpacing: '-0.01em',
                }}>สร้างใบเสนอราคา (Draft)</h1>
                <p style={{
                    color: 'rgba(255,255,255,0.45)',
                    fontSize: '0.9rem',
                    margin: 0,
                }}>Admin Tool สำหรับสร้างและส่งลิ้งค์ให้ลูกค้า</p>
            </div>

            <div style={{ padding: '0 1rem' }}>

                {/* TOOL: Add Item Panel */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Plus size={20} className="text-blue-600" />
                        เพิ่มรายการสินค้า
                    </h2>

                    {/* Button to Open Modal */}
                    {!selectedCollection && (
                        <button
                            onClick={() => setShowProductModal(true)}
                            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition gap-2"
                        >
                            <Search size={24} />
                            <span className="font-semibold">กดเพื่อเลือกสินค้าจากแคตตาล็อก</span>
                        </button>
                    )}

                    {/* Selected Item Form */}
                    {selectedCollection && (
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-sm text-blue-600 font-bold mb-1">สินค้าที่เลือก:</div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedCollection.name}</h3>
                                    <div className="text-sm text-gray-500">{selectedCollection.product_brands?.name}</div>
                                </div>
                                <button onClick={() => setSelectedCollection(null)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">กว้าง (ซม.)</label>
                                    <input
                                        type="number"
                                        value={width}
                                        onChange={e => setWidth(e.target.value)}
                                        className="w-full p-2 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">สูง (ซม.)</label>
                                    <input
                                        type="number"
                                        value={height}
                                        onChange={e => setHeight(e.target.value)}
                                        className="w-full p-2 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">จำนวน</label>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                                        min="1"
                                        className="w-full p-2 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={handleAddItem}
                                        disabled={!width || !height}
                                        className="w-full bg-blue-600 text-white p-2 rounded-lg font-bold disabled:opacity-50 hover:bg-blue-700 transition shadow-sm"
                                    >
                                        เพิ่มรายการ
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* PRODUCT SELECTION MODAL */}
                {showProductModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowProductModal(false)}>
                        <div
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-lg text-gray-800">
                                    {selectedCategoryForModal ? `เลือกสินค้า: ${selectedCategoryForModal.name}` : 'เลือกหมวดหมู่สินค้า'}
                                </h3>
                                <div className="flex gap-2">
                                    {selectedCategoryForModal && (
                                        <button
                                            onClick={() => {
                                                setSelectedCategoryForModal(null);
                                                setSearchTerm('');
                                            }}
                                            className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100"
                                        >
                                            <ArrowLeft size={16} className="inline mr-1" /> กลับไปหมวดหมู่
                                        </button>
                                    )}
                                    <button onClick={() => setShowProductModal(false)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                                {!selectedCategoryForModal ? (
                                    /* STEP 1: CATEGORY GRID */
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setSelectedCategoryForModal(cat)}
                                                className="group relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-blue-500 bg-white"
                                            >
                                                {cat.image_url ? (
                                                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                                        <Images size={48} />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                                                    <span className="text-white font-bold text-lg">{cat.name}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    /* STEP 2: COLLECTION LIST */
                                    <div className="space-y-4">
                                        {/* Search in Modal */}
                                        <div className="relative mb-4">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="text"
                                                placeholder={`ค้นหาในหมวด ${selectedCategoryForModal.name}...`}
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                                autoFocus
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {collections
                                                .filter(c =>
                                                    c.category_id === selectedCategoryForModal.id &&
                                                    (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        c.product_brands?.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                                )
                                                .map(collection => (
                                                    <button
                                                        key={collection.id}
                                                        onClick={() => {
                                                            setSelectedCollection(collection);
                                                            setShowProductModal(false);
                                                            setSearchTerm('');
                                                            setSelectedCategoryForModal(null);
                                                        }}
                                                        className="flex flex-col text-left bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition group"
                                                    >
                                                        <div className="flex justify-between items-start w-full mb-2">
                                                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-md group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                                                                {collection.product_brands?.name || 'No Brand'}
                                                            </span>
                                                            <span className="font-bold text-blue-600">฿{collection.price_per_unit.toLocaleString()}</span>
                                                        </div>
                                                        <h4 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">{collection.name}</h4>
                                                        <p className="text-gray-400 text-sm">หน่วย: {collection.unit}</p>
                                                    </button>
                                                ))}

                                            {collections.filter(c => c.category_id === selectedCategoryForModal.id).length === 0 && (
                                                <div className="col-span-full text-center py-12 text-gray-400">
                                                    ไม่พบสินค้าในหมวดหมู่นี้
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- QUOTATION PREVIEW UI --- */}

                {/* 1. Remarks Accordion */}
                <div style={{
                    background: 'white',
                    border: '1px solid #f0f0f0',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    marginTop: '1rem',
                    marginBottom: '1.5rem',
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

                {/* 2. Price Mode Toggle (Visual Only for basic draft, or functional if you want admin to set checking mode) */}
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
                    <div style={{ display: 'flex', gap: '4px', background: '#f3f3f3', padding: '3px', borderRadius: '10px' }}>
                        <button
                            type="button"
                            onClick={() => handleModeChange('shop')}
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
                            onClick={() => handleModeChange('platform')}
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

            {/* 3. Items Table */}
            {draftItems.length > 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mb-8">
                    {/* Mobile View / Card-like for small screens could be added here, sticking to Table as requested for visuals */}
                    <div className="overflow-x-auto">
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e5e5' }}>
                                <tr>
                                    <th style={{ padding: '1.25rem', fontWeight: 600, color: '#444' }}>สินค้า</th>
                                    <th style={{ padding: '1.25rem', fontWeight: 600, color: '#444' }}>รหัสสินค้า</th>
                                    <th style={{ padding: '1.25rem', fontWeight: 600, color: '#444' }}>ขนาด (กxส)</th>
                                    <th style={{ padding: '1.25rem', fontWeight: 600, color: '#444', textAlign: 'center' }}>จำนวน</th>
                                    <th style={{ padding: '1.25rem', fontWeight: 600, color: '#444', textAlign: 'right' }}>ราคาต่อชิ้น</th>
                                    <th style={{ padding: '1.25rem', fontWeight: 600, color: '#444', textAlign: 'right' }}>ราคารวม</th>
                                    <th style={{ padding: '1.25rem', fontWeight: 600, color: '#444', width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {draftItems.map((item, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ fontWeight: 600, fontSize: '1rem', color: '#111' }}>
                                                {item.collection.product_brands?.logo_url && (
                                                    <img src={item.collection.product_brands?.logo_url} className="w-4 h-4 object-contain inline-block mr-2" alt="" />
                                                )}
                                                {item.collection.name}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem' }}>
                                                {(item.unitPrice || 0).toLocaleString()} บาท/{item.collection.unit}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 italic w-32 text-center">
                                                -- เลือก --
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem', color: '#666' }}>
                                            {item.width} x {item.height} ซม.
                                        </td>
                                        <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                                                    className="p-1 rounded-md hover:bg-gray-100 text-gray-500 disabled:opacity-30"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                                                    className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem', textAlign: 'right', color: '#666', fontWeight: 500 }}>
                                            ฿{item.pricePerPiece.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600, fontSize: '1.1rem' }}>
                                            ฿{item.totalPrice.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleRemoveItem(index)}
                                                style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}
                                                title="ลบรายการ"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot style={{ backgroundColor: '#f9fafb', borderTop: '1px solid #e5e5e5' }}>
                                <tr>
                                    <td colSpan={5} style={{ padding: '1.5rem', textAlign: 'right', fontWeight: 600, fontSize: '1.2rem' }}>
                                        ราคารวมทั้งหมด ({priceMode === 'platform' ? 'Platform' : 'หน้าร้าน'})
                                    </td>
                                    <td style={{ padding: '1.5rem', textAlign: 'right', fontWeight: 700, fontSize: '1.5rem', color: 'black' }}>
                                        ฿{totalEstimate.toLocaleString()}
                                    </td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan={7} style={{ padding: '0.75rem 1.5rem', textAlign: 'right', color: '#ff4d4f', fontSize: '0.9rem', borderTop: '1px dashed #e5e5e5' }}>
                                        * ราคาเฉพาะค่าสินค้า ยังไม่รวมค่าจัดส่งและค่าติดตั้ง
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
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
                    marginBottom: '2rem'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                    <p style={{ color: '#999', fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 500 }}>ยังไม่มีรายการสินค้าในใบเสนอราคา</p>
                </div>
            )}


            {/* ACTION BAR (Sticky Bottom) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50 md:pl-[260px]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="ชื่อลูกค้า / โน๊ต (Optional)"
                            value={customerName}
                            onChange={e => setCustomerName(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {!generatedLink ? (
                        <button
                            onClick={handleSaveDraft}
                            disabled={draftItems.length === 0 || saving}
                            className="w-full md:w-auto px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? 'กำลังบันทึก...' : <><Save size={18} /> สร้างลิงค์เสนอราคา</>}
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-800 font-mono text-sm flex-1 truncate max-w-[200px]">
                                {generatedLink}
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700"
                                title="Copy Link"
                            >
                                <Copy size={20} />
                            </button>
                            <a
                                href={generatedLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 bg-black text-white rounded-xl hover:bg-gray-800"
                                title="Open Link"
                            >
                                <ExternalLink size={20} />
                            </a>
                            <button
                                onClick={() => {
                                    setGeneratedLink(null);
                                    setDraftItems([]);
                                    setCustomerName('');
                                }}
                                className="text-xs text-gray-500 underline ml-2 whitespace-nowrap"
                            >
                                เริ่มใหม่
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
