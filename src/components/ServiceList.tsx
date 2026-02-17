"use client";

import React from 'react';
import { Package, MapPin, Wrench, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

import { useLanguage } from '@/contexts/LanguageContext';

export default function ServiceList() {
    const { language } = useLanguage();

    const services = [
        {
            title: "1. สั่งซื้อออนไลน์",
            titleEn: "1. Online Order",
            subtitle: "(ประหยัดที่สุด)",
            subtitleEn: "(Most Economical)",
            icon: <Package size={32} className="text-gray-700" />,
            description: "เลือกสินค้าออนไลน์ วัดพื้นที่ สั่งผลิต และติดตั้งเอง",
            descriptionEn: "Choose online, measure yourself, order, and install yourself",
            details: [
                "เลือกสินค้าออนไลน์",
                "วัดพื้นที่เอง",
                "สั่งผลิตส่งถึงบ้าน",
                "ติดตั้งเอง"
            ],
            detailsEn: [
                "Choose online",
                "Measure yourself",
                "Delivered to home",
                "Install yourself"
            ],
            price: "ราคาสินค้า + ค่าจัดส่ง",
            priceEn: "Product Price + Delivery",
            highlight: false
        },
        {
            title: "2. บริการวัดหน้างาน",
            titleEn: "2. Measurement Service",
            subtitle: "(ติดตั้งเอง)",
            subtitleEn: "(Self-Installation)",
            icon: <MapPin size={32} className="text-gray-700" />,
            description: "วัดพื้นที่และเลือกแบบถึงบ้าน (ลูกค้าติดตั้งเอง)",
            descriptionEn: "On-site measurement & selection (Customer installs)",
            details: [
                "เลือกแบบเบื้องต้น",
                "นัดวัดพื้นที่หน้างาน",
                "เลือกแบบจริงหน้างาน",
                "สั่งผลิตส่งถึงบ้าน",
                "ติดตั้งเอง"
            ],
            detailsEn: [
                "Initial selection",
                "On-site measurement",
                "Final selection on-site",
                "Delivered to home",
                "Install yourself"
            ],
            price: "ค่าวัดหน้างาน + ราคาสินค้า + ค่าจัดส่ง",
            priceEn: "Measurement Fee + Product + Delivery",
            highlight: false
        },
        {
            title: "3. บริการครบวงจร",
            titleEn: "3. Full Service",
            subtitle: "(แนะนำ)",
            subtitleEn: "(Recommended)",
            icon: <Wrench size={32} className="text-yellow-600" />,
            description: "ดูแลครบวงจร ตั้งแต่เลือกแบบ ผลิต จนถึงติดตั้ง",
            descriptionEn: "Full service from selection, production to installation",
            details: [
                "เลือกแบบเบื้องต้น",
                "นัดวัดพื้นที่หน้างาน",
                "เลือกแบบจริงหน้างาน",
                "ติดตั้งโดยทีมช่าง",
                "รับประกันงานติดตั้ง 1 ปี"
            ],
            detailsEn: [
                "Initial selection",
                "On-site measurement",
                "Final selection on-site",
                "Professional installation",
                "1 Year Warranty"
            ],
            price: "ค่าวัดหน้างาน + ราคาสินค้า + ค่าติดตั้ง",
            priceEn: "Measurement Fee + Product + Installation",
            highlight: false
        },
        {
            title: "4. บริการครบวงจร (Premium)",
            titleEn: "4. Full Service (Premium)",
            subtitle: "(รับประกัน 2 ปี)",
            subtitleEn: "(2 Year Warranty)",
            icon: <ShieldCheck size={32} className="text-emerald-600" />,
            description: "บริการพรีเมียม คุมงาน A-Z พร้อมออกแบบ & ประกัน 2 ปี",
            descriptionEn: "Premium service A-Z with design & 2 year warranty",
            details: [
                "ปรึกษา & ออกแบบ",
                "นัดวัดพื้นที่หน้างาน",
                "เลือกแบบจริงหน้างาน",
                "คุมงานโดยผู้เชี่ยวชาญ",
                "รับประกันงานติดตั้ง 2 ปี"
            ],
            detailsEn: [
                "Consultation & Design",
                "On-site measurement",
                "Final selection on-site",
                "Expert supervision",
                "2 Year Warranty"
            ],
            price: "ราคาเหมางาน",
            priceEn: "Package Price",
            highlight: true
        }
    ];

    return (
        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '2rem 0' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>
                {language === 'th' ? 'รูปแบบการให้บริการของเรา' : 'Our Service Options'}
            </h2>

            <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                style={{}}
            >
                {services.map((service, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                            backgroundColor: service.highlight ? 'white' : 'white',
                            border: service.highlight ? '2px solid var(--color-accent)' : '1px solid #eee',
                            borderRadius: 'var(--radius-lg)',
                            padding: '1.5rem',
                            boxShadow: service.highlight ? 'var(--shadow-lg)' : 'var(--shadow-card)',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {service.highlight && (
                            <span style={{
                                position: 'absolute',
                                top: '-10px',
                                right: '10px',
                                backgroundColor: 'var(--color-accent)',
                                color: 'white',
                                padding: '2px 10px',
                                borderRadius: '15px',
                                fontSize: '0.75rem',
                                fontWeight: 700
                            }}>
                                {language === 'th' ? 'แนะนำ' : 'Recommended'}
                            </span>
                        )}

                        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                            {service.icon}
                        </div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>
                            {language === 'th' ? service.title : service.titleEn} <br />
                            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#555' }}>
                                {language === 'th' ? service.subtitle : service.subtitleEn}
                            </span>
                        </h3>

                        <p style={{ color: '#444', marginBottom: '1rem', textAlign: 'center', minHeight: '3rem', fontWeight: 400, fontSize: '0.9rem', lineHeight: '1.4' }}>
                            {language === 'th' ? service.description : service.descriptionEn}
                        </p>

                        <div style={{
                            backgroundColor: '#f8f9fa',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.75rem',
                            marginBottom: '1rem',
                            flex: 1
                        }}>
                            <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                {(language === 'th' ? service.details : service.detailsEn).map((detail, idx) => (
                                    <li key={idx} style={{ marginBottom: '0.25rem', fontSize: '0.85rem', color: '#333', fontWeight: 500 }}>
                                        {detail}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div style={{
                            textAlign: 'center',
                            paddingTop: '0.75rem',
                            borderTop: '1px solid #eee',
                            fontWeight: 600,
                            color: service.highlight ? 'var(--color-accent)' : 'var(--color-primary)',
                            whiteSpace: 'normal',
                            fontSize: '0.85rem'
                        }}>
                            {language === 'th' ? service.price : service.priceEn}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
