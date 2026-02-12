import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    category: 'curtain' | 'wallpaper';
    price: string;
    image: string;
}

const PRODUCTS: Product[] = [
    { id: 1, name: 'Royal Velvet Curtain', category: 'curtain', price: '฿500/yard', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&q=80' },
    { id: 2, name: 'Sheer Elegance', category: 'curtain', price: '฿350/yard', image: 'https://images.unsplash.com/photo-1463695973559-96068288d6dc?w=500&q=80' },
    { id: 3, name: 'Modern Geometric Wallpaper', category: 'wallpaper', price: '฿1,200/roll', image: 'https://images.unsplash.com/photo-1615800098779-1be435081f06?w=500&q=80' },
    { id: 4, name: 'Classic Floral Wallpaper', category: 'wallpaper', price: '฿1,500/roll', image: 'https://images.unsplash.com/photo-1598300056393-8dd6035f2998?w=500&q=80' },
    { id: 5, name: 'Blackout Linen', category: 'curtain', price: '฿600/yard', image: 'https://images.unsplash.com/photo-1505691938895-1758d71680d6?w=500&q=80' },
    { id: 6, name: 'Textured Vinyl', category: 'wallpaper', price: '฿900/roll', image: 'https://images.unsplash.com/photo-1502005229766-31e479a32c25?w=500&q=80' },
];

const Products: React.FC = () => {
    const [filter, setFilter] = useState<'all' | 'curtain' | 'wallpaper'>('all');

    const filteredProducts = PRODUCTS.filter(p => filter === 'all' || p.category === filter);

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
                            <div style={{ height: '200px', overflow: 'hidden' }}>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
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
        </div>
    );
};

export default Products;
