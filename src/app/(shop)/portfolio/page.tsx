"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, Image as ImageIcon } from 'lucide-react';

interface PortfolioItem {
    id: number;
    title_th: string;
    title_en?: string;
    description_th?: string;
    description_en?: string;
    image_url?: string;
    category?: string;
}

export default function PortfolioPage() {
    const { language } = useLanguage();
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        if (!supabase) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('portfolio_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching portfolio:', error);
        } else {
            setItems(data || []);
        }
        setLoading(false);
    };

    const categories = ['All', 'Curtains', 'Wallpaper', 'Blinds', 'Other'];

    const filteredItems = filter === 'All'
        ? items
        : items.filter(item => item.category === filter);

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 font-sans">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">
                    {language === 'th' ? 'ผลงานของเรา' : 'Our Portfolio'}
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    {language === 'th'
                        ? 'ตัวอย่างผลงานการติดตั้งผ้าม่าน วอลเปเปอร์ และมู่ลี่ จากลูกค้าที่ไว้วางใจเรา'
                        : 'Examples of curtain, wallpaper, and blinds installations from our trusted customers.'}
                </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-6 py-2 rounded-full transition-all duration-300 font-medium ${filter === cat
                                ? 'bg-black text-white shadow-lg shadow-black/20'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {cat === 'All' ? (language === 'th' ? 'ทั้งหมด' : 'All') : cat}
                    </button>
                ))}
            </div>

            {/* Content Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-gray-400" size={48} />
                </div>
            ) : filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group cursor-pointer"
                        >
                            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 relative mb-4 shadow-sm group-hover:shadow-md transition-all duration-300">
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={language === 'th' ? item.title_th : (item.title_en || item.title_th)}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <ImageIcon size={48} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                    <span className="text-white font-medium text-sm px-3 py-1 bg-black/30 backdrop-blur-md rounded-lg">
                                        {item.category}
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {language === 'th' ? item.title_th : (item.title_en || item.title_th)}
                            </h3>
                            <p className="text-gray-500 mt-2 line-clamp-2 text-sm">
                                {language === 'th' ? item.description_th : (item.description_en || item.description_th || '-')}
                            </p>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-400">
                    <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                    <p>{language === 'th' ? 'ไม่มีข้อมูลผลงานในขณะนี้' : 'No portfolio items available.'}</p>
                </div>
            )}
        </div>
    );
}
