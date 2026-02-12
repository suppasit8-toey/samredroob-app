"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
    const pathname = usePathname();

    const navLinks = [
        { name: 'สินค้า', path: '/products' },
        { name: 'คำนวณราคา', path: '/calculator' },
        { name: 'เกี่ยวกับเรา', path: '/about' },
        { name: 'ติดต่อเรา', path: '/contact' },
    ];

    return (
        <header style={{
            backgroundColor: '#ffffff',
            boxShadow: 'var(--shadow-sm)',
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
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
                    <span style={{
                        fontSize: '1.8rem',
                        fontFamily: 'var(--font-mitr)',
                        fontWeight: 600,
                        lineHeight: 1,
                        color: '#333',
                        borderLeft: '2px solid #e5e7eb',
                        paddingLeft: '1rem',
                        marginLeft: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        height: '40px',
                        letterSpacing: '0.02em'
                    }}>สำเร็จรูป</span>
                </Link>

                {/* Desktop Nav */}
                <div className="desktop-nav">
                    <div style={{ display: 'flex', gap: '2rem' }}>
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
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <style>{`
                    @media (max-width: 767px) {
                        .desktop-nav { display: none !important; }
                    }
                `}</style>
            </nav>
        </header>
    );
};

export default Header;
