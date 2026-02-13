"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calculator, Grid, Phone } from 'lucide-react';

const BottomNav: React.FC = () => {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { name: 'หน้าแรก', path: '/', icon: <Home size={26} color={isActive('/') ? '#FFD700' : '#FFFFFF'} strokeWidth={isActive('/') ? 2.8 : 2} /> },
        { name: 'สินค้า', path: '/products', icon: <Grid size={26} color={isActive('/products') ? '#FFD700' : '#FFFFFF'} strokeWidth={isActive('/products') ? 2.8 : 2} /> },
        { name: 'คำนวณ', path: '/calculator', icon: <Calculator size={26} color={isActive('/calculator') ? '#FFD700' : '#FFFFFF'} strokeWidth={isActive('/calculator') ? 2.8 : 2} /> },
        { name: 'ติดต่อ', path: '/contact', icon: <Phone size={26} color={isActive('/contact') ? '#FFD700' : '#FFFFFF'} strokeWidth={isActive('/contact') ? 2.8 : 2} /> },
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

                            </div>
                            <span className="label" style={{
                                color: active ? '#FFD700' : '#FFFFFF',
                                opacity: 1,
                                fontWeight: active ? 700 : 500
                            }}>
                                {item.name}
                            </span>
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
                    background: #111111; /* Solid Black */
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    padding: 0.85rem 1rem;
                    padding-bottom: max(0.85rem, env(safe-area-inset-bottom));
                    box-shadow: 0 -4px 20px rgba(0,0,0,0.6);
                    z-index: 1000;
                    border-top: 1px solid rgba(255,255,255,0.15);
                    border-radius: 20px 20px 0 0;
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
                    color: #FFFFFF !important; /* Force White TEXT */
                    text-decoration: none;
                    font-size: 0.8rem; 
                    font-weight: 500;
                    transition: all 0.2s ease;
                    flex: 1;
                    position: relative;
                    padding: 6px 0;
                    opacity: 1 !important; 
                }

                /* Force Label Color */
                /* Removed due to inline style */

                .nav-item.active {
                    color: #FFD700 !important; /* Bright Yellow/Gold TEXT */
                    transform: translateY(-2px);
                }

                /* Force Active Label Color */
                /* Removed due to inline style */

                .icon-wrapper {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 4px;
                }

                .icon-container {
                    transition: transform 0.2s ease;
                    display: flex; /* Ensure SVG container is flex */
                    align-items: center;
                    justify-content: center;
                }

                .nav-item.active .icon-container {
                    transform: scale(1.1);
                    filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.5)); /* Glow Effect */
                }
                


                .label {
                    font-family: var(--font-mitr);
                    font-weight: 600; 
                    letter-spacing: 0.2px;
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
