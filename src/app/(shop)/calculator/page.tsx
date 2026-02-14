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
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]); // Changed to array for multi-select
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
        <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>

            <style jsx>{`
                /* ===== Layout ===== */
                .calculator-layout {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    padding: 0 1rem;
                }
                .results-grid, .results-container.grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                }
                .results-container.list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .calc-submit:hover {
                    transform: translateY(-1px) !important;
                    box-shadow: 0 6px 20px rgba(0,0,0,0.25) !important;
                }
                .calc-submit:active {
                    transform: translateY(0) !important;
                }
                .calc-input:focus {
                    border-color: #111 !important;
                    background: #fff !important;
                    box-shadow: 0 0 0 3px rgba(0,0,0,0.06) !important;
                }
                .cat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                }

                /* ===== Desktop ===== */
                @media (min-width: 768px) {
                    .calculator-layout {
                        flex-direction: row;
                        align-items: flex-start;
                        gap: 2rem;
                    }
                    .input-section {
                        width: 380px;
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

                /* ===== Mobile ===== */
                @media (max-width: 767px) {
                    /* List View Mobile Optimizations */
                    .result-item-list {
                        flex-direction: column;
                        align-items: stretch !important;
                        gap: 0.75rem !important;
                        padding: 1rem !important;
                    }
                    .result-info {
                        flex: 1 1 auto !important;
                        margin-bottom: 0.5rem;
                    }
                    .result-price {
                        text-align: left !important;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        background-color: #f9fafb;
                        padding: 0.75rem;
                        border-radius: 8px;
                        margin: 0.5rem 0;
                    }
                    .result-price::before {
                        content: "ราคารวม";
                        font-size: 0.9rem;
                        color: #666;
                        font-weight: 500;
                    }
                    .result-actions {
                        width: 100%;
                        gap: 0.75rem !important;
                        margin-top: 0.5rem;
                    }
                    .result-actions button {
                        flex: 1;
                        justify-content: center;
                        padding: 0.75rem !important;
                        height: 44px;
                    }
                }
            `}</style>

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
                    <h1 style={{
                        fontSize: '2.2rem',
                        fontWeight: 700,
                        color: 'white',
                        fontFamily: 'var(--font-mitr)',
                        margin: '0 0 0.4rem',
                        letterSpacing: '-0.01em',
                    }}>คำนวณราคา</h1>
                    <p style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '0.9rem',
                        margin: 0,
                        fontWeight: 400,
                    }}>เลือกหมวดหมู่ ระบุขนาด แล้วเปรียบเทียบราคาได้ทันที</p>
                </div>
            </div>

            {/* Steps Indicator */}
            <div style={{
                maxWidth: '680px',
                margin: '-1rem auto 1.5rem',
                position: 'relative',
                zIndex: 2,
                padding: '0 1rem',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'white',
                    borderRadius: '14px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    padding: '0.65rem 1rem',
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    gap: '0.2rem',
                }}>
                    {[
                        { num: '1', label: 'เลือกหมวดหมู่' },
                        { num: '2', label: 'ระบุขนาด' },
                        { num: '3', label: 'คำนวณราคา' },
                        { num: '4', label: 'เพิ่มสินค้า' },
                        { num: '5', label: 'ส่งใบเสนอราคา' },
                    ].map((step, i, arr) => (
                        <React.Fragment key={step.num}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                flexShrink: 0,
                            }}>
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    background: '#111',
                                    color: 'white',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}>{step.num}</div>
                                <span style={{
                                    fontSize: '0.72rem',
                                    color: '#555',
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                }}>{step.label}</span>
                            </div>
                            {i < arr.length - 1 && (
                                <div style={{
                                    width: '16px',
                                    height: '1.5px',
                                    background: '#ddd',
                                    flexShrink: 0,
                                    margin: '0 0.15rem',
                                }} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="calculator-layout">

                {/* Input Section */}
                <div className="input-section">
                    <form onSubmit={handleCalculate} style={{
                        background: 'white',
                        padding: '1.75rem',
                        borderRadius: '20px',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                        border: '1px solid #eee',
                    }}>
                        <h2 style={{
                            fontSize: '1.15rem',
                            fontWeight: 700,
                            margin: '0 0 1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#111',
                        }}>
                            <CalcIcon size={20} />
                            เพิ่มสินค้า
                        </h2>

                        {/* Category Selection */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: 600,
                                fontSize: '0.82rem',
                                color: '#555',
                                textTransform: 'uppercase' as const,
                                letterSpacing: '0.03em',
                            }}>หมวดหมู่สินค้า</label>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '0.6rem',
                            }}>
                                {categories.map(c => {
                                    const isSelected = selectedCategoryId === c.id.toString();
                                    return (
                                        <button
                                            key={c.id}
                                            type="button"
                                            className="cat-card"
                                            style={{
                                                position: 'relative',
                                                overflow: 'hidden',
                                                borderRadius: '14px',
                                                border: isSelected ? '2px solid #111' : '2px solid transparent',
                                                padding: 0,
                                                cursor: 'pointer',
                                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                                aspectRatio: '16/10',
                                                display: 'flex',
                                                alignItems: 'flex-end',
                                                background: '#f0f0f0',
                                                boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.18)' : 'none',
                                                transform: isSelected ? 'scale(1.02)' : 'none',
                                            }}
                                            onClick={() => {
                                                setSelectedCategoryId(isSelected ? '' : c.id.toString());
                                                setResults(null);
                                                setSelectedTags([]);
                                            }}
                                        >
                                            {c.image_url ? (
                                                <img
                                                    src={c.image_url}
                                                    alt={c.name}
                                                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div style={{
                                                    position: 'absolute', inset: 0,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: isSelected ? 'linear-gradient(135deg, #1a1a2e, #16213e)' : 'linear-gradient(135deg, #e8e8e8, #d5d5d5)',
                                                    transition: 'all 0.3s',
                                                }}>
                                                    <span style={{ fontSize: '1.5rem', opacity: 0.25 }}>📷</span>
                                                </div>
                                            )}
                                            {/* Gradient overlay */}
                                            <div style={{
                                                position: 'absolute', inset: 0,
                                                background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.05) 100%)',
                                            }} />
                                            {/* Name */}
                                            <span style={{
                                                position: 'relative', zIndex: 1, width: '100%',
                                                padding: '0.5rem 0.65rem',
                                                color: 'white', fontWeight: 600, fontSize: '0.8rem',
                                                textAlign: 'left', lineHeight: 1.3,
                                                fontFamily: 'var(--font-mitr)',
                                                textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                                            }}>
                                                {c.name}
                                            </span>
                                            {/* Checkmark */}
                                            {isSelected && (
                                                <div style={{
                                                    position: 'absolute', top: 6, right: 6,
                                                    width: 24, height: 24, borderRadius: '50%',
                                                    background: '#111', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center',
                                                    zIndex: 2, boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
                                                }}>
                                                    <Check size={14} color="white" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            {selectedCategoryId && (
                                <p style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#aaa', textAlign: 'center' }}>
                                    กดอีกครั้งเพื่อยกเลิกการเลือก
                                </p>
                            )}
                        </div>

                        {/* Dimensions */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontWeight: 600,
                                fontSize: '0.82rem',
                                color: '#555',
                                textTransform: 'uppercase' as const,
                                letterSpacing: '0.03em',
                            }}>ขนาดที่ต้องการ</label>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '0.75rem',
                            }}>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="number"
                                        value={width}
                                        onChange={(e) => setWidth(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="กว้าง"
                                        required
                                        className="calc-input"
                                        style={{
                                            width: '100%',
                                            padding: '0.85rem 3rem 0.85rem 1rem',
                                            border: '1.5px solid #e5e5e5',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            fontFamily: 'var(--font-mitr)',
                                            background: '#fafafa',
                                            transition: 'all 0.2s',
                                            outline: 'none',
                                        }}
                                    />
                                    <span style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: '#999', fontWeight: 500 }}>ซม.</span>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="number"
                                        value={height}
                                        onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="สูง"
                                        required
                                        className="calc-input"
                                        style={{
                                            width: '100%',
                                            padding: '0.85rem 3rem 0.85rem 1rem',
                                            border: '1.5px solid #e5e5e5',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            fontFamily: 'var(--font-mitr)',
                                            background: '#fafafa',
                                            transition: 'all 0.2s',
                                            outline: 'none',
                                        }}
                                    />
                                    <span style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: '#999', fontWeight: 500 }}>ซม.</span>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="calc-submit" style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'linear-gradient(135deg, #111 0%, #333 100%)',
                            color: 'white',
                            fontWeight: 700,
                            borderRadius: '14px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            border: 'none',
                            fontSize: '1rem',
                            transition: 'all 0.25s',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                            fontFamily: 'var(--font-mitr)',
                        }}>
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


                            {/* Tag Chips */}
                            {(() => {
                                const allTags = Array.from(new Set(results.flatMap(r => r.collection.tags || []))).sort();
                                if (allTags.length === 0) return null;

                                return (
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                        <button
                                            onClick={() => setSelectedTags([])}
                                            style={{
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                border: '1px solid',
                                                borderColor: selectedTags.length === 0 ? 'black' : '#e5e5e5',
                                                backgroundColor: selectedTags.length === 0 ? 'black' : 'white',
                                                color: selectedTags.length === 0 ? 'white' : '#666',
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
                                                onClick={() => {
                                                    if (selectedTags.includes(tag)) {
                                                        setSelectedTags(prev => prev.filter(t => t !== tag));
                                                    } else {
                                                        setSelectedTags(prev => [...prev, tag]);
                                                    }
                                                }}
                                                style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    border: '1px solid',
                                                    borderColor: selectedTags.includes(tag) ? 'black' : '#e5e5e5',
                                                    backgroundColor: selectedTags.includes(tag) ? 'black' : 'white',
                                                    color: selectedTags.includes(tag) ? 'white' : '#666',
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
                                        const matchesTag = selectedTags.length > 0 ? item.collection.tags?.some(tag => selectedTags.includes(tag)) : true;
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
                                                <div key={item.collection.id} className="result-item-list" style={{
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
                                                    <div className="result-info" style={{ flex: '1 1 300px' }}>
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
                                                    <div className="result-price" style={{ flex: '0 0 auto', textAlign: 'right' }}>
                                                        {isError ? (
                                                            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444' }}>เกินเงื่อนไข</span>
                                                        ) : (
                                                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'black' }}>
                                                                ฿{item.total.toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* 3. Actions */}
                                                    <div className="result-actions" style={{ display: 'flex', gap: '0.5rem', flex: '0 0 auto' }}>
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
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <CalcIcon size={28} style={{ color: '#bbb' }} />
                            </div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#555', margin: '0 0 0.35rem' }}>กรอกขนาดเพื่อเปรียบเทียบราคา</p>
                            <p style={{ fontSize: '0.85rem', color: '#999', margin: 0 }}>เลือกหมวดหมู่ → ระบุขนาด → กดคำนวณ</p>
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
