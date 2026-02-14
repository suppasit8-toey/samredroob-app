"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Category } from '@/lib/types'; // Ensure this type exists
import {
    Plus,
    Edit,
    Trash2,
    X,
    Search,
    Save,
    ImageIcon,
    LayoutGrid,
    List,
    Upload,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CldUploadWidget, CloudinaryUploadWidgetResults } from 'next-cloudinary';

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [uploading, setUploading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        image_url: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        if (!supabase) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('product_categories')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            console.error('Error fetching categories:', error);
        } else {
            setCategories(data || []);
        }
        setLoading(false);
    };

    const handleOpenModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                slug: category.slug || '',
                image_url: category.image_url || ''
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                slug: '',
                image_url: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleDelete = async (id: number) => {
        if (!supabase) return;
        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่นี้? การลบหมวดหมู่จะทำให้สินค้าในหมวดหมู่นี้ถูกลบไปด้วย!')) return;

        const { error } = await supabase.from('product_categories').delete().eq('id', id);
        if (error) {
            alert('เกิดข้อผิดพลาดในการลบหมวดหมู่');
            console.error(error);
        } else {
            fetchCategories();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return;

        try {
            const dataToSave = {
                name: formData.name,
                slug: formData.slug || formData.name.toLowerCase().replace(/ /g, '-'),
                image_url: formData.image_url
            };

            if (editingCategory) {
                // Update
                const { error } = await supabase
                    .from('product_categories')
                    .update(dataToSave)
                    .eq('id', editingCategory.id);

                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('product_categories')
                    .insert([dataToSave]);

                if (error) throw error;
            }

            handleCloseModal();
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 font-sans">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">หมวดหมู่สินค้า (Categories)</h1>
                    <p className="text-gray-500 text-sm mt-1">จัดการประเภทหลักของสินค้าทั้งหมด</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-black text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-lg shadow-black/10 font-medium cursor-pointer"
                >
                    <Plus size={20} />
                    เพิ่มหมวดหมู่ใหม่
                </button>
            </div>

            {/* Filter & View Controls */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาหมวดหมู่..."
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
                    ) : filteredCategories.map((category) => (
                        <div key={category.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 relative">
                            <div className="h-40 bg-gray-100 overflow-hidden relative">
                                {category.image_url ? (
                                    <img src={category.image_url} alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                                        <ImageIcon size={40} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-200">
                                    <button onClick={() => handleOpenModal(category)} className="p-2 bg-white text-gray-700 rounded-full hover:text-blue-600 shadow-sm cursor-pointer"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(category.id)} className="p-2 bg-white text-gray-700 rounded-full hover:text-red-600 shadow-sm cursor-pointer"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-lg text-gray-900 mb-1">{category.name}</h3>
                                <p className="text-xs text-gray-400 font-mono">/{category.slug}</p>
                            </div>
                        </div>
                    ))}

                    {/* Add New Card (Ghost) */}
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex flex-col items-center justify-center h-full min-h-[250px] rounded-2xl border-2 border-dashed border-gray-200 hover:border-black hover:bg-gray-50 transition-all gap-4 group cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-black transition-colors shadow-sm">
                            <Plus size={24} />
                        </div>
                        <span className="font-semibold text-gray-400 group-hover:text-black transition-colors">เพิ่มหมวดหมู่ใหม่</span>
                    </button>
                </div>
            ) : (
                /* List View (Table) */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 pl-6 font-semibold text-gray-600 w-24">รูปภาพ</th>
                                <th className="p-4 font-semibold text-gray-600">ชื่อหมวดหมู่</th>
                                <th className="p-4 font-semibold text-gray-600">Slug (URL)</th>
                                <th className="p-4 pr-6 font-semibold text-gray-600 text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCategories.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 pl-6">
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-100">
                                            <img
                                                src={category.image_url || 'https://placehold.co/100?text=No+Img'}
                                                alt={category.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-gray-900">{category.name}</td>
                                    <td className="p-4 font-mono text-sm text-gray-500">{category.slug}</td>
                                    <td className="p-4 pr-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleOpenModal(category)} className="p-2 text-gray-400 hover:text-blue-600 transition cursor-pointer"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(category.id)} className="p-2 text-gray-400 hover:text-red-600 transition cursor-pointer"><Trash2 size={18} /></button>
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
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
                                </h2>
                                <button onClick={handleCloseModal} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500 cursor-pointer">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                                <div>
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-black">
                                            ชื่อหมวดหมู่ <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 text-gray-900 font-medium rounded-xl border-2 border-transparent focus:border-black focus:bg-white focus:outline-none focus:ring-4 focus:ring-black/5 transition-all duration-300 placeholder-gray-400 text-lg"
                                            placeholder="ระบุชื่อหมวดหมู่..."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <div className="relative group">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-black">
                                                Slug (URL)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.slug}
                                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                className="w-full px-5 py-3.5 bg-gray-50 text-gray-900 font-medium rounded-xl border-2 border-transparent focus:border-black focus:bg-white focus:outline-none focus:ring-4 focus:ring-black/5 transition-all duration-300 placeholder-gray-400 font-mono text-sm"
                                                placeholder="my-category"
                                            />
                                            <p className="text-[10px] text-gray-400 mt-2 font-medium">* ภาษาอังกฤษตัวเล็ก ห้ามเว้นวรรค</p>
                                        </div>
                                    </div>

                                    <div className="col-span-full">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                            รูปภาพปก
                                        </label>
                                    </div>
                                </div>

                                {/* Image Upload Area */}
                                {formData.image_url ? (
                                    <div className="relative p-4 bg-gray-50 rounded-2xl border border-gray-200 group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-24 w-24 rounded-xl overflow-hidden shadow-sm bg-white shrink-0 border border-gray-100">
                                                <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900">อัปโหลดสำเร็จ ✓</p>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2 break-all">{formData.image_url}</p>
                                                <div className="flex gap-2 mt-3">
                                                    <CldUploadWidget
                                                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                                                        options={{
                                                            maxFiles: 1,
                                                            resourceType: 'image',
                                                            folder: 'samredroob/categories',
                                                            cropping: true,
                                                        }}
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
                                                                className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition text-gray-600 font-medium cursor-pointer"
                                                            >
                                                                เปลี่ยนรูป
                                                            </button>
                                                        )}
                                                    </CldUploadWidget>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                                                        className="text-xs px-3 py-1.5 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition text-red-500 font-medium cursor-pointer"
                                                    >
                                                        ลบรูป
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <CldUploadWidget
                                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                                        options={{
                                            maxFiles: 1,
                                            resourceType: 'image',
                                            folder: 'samredroob/categories',
                                            cropping: true,
                                        }}
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
                                                {uploading ? (
                                                    <>
                                                        <Loader2 size={32} className="text-gray-400 animate-spin" />
                                                        <span className="text-sm text-gray-400 font-medium">กำลังอัปโหลด...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300">
                                                            <Upload size={24} className="text-gray-400 group-hover:text-white transition-colors" />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-sm font-semibold text-gray-500 group-hover:text-black transition-colors">คลิกเพื่ออัปโหลดรูปภาพ</p>
                                                            <p className="text-xs text-gray-400 mt-1">รองรับ JPG, PNG, WebP</p>
                                                        </div>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </CldUploadWidget>
                                )}

                                <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 items-center">
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
