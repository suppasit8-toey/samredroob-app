"use client";

import React from 'react';
import ServiceList from '@/components/ServiceList';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AboutPage() {
    const { language } = useLanguage();

    const t = {
        th: {
            title: 'เกี่ยวกับเรา',
            description: (
                <>
                    เราคือ <strong>SAMREDROOB</strong> มุ่งมั่นที่จะทำให้บ้านของคุณสวยงามน่าอยู่
                    <br className="hidden sm:block" /> ด้วยบริการผ้าม่านและวอลเปเปอร์คุณภาพครบวงจร
                </>
            )
        },
        en: {
            title: 'About Us',
            description: (
                <>
                    We are <strong>SAMREDROOB</strong>, dedicated to making your home beautiful and livable
                    <br className="hidden sm:block" /> with comprehensive curtain and wallpaper services.
                </>
            )
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>{t[language].title}</h1>
                <p style={{ fontSize: '1.2rem', color: '#333', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                    {t[language].description}
                </p>
            </div>

            <ServiceList />
        </div>
    );
}
