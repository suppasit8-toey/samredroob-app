"use client";

import React from 'react';

import { ArrowRight, ShoppingBag, Truck, ShieldCheck, Star } from 'lucide-react';


import ServiceList from '@/components/ServiceList';
import ServiceComparisonTable from '@/components/ServiceComparisonTable';
import HeroBanner from '@/components/HeroBanner';

export default function Home() {
    // Sample data for "Explore" section


    return (
        <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '1rem',
            paddingTop: '2rem'
        }}>


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


            {/* Explore / Featured */}
            <div style={{ marginBottom: '2rem' }}>

                {/* Service Options */}
                <ServiceList />
                <ServiceComparisonTable />
            </div>
        </div>
    );
}
