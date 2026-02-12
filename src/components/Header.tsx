"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
    const pathname = usePathname();

    const navLinks = [
        { name: 'Products', path: '/products' },
        { name: 'Calculator', path: '/calculator' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
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
                <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--color-accent)' }}>SAMREDROOB</span>
                </Link>

                {/* Desktop Nav */}
                <div className="desktop-nav">
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        {navLinks.map(link => (
                            <Link
                                key={link.name}
                                href={link.path}
                                style={{
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
