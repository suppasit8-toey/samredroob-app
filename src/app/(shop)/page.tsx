"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Truck, ShieldCheck, Star } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import CategoryList from '@/components/CategoryList';
import ProductCard from '@/components/ProductCard';
import ServiceList from '@/components/ServiceList';
import ServiceComparisonTable from '@/components/ServiceComparisonTable';
import HeroBanner from '@/components/HeroBanner';

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

            {/* Hero Banner Component */}
            <HeroBanner />

            {/* Shopee Banner */}
            <a href="https://shopee.co.th/shop/1058873301" target="_blank" className="block mb-12 group no-underline relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-[#EE4D2D] via-[#FF5722] to-[#FF7337]"></div>
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="relative flex flex-col md:flex-row items-center justify-between p-8 md:p-10 text-white">
                    <div className="flex items-center gap-6 mb-6 md:mb-0">
                        <div className="bg-white/20 p-5 rounded-full backdrop-blur-sm shadow-inner">
                            <ShoppingBag size={42} className="text-white drop-shadow-md" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-mitr)]">Official Store on Shopee</h2>
                                <span className="bg-yellow-400 text-[#EE4D2D] text-xs font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wide transform rotate-3">Mall</span>
                            </div>
                            <p className="text-white/90 text-lg font-light">ช้อปสินค้าสำเร็จรูปพร้อมโค้ดส่วนลดพิเศษมากมาย</p>
                            <div className="flex flex-wrap gap-2 mt-4 text-sm font-medium">
                                <span className="bg-black/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 flex items-center gap-1"><Truck size={14} /> ส่งฟรี*</span>
                                <span className="bg-black/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 flex items-center gap-1"><ShieldCheck size={14} /> ของแท้ 100%</span>
                                <span className="bg-black/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 flex items-center gap-1"><Star size={14} /> รีวิว 4.9/5</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white text-[#EE4D2D] px-8 py-3 rounded-full font-bold text-lg flex items-center gap-2 group-hover:scale-105 transition-transform shadow-lg whitespace-nowrap">
                        ไปที่ร้านค้า <ArrowRight size={20} />
                    </div>
                </div>
            </a>
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
