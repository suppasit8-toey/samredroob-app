"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone } from 'lucide-react';

import { useLanguage } from '@/contexts/LanguageContext';

const Header: React.FC = () => {
    const pathname = usePathname();
    const { language, toggleLanguage } = useLanguage();

    const navLinks = [
        { name: 'สินค้า', nameEn: 'Products', path: '/products' },
        { name: 'คำนวณราคา', nameEn: 'Calculator', path: '/calculator' },
        { name: 'เกี่ยวกับเรา', nameEn: 'About Us', path: '/about' },
        { name: 'ติดต่อเรา', nameEn: 'Contact', path: '/contact' },
    ];

    return (
        <header style={{
            backgroundColor: '#ffffff',
            boxShadow: 'var(--shadow-sm)',
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
            {/* Top Bar for Contact Info */}
            <div style={{ backgroundColor: '#111', color: 'white', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem' }}>
                    <a href="tel:0947461744" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'white', textDecoration: 'none' }}>
                        <Phone size={14} /> 094-746-1744
                    </a>
                    <a href="https://line.me/ti/p/~@samredroob" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'white', textDecoration: 'none' }}>
                        <span style={{ backgroundColor: '#06c755', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem', lineHeight: '1.2' }}>LINE</span> @samredroob
                    </a>
                </div>
            </div>
            <nav style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'black' }}>
                    <img
                        src="https://res.cloudinary.com/dcspjhgdj/image/upload/v1770868240/kksnv5p98nugmlwsjkyj.png"
                        alt="SAMREDROOB"
                        style={{ height: '40px', width: 'auto' }}
                    />
                    <span className="logo-text">สำเร็จรูป-Samredroob</span>
                </Link>

                {/* Desktop Nav */}
                <div className="desktop-nav">
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        {navLinks.map(link => (
                            <Link
                                key={link.name}
                                href={link.path}
                                style={{
                                    fontFamily: 'var(--font-mitr)',
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    transition: 'color 0.2s',
                                    color: pathname === link.path ? 'var(--color-accent)' : 'inherit'
                                }}
                            >
                                {language === 'th' ? link.name : link.nameEn}
                            </Link>
                        ))}

                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-1 px-3 py-1 rounded-full border border-gray-200 hover:border-gray-400 transition-colors text-sm font-medium"
                            aria-label="Toggle Language"
                        >
                            <span className={language === 'th' ? 'text-black font-bold' : 'text-gray-400'}>TH</span>
                            <span className="text-gray-300">|</span>
                            <span className={language === 'en' ? 'text-black font-bold' : 'text-gray-400'}>EN</span>
                        </button>
                    </div>
                </div>

                <style>{`
                    .logo-text {
                        font-size: 1.8rem;
                        font-family: var(--font-mitr);
                        font-weight: 600;
                        line-height: 1;
                        color: #333;
                        border-left: 2px solid #e5e7eb;
                        padding-left: 1rem;
                        margin-left: 0.5rem;
                        display: flex;
                        align-items: center;
                        height: 40px;
                        letter-spacing: 0.05em; /* More luxury spacing */
                    }
                    @media (max-width: 768px) {
                        .logo-text {
                            font-size: 1.1rem !important; /* Smaller on mobile */
                            font-weight: 500; /* Slightly lighter for elegance */
                            padding-left: 0.75rem;
                            margin-left: 0.25rem;
                            letter-spacing: 0.03em;
                        }
                        .desktop-nav { display: none !important; }
                    }
                `}</style>
            </nav>
        </header>
    );
};

export default Header;
