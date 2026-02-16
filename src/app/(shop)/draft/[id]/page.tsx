"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { Loader2 } from 'lucide-react';

export default function DraftPage() {
    const params = useParams();
    const router = useRouter();
    const { loadDraftCart } = useCart();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDraft = async () => {
            if (!supabase || !params.id) return;

            try {
                const { data, error } = await supabase
                    .from('quotation_drafts')
                    .select('*')
                    .eq('id', params.id)
                    .single();

                if (error) throw error;

                if (data) {
                    // Load items into cart
                    // Ensure items have unique IDs (regenerate if needed to avoid conflicts? 
                    // CartContext usually generates ID on add, but here we replace.
                    // The loaded items should already have structure compatible with CartItem.

                    // We might need to re-validate or re-fetch current prices/stock here in a real app,
                    // but for now we assume draft data is valid.

                    // Important: The draft items saved in Admin might be missing 'selectedVariant' 
                    // or other fields if they weren't in the original type.
                    // Admin saves: collection, width, height, quantity, totalPrice, breakdown.
                    // CartItem needs: id, collection, width, height, quantity, totalPrice, breakdown.
                    // It fits!

                    loadDraftCart(data.items);

                    // Redirect to quotation page
                    router.push('/quotation');
                } else {
                    setError('ไม่พบใบเสนอราคานี้');
                }
            } catch (err) {
                console.error('Error loading draft:', err);
                setError('เกิดข้อผิดพลาดในการโหลดใบเสนอราคา');
            } finally {
                setLoading(false);
            }
        };

        fetchDraft();
    }, [params.id, router, loadDraftCart]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500">กำลังโหลดรายการสินค้า...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 text-2xl">!</div>
                <h1 className="text-xl font-bold text-gray-800 mb-2">ไม่สามารถโหลดข้อมูลได้</h1>
                <p className="text-gray-500 mb-6">{error}</p>
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                    กลับไปหน้าแรก
                </button>
            </div>
        );
    }

    return null;
}
