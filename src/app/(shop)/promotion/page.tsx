"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, Tag, CalendarClock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PromotionItem {
    id: number;
    title_th: string;
    title_en?: string;
    description_th?: string;
    description_en?: string;
    image_url?: string;
    start_date?: string;
    end_date?: string;
}

export default function PromotionPage() {
    const { language } = useLanguage();
    const [promotions, setPromotions] = useState<PromotionItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        if (!supabase) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('promotions')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching promotions:', error);
        } else {
            // Filter by date if needed (though generally backend filter is better, for now client side is fine for small scale)
            const now = new Date();
            const validPromotions = (data || []).filter(p => {
                if (p.end_date && new Date(p.end_date) < now) return false;
                if (p.start_date && new Date(p.start_date) > now) return false;
                return true;
            });
            setPromotions(validPromotions);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-16 font-sans">
            <div className="text-center mb-16">
                <span className="inline-block px-4 py-1.5 rounded-full bg-red-50 text-red-600 font-bold text-sm tracking-wider uppercase mb-4 border border-red-100">
                    {language === 'th' ? 'สิทธิพิเศษ' : 'Special Offers'}
                </span>
                <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-gray-900">
                    {language === 'th' ? 'โปรโมชั่นล่าสุด' : 'Latest Promotions'}
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                    {language === 'th'
                        ? 'พบกับข้อเสนอสุดพิเศษ ส่วนลด และแพ็คเกจราคาประหยัดสำหรับคุณ'
                        : 'Discover special offers, discounts, and value packages just for you.'}
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-gray-400" size={48} />
                </div>
            ) : promotions.length > 0 ? (
                <div className="space-y-12">
                    {promotions.map((promo, index) => (
                        <motion.div
                            key={promo.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                        >
                            <div className="flex flex-col md:flex-row">
                                <div className="md:w-1/2 lg:w-3/5 h-[300px] md:h-[400px] bg-gray-100 relative overflow-hidden">
                                    {promo.image_url ? (
                                        <img
                                            src={promo.image_url}
                                            alt={language === 'th' ? promo.title_th : (promo.title_en || promo.title_th)}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <Tag size={64} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur text-black px-4 py-2 rounded-xl font-bold text-sm shadow-lg">
                                            LIMITED OFFER
                                        </span>
                                    </div>
                                </div>
                                <div className="md:w-1/2 lg:w-2/5 p-8 md:p-12 flex flex-col justify-center">
                                    {promo.end_date && (
                                        <div className="flex items-center gap-2 text-orange-600 font-medium mb-4 bg-orange-50 w-fit px-3 py-1 rounded-lg">
                                            <CalendarClock size={16} />
                                            <span className="text-sm">
                                                {language === 'th' ? 'หมดเขต: ' : 'Ends: '}
                                                {new Date(promo.end_date).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                    )}
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                                        {language === 'th' ? promo.title_th : (promo.title_en || promo.title_th)}
                                    </h2>
                                    <p className="text-gray-600 mb-8 leading-relaxed">
                                        {language === 'th' ? promo.description_th : (promo.description_en || promo.description_th)}
                                    </p>

                                    <Link
                                        href="/contact"
                                        className="inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 w-fit"
                                    >
                                        {language === 'th' ? 'สอบถามเพิ่มเติม' : 'Inquire Now'}
                                        <ArrowRight size={20} />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
                    <Tag size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {language === 'th' ? 'ยังไม่มีโปรโมชั่นในขณะนี้' : 'No promotions available.'}
                    </h3>
                    <p className="text-gray-500">
                        {language === 'th' ? 'ติดตามข่าวสารจากเราได้ใหม่เร็วๆ นี้' : 'Stay tuned for upcoming offers.'}
                    </p>
                </div>
            )}
        </div>
    );
}
