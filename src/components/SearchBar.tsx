"use client";

import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function SearchBar() {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.75rem 1.5rem',
            boxShadow: 'var(--shadow-soft)',
            marginBottom: '2rem',
            gap: '1rem'
        }}>
            <Search size={24} color="var(--color-secondary)" />
            <input
                type="text"
                placeholder="ค้นหาสินค้า..."
                style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '1rem',
                    color: 'var(--color-primary)',
                    background: 'transparent'
                }}
            />
            <div style={{ borderLeft: '1px solid #eee', height: '24px', margin: '0 0.5rem' }}></div>
            <button style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
            }}>
                <SlidersHorizontal size={24} color="var(--color-primary)" />
            </button>
        </div>
    );
}
