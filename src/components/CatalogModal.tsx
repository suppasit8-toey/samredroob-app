"use client";

import React from 'react';
import { X, ExternalLink, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const FlipbookViewer = dynamic(() => import('./FlipbookViewer'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-white">กำลังโหลด...</div>
});

interface CatalogModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string | null;
    title?: string;
}

export default function CatalogModal({ isOpen, onClose, url, title = 'แคตตาล็อก' }: CatalogModalProps) {
    if (!url) return null;

    // Determine file type simply by extension
    const isPdf = url.toLowerCase().includes('.pdf');
    const isImage = url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
                    >
                        {/* Header */}
                        <div className="bg-black text-white px-4 py-3 flex items-center justify-between shrink-0">
                            <h3 className="font-bold text-lg truncate pr-4 max-w-[70%] font-[family-name:var(--font-mitr)]">
                                {title}
                            </h3>
                            <div className="flex items-center gap-2">
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-white/20 rounded-full transition text-white/80 hover:text-white"
                                    title="เปิดในแท็บใหม่ / ดาวน์โหลด"
                                >
                                    <Download size={20} />
                                </a>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/20 rounded-full transition text-white hover:text-red-400"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-gray-100 overflow-hidden relative flex items-center justify-center">
                            {isPdf ? (
                                <FlipbookViewer url={url} />
                            ) : (
                                <div className="w-full h-full overflow-auto p-4 flex items-center justify-center">
                                    {/* Using standard img tag for simplicity in modal context, passing url directly */}
                                    <img
                                        src={url}
                                        alt={title}
                                        className="max-w-full max-h-full object-contain shadow-lg rounded-md"
                                    />
                                </div>
                            )}

                            {/* Fallback / Loading info if needed could go here */}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
