"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import CategoryList from '@/components/CategoryList';
import ProductCard from '@/components/ProductCard';
import ServiceList from '@/components/ServiceList';
import ServiceComparisonTable from '@/components/ServiceComparisonTable';

export default function Home() {
    // Sample data for "Explore" section
    const featuredProducts = [
        {
            id: 1,
            name: 'ม่านจีบกัน UV',
            price: '฿2,500',
            category: 'Curtain',
            image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop'
        },
        {
            id: 2,
            name: 'วอลเปเปอร์ลายหินอ่อน',
            price: '฿1,200',
            category: 'Wallpaper',
            image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?q=80&w=600&auto=format&fit=crop'
        },
        {
            id: 3,
            name: 'ม่านม้วน Sunscreen',
            price: '฿1,800',
            category: 'Blinds',
            image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=600&auto=format&fit=crop'
        },
        {
            id: 4,
            name: 'ผ้าม่านโปร่งแสง',
            price: '฿1,500',
            category: 'Sheer',
            image: 'https://images.unsplash.com/photo-1499364660878-4a3079642631?q=80&w=600&auto=format&fit=crop'
        }
    ];

    return (
        <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '1rem',
            paddingTop: '2rem'
        }}>
            {/* Search Section */}
            <SearchBar />

            {/* Hero Card / Banner */}
            <div style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                height: '250px',
                marginBottom: '2rem',
                boxShadow: 'var(--shadow-soft)'
            }}>
                <img
                    src="https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=1200&auto=format&fit=crop"
                    alt="Hero Banner"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '2rem',
                    color: 'white'
                }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                        ลดพิเศษ 30%
                    </h2>
                    <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', opacity: 0.9 }}>
                        สำหรับผ้าม่านรุ่นกัน UV
                    </p>
                    <Link href="/products" style={{
                        backgroundColor: 'white',
                        color: 'black',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '30px',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        width: 'fit-content'
                    }}>
                        ดูรายละเอียด <ArrowRight size={18} />
                    </Link>
                </div>
            </div>

            {/* Categories */}
            <CategoryList />

            {/* Explore / Featured */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    padding: '0 0.5rem'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>สินค้าแนะนำ</h2>
                    <Link href="/products" style={{ color: 'var(--color-secondary)', fontSize: '0.9rem' }}>ดูทั้งหมด</Link>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', // Responsive grid
                    gap: '1.5rem'
                }}>
                    {featuredProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            name={product.name}
                            price={product.price}
                            category={product.category}
                            image={product.image}
                        />
                    ))}
                </div>
                {/* Service Options */}
                <ServiceList />
                <ServiceComparisonTable />
            </div>
        </div>
    );
}
