"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calculator, Grid, Phone } from 'lucide-react';

const BottomNav: React.FC = () => {
    const pathname = usePathname();

    // Helper to determine if a link is active
    const isActive = (path: string) => pathname === path;

    const navItems = [
        { name: 'Home', path: '/', icon: <Home size={24} /> },
        { name: 'Products', path: '/products', icon: <Grid size={24} /> },
        { name: 'Calculator', path: '/calculator', icon: <Calculator size={24} /> },
        { name: 'Contact', path: '/contact', icon: <Phone size={24} /> },
    ];

    return (
        <>
            <div className="bottom-nav-spacer"></div>
            <nav className="bottom-nav">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.path}
                        className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                    >
                        <div className="icon-container">
                            {item.icon}
                        </div>
                        <span className="label">{item.name}</span>
                    </Link>
                ))}
            </nav>
            <style jsx>{`
                .bottom-nav {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background-color: white;
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    padding: 0.75rem 0.5rem;
                    box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
                    z-index: 1000;
                    border-top: 1px solid #f0f0f0;
                }
                
                .bottom-nav-spacer {
                    height: 80px; 
                    display: none;
                }

                .nav-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #999;
                    text-decoration: none;
                    font-size: 0.75rem;
                    transition: all 0.3s ease;
                    flex: 1;
                }

                .nav-item.active {
                    color: var(--color-accent);
                }

                .icon-container {
                    margin-bottom: 4px;
                    transition: transform 0.2s;
                }

                .nav-item:active .icon-container {
                    transform: scale(0.9);
                }

                /* Hide by default on desktop, show on mobile */
                @media (min-width: 769px) {
                    .bottom-nav, .bottom-nav-spacer {
                        display: none !important;
                    }
                }
                @media (max-width: 768px) {
                    .bottom-nav, .bottom-nav-spacer {
                        display: flex;
                    }
                    .bottom-nav-spacer {
                        display: block;
                    }
                }
            `}</style>
        </>
    );
};

export default BottomNav;
