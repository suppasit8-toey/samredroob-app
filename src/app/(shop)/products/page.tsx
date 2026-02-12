"use client";

import React, { useState, useEffect } from 'react';
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

export default function ProductsPage() {
    // Note: We might want to lift state up or use a context for filtering via CategoryList in the future
    // For now, we'll keep the filter logic local or simplified.
    // Actually, CategoryList in the design is navigation/filter. 
    // Let's reuse CategoryList just for visual consistency, but the page needs its own filter state 
    // or we pass props. For this iteration, let's keep it simple.

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const searchParams = useSearchParams();
    const currentCategory = searchParams.get('category') || 'all';

    useEffect(() => {
        const fetchProducts = async () => {
            if (!supabase) return;

            setLoading(true);
            let query = supabase.from('products').select('*');

            // Map frontend category IDs to database category names if they differ
            // Or assume database uses the same IDs/slugs. 
            // For now, let's assume loose matching or exact matching.
            if (currentCategory !== 'all') {
                // Adjust this matching logic based on your actual DB values
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
