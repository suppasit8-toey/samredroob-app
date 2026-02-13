"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ProductCollection, Category } from '@/lib/types';
import { calculatePrice } from '@/utils/pricing';
import { Calculator as CalcIcon, RefreshCw, Loader2, ExternalLink, ArrowRight, ShoppingCart, Check, Store, ShoppingBag, Info, LayoutGrid, List, Search } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import CatalogModal from '@/components/CatalogModal';

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
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null); // Added selectedTag state
    const [results, setResults] = useState<CalculationResult[] | null>(null);
    const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

    // Catalog Modal State
    const [activeCatalog, setActiveCatalog] = useState<{ url: string; title: string } | null>(null);

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

                // Removed auto-selection logic
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

    // Extract calculation logic
    const performCalculation = () => {
        if (width && height && filteredCollections.length > 0) {
            const calculatedResults: CalculationResult[] = filteredCollections.map(collection => {
                let priceToUse = collection.price_per_unit;
                if (priceMode === 'platform') {
                    if ((collection.price_per_unit_platform ?? 0) > 0) {
                        priceToUse = collection.price_per_unit_platform!;
                    }
                }

                const res = calculatePrice(collection, Number(width), Number(height), priceToUse);
                return {
                    collection,
                    total: res.total,
                    breakdown: res.breakdown
                };
            });

            calculatedResults.sort((a, b) => a.total - b.total);
            setResults(calculatedResults);

            // Track calculation event
            if (supabase) {
                supabase
                    .from('analytics_events')
                    .insert([
                        {
                            event_type: 'calculate',
                            page_path: '/calculator',
                            metadata: {
                                item_count: calculatedResults.length,
                                total_amount: calculatedResults.reduce((sum, item) => sum + item.total, 0),
                                price_mode: priceMode,
                                width: Number(width),
                                height: Number(height),
                                category_id: selectedCategoryId,
                                category_name: categories.find(c => c.id === Number(selectedCategoryId))?.name,
                                top_product: calculatedResults.length > 0 ? calculatedResults[0].collection.name : null,
                                top_price: calculatedResults.length > 0 ? calculatedResults[0].total : null
                            }
                        }
                    ]).then(({ error }) => {
                        if (error) console.error('Error logging calculation event:', error);
                    });
            }
        }
    };

    // Auto-calculate when priceMode changes AND we already have results (or valid inputs)
    useEffect(() => {
        if (width && height && results) {
            performCalculation();
        }
    }, [priceMode]); // Only trigger on priceMode change for now to avoid loops or aggressive recalcs on typing

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        setAddedItems(new Set());
        // Instruction: Set priceMode to 'shop' at the start of handleCalculate to ensure "calculate normal price first".
        // If priceMode is 'platform', setting it to 'shop' will trigger the useEffect to perform calculation.
        // If priceMode is already 'shop', the useEffect won't trigger, so we call performCalculation directly.
        if (priceMode === 'platform') {
            setPriceMode('shop'); // This will trigger the useEffect to call performCalculation
        } else {
            performCalculation(); // priceMode is already 'shop', so call performCalculation directly
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
                    .results-container.grid {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }
                    .results-container.list {
                        display: flex;
                        flex-direction: column;
                        gap: 1rem;
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
                        .results-grid, .results-container.grid {
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
                                <option value="">-- กรุณาเลือกหมวดหมู่ --</option>
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
                            <CalcIcon size={20} /> คำนวณราคา
                        </button>
                    </form>
                </div>

                {/* Results Section */}
                <div className="results-section">
                    {results ? (
                        <>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
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

                                {/* Price Mode Toggle (Moved here) */}
                                <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontWeight: 600, color: '#333' }}>ราคาสำหรับ:</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#f5f5f5', padding: '0.25rem', borderRadius: '8px' }}>
                                            <button
                                                type="button"
                                                onClick={() => setPriceMode('shop')}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    backgroundColor: priceMode === 'shop' ? 'white' : 'transparent',
                                                    color: priceMode === 'shop' ? 'black' : '#666',
                                                    boxShadow: priceMode === 'shop' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                    fontWeight: 600,
                                                    fontSize: '0.9rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <Store size={16} /> หน้าร้าน
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPriceMode('platform')}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    backgroundColor: priceMode === 'platform' ? 'white' : 'transparent',
                                                    color: priceMode === 'platform' ? '#f97316' : '#666',
                                                    boxShadow: priceMode === 'platform' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                    fontWeight: 600,
                                                    fontSize: '0.9rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <ShoppingBag size={16} /> แพลตฟอร์ม
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {priceMode === 'platform' && (
                                    <p style={{ fontSize: '0.8rem', color: '#f97316', marginTop: '0.5rem', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                                        <Info size={14} /> ราคาอาจสูงกว่าหน้าร้านเนื่องจากมีค่าธรรมเนียม
                                    </p>
                                )}
                            </div>

                            {/* Search Input */}
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder="ค้นหาชื่อ..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem 0.75rem 2.5rem',
                                            borderRadius: '12px',
                                            border: '1px solid #e5e5e5',
                                            fontSize: '1rem',
                                            fontFamily: 'var(--font-mitr)',
                                            outline: 'none'
                                        }}
                                    />
                                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                                        <Search size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* Tag Chips */}
                            {(() => {
                                const allTags = Array.from(new Set(results.flatMap(r => r.collection.tags || []))).sort();
                                if (allTags.length === 0) return null;

                                return (
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                        <button
                                            onClick={() => setSelectedTag(null)}
                                            style={{
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                border: '1px solid',
                                                borderColor: selectedTag === null ? 'black' : '#e5e5e5',
                                                backgroundColor: selectedTag === null ? 'black' : 'white',
                                                color: selectedTag === null ? 'white' : '#666',
                                                fontSize: '0.85rem',
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            ทั้งหมด
                                        </button>
                                        {allTags.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                                style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    border: '1px solid',
                                                    borderColor: selectedTag === tag ? 'black' : '#e5e5e5',
                                                    backgroundColor: selectedTag === tag ? 'black' : 'white',
                                                    color: selectedTag === tag ? 'white' : '#666',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                );
                            })()}

                            {/* View Mode Toggle */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', backgroundColor: '#f5f5f5', padding: '0.25rem', borderRadius: '8px', gap: '0.25rem' }}>
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        style={{
                                            padding: '0.4rem',
                                            borderRadius: '6px',
                                            border: 'none',
                                            backgroundColor: viewMode === 'grid' ? 'white' : 'transparent',
                                            color: viewMode === 'grid' ? 'black' : '#888',
                                            boxShadow: viewMode === 'grid' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title="Grid View"
                                    >
                                        <LayoutGrid size={18} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        style={{
                                            padding: '0.4rem',
                                            borderRadius: '6px',
                                            border: 'none',
                                            backgroundColor: viewMode === 'list' ? 'white' : 'transparent',
                                            color: viewMode === 'list' ? 'black' : '#888',
                                            boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title="List View"
                                    >
                                        <List size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className={`results-container ${viewMode}`}>
                                {(() => {
                                    const filteredResults = results.filter(item => {
                                        const matchesSearch = item.collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            item.collection.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
                                        const matchesTag = selectedTag ? item.collection.tags?.includes(selectedTag) : true;
                                        return matchesSearch && matchesTag;
                                    });

                                    // Find minimum price (greater than 0)
                                    const minPrice = filteredResults.reduce((min, item) => {
                                        if (item.total > 0 && (min === 0 || item.total < min)) {
                                            return item.total;
                                        }
                                        return min;
                                    }, 0);

                                    return filteredResults.map((item, index) => {
                                        const isAdded = addedItems.has(item.collection.id.toString());
                                        const isError = item.total === 0;
                                        const isBestValue = !isError && item.total === minPrice && minPrice > 0;

                                        // Determine display unit price
                                        let displayUnitPrice = item.collection.price_per_unit;
                                        if (priceMode === 'platform' && item.collection.price_per_unit_platform) {
                                            displayUnitPrice = item.collection.price_per_unit_platform;
                                        }

                                        if (viewMode === 'list') {
                                            // LIST VIEW RENDER
                                            return (
                                                <div key={item.collection.id} style={{
                                                    backgroundColor: 'white',
                                                    borderRadius: '12px',
                                                    border: isAdded ? '2px solid #22c55e' : (isError ? '1px solid #fee2e2' : '1px solid #f0f0f0'),
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '1rem',
                                                    gap: '1rem',
                                                    transition: 'all 0.2s',
                                                    opacity: isError ? 0.8 : 1,
                                                    flexWrap: 'wrap'
                                                }}>
                                                    {/* 1. Name & Breakdown */}
                                                    <div style={{ flex: '1 1 300px' }}>
                                                        <div style={{ flex: '1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
                                                                {item.collection.name}
                                                            </h3>
                                                            {isBestValue && (
                                                                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', backgroundColor: '#DCFCE7', color: '#166534', borderRadius: '12px', fontWeight: 700 }}>
                                                                    คุ้มสุด
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                                            ราคาต่อหน่วย: {displayUnitPrice} บาท/{item.collection.unit}
                                                            <span style={{ marginLeft: '0.5rem', opacity: 0.8, color: isError ? '#ef4444' : '#888' }}>
                                                                ({isError ? item.breakdown : item.breakdown.split(' (')[0]})
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* 2. Price */}
                                                    <div style={{ flex: '0 0 auto', textAlign: 'right' }}>
                                                        {isError ? (
                                                            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444' }}>เกินเงื่อนไข</span>
                                                        ) : (
                                                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'black' }}>
                                                                ฿{item.total.toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* 3. Actions */}
                                                    <div style={{ display: 'flex', gap: '0.5rem', flex: '0 0 auto' }}>
                                                        <button
                                                            onClick={() => handleAddToCart(item)}
                                                            disabled={isAdded || isError}
                                                            style={{
                                                                padding: '0.5rem 1rem',
                                                                backgroundColor: isAdded ? '#dcfce7' : (isError ? '#e5e5e5' : 'black'),
                                                                color: isAdded ? '#166534' : (isError ? '#a3a3a3' : 'white'),
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                fontWeight: 600,
                                                                cursor: (isAdded || isError) ? 'default' : 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.4rem',
                                                                fontSize: '0.85rem'
                                                            }}
                                                        >
                                                            {isAdded ? (
                                                                <>
                                                                    <Check size={16} /> <span className="hidden sm:inline">เพิ่มแล้ว</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ShoppingCart size={16} /> <span className="hidden sm:inline">เพิ่ม</span>
                                                                </>
                                                            )}
                                                        </button>

                                                        {item.collection.catalog_url && (
                                                            <button
                                                                onClick={() => setActiveCatalog({
                                                                    url: item.collection.catalog_url!,
                                                                    title: `Spec: ${item.collection.name}`
                                                                })}
                                                                className="flex items-center justify-center p-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                                                                title="ดู Catalog / Spec"
                                                            >
                                                                <ExternalLink size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // GRID VIEW RENDER (Default)
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
                                                        {isBestValue && (
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
                                                        <button
                                                            onClick={() => setActiveCatalog({
                                                                url: item.collection.catalog_url!,
                                                                title: `Spec: ${item.collection.name}`
                                                            })}
                                                            className="flex-1 flex justify-center items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                                                            title="ดู Catalog / Spec"
                                                        >
                                                            <ExternalLink size={14} /> ดู Catalog
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                })()}
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

            {/* Catalog Modal */}
            <CatalogModal
                isOpen={!!activeCatalog}
                onClose={() => setActiveCatalog(null)}
                url={activeCatalog?.url || null}
                title={activeCatalog?.title}
            />
        </div>
    );
}
