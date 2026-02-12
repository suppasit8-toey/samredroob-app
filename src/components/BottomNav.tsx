"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calculator, Grid, Phone } from 'lucide-react';

const BottomNav: React.FC = () => {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { name: 'หน้าแรก', path: '/', icon: <Home size={24} strokeWidth={isActive('/') ? 2.75 : 2.25} /> },
        { name: 'สินค้า', path: '/products', icon: <Grid size={24} strokeWidth={isActive('/products') ? 2.75 : 2.25} /> },
        { name: 'คำนวณ', path: '/calculator', icon: <Calculator size={24} strokeWidth={isActive('/calculator') ? 2.75 : 2.25} /> },
        { name: 'ติดต่อ', path: '/contact', icon: <Phone size={24} strokeWidth={isActive('/contact') ? 2.75 : 2.25} /> },
    ];

    return (
        <>
            <div className="bottom-nav-spacer"></div>
            <nav className="bottom-nav">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.name}
                            href={item.path}
                            className={`nav-item ${active ? 'active' : ''}`}
                        >
                            <div className="icon-wrapper">
                                <div className="icon-container">
                                    {item.icon}
                                </div>
                                {active && <span className="active-dot" />}
                            </div>
                            <span className="label">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
            <style jsx>{`
                .bottom-nav {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
                    box-shadow: 0 -4px 20px rgba(0,0,0,0.08); /* Softer, spread out shadow */
                    z-index: 1000;
                    border-top: 1px solid rgba(255,255,255,0.3);
                    border-radius: 20px 20px 0 0; /* Subtle rounded corners at top */
                }
                
                .bottom-nav-spacer {
                    height: 90px; 
                    display: none;
                }

                .nav-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #A3A3A3; /* Lighter grey for inactive */
                    text-decoration: none;
                    font-size: 0.75rem; /* Slightly larger */
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    flex: 1;
                    position: relative;
                    padding: 4px 0;
                }

                .nav-item.active {
                    color: #000; /* Sharp black for active */
                    transform: translateY(-2px);
                }

                .icon-wrapper {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .icon-container {
                    margin-bottom: 4px; /* Reduced margin */
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .nav-item.active .icon-container {
                    transform: scale(1.1);
                }
                
                .active-dot {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background-color: #000;
                    border-radius: 50%;
                    bottom: -8px; 
                    animation: fadeIn 0.3s ease-out forwards;
                }

                .label {
                    font-family: var(--font-mitr);
                    font-weight: 600; /* Bolder font */
                    letter-spacing: 0; /* Removing extra spacing for cleaner Thai text */
                    margin-top: 2px;
                }
                
                .nav-item:active .icon-container {
                    transform: scale(0.95);
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0); }
                    to { opacity: 1; transform: scale(1); }
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
