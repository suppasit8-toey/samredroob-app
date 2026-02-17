
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'th' | 'en';

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('th');

    // Optional: Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('app-language') as Language;
        if (saved) setLanguage(saved);
    }, []);

    const toggleLanguage = () => {
        const newLang = language === 'th' ? 'en' : 'th';
        setLanguage(newLang);
        localStorage.setItem('app-language', newLang);
    };

    // Simple dictionary for common terms if needed, primarily used for static text
    // Just a placeholder implementation as most translations will be component-specific objects
    const t = (key: string) => key;

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
