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
    created_at?: string;
}

export default function ReviewsPage() {
    const { language } = useLanguage();
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [loading, setLoading] = useState(true);

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
            setReviews(data || []);
        }
        setLoading(false);
    };

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
                            ? 'ความประทับใจจากลูกค้าที่ใช้บริการติดตั้งผ้าม่านและวอลเปเปอร์กับเรา'
                            : 'Impressions from customers who have used our curtain and wallpaper installation services.'}
                    </p>
                </motion.div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-gray-400" size={48} />
                </div>
            ) : reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map((review, index) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <Quote className="absolute top-8 right-8 text-gray-100" size={48} fill="currentColor" />

                            <div className="flex items-center gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={20}
                                        className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-100 text-gray-100"}
                                    />
                                ))}
                            </div>

                            <p className="text-gray-700 mb-8 leading-relaxed relative z-10 min-h-[80px]">
                                "{language === 'th' ? review.comment_th : (review.comment_en || review.comment_th)}"
                            </p>

                            <div className="flex items-center gap-4 mt-auto pt-6 border-t border-gray-50">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
                                    {review.image_url ? (
                                        <img src={review.image_url} alt={review.customer_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-xl">
                                            {review.customer_name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{review.customer_name}</h4>
                                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                                        Verified Customer
                                    </span>
                                </div>
                            </div>
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
        </div>
    );
}
