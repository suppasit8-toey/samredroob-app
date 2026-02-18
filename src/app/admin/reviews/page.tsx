"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Plus,
    Edit,
    Trash2,
    X,
    Search,
    Save,
    LayoutGrid,
    List,
    Upload,
    Loader2,
    MessageSquare,
    Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CldUploadWidget, CloudinaryUploadWidgetResults } from 'next-cloudinary';

interface ReviewItem {
    id: number;
    customer_name: string;
    rating: number;
    comment_th?: string;
    comment_en?: string;
    image_url?: string;
    is_active: boolean;
    created_at?: string;
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ReviewItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [uploading, setUploading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        customer_name: '',
        rating: 5,
        comment_th: '',
        comment_en: '',
        image_url: '',
        is_active: true
    });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        if (!supabase) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            console.error('Error fetching reviews:', error);
        } else {
            setReviews(data || []);
        }
        setLoading(false);
    };

    const handleOpenModal = (item?: ReviewItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                customer_name: item.customer_name,
                rating: item.rating,
                comment_th: item.comment_th || '',
                comment_en: item.comment_en || '',
                image_url: item.image_url || '',
                is_active: item.is_active
            });
        } else {
            setEditingItem(null);
            setFormData({
                customer_name: '',
                rating: 5,
                comment_th: '',
                comment_en: '',
                image_url: '',
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleDelete = async (id: number) => {
        if (!supabase) return;
        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบรีวิวนี้?')) return;

        const { error } = await supabase.from('reviews').delete().eq('id', id);
        if (error) {
            alert('เกิดข้อผิดพลาดในการลบข้อมูล');
            console.error(error);
        } else {
            fetchReviews();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return;

        try {
            const dataToSave = {
                customer_name: formData.customer_name,
                rating: formData.rating,
                comment_th: formData.comment_th,
                comment_en: formData.comment_en,
                image_url: formData.image_url,
                is_active: formData.is_active
            };

            if (editingItem) {
                // Update
                const { error } = await supabase
                    .from('reviews')
                    .update(dataToSave)
                    .eq('id', editingItem.id);

                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('reviews')
                    .insert([dataToSave]);

                if (error) throw error;
            }

            handleCloseModal();
            fetchReviews();
        } catch (error) {
            console.error('Error saving review:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const filteredReviews = reviews.filter(item =>
        item.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.comment_th && item.comment_th.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 font-sans">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="text-black" />
                        จัดการรีวิว (Reviews)
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">จัดการคำชม ข้อเสนอแนะจากลูกค้า</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-black text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-lg shadow-black/10 font-medium cursor-pointer"
                >
                    <Plus size={20} />
                    เพิ่มรีวิวใหม่
                </button>
            </div>

            {/* Filter & View Controls */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหารีวิว..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition"
                    />
                </div>
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'grid' ? (
                /* Grid View */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse h-64"></div>
                        ))
                    ) : filteredReviews.map((item) => (
                        <div key={item.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 relative flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.customer_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                                                    {item.customer_name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 line-clamp-1">{item.customer_name}</h3>
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} className={i < item.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${item.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                                </div>
                                <p className="text-gray-600 text-sm line-clamp-3 italic">"{item.comment_th}"</p>
                            </div>

                            <div className="p-4 border-t border-gray-50 flex justify-end gap-2 bg-gray-50/50">
                                <button onClick={() => handleOpenModal(item)} className="p-2 bg-white text-gray-700 rounded-lg hover:text-blue-600 shadow-sm cursor-pointer border border-gray-100"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 bg-white text-gray-700 rounded-lg hover:text-red-600 shadow-sm cursor-pointer border border-gray-100"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}

                    {/* Add New Card (Ghost) */}
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex flex-col items-center justify-center h-full min-h-[200px] rounded-2xl border-2 border-dashed border-gray-200 hover:border-black hover:bg-gray-50 transition-all gap-4 group cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-black transition-colors shadow-sm">
                            <Plus size={24} />
                        </div>
                        <span className="font-semibold text-gray-400 group-hover:text-black transition-colors">เพิ่มรีวิวใหม่</span>
                    </button>
                </div>
            ) : (
                /* List View (Table) */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 pl-6 font-semibold text-gray-600 w-16">Status</th>
                                <th className="p-4 font-semibold text-gray-600">Customer</th>
                                <th className="p-4 font-semibold text-gray-600">Rating</th>
                                <th className="p-4 font-semibold text-gray-600">Comment</th>
                                <th className="p-4 pr-6 font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredReviews.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 pl-6">
                                        <div className={`w-3 h-3 rounded-full ${item.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    </td>
                                    <td className="p-4 font-bold text-gray-900">{item.customer_name}</td>
                                    <td className="p-4">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} className={i < item.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600 max-w-xs truncate">{item.comment_th}</td>
                                    <td className="p-4 pr-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-400 hover:text-blue-600 transition cursor-pointer"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 transition cursor-pointer"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingItem ? 'แก้ไขรีวิว' : 'เพิ่มรีวิวใหม่'}
                                </h2>
                                <button onClick={handleCloseModal} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500 cursor-pointer">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ชื่อลูกค้า <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.customer_name}
                                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition outline-none"
                                        placeholder="ระบุชื่อลูกค้า..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">คะแนน (1-5)</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map(score => (
                                                <button
                                                    key={score}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, rating: score })}
                                                    className={`p-2 rounded-lg transition ${formData.rating >= score ? 'text-yellow-400' : 'text-gray-300'}`}
                                                >
                                                    <Star size={24} className={formData.rating >= score ? 'fill-yellow-400' : ''} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">สถานะ</label>
                                        <div className="flex items-center gap-3 mt-2">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${formData.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${formData.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </button>
                                            <span className="text-sm font-medium text-gray-700">{formData.is_active ? 'แสดงผล' : 'ซ่อน'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ความคิดเห็น (TH)</label>
                                    <textarea
                                        value={formData.comment_th}
                                        onChange={(e) => setFormData({ ...formData, comment_th: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition outline-none h-24 resize-none"
                                        placeholder="เช่น บริการดีมาก..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Comment (EN) - Optional</label>
                                    <textarea
                                        value={formData.comment_en}
                                        onChange={(e) => setFormData({ ...formData, comment_en: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition outline-none h-24 resize-none"
                                        placeholder="e.g. Great service..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">รูปลูกค้า / โปรไฟล์ (Optional)</label>
                                    {formData.image_url ? (
                                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                            <div className="w-16 h-16 rounded-full overflow-hidden bg-white shadow-sm">
                                                <img src={formData.image_url} alt="Profile" className="w-full h-full object-cover" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                                                className="text-red-500 text-sm font-medium hover:underline"
                                            >
                                                ลบรูป
                                            </button>
                                        </div>
                                    ) : (
                                        <CldUploadWidget
                                            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                                            options={{ maxFiles: 1, resourceType: 'image', folder: 'samredroob/reviews' }}
                                            onSuccess={(result: CloudinaryUploadWidgetResults) => {
                                                const info = result?.info;
                                                if (typeof info !== 'string' && info?.secure_url) {
                                                    setFormData(prev => ({ ...prev, image_url: info.secure_url }));
                                                }
                                                setUploading(false);
                                            }}
                                            onOpen={() => setUploading(true)}
                                            onClose={() => setUploading(false)}
                                        >
                                            {({ open }) => (
                                                <button
                                                    type="button"
                                                    onClick={() => open()}
                                                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2"
                                                >
                                                    <Upload size={16} /> อัปโหลดรูปภาพ
                                                </button>
                                            )}
                                        </CldUploadWidget>
                                    )}
                                </div>

                                <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-6 py-3 text-gray-500 hover:text-black hover:bg-gray-50 rounded-xl transition-all font-semibold text-sm cursor-pointer"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 font-semibold shadow-xl shadow-black/20 text-sm cursor-pointer"
                                    >
                                        <Save size={18} />
                                        บันทึก
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
