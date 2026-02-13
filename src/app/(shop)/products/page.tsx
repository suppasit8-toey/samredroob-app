"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import CategoryList from '@/components/CategoryList';
import SearchBar from '@/components/SearchBar';

interface Product {
    id: number;
    name: string;
    category: 'curtain' | 'wallpaper';
    price: string;
    image_url: string;
    tags?: string[];
}

function ProductsContent() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null); // Added selectedTag state // Added search state

    const searchParams = useSearchParams();
    const currentCategory = searchParams.get('category') || 'all';

    useEffect(() => {
        const fetchProducts = async () => {
            if (!supabase) return;

            setLoading(true);
            let query = supabase.from('products').select('*');

            if (currentCategory !== 'all') {
                query = query.eq('category', currentCategory);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching products:', error);
            } else {
                setProducts(data || []);
            }
            setLoading(false);
        };

        fetchProducts();
    }, [currentCategory]);

    // Filter logic
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesTag = selectedTag ? product.tags?.includes(selectedTag) : true;
        return matchesSearch && matchesTag;
    });

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '1rem',
            paddingTop: '2rem'
        }}>
            <SearchBar
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาสินค้า..."
            />

            {/* Tag Chips */}
            {(() => {
                const allTags = Array.from(new Set(products.flatMap(p => p.tags || []))).sort();

                if (allTags.length > 0) {
                    return (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '2rem', paddingLeft: '0.5rem' }}>
                            <button
                                onClick={() => setSelectedTag(null)}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '20px',
                                    border: '1px solid',
                                    borderColor: selectedTag === null ? 'black' : '#e5e5e5',
                                    backgroundColor: selectedTag === null ? 'black' : 'white',
                                    color: selectedTag === null ? 'white' : '#666',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}
                            >
                                ทั้งหมด
                            </button>
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        border: '1px solid',
                                        borderColor: selectedTag === tag ? 'black' : '#e5e5e5',
                                        backgroundColor: selectedTag === tag ? 'black' : 'white',
                                        color: selectedTag === tag ? 'white' : '#666',
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    );
                }
                return null;
            })()}

            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                    สินค้าทั้งหมด
                </h1>

                {/* Horizontal Category List (Reusing component for consistency) */}
                <CategoryList />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-secondary)' }}>
                    กำลังโหลดสินค้า...
                </div>
            ) : (
                <motion.div
                    layout
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                        gap: '1.5rem'
                    }}
                >
                    <AnimatePresence>
                        {filteredProducts.map(product => ( // Use filteredProducts
                            <ProductCard
                                key={product.id}
                                name={product.name}
                                price={product.price}
                                category={product.category}
                                image={product.image_url || 'https://placehold.co/600x400?text=No+Image'}
                                tags={product.tags}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <ProductsContent />
        </Suspense>
    );
}
