"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ProductCollection, Category } from '@/lib/types';
import { calculatePrice } from '@/utils/pricing';
import { Calculator as CalcIcon, RefreshCw, Loader2, ExternalLink, ArrowRight, ShoppingCart, Check, Store, ShoppingBag, Info } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

interface CalculationResult {
    collection: ProductCollection;
    total: number;
    breakdown: string;
}

export default function CalculatorPage() {
    const { addToCart, cartCount } = useCart();
    const [categories, setCategories] = useState<Category[]>([]);
    const [collections, setCollections] = useState<ProductCollection[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [width, setWidth] = useState<number | ''>('');
    const [height, setHeight] = useState<number | ''>('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [priceMode, setPriceMode] = useState<'shop' | 'platform'>('shop');
    const [results, setResults] = useState<CalculationResult[] | null>(null);
    const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

    useEffect(() => {
        const initData = async () => {
            if (!supabase) return;
            try {
                setLoading(true);
                // Fetch Categories
                const { data: catData, error: catError } = await supabase
                    .from('product_categories')
                    .select('*')
                    .order('name');

                if (catError) throw catError;
                setCategories(catData || []);

                // Fetch Collections
                const { data: colData, error: colError } = await supabase
                    .from('product_collections')
                    .select('*')
                    .order('name');

                if (colError) throw colError;
                setCollections(colData || []);

                // Set Default Category if exists
                if (catData && catData.length > 0) {
                    setSelectedCategoryId(catData[0].id.toString());
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, []);

    // Filter collections based on selected category
    const filteredCollections = collections.filter(c =>
        selectedCategoryId ? c.category_id.toString() === selectedCategoryId : true
    );

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        setAddedItems(new Set()); // Reset added state on new calculation

        if (width && height && filteredCollections.length > 0) {
            const calculatedResults: CalculationResult[] = filteredCollections.map(collection => {
                // Determine price based on mode
                // If platform mode, use platform price. If not available, fallback to shop price?
                // Or maybe use 0 if not available? Let's use standard fallback logic in pricing util if we pass undefined,
                // but here we want to be explicit.

                let priceToUse = collection.price_per_unit;
                if (priceMode === 'platform') {
                    // Check if platform price exists and is > 0
                    if (collection.price_per_unit_platform && collection.price_per_unit_platform > 0) {
                        priceToUse = collection.price_per_unit_platform;
                    } else {
                        // Fallback or warning? For now use standard
                        priceToUse = collection.price_per_unit;
                    }
                }

                const res = calculatePrice(collection, Number(width), Number(height), priceToUse);
                return {
                    collection,
                    total: res.total,
                    breakdown: res.breakdown
                };
            });

            // Sort by price (lowest first)
            calculatedResults.sort((a, b) => a.total - b.total);
            setResults(calculatedResults);
        }
    };

    const handleAddToCart = (item: CalculationResult) => {
        addToCart({
            collection: item.collection,
            width: Number(width),
            height: Number(height),
            totalPrice: item.total,
            breakdown: item.breakdown
        });
        setAddedItems(prev => new Set(prev).add(item.collection.id.toString()));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="animate-spin text-gray-400" size={48} />
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>

            {/* Floating Cart Button */}
            {cartCount > 0 && (
                <Link
                    href="/quotation"
                    className="fixed right-4 bottom-28 md:bottom-8 z-50 flex items-center gap-3 bg-black text-white px-6 py-4 rounded-full shadow-2xl hover:scale-105 transition-transform duration-200"
                >
                    <div className="relative">
                        <ShoppingCart size={24} />
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-black">
                            {cartCount}
                        </span>
                    </div>
                    <span className="font-semibold text-base font-[family-name:var(--font-mitr)]">ดูใบเสนอราคา</span>
                </Link>
            )}

            <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2.5rem', fontFamily: 'var(--font-mitr)' }}>คำนวณราคา</h1>

            <div className="calculator-layout">
                <style jsx>{`
                    .calculator-layout {
                        display: flex;
                        flex-direction: column;
                        gap: 2rem;
                    }
                    .results-grid {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }
                    @media (min-width: 768px) {
                        .calculator-layout {
                            flex-direction: row;
                            align-items: flex-start;
                        }
                        .input-section {
                            width: 350px;
                            position: sticky;
                            top: 2rem;
                        }
                        .results-section {
                            flex: 1;
                        }
                        .results-grid {
                            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                        }
                    }
                `}</style>

                {/* Input Section */}
                <div className="input-section">
                    <form onSubmit={handleCalculate} style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        border: '1px solid #f0f0f0'
                    }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>กรอกข้อมูล</h2>

                        {/* Category Selection */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#666' }}>หมวดหมู่สินค้า</label>
                            <select
                                value={selectedCategoryId}
                                onChange={(e) => {
                                    setSelectedCategoryId(e.target.value);
                                    setResults(null); // Clear results on category change
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e5e5e5',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontFamily: 'var(--font-mitr)',
                                    backgroundColor: '#fff'
                                }}
                            >
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#666' }}>ความกว้าง (ซม.)</label>
                                <input
                                    type="number"
                                    value={width}
                                    onChange={(e) => setWidth(Number(e.target.value))}
                                    placeholder="เช่น 200"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #e5e5e5',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontFamily: 'var(--font-mitr)'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#666' }}>ความสูง (ซม.)</label>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(Number(e.target.value))}
                                    placeholder="เช่น 250"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #e5e5e5',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontFamily: 'var(--font-mitr)'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#666' }}>ช่องทางการสั่งซื้อ</label>
                            <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#f5f5f5', padding: '0.25rem', borderRadius: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPriceMode('shop');
                                        setResults(null);
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        backgroundColor: priceMode === 'shop' ? 'white' : 'transparent',
                                        color: priceMode === 'shop' ? 'black' : '#666',
                                        boxShadow: priceMode === 'shop' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.4rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Store size={16} /> หน้าร้าน
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPriceMode('platform');
                                        setResults(null);
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        backgroundColor: priceMode === 'platform' ? 'white' : 'transparent',
                                        color: priceMode === 'platform' ? '#f97316' : '#666',
                                        boxShadow: priceMode === 'platform' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.4rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <ShoppingBag size={16} /> แพลตฟอร์ม
                                </button>
                            </div>
                            {priceMode === 'platform' && (
                                <p style={{ fontSize: '0.75rem', color: '#f97316', marginTop: '0.5rem', display: 'flex', gap: '0.25rem' }}>
                                    <Info size={12} style={{ marginTop: '2px' }} /> ราคาอาจสูงกว่าหน้าร้านเนื่องจากมีค่าธรรมเนียม
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                backgroundColor: 'black',
                                color: 'white',
                                fontWeight: 600,
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                border: 'none',
                                fontSize: '1rem'
                            }}
                        >
                            <CalcIcon size={20} /> คำนวณราคา {priceMode === 'platform' ? '(Platform)' : ''}
                        </button>
                    </form>
                </div>

                {/* Results Section */}
                <div className="results-section">
                    {results ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                                    ผลลัพธ์การคำนวณ ({results.length} รายการ)
                                </h2>
                                <button
                                    onClick={() => setResults(null)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: '#666',
                                        fontSize: '0.9rem',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        backgroundColor: '#f5f5f5',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <RefreshCw size={14} /> ล้างค่าใหม่
                                </button>
                            </div>

                            <div className="results-grid">
                                {results.map((item, index) => {
                                    const isAdded = addedItems.has(item.collection.id.toString());
                                    const isError = item.total === 0;

                                    // Determine display unit price
                                    let displayUnitPrice = item.collection.price_per_unit;
                                    if (priceMode === 'platform' && item.collection.price_per_unit_platform) {
                                        displayUnitPrice = item.collection.price_per_unit_platform;
                                    }

                                    return (
                                        <div key={item.collection.id} style={{
                                            backgroundColor: 'white',
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            border: isAdded ? '2px solid #22c55e' : (isError ? '1px solid #fee2e2' : '1px solid #f0f0f0'),
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            opacity: isError ? 0.8 : 1
                                        }}>
                                            <div style={{ padding: '1.5rem', flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1a1a1a', lineHeight: 1.4 }}>
                                                        {item.collection.name}
                                                    </h3>
                                                    {index === 0 && !isError && (
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            padding: '0.2rem 0.6rem',
                                                            backgroundColor: '#DCFCE7',
                                                            color: '#166534',
                                                            borderRadius: '12px',
                                                            fontWeight: 700,
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            คุ้มค่าที่สุด
                                                        </span>
                                                    )}
                                                </div>

                                                <div style={{ marginBottom: '1rem' }}>
                                                    {isError ? (
                                                        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>
                                                            เกินเงื่อนไข
                                                        </span>
                                                    ) : (
                                                        <span style={{ fontSize: '2rem', fontWeight: 700, color: 'black' }}>
                                                            ฿{item.total.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>

                                                <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.6, backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                                    ราคาต่อหน่วย: {displayUnitPrice} บาท/{item.collection.unit}
                                                    <br />
                                                    <span style={{ opacity: 0.8, color: isError ? '#ef4444' : 'inherit' }}>
                                                        {isError ? item.breakdown : item.breakdown.split(' (')[0]}
                                                    </span>
                                                </div>

                                                <button
                                                    onClick={() => handleAddToCart(item)}
                                                    disabled={isAdded || isError}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        backgroundColor: isAdded ? '#dcfce7' : (isError ? '#e5e5e5' : 'black'),
                                                        color: isAdded ? '#166534' : (isError ? '#a3a3a3' : 'white'),
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        fontWeight: 600,
                                                        cursor: (isAdded || isError) ? 'default' : 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5rem',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {isAdded ? (
                                                        <>
                                                            <Check size={18} /> เพิ่มแล้ว
                                                        </>
                                                    ) : isError ? (
                                                        'ไม่สามารถสั่งซื้อได้'
                                                    ) : (
                                                        <>
                                                            <ShoppingCart size={18} /> เพิ่มรายการ
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            <div style={{
                                                padding: '1rem 1.5rem',
                                                borderTop: '1px solid #f5f5f5',
                                                display: 'flex',
                                                gap: '0.5rem',
                                                backgroundColor: '#fafafa'
                                            }}>
                                                {item.collection.catalog_url && (
                                                    <a
                                                        href={item.collection.catalog_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            flex: 1,
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            gap: '0.4rem',
                                                            padding: '0.5rem',
                                                            backgroundColor: 'white',
                                                            border: '1px solid #e5e5e5',
                                                            borderRadius: '6px',
                                                            fontSize: '0.85rem',
                                                            color: '#333',
                                                            textDecoration: 'none',
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        <ExternalLink size={14} /> Catalog
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            minHeight: '300px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '16px',
                            border: '2px dashed #e5e5e5',
                            color: '#888'
                        }}>
                            <CalcIcon size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>กรอกขนาดเพื่อเปรียบเทียบราคา</p>
                            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>ระบบจะคำนวณราคาสินค้าทั้งหมดในหมวดหมู่นี้ให้ทันที</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
