"use client";

import React, { useEffect, useState } from 'react';
import {
    Blinds,
    Scroll,
    GalleryVerticalEnd,
    FoldHorizontal,
    GalleryHorizontalEnd,
    Image,
    AlignJustify,
    Wrench,
    Package
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Category, ProductCollection } from '@/lib/types';

// Map icons roughly by name/slug keywords
const getIconForCategory = (name: string, slug?: string) => {
    const term = (slug || name).toLowerCase();
    if (term.includes('wood') || term.includes('ไม้')) return <AlignJustify size={20} />;
    if (term.includes('roller') || term.includes('ม้วน')) return <Scroll size={20} />;
    if (term.includes('curtain') || term.includes('จีบ') || term.includes('ผ้า')) return <GalleryVerticalEnd size={20} />;
    if (term.includes('pvc') || term.includes('ฉาก')) return <FoldHorizontal size={20} />;
    if (term.includes('vertical') || term.includes('ปรับแสง')) return <GalleryHorizontalEnd size={20} />;
    if (term.includes('wallpaper') || term.includes('วอล')) return <Image size={20} />;
    if (term.includes('alum') || term.includes('อลูมิเนียม')) return <Blinds size={20} />;
    return <Package size={20} />; // Default
};

export default function CategoryList() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [collections, setCollections] = useState<ProductCollection[]>([]);
    const [activeCategoryId, setActiveCategoryId] = useState<number | 'all'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!supabase) return;

            try {
                // 1. Fetch Categories
                const { data: cats, error: catError } = await supabase
                    .from('product_categories')
                    .select('*')
                    .order('id');

                if (catError) throw catError;

                // 2. Fetch Collections
                const { data: cols, error: colError } = await supabase
                    .from('product_collections')
                    .select('*')
                    .order('name');

                if (colError) throw colError;

                // 3. Filter categories that have at least one collection
                const activeCats = (cats || []).filter(cat =>
                    (cols || []).some(col => col.category_id === cat.id)
                );

                setCategories(activeCats);
                setCollections(cols || []);

                // Set first category as active if available and not 'all' logic (though 'all' is distinct)
                // For now keep 'all' as default or maybe the first category?
                // Let's keep 'all' to show everything or just handle selection.

            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    // Filter collections based on active category
    const filteredCollections = activeCategoryId === 'all'
        ? collections
        : collections.filter(c => c.category_id === activeCategoryId);

    if (loading) {
        return <div className="p-4 text-center">Loading categories...</div>;
    }

    if (categories.length === 0) {
        return null; // Or empty state
    }

    return (
        <div style={{ marginBottom: '2rem' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                padding: '0 0.5rem'
            }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>หมวดหมู่</h2>
                <Link href="/products" style={{ color: 'var(--color-secondary)', fontSize: '0.9rem' }}>ดูทั้งหมด</Link>
            </div>

            {/* Categories Horizontal Scroll */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto',
                paddingBottom: '1rem',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }} className="no-scrollbar">

                {/* 'All' Option */}
                {/* <button
                    onClick={() => setActiveCategoryId('all')}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        minWidth: '80px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                   <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '20px',
                        backgroundColor: activeCategoryId === 'all' ? 'var(--color-primary)' : 'white',
                        color: activeCategoryId === 'all' ? 'white' : 'var(--color-primary)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: activeCategoryId === 'all' ? 'var(--shadow-lg)' : 'var(--shadow-soft)',
                        transition: 'all 0.3s ease',
                        border: '1px solid #eee'
                    }}>
                        <AlignJustify size={20} />
                    </div>
                    <span style={{
                        fontSize: '0.85rem',
                        color: activeCategoryId === 'all' ? 'var(--color-primary)' : 'var(--color-secondary)',
                        fontWeight: activeCategoryId === 'all' ? 600 : 400
                    }}>
                        ทั้งหมด
                    </span>
                </button> */}

                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategoryId(cat.id)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            minWidth: '80px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '20px',
                            backgroundColor: activeCategoryId === cat.id ? 'var(--color-primary)' : 'white',
                            color: activeCategoryId === cat.id ? 'white' : 'var(--color-primary)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            boxShadow: activeCategoryId === cat.id ? 'var(--shadow-lg)' : 'var(--shadow-soft)',
                            transition: 'all 0.3s ease',
                            border: '1px solid #eee'
                        }}>
                            {getIconForCategory(cat.name, cat.slug)}
                        </div>
                        <span style={{
                            fontSize: '0.85rem',
                            color: activeCategoryId === cat.id ? 'var(--color-primary)' : 'var(--color-secondary)',
                            fontWeight: activeCategoryId === cat.id ? 600 : 400,
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            maxWidth: '100px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {cat.name}
                        </span>
                    </button>
                ))}
            </div>

            {/* Collections Chips (Sub-categories) */}
            {activeCategoryId !== 'all' && (
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    padding: '0 0.5rem',
                    marginTop: '0.5rem'
                }}>
                    {filteredCollections.map(col => (
                        <Link
                            key={col.id}
                            href={`/products?collection=${col.id}`}
                            style={{
                                padding: '6px 16px',
                                backgroundColor: '#f0f0f0',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                color: '#333',
                                textDecoration: 'none',
                                transition: 'background-color 0.2s'
                            }}
                            className="hover:bg-gray-200"
                        >
                            {col.name}
                        </Link>
                    ))}

                    {filteredCollections.length === 0 && (
                        <span style={{ fontSize: '0.85rem', color: '#888' }}>
                            (ยังไม่มีสินค้าในหมวดนี้)
                        </span>
                    )}
                </div>
            )}

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
