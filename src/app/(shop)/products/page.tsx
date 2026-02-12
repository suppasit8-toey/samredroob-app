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
}

function ProductsContent() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '1rem',
            paddingTop: '2rem'
        }}>
            <SearchBar />

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
                        {products.map(product => (
                            <ProductCard
                                key={product.id}
                                name={product.name}
                                price={product.price}
                                category={product.category}
                                image={product.image_url || 'https://placehold.co/600x400?text=No+Image'}
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
