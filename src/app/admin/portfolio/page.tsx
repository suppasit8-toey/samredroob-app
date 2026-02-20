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
    Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CldUploadWidget, CloudinaryUploadWidgetResults } from 'next-cloudinary';
import { PRODUCT_CATEGORIES } from '@/lib/constants';

// Define Type locally or in types file
interface PortfolioItem {
    id: number;
    title_th: string;
    title_en?: string;
    description_th?: string;
    description_en?: string;
    image_url?: string;
    category?: string;
    categories?: string[];
    product_collection_id?: number | null;
    product_variant_ids?: number[] | null;
    created_at?: string;
    // Joined fields
    product_collections?: { name: string };
    product_variants?: { id: number, name: string }[]; // We might need to fetch this separately or via join
}

interface Collection {
    id: number;
    name: string;
}

interface Variant {
    id: number;
    name: string;
    collection_id: number;
}

export default function AdminPortfolioPage() {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [variants, setVariants] = useState<Variant[]>([]);

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
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
        categories: [] as string[],
        product_collection_id: '' as string | number, // Use string for select input handling
        product_variant_ids: [] as number[]
    });

    useEffect(() => {
        fetchItems();
        fetchCollections();
        fetchVariants();
    }, []);

    const fetchCollections = async () => {
        if (!supabase) return;
        const { data, error } = await supabase
            .from('product_collections')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            console.error('Error fetching collections:', error);
        } else {
            console.log('Fetched collections:', data);
            setCollections(data || []);
        }
    };

    const fetchVariants = async () => {
        if (!supabase) return;
        const { data, error } = await supabase
            .from('product_variants')
            .select('id, name, collection_id')
            .order('name');

        if (error) {
            console.error('Error fetching variants:', error);
        } else {
            setVariants(data || []);
        }
    };

    const fetchItems = async () => {
        if (!supabase) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('portfolio_items')
            .select(`
                *,
                product_collections ( name )
            `)
            .order('id', { ascending: false });

        if (error) {
            console.error('Error fetching portfolio:', error);
        } else {
            setItems(data || []);
        }
        setLoading(false);
    };

    const handleOpenModal = (item?: PortfolioItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title_th: item.title_th,
                title_en: item.title_en || '',
                description_th: item.description_th || '',
                description_en: item.description_en || '',
                image_url: item.image_url || '',
                categories: item.categories || (item.category ? [item.category] : []),
                product_collection_id: item.product_collection_id || '',
                product_variant_ids: item.product_variant_ids || []
            });
        } else {
            setEditingItem(null);
            setFormData({
                title_th: '',
                title_en: '',
                description_th: '',
                description_en: '',
                image_url: '',
                categories: [],
                product_collection_id: '',
                product_variant_ids: []
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
        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบผลงานนี้?')) return;

        const { error } = await supabase.from('portfolio_items').delete().eq('id', id);
        if (error) {
            alert('เกิดข้อผิดพลาดในการลบข้อมูล');
            console.error(error);
        } else {
            fetchItems();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return;

        try {
            // Auto-generate title from selected catalog
            let titleToSave = formData.title_th;
            if (formData.product_collection_id) {
                const selectedCollection = collections.find(c => c.id === Number(formData.product_collection_id));
                if (selectedCollection) {
                    titleToSave = selectedCollection.name;
                }
            }

            if (!titleToSave) {
                alert('กรุณาเลือกเล่มตัวอย่าง (Catalog)');
                return;
            }

            if (formData.categories.length === 0) {
                alert('กรุณาเลือกหมวดหมู่');
                return;
            }

            if (!formData.image_url) {
                alert('กรุณาอัปโหลดรูปภาพ');
                return;
            }

            const dataToSave = {
                title_th: titleToSave,
                title_en: formData.title_en, // Optional, can be empty
                description_th: formData.description_th, // Optional
                description_en: formData.description_en, // Optional
                image_url: formData.image_url,
                categories: formData.categories,
                category: formData.categories[0] || null,
                product_collection_id: formData.product_collection_id || null,
                product_variant_ids: formData.product_variant_ids
            };

            if (editingItem) {
                // Update
                const { error } = await supabase
                    .from('portfolio_items')
                    .update(dataToSave)
                    .eq('id', editingItem.id);

                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('portfolio_items')
                    .insert([dataToSave]);

                if (error) throw error;
            }

            handleCloseModal();
            fetchItems();
        } catch (error) {
            console.error('Error saving portfolio:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const filteredItems = items.filter(item =>
        item.title_th.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.title_en && item.title_en.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 font-sans">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ImageIcon className="text-black" />
                        จัดการผลงาน (Portfolio)
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">เพิ่ม ลบ แก้ไข รายการผลงานติดตั้ง</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-black text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-lg shadow-black/10 font-medium cursor-pointer"
                >
                    <Plus size={20} />
                    เพิ่มผลงานใหม่
                </button>
            </div>

            {/* Filter & View Controls */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาผลงาน..."
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
                    ) : filteredItems.map((item) => (
                        <div key={item.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 relative">
                            <div className="h-48 bg-gray-50 overflow-hidden relative flex items-center justify-center">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.title_th} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="text-gray-300 flex flex-col items-center gap-2">
                                        <ImageIcon size={40} />
                                        <span className="text-xs font-medium">No Image</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-200">
                                    <button onClick={() => handleOpenModal(item)} className="p-2 bg-white text-gray-700 rounded-full hover:text-blue-600 shadow-sm cursor-pointer border border-gray-100"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-white text-gray-700 rounded-full hover:text-red-600 shadow-sm cursor-pointer border border-gray-100"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div className="p-5 border-t border-gray-50">
                                <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{item.title_th}</h3>
                                {item.title_en && <p className="text-sm text-gray-500 mb-2 line-clamp-1">{item.title_en}</p>}
                                <div className="flex gap-1 flex-wrap mb-2">
                                    {(item.categories && item.categories.length > 0 ? item.categories : [item.category]).map((catId, idx) => (
                                        catId ? (
                                            <span key={idx} className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                                                {PRODUCT_CATEGORIES.find(c => c.id === catId)?.name || catId || 'General'}
                                            </span>
                                        ) : null
                                    ))}
                                </div>
                                {item.product_collections && (
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <span className="font-semibold text-black">{item.product_collections?.name}</span>
                                        {item.product_variant_ids && item.product_variant_ids.length > 0 && (
                                            <span>(+{item.product_variant_ids.length} options)</span>
                                        )}
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
                        <span className="font-semibold text-gray-400 group-hover:text-black transition-colors">เพิ่มผลงานใหม่</span>
                    </button>
                </div>
            ) : (
                /* List View (Table) */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 pl-6 font-semibold text-gray-600 w-24">Image</th>
                                <th className="p-4 font-semibold text-gray-600">Title (TH)</th>
                                <th className="p-4 font-semibold text-gray-600">Title (EN)</th>
                                <th className="p-4 font-semibold text-gray-600">Category</th>
                                <th className="p-4 pr-6 font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 pl-6">
                                        <div className="w-16 h-12 rounded-lg bg-gray-50 overflow-hidden border border-gray-100 flex items-center justify-center">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.title_th} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon size={20} className="text-gray-300" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-gray-900">{item.title_th}</td>
                                    <td className="p-4 text-gray-600">{item.title_en || '-'}</td>
                                    <td className="p-4">
                                        <div className="flex gap-1 flex-wrap max-w-[200px]">
                                            {(item.categories && item.categories.length > 0 ? item.categories : [item.category]).slice(0, 3).map((catId, idx) => (
                                                catId ? (
                                                    <span key={idx} className="px-2 py-1 bg-gray-100 text-xs rounded-md whitespace-nowrap">
                                                        {PRODUCT_CATEGORIES.find(c => c.id === catId)?.name || catId || '-'}
                                                    </span>
                                                ) : null
                                            ))}
                                            {(item.categories?.length || 0) > 3 && (
                                                <span className="text-xs text-gray-400">+{item.categories!.length - 3}</span>
                                            )}
                                        </div>
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
                                    {editingItem ? 'แก้ไขผลงาน' : 'เพิ่มผลงานใหม่'}
                                </h2>
                                <button onClick={handleCloseModal} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500 cursor-pointer">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-6">
                                    {/* Category Selection */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">หมวดหมู่ (เลือก 1 รายการ) <span className="text-red-500">*</span></label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {PRODUCT_CATEGORIES.map((cat) => {
                                                const isSelected = formData.categories.includes(cat.id);
                                                return (
                                                    <label
                                                        key={cat.id}
                                                        className={`
                                                            flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer transition-all
                                                            ${isSelected ? 'bg-black text-white border-black shadow-md' : 'bg-white hover:bg-gray-50'}
                                                        `}
                                                    >
                                                        <div className={`
                                                            w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                                                            ${isSelected ? 'bg-white border-white' : 'border-gray-300'}
                                                        `}>
                                                            {isSelected && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                                                        </div>
                                                        <input
                                                            type="radio"
                                                            name="category"
                                                            checked={isSelected}
                                                            onChange={() => setFormData(prev => ({ ...prev, categories: [cat.id] }))}
                                                            className="hidden"
                                                        />
                                                        <span className="text-sm font-medium">{cat.name}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Catalog Selection */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">เลือกเล่มตัวอย่าง (Catalog) <span className="text-red-500">*</span></label>
                                        <select
                                            required
                                            value={formData.product_collection_id}
                                            onChange={(e) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    product_collection_id: e.target.value,
                                                    product_variant_ids: [] // Reset variants when catalog changes
                                                }));
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition outline-none"
                                        >
                                            <option value="">-- กรุณาเลือกเล่มตัวอย่าง --</option>
                                            {collections.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-400 mt-1">ชื่อผลงานจะถูกตั้งตามชื่อเล่มตัวอย่างโดยอัตโนมัติ</p>
                                    </div>

                                    {/* Options Selection */}
                                    {formData.product_collection_id && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                เลือกรายการสินค้า (Options)
                                                <span className="ml-2 text-gray-400 font-normal">เลือกได้หลายรายการ</span>
                                            </label>
                                            <div className="max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-xl border border-gray-100 grid grid-cols-1 gap-2">
                                                {variants.filter(v => v.collection_id === Number(formData.product_collection_id)).length > 0 ? (
                                                    variants
                                                        .filter(v => v.collection_id === Number(formData.product_collection_id))
                                                        .map(v => {
                                                            const isSelected = formData.product_variant_ids.includes(v.id);
                                                            return (
                                                                <label key={v.id} className="flex items-center gap-3 cursor-pointer hover:bg-black/5 p-2 rounded-lg transition">
                                                                    <div className={`
                                                                        w-5 h-5 rounded border flex items-center justify-center transition-colors
                                                                        ${isSelected ? 'bg-black border-black' : 'bg-white border-gray-300'}
                                                                    `}>
                                                                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                                                    </div>
                                                                    <input
                                                                        type="checkbox"
                                                                        className="hidden"
                                                                        checked={isSelected}
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) {
                                                                                setFormData(prev => ({
                                                                                    ...prev,
                                                                                    product_variant_ids: [...prev.product_variant_ids, v.id]
                                                                                }));
                                                                            } else {
                                                                                setFormData(prev => ({
                                                                                    ...prev,
                                                                                    product_variant_ids: prev.product_variant_ids.filter(id => id !== v.id)
                                                                                }));
                                                                            }
                                                                        }}
                                                                    />
                                                                    <span className="text-sm text-gray-700">{v.name}</span>
                                                                </label>
                                                            );
                                                        })
                                                ) : (
                                                    <div className="text-gray-400 text-sm p-2 text-center">ไม่มีรายการสินค้าในเล่มนี้</div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">รูปภาพผลงาน <span className="text-red-500">*</span></label>
                                        {formData.image_url ? (
                                            <div className="relative p-4 bg-gray-50 rounded-2xl border border-gray-200 group">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-24 w-24 rounded-xl overflow-hidden shadow-sm bg-white shrink-0 border border-gray-100 flex items-center justify-center text-gray-400">
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
                                                options={{ maxFiles: 1, resourceType: 'image', folder: 'samredroob/portfolio' }}
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
