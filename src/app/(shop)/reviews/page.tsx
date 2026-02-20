"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, Star, Quote } from 'lucide-react';

interface ReviewItem {
    id: number;
    customer_name: string;
    rating: number;
    comment_th?: string;
    comment_en?: string;
    image_url?: string;
    images?: string[];
    created_at?: string;
}

export default function ReviewsPage() {
    const { language } = useLanguage();
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [lightboxState, setLightboxState] = useState<{
        isOpen: boolean;
        images: string[];
        currentIndex: number;
    }>({
        isOpen: false,
        images: [],
        currentIndex: 0
    });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        if (!supabase) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reviews:', error);
        } else {
            const mappedData = (data || []).map((item: any) => ({
                ...item,
                images: item.images || (item.image_url ? [item.image_url] : [])
            }));
            setReviews(mappedData);
        }
        setLoading(false);
    };

    const openLightbox = (images: string[], index: number) => {
        setLightboxState({
            isOpen: true,
            images,
            currentIndex: index
        });
    };

    const closeLightbox = () => {
        setLightboxState(prev => ({ ...prev, isOpen: false }));
    };

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLightboxState(prev => ({
            ...prev,
            currentIndex: (prev.currentIndex + 1) % prev.images.length
        }));
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLightboxState(prev => ({
            ...prev,
            currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
        }));
    };


    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeLightbox();
            }
        };

        if (lightboxState.isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [lightboxState.isOpen]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-16 font-sans">
            <div className="text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                        {language === 'th' ? 'เสียงจากลูกค้าของเรา' : 'What Our Customers Say'}
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        {language === 'th'
                            ? 'รวมภาพรีวิวผลงานจริงจากลูกค้าที่สั่งผลิตสินค้าไปติดตั้งเอง สวยงาม ภูมิใจ ทำเองได้ง่ายๆ'
                            : 'Real reviews from customers who ordered custom-made products for DIY installation. Beautiful, proud, and easy to do.'}
                    </p>
                </motion.div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-gray-400" size={48} />
                </div>
            ) : reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.map((review, index) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex flex-col h-full"
                        >
                            {/* Header: User Info & Rating */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                        {review.customer_name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-gray-900 text-sm">{review.customer_name}</h4>
                                            <span className="text-[10px] text-green-700 font-bold bg-green-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-green-200">
                                                {language === 'th' ? 'ติดตั้งเอง ✓' : 'Verified DIY'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-0.5 mt-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={12}
                                                    className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <Quote className="text-gray-100" size={32} fill="currentColor" />
                            </div>

                            {/* Review Content */}
                            <div className="mb-4 flex-grow">
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    "{language === 'th' ? review.comment_th : (review.comment_en || review.comment_th)}"
                                </p>
                            </div>

                            {/* Review Images */}
                            {review.images && review.images.length > 0 && (
                                <div className="mt-auto pt-4 border-t border-gray-50">
                                    <div className={`grid gap-2 ${review.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} ${review.images.length > 2 ? 'grid-rows-2 h-48' : 'h-48'}`}>
                                        {review.images.slice(0, 3).map((img, idx) => {
                                            const isLastVisible = idx === 2 && review.images!.length > 3;
                                            const remainingCount = review.images!.length - 3;

                                            // Layout logic: 
                                            // 1 item: full h-48
                                            // 2 items: 2 cols, full h-48
                                            // 3 items: 1st (full height or col-span-2?), let's keep simple grid for >2

                                            // Simple Grid Logic
                                            let className = "relative rounded-xl overflow-hidden cursor-pointer group bg-gray-100 border border-gray-200 h-full w-full";
                                            if (review.images!.length === 1) className += " h-48";
                                            else if (review.images!.length === 3 && idx === 0) className += " row-span-2"; // First image takes full height in 3-item grid

                                            return (
                                                <div
                                                    key={idx}
                                                    className={className}
                                                    onClick={() => openLightbox(review.images!, idx)}
                                                >
                                                    <img
                                                        src={img}
                                                        alt={`Review ${idx}`}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                    {isLastVisible ? (
                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg backdrop-blur-[2px]">
                                                            +{remainingCount + 1}
                                                        </div>
                                                    ) : (
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors opacity-0 group-hover:opacity-100" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-3xl">
                    <p className="text-gray-500 text-lg">
                        {language === 'th' ? 'ยังไม่มีรีวิวในขณะนี้' : 'No reviews available yet.'}
                    </p>
                </div>
            )}

            {/* Lightbox Modal */}
            {lightboxState.isOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={closeLightbox}
                >
                    <button
                        onClick={closeLightbox}
                        className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-colors z-[110]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center pointer-events-none"
                        onClick={(e) => e.stopPropagation()} // Prevent clicks on the container from bubbling (though the backdrop handles close)
                    >
                        <img
                            src={lightboxState.images[lightboxState.currentIndex]}
                            alt="Full size review"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl pointer-events-auto cursor-default"
                            onClick={(e) => e.stopPropagation()} // Clicking image shouldn't close it
                        />

                        {lightboxState.images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-4 rounded-full backdrop-blur-md transition-colors z-[120] pointer-events-auto"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-4 rounded-full backdrop-blur-md transition-colors z-[120] pointer-events-auto"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-base backdrop-blur-md pointer-events-auto">
                                    {lightboxState.currentIndex + 1} / {lightboxState.images.length}
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
}
