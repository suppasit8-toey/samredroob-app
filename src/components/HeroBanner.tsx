"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { useLanguage } from '@/contexts/LanguageContext';

const slides = [
    {
        id: 1,
        title: "ยกระดับความสวยงามให้บ้านคุณ",
        titleEn: "Elevate Your Home Aesthetics",
        subtitle: "ด้วยผ้าม่านและวอลเปเปอร์เกรดพรีเมียม",
        subtitleEn: "With Premium Curtains & Wallpapers",
        image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1600&auto=format&fit=crop",
        link: "/calculator",
        buttonText: "ดูสินค้าทั้งหมด",
        buttonTextEn: "View All Products",
        themeColor: "#f97316"
    },
    {
        id: 2,
        title: "ออกแบบห้องในฝัน",
        titleEn: "Design Your Dream Room",
        subtitle: "บริการวัดหน้างานและติดตั้งโดยทีมมืออาชีพ",
        subtitleEn: "Professional Measurement & Installation",
        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600&auto=format&fit=crop",
        link: "/calculator",
        buttonText: "ประเมินราคาฟรี",
        buttonTextEn: "Free Estimate",
        themeColor: "#000000"
    },
    {
        id: 3,
        title: "วอลเปเปอร์หลากหลายสไตล์",
        titleEn: "Various Wallpaper Styles",
        subtitle: "เปลี่ยนผนังธรรมดาให้ดูมีระดับ",
        subtitleEn: "Turn Ordinary Walls into Masterpieces",
        image: "https://images.unsplash.com/photo-1615873968403-89e068629265?q=80&w=1600&auto=format&fit=crop",
        link: "/calculator",
        buttonText: "เลือกชมลาย",
        buttonTextEn: "Explore Patterns",
        themeColor: "#333333"
    }
];

export default function HeroBanner() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const { language } = useLanguage();

    // Auto-play slide
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const slide = slides[currentSlide];

    return (
        <div className="relative w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl mb-8 group bg-gray-900">
            {/* Background Images - Using CSS transition instead of Framer Motion for reliability */}
            {slides.map((s, index) => (
                <div
                    key={s.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                >
                    <img
                        src={s.image}
                        alt={s.title}
                        className="w-full h-full object-cover"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                </div>
            ))}

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 text-white z-20 max-w-4xl">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={slide.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs md:text-sm font-medium mb-4 text-white border border-white/20">
                            <Sparkles size={14} className="text-yellow-400" />
                            <span>Authentic Premium Quality</span>
                        </div>
                        <h1 className="text-2xl md:text-5xl font-bold font-[family-name:var(--font-mitr)] mb-4 leading-tight drop-shadow-md">
                            {language === 'th' ? slide.title : slide.titleEn}
                        </h1>
                        <p className="text-base md:text-xl text-white/90 mb-6 md:mb-8 font-light drop-shadow-sm max-w-lg">
                            {language === 'th' ? slide.subtitle : slide.subtitleEn}
                        </p>
                        <Link href={slide.link}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white text-black px-6 py-2 md:px-8 md:py-3 rounded-full font-bold text-base md:text-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                            >
                                {language === 'th' ? slide.buttonText : slide.buttonTextEn} <ArrowRight size={20} />
                            </motion.button>
                        </Link>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
                {slides.map((s, index) => (
                    <button
                        key={s.id}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-30 hidden md:block" // Hidden on mobile to avoid clutter
                onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
            >
                <ArrowRight className="transform rotate-180" size={24} />
            </button>
            <button
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-30 hidden md:block" // Hidden on mobile to avoid clutter
                onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
            >
                <ArrowRight size={24} />
            </button>
        </div>
    );
}
