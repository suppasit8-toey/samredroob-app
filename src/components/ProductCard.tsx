"use client";

import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductCardProps {
    name: string;
    price: string;
    image: string;
    category: string;
    tags?: string[];
}

export default function ProductCard({ name, price, image, category, tags }: ProductCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '12px',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                cursor: 'pointer',
                height: '100%'
            }}
        >
            <div style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                aspectRatio: '1/1', // Square image for grid
                backgroundColor: '#f0f0f0'
            }}>
                <img
                    src={image}
                    alt={name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />

                <button style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer'
                }}>
                    <ArrowRight size={16} color="#000" />
                </button>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    {category}
                </span>
                <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    margin: '4px 0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {name}
                </h3>

                <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{price}</span>
                    <button style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}>
                        <ShoppingBag size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
