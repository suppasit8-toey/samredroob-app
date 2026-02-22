"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { QualityIcon, SpeedIcon, DesignIcon } from './CustomSVGs';

export default function FeatureSection() {
    const { language } = useLanguage();

    const features = [
        {
            id: 1,
            icon: <QualityIcon size={72} />,
            title: language === 'th' ? "คุณภาพพรีเมียม" : "Premium Quality",
            description: language === 'th'
                ? "เราคัดสรรวัสดุชั้นดี เพื่อให้บ้านของคุณดูหรูหราและทนทานใช้งานได้ยาวนาน"
                : "We handpick the best materials to ensuring your home looks luxurious and stands the test of time."
        },
        {
            id: 2,
            icon: <DesignIcon size={72} />,
            title: language === 'th' ? "ดีไซน์ทันสมัย" : "Modern Design",
            description: language === 'th'
                ? "มีแบบให้เลือกมากมาย พร้อมอัพเดทเทรนด์เพื่อให้เข้ากับทุกสไตล์การตกแต่ง"
                : "A wide variety of trendy styles to perfectly match your interior decor."
        },
        {
            id: 3,
            icon: <SpeedIcon size={72} />,
            title: language === 'th' ? "บริการรวดเร็ว" : "Speedy Service",
            description: language === 'th'
                ? "ทีมช่างมืออาชีพพร้อมเข้าประเมินพื้นที่และติดตั้งงานด้วยความรวดเร็วและแม่นยำ"
                : "Our professional team is ready to evaluate and install with speed and precision."
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5 }
        }
    };

    return (
        <section className="relative py-20 px-4 overflow-hidden rounded-3xl mb-16 bg-white shadow-sm border border-gray-100">
            {/* Soft decorative background element */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 blur-3xl opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-gradient-to-tr from-amber-50 to-orange-50 blur-3xl opacity-50 pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 font-[family-name:var(--font-mitr)] mb-4"
                    >
                        {language === 'th' ? 'ทำไมต้องเลือกเรา?' : 'Why Choose Us?'}
                    </motion.h2>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="w-24 h-1.5 bg-gradient-to-r from-orange-400 to-red-500 mx-auto rounded-full mb-6"
                    />
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto font-light"
                    >
                        {language === 'th' ? 'เรามุ่งมั่นตั้งใจมอบสิ่งที่ดีที่สุดสำหรับบ้านคุณ ด้วยความเชี่ยวชาญกว่า 10 ปี' : 'We are dedicated to providing the best for your home, backed by over 10 years of experience.'}
                    </motion.p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
                >
                    {features.map((feature) => (
                        <motion.div
                            key={feature.id}
                            variants={itemVariants}
                            className="bg-white/60 backdrop-blur-xl rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-300 group flex flex-col items-center text-center"
                        >
                            <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-xl h-24 flex items-center justify-center">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 font-[family-name:var(--font-mitr)]">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed font-light">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
