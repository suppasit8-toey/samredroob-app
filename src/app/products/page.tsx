"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Product {
    id: number;
    name: string;
    category: 'curtain' | 'wallpaper';
    price: string;
    image_url: string;
}

export default function ProductsPage() {
    const [filter, setFilter] = useState<'all' | 'curtain' | 'wallpaper'>('all');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!supabase) return;

            const { data, error } = await supabase
                .from('products')
                .select('*');

            if (error) {
                console.error('Error fetching products:', error);
            } else {
                setProducts(data || []);
            }
            setLoading(false);
        };

        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p => filter === 'all' || p.category === filter);

    return (
        <div style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem' }}>Our Collection</h1>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Filter size={20} style={{ color: '#666' }} />
                    <button
                        onClick={() => setFilter('all')}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            backgroundColor: filter === 'all' ? 'var(--color-primary)' : '#eee',
                            color: filter === 'all' ? 'white' : 'black',
                            transition: 'all 0.3s'
                        }}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('curtain')}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            backgroundColor: filter === 'curtain' ? 'var(--color-primary)' : '#eee',
                            color: filter === 'curtain' ? 'white' : 'black',
                            transition: 'all 0.3s'
                        }}
                    >
                        Curtains
                    </button>
                    <button
                        onClick={() => setFilter('wallpaper')}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            backgroundColor: filter === 'wallpaper' ? 'var(--color-primary)' : '#eee',
                            color: filter === 'wallpaper' ? 'white' : 'black',
                            transition: 'all 0.3s'
                        }}
                    >
                        Wallpapers
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading products...</div>
            ) : (
                <motion.div
                    layout
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '2rem'
                    }}
                >
                    <AnimatePresence>
                        {filteredProducts.map(product => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: 'var(--border-radius)',
                                    overflow: 'hidden',
                                    boxShadow: 'var(--shadow-sm)',
                                    cursor: 'pointer'
                                }}
                                whileHover={{ y: -5, boxShadow: 'var(--shadow-lg)' }}
                            >
                                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                                    {/* Using standard img for external URLs initially to avoid domain config issues, or configure next.config.ts */}
                                    <img
                                        src={product.image_url || 'https://placehold.co/600x400?text=No+Image'}
                                        alt={product.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                                    />
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        textTransform: 'uppercase',
                                        color: 'var(--color-accent)',
                                        fontWeight: 700
                                    }}>
                                        {product.category}
                                    </span>
                                    <h3 style={{ fontSize: '1.25rem', margin: '0.5rem 0' }}>{product.name}</h3>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                        <span style={{ fontWeight: 600 }}>{product.price}</span>
                                        <button style={{
                                            padding: '0.5rem 1rem',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '0.9rem'
                                        }}>
                                            Details
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}
