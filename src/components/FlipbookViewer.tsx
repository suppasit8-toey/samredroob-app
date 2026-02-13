"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface FlipbookViewerProps {
    url: string;
}

export default function FlipbookViewer({ url }: FlipbookViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [loading, setLoading] = useState(true);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [isAnimating, setIsAnimating] = useState(false);
    const [direction, setDirection] = useState<'left' | 'right' | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const thumbStripRef = useRef<HTMLDivElement>(null);

    // Measure container on mount & resize
    useEffect(() => {
        const measure = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setContainerSize({ width: rect.width, height: rect.height });
            }
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setLoading(false);
    }

    const goToPage = useCallback((page: number, dir: 'left' | 'right') => {
        if (page < 1 || page > numPages || isAnimating) return;
        setDirection(dir);
        setIsAnimating(true);
        setTimeout(() => {
            setPageNumber(page);
            setIsAnimating(false);
            setDirection(null);
        }, 200);
    }, [numPages, isAnimating]);

    const next = useCallback(() => goToPage(pageNumber + 1, 'left'), [pageNumber, goToPage]);
    const prev = useCallback(() => goToPage(pageNumber - 1, 'right'), [pageNumber, goToPage]);

    // Scroll active thumbnail into view
    useEffect(() => {
        if (thumbStripRef.current) {
            const activeBtn = thumbStripRef.current.querySelector(`[data-page="${pageNumber}"]`);
            if (activeBtn) {
                activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [pageNumber]);

    // Leave room for thumbnail strip (~90px) and padding  
    const thumbStripHeight = 90;
    const mainAreaHeight = containerSize.height - thumbStripHeight - 16;

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [next, prev]);

    // Touch swipe support
    const touchStartX = useRef<number | null>(null);
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) next();
            else prev();
        }
        touchStartX.current = null;
    };

    return (
        <div
            ref={containerRef}
            className="flex flex-col h-full w-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Loading */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/60 backdrop-blur-sm flex-col gap-3">
                    <Loader2 className="animate-spin text-white w-10 h-10" />
                    <span className="text-white/80 text-sm">กำลังโหลด Catalog...</span>
                </div>
            )}

            <Document
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={null}
                className="flex flex-col h-full w-full"
            >
                {/* Main Page Area */}
                <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                    {/* Left Arrow */}
                    {!loading && pageNumber > 1 && (
                        <button
                            onClick={prev}
                            className="absolute left-1 md:left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/10 hover:bg-white/25 text-white rounded-full transition-all shadow-lg backdrop-blur-sm border border-white/20"
                        >
                            <ChevronLeft size={28} />
                        </button>
                    )}

                    {/* Right Arrow */}
                    {!loading && pageNumber < numPages && (
                        <button
                            onClick={next}
                            className="absolute right-1 md:right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/10 hover:bg-white/25 text-white rounded-full transition-all shadow-lg backdrop-blur-sm border border-white/20"
                        >
                            <ChevronRight size={28} />
                        </button>
                    )}

                    {/* PDF Page - Centered & Fit to Screen */}
                    {containerSize.width > 0 && numPages > 0 && (
                        <div
                            className="transition-all duration-200 ease-in-out mx-14"
                            style={{
                                transform: isAnimating
                                    ? direction === 'left'
                                        ? 'translateX(-20px) scale(0.98)'
                                        : 'translateX(20px) scale(0.98)'
                                    : 'translateX(0) scale(1)',
                                opacity: isAnimating ? 0.4 : 1,
                            }}
                        >
                            <div className="bg-white rounded-lg shadow-2xl overflow-hidden ring-1 ring-white/10">
                                <Page
                                    pageNumber={pageNumber}
                                    height={mainAreaHeight > 100 ? mainAreaHeight : 400}
                                    renderAnnotationLayer={false}
                                    renderTextLayer={false}
                                    loading={
                                        <div
                                            style={{ width: 300, height: mainAreaHeight > 100 ? mainAreaHeight : 400 }}
                                            className="flex items-center justify-center bg-gray-100"
                                        >
                                            <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
                                        </div>
                                    }
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Thumbnail Strip with actual PDF page previews */}
                {!loading && numPages > 0 && (
                    <div className="shrink-0 bg-black/50 backdrop-blur-md border-t border-white/10 px-2 py-2">
                        <div ref={thumbStripRef} className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
                            {/* Page Counter Label */}
                            <div className="shrink-0 text-white/60 text-xs font-medium px-2 border-r border-white/20 mr-1 whitespace-nowrap flex flex-col items-center">
                                <span className="text-white font-bold text-base">{pageNumber}</span>
                                <span className="text-white/40 text-[10px]">/ {numPages}</span>
                            </div>

                            {/* Thumbnail Page Previews */}
                            {Array.from({ length: numPages }, (_, i) => {
                                const pg = i + 1;
                                const isActive = pg === pageNumber;
                                return (
                                    <button
                                        key={pg}
                                        data-page={pg}
                                        onClick={() => {
                                            const dir = pg > pageNumber ? 'left' : 'right';
                                            goToPage(pg, dir);
                                        }}
                                        className={`
                                            shrink-0 rounded-md overflow-hidden transition-all duration-200 border-2 relative
                                            ${isActive
                                                ? 'border-blue-400 shadow-lg shadow-blue-500/40 scale-105 ring-1 ring-blue-400/50'
                                                : 'border-white/10 hover:border-white/40 opacity-60 hover:opacity-100'
                                            }
                                        `}
                                        title={`หน้า ${pg}`}
                                    >
                                        <Page
                                            pageNumber={pg}
                                            height={60}
                                            renderAnnotationLayer={false}
                                            renderTextLayer={false}
                                            loading={
                                                <div className="w-[34px] h-[60px] bg-gray-700 flex items-center justify-center">
                                                    <span className="text-[10px] text-white/40">{pg}</span>
                                                </div>
                                            }
                                        />
                                        {/* Page number overlay */}
                                        <div className={`absolute bottom-0 left-0 right-0 text-center text-[8px] py-[1px] ${isActive ? 'bg-blue-500/80 text-white' : 'bg-black/50 text-white/70'}`}>
                                            {pg}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </Document>
        </div>
    );
}
