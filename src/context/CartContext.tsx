"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductCollection, ProductVariant } from '@/lib/types';

export interface CartItem {
    id: string; // unique timestamp
    collection: ProductCollection;
    width: number;
    height: number;
    totalPrice: number;
    breakdown: string;
    quantity: number;
    selectedVariant?: ProductVariant;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, 'id' | 'quantity'>, initialQuantity?: number) => void;
    updateItem: (id: string, updates: Partial<CartItem>) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    loadDraftCart: (draftItems: CartItem[]) => void;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('samredroob_cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save to localStorage whenever items change
    useEffect(() => {
        localStorage.setItem('samredroob_cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (newItem: Omit<CartItem, 'id' | 'quantity'>, initialQuantity?: number) => {
        setItems(prev => {
            // Check if exact same config exists (optional, simply adding new entry for now)
            const id = Date.now().toString();
            return [...prev, { ...newItem, id, quantity: initialQuantity || 1 }];
        });
    };

    const updateItem = (id: string, updates: Partial<CartItem>) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));
    };

    const removeFromCart = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const clearCart = () => {
        setItems([]);
    };

    const loadDraftCart = (draftItems: CartItem[]) => {
        setItems(draftItems);
    };

    return (
        <CartContext.Provider value={{ items, addToCart, updateItem, removeFromCart, clearCart, loadDraftCart, cartCount: items.length }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
