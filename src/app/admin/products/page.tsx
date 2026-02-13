
"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, X, Search, Save, Filter, ImageIcon, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
    id: number;
    name: string;
    category: string;
    price: string;

    image_url: string;
    tags?: string[];
}

const CATEGORIES = [
    { id: 'wooden-blinds', name: 'มู่ลี่ไม้', color: 'bg-amber-100 text-amber-800' },
    { id: 'roller-blinds', name: 'ม่านม้วน', color: 'bg-slate-100 text-slate-800' },
    { id: 'curtains', name: 'ผ้าม่าน', color: 'bg-rose-100 text-rose-800' },
    { id: 'pvc-partition', name: 'ฉากกั้น PVC', color: 'bg-blue-100 text-blue-800' },
    { id: 'vertical-blinds', name: 'ม่านปรับแสง', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'wallpaper', name: 'วอลล์เปเปอร์', color: 'bg-purple-100 text-purple-800' },
    { id: 'alum-blinds', name: 'มู่ลี่อลูมิเนียม', color: 'bg-gray-100 text-gray-800' },
    { id: 'accessories', name: 'อุปกรณ์/อื่นๆ', color: 'bg-emerald-100 text-emerald-800' },
];

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: 'curtains',
        price: '',
        image_url: ''
    });

    // Tag State
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        if (!supabase) return;
        setLoading(true);
        const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
        if (error) console.error('Error fetching products:', error);
        else setProducts(data || []);
        setLoading(false);
    };

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
        if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return;
        e.preventDefault();

        const newTag = tagInput.trim();
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                category: product.category,
                price: product.price,
                image_url: product.image_url || ''
            });
            setTags(product.tags || []);
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                category: 'curtains',
                price: '',
                image_url: ''
            });
            setTags([]);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleDelete = async (id: number) => {
        if (!supabase) return;
        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?')) return;

        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
            alert('เกิดข้อผิดพลาดในการลบสินค้า');
            console.error(error);
        } else {
            fetchProducts();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return;

        try {
            if (editingProduct) {
                // Update
                const { error } = await supabase
                    .from('products')
                    .update({ ...formData, tags })
                    .eq('id', editingProduct.id);

                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('products')
                    .insert([{ ...formData, tags }]);

                if (error) throw error;
            }

            handleCloseModal();
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">จัดการสินค้า (Products)</h1>
                    <p className="text-gray-500 text-sm mt-1">รายการสินค้าทั้งหมด {products.length} รายการ</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-black text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-lg shadow-black/10 font-medium"
                >
                    <Plus size={20} />
                    เพิ่มสินค้าใหม่
                </button>
            </div>

            {/* Filter & View Controls */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อสินค้า, หมวดหมู่ หรือ Tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition"
                    />
                </div>
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p - 2 rounded - lg transition - all ${viewMode === 'grid' ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'} `}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p - 2 rounded - lg transition - all ${viewMode === 'list' ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'} `}
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
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse h-80"></div>
                        ))
                    ) : filteredProducts.map((product) => (
                        <div key={product.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
                            <div className="relative h-48 bg-gray-100 overflow-hidden">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <ImageIcon size={48} />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenModal(product)} className="p-2 bg-white/90 backdrop-blur rounded-full hover:text-blue-600 shadow-sm"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(product.id)} className="p-2 bg-white/90 backdrop-blur rounded-full hover:text-red-600 shadow-sm"><Trash2 size={16} /></button>
                                </div>
                                <div className="absolute bottom-3 left-3">
                                    {(() => {
                                        const cat = CATEGORIES.find(c => c.id === product.category);
                                        return (
                                            <span className={`px - 2.5 py - 1 rounded - lg text - xs font - semibold shadow - sm backdrop - blur - md ${cat?.color || 'bg-gray-100 text-gray-800'} `}>
                                                {cat?.name || product.category}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                                {product.tags && product.tags.length > 0 && (
                                    <div className="flex gap-1 mb-1 flex-wrap">
                                        {product.tags.map((tag, idx) => (
                                            <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-md font-medium border border-gray-200">{tag}</span>
                                        ))}
                                    </div>
                                )}
                                <p className="text-gray-900 font-semibold">{product.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* List View (Table) */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 pl-6 font-semibold text-gray-600">รูปภาพ</th>
                                <th className="p-4 font-semibold text-gray-600">ชื่อสินค้า</th>
                                <th className="p-4 font-semibold text-gray-600">หมวดหมู่</th>
                                <th className="p-4 font-semibold text-gray-600">Tags</th>
                                <th className="p-4 font-semibold text-gray-600">ราคา</th>
                                <th className="p-4 pr-6 font-semibold text-gray-600 text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 pl-6">
                                        <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shadow-sm border border-gray-100">
                                            <img
                                                src={product.image_url || 'https://placehold.co/100?text=No+Img'}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-gray-900">{product.name}</td>
                                    <td className="p-4">
                                        {(() => {
                                            const cat = CATEGORIES.find(c => c.id === product.category);
                                            return (
                                                <span className={`px - 2.5 py - 1 rounded - lg text - xs font - semibold ${cat?.color || 'bg-gray-100 text-gray-800'} `}>
                                                    {cat?.name || product.category}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-1 flex-wrap max-w-[200px]">
                                            {product.tags && product.tags.slice(0, 3).map((tag, idx) => (
                                                <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-md font-medium border border-gray-200">
                                                    {tag}
                                                </span>
                                            ))}
                                            {product.tags && product.tags.length > 3 && (
                                                <span className="text-[10px] px-1.5 py-0.5 text-gray-400">+{product.tags.length - 3}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-gray-600">{product.price}</td>
                                    <td className="p-4 pr-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleOpenModal(product)} className="p-2 text-gray-400 hover:text-blue-600 transition"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 transition"><Trash2 size={18} /></button>
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
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
                                </h2>
                                <button onClick={handleCloseModal} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อสินค้า</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition"
                                        placeholder="เช่น ผ้าม่านกัน UV รุ่น Premium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">หมวดหมู่</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">ราคา (ข้อความ)</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition"
                                            placeholder="เช่น ฿2,500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">URL รูปภาพ</label>
                                        <input
                                            type="text"
                                            value={formData.image_url}
                                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition"
                                            placeholder="https://..."
                                        />
                                    </div>

                                    {/* Tag Input */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags (ป้ายกำกับ)</label>
                                        <div className="flex gap-2 mb-2 flex-wrap">
                                            {tags.map((tag, index) => (
                                                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center gap-1">
                                                    {tag}
                                                    <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-500 rounded-full p-0.5"><X size={14} /></button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={handleAddTag}
                                                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition"
                                                placeholder="พิมพ์ Tag แล้วกด Enter..."
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddTag}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                                            >
                                                เพิ่ม
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {formData.image_url && (
                                    <div className="mt-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-4">
                                        <div className="h-24 w-24 rounded-xl overflow-hidden shadow-sm bg-white shrink-0">
                                            <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <p className="text-sm font-medium text-gray-900">ตัวอย่างรูปภาพ</p>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{formData.image_url}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition font-medium"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition flex items-center gap-2 font-medium shadow-lg shadow-black/10"
                                    >
                                        <Save size={18} />
                                        บันทึกข้อมูล
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
