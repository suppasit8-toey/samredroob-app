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
    Tag,
    Calendar,
    CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CldUploadWidget, CloudinaryUploadWidgetResults } from 'next-cloudinary';

interface PromotionItem {
    id: number;
    title_th: string;
    title_en?: string;
    description_th?: string;
    description_en?: string;
    image_url?: string;
    start_date?: string;
    end_date?: string;
    is_active: boolean;
    created_at?: string;
}

export default function AdminPromotionsPage() {
    const [promotions, setPromotions] = useState<PromotionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PromotionItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [uploading, setUploading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title_th: '',
        title_en: '',
        description_th: '',
        description_en: '',
        image_url: '',
        start_date: '',
        end_date: '',
        is_active: true
    });

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        if (!supabase) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('promotions')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            console.error('Error fetching promotions:', error);
        } else {
            setPromotions(data || []);
        }
        setLoading(false);
    };

    const handleOpenModal = (item?: PromotionItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title_th: item.title_th,
                title_en: item.title_en || '',
                description_th: item.description_th || '',
                description_en: item.description_en || '',
                image_url: item.image_url || '',
                start_date: item.start_date || '',
                end_date: item.end_date || '',
                is_active: item.is_active
            });
        } else {
            setEditingItem(null);
            setFormData({
                title_th: '',
                title_en: '',
                description_th: '',
                description_en: '',
                image_url: '',
                start_date: new Date().toISOString().split('T')[0],
                end_date: '',
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
        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบโปรโมชั่นนี้?')) return;

        const { error } = await supabase.from('promotions').delete().eq('id', id);
        if (error) {
            alert('เกิดข้อผิดพลาดในการลบข้อมูล');
            console.error(error);
        } else {
            fetchPromotions();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return;

        try {
            const dataToSave = {
                title_th: formData.title_th,
                title_en: formData.title_en,
                description_th: formData.description_th,
                description_en: formData.description_en,
                image_url: formData.image_url,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
                is_active: formData.is_active
            };

            if (editingItem) {
                // Update
                const { error } = await supabase
                    .from('promotions')
                    .update(dataToSave)
                    .eq('id', editingItem.id);

                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('promotions')
                    .insert([dataToSave]);

                if (error) throw error;
            }

            handleCloseModal();
            fetchPromotions();
        } catch (error) {
            console.error('Error saving promotion:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const filteredPromotions = promotions.filter(item =>
        item.title_th.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.title_en && item.title_en.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 font-sans">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Tag className="text-black" />
                        จัดการโปรโมชั่น (Promotions)
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">จัดการรายการส่วนลด และแคมเปญต่างๆ</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-black text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-lg shadow-black/10 font-medium cursor-pointer"
                >
                    <Plus size={20} />
                    เพิ่มโปรโมชั่นใหม่
                </button>
            </div>

            {/* Filter & View Controls */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาโปรโมชั่น..."
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
                    ) : filteredPromotions.map((item) => (
                        <div key={item.id} className={`group bg-white rounded-2xl shadow-sm border ${item.is_active ? 'border-gray-100' : 'border-red-100 bg-red-50/10'} overflow-hidden hover:shadow-md transition-all duration-300 relative`}>
                            <div className="h-40 bg-gray-50 overflow-hidden relative flex items-center justify-center">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.title_th} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="text-gray-300 flex flex-col items-center gap-2">
                                        <Tag size={40} />
                                        <span className="text-xs font-medium">No Image</span>
                                    </div>
                                )}
                                {!item.is_active && (
                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                        <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold">ไม่แสดงผล</span>
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-200 z-10">
                                    <button onClick={() => handleOpenModal(item)} className="p-2 bg-white text-gray-700 rounded-full hover:text-blue-600 shadow-sm cursor-pointer border border-gray-100"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-white text-gray-700 rounded-full hover:text-red-600 shadow-sm cursor-pointer border border-gray-100"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div className="p-5 border-t border-gray-50">
                                <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{item.title_th}</h3>
                                {item.end_date && (
                                    <div className="flex items-center gap-1 text-xs text-orange-600 font-medium mt-2">
                                        <Calendar size={12} />
                                        <span>ถึง {new Date(item.end_date).toLocaleDateString('th-TH')}</span>
                                    </div>
                                )}
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
                        <span className="font-semibold text-gray-400 group-hover:text-black transition-colors">เพิ่มโปรโมชั่นใหม่</span>
                    </button>
                </div>
            ) : (
                /* List View (Table) */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 pl-6 font-semibold text-gray-600 w-16">Status</th>
                                <th className="p-4 font-semibold text-gray-600">Image</th>
                                <th className="p-4 font-semibold text-gray-600">Title</th>
                                <th className="p-4 font-semibold text-gray-600">Period</th>
                                <th className="p-4 pr-6 font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPromotions.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 pl-6">
                                        <div className={`w-3 h-3 rounded-full ${item.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    </td>
                                    <td className="p-4">
                                        <div className="w-16 h-12 rounded-lg bg-gray-50 overflow-hidden border border-gray-100 flex items-center justify-center">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.title_th} className="w-full h-full object-cover" />
                                            ) : (
                                                <Tag size={20} className="text-gray-300" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-gray-900">{item.title_th}</td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {item.start_date ? new Date(item.start_date).toLocaleDateString('th-TH') : 'Start'}
                                        {' - '}
                                        {item.end_date ? new Date(item.end_date).toLocaleDateString('th-TH') : 'Forever'}
                                    </td>
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
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingItem ? 'แก้ไขโปรโมชั่น' : 'เพิ่มโปรโมชั่นใหม่'}
                                </h2>
                                <button onClick={handleCloseModal} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500 cursor-pointer">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="flex justify-end">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-gray-700">{formData.is_active ? 'กำลังใช้งาน (Active)' : 'ปิดใช้งาน (Inactive)'}</span>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${formData.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${formData.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">หัวข้อโปรโมชั่น (TH) <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title_th}
                                            onChange={(e) => setFormData({ ...formData, title_th: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition outline-none"
                                            placeholder="ระบุชื่อโปรโมชั่น..."
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Title (EN)</label>
                                        <input
                                            type="text"
                                            value={formData.title_en}
                                            onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition outline-none"
                                            placeholder="Promotion title..."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">วันที่เริ่ม</label>
                                        <div className="relative">
                                            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="date"
                                                value={formData.start_date}
                                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">วันที่สิ้นสุด</label>
                                        <div className="relative">
                                            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="date"
                                                value={formData.end_date}
                                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">รายละเอียด (TH)</label>
                                        <textarea
                                            value={formData.description_th}
                                            onChange={(e) => setFormData({ ...formData, description_th: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition outline-none h-32 resize-none"
                                            placeholder="เงื่อนไข รายละเอียด..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description (EN)</label>
                                        <textarea
                                            value={formData.description_en}
                                            onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition outline-none h-32 resize-none"
                                            placeholder="Promotion details..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">แบนเนอร์ / รูปภาพ</label>
                                    {formData.image_url ? (
                                        <div className="relative p-4 bg-gray-50 rounded-2xl border border-gray-200 group">
                                            <div className="flex items-center gap-4">
                                                <div className="h-24 w-40 rounded-xl overflow-hidden shadow-sm bg-white shrink-0 border border-gray-100 flex items-center justify-center text-gray-400">
                                                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-900">อัปโหลดสำเร็จ ✓</p>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1 break-all">{formData.image_url}</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                                                        className="mt-2 text-xs px-3 py-1.5 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition text-red-500 font-medium cursor-pointer"
                                                    >
                                                        ลบรูป
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <CldUploadWidget
                                            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                                            options={{ maxFiles: 1, resourceType: 'image', folder: 'samredroob/promotions' }}
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
                                                    className="w-full p-8 border-2 border-dashed border-gray-200 rounded-2xl hover:border-black hover:bg-gray-50 transition-all duration-300 flex flex-col items-center justify-center gap-3 group cursor-pointer"
                                                >
                                                    <Upload size={24} className="text-gray-400 group-hover:text-black transition-colors" />
                                                    <span className="text-sm font-medium text-gray-500 group-hover:text-black">คลิกเพื่ออัปโหลด</span>
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
