"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, Image as ImageIcon, X } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '@/lib/constants';

interface PortfolioItem {
    id: number;
    title_th: string;
    title_en?: string;
    description_th?: string;
    description_en?: string;
    image_url?: string;
    category?: string;
    categories?: string[];
    product_collection_id?: number | null;
    product_variant_ids?: number[] | null;
    product_collections?: { name: string };
}

export default function PortfolioPage() {
    const { language } = useLanguage();
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        if (!supabase) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('portfolio_items')
            .select(`
                *,
                product_collections ( name )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching portfolio:', error);
        } else {
            setItems(data || []);
        }
        setLoading(false);
    };

    const categories = ['All', ...PRODUCT_CATEGORIES.map(c => c.id)];

    const filteredItems = filter === 'All'
        ? items
        : items.filter(item => {
            // Check array first, fallback to single string
            if (item.categories && item.categories.length > 0) {
                return item.categories.includes(filter);
            }
            return item.category === filter;
        });

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
                        {cat === 'All'
                            ? (language === 'th' ? 'ทั้งหมด' : 'All')
                            : (language === 'th'
                                ? PRODUCT_CATEGORIES.find(c => c.id === cat)?.name
                                : PRODUCT_CATEGORIES.find(c => c.id === cat)?.name_en) || cat}
                    </button>
                ))}
            </div>

            {/* Content Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-gray-400" size={48} />
                </div>
            ) : filteredItems.length > 0 ? (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {filteredItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group cursor-pointer break-inside-avoid mb-6"
                            onClick={() => setSelectedItem(item)}
                        >
                            <div className="rounded-2xl overflow-hidden bg-gray-100 relative shadow-sm group-hover:shadow-md transition-all duration-300">
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={language === 'th' ? item.title_th : (item.title_en || item.title_th)}
                                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="aspect-[4/3] w-full flex items-center justify-center text-gray-300">
                                        <ImageIcon size={48} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 gap-2">
                                    <div className="flex flex-wrap gap-2 mb-1">
                                        {(item.categories && item.categories.length > 0 ? item.categories : [item.category]).map((catId, idx) => (
                                            catId ? (
                                                <span key={idx} className="text-white font-medium text-xs px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg border border-white/10">
                                                    {PRODUCT_CATEGORIES.find(c => c.id === catId)?.name || catId}
                                                </span>
                                            ) : null
                                        ))}
                                    </div>

                                    {/* Product Info Tag */}
                                    {item.product_collections && (
                                        <div className="text-white/90 text-xs font-medium bg-black/40 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 self-start">
                                            <span className="text-white/60 text-[10px] uppercase tracking-wider block mb-0.5">Product</span>
                                            {item.product_collections.name}
                                            {item.product_variant_ids && item.product_variant_ids.length > 0 && (
                                                <span className="opacity-75 ml-1">(+{item.product_variant_ids.length})</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-400">
                    <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                    <p>{language === 'th' ? 'ไม่มีข้อมูลผลงานในขณะนี้' : 'No portfolio items available.'}</p>
                </div>
            )}

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedItem(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                        />
                        <motion.div
                            layoutId={`item-${selectedItem.id}`}
                            className="bg-transparent max-w-7xl w-full max-h-[95vh] flex flex-col items-center justify-center relative z-10 pointer-events-none"
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedItem(null); }}
                                className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition backdrop-blur-md pointer-events-auto cursor-pointer"
                            >
                                <X size={24} />
                            </button>

                            {/* Image Section */}
                            <div
                                className="relative w-full h-full flex items-center justify-center pointer-events-auto select-none"
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                {selectedItem.image_url ? (
                                    <div className="relative max-w-full max-h-[85vh]">
                                        <img
                                            src={selectedItem.image_url}
                                            alt={selectedItem.title_th}
                                            className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg select-none"
                                            draggable={false}
                                        />
                                        {/* Watermark Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                                            <img
                                                src="https://res.cloudinary.com/dcspjhgdj/image/upload/v1770868240/xq5odkgk3lkto43nzvgh.png"
                                                alt="Watermark"
                                                className="w-1/3 h-auto object-contain"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white p-10 rounded-2xl">
                                        <ImageIcon size={64} className="text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Details Overlay (Bottom) - Removed by request */}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
