"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ProductCollection, Category } from '@/lib/types';
import {
    Plus,
    Edit,
    Trash2,
    X,
    Search,
    Save,
    Folder,
    LayoutGrid,
    List,
    Calculator,
    DollarSign,
    Ruler,
    Link2,
    ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock options for Units and Calculation Methods
const UNIT_OPTIONS = [
    { value: 'm2', label: 'ตารางเมตร (ตร.ม.)' },
    { value: 'sq_yard', label: 'ตารางหลา (ตร.หลา)' },
    { value: 'roll', label: 'ม้วน (Roll)' },
    { value: 'set', label: 'ชุด (Set)' },
    { value: 'piece', label: 'ชิ้น (Piece)' },
    { value: 'yard', label: 'หลา (Yard)' },
    { value: 'meter', label: 'เมตร (Meter)' },
];

const CALC_METHODS = [
    { value: 'area', label: 'คำนวณตามพื้นที่ (ตร.ม.)' },
    { value: 'area_sq_yard', label: 'คำนวณตามพื้นที่ (ตร.หลา)' },
    { value: 'rail_width', label: 'คำนวณตามความกว้างราง' },
    { value: 'box', label: 'คำนวณตามจำนวน (กล่อง/ม้วน)' },
    { value: 'fixed', label: 'ราคาคงที่ (ต่อชิ้น/ชุด)' },
];

export default function AdminCollectionsPage() {
    const [collections, setCollections] = useState<ProductCollection[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState<ProductCollection | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category_id: 0,
        unit: 'm2',
        price_per_unit: '',
        price_per_unit_platform: '',
        calculation_method: 'area',
        min_width: '0.45',
        max_width: '2.40',
        max_height: '3.00',
        min_area: '1.20',
        area_factor: '1.20',
        min_billable_width: '',
        min_billable_height: '',
        width_step: '',
        height_step: '',
        area_rounding: '',
        catalog_url: '',
        portfolio_url: ''
    });

    // Constraint Toggle State
    const [enabledConstraints, setEnabledConstraints] = useState({
        min_width: false,
        max_width: false,
        max_height: false,
        min_area: false,
        area_factor: false,
        min_billable_width: false,
        min_billable_height: false,
        width_step: false,
        height_step: false,
        area_rounding: false
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        if (!supabase) return;
        setLoading(true);

        // Fetch Categories for dropdown
        const { data: catData } = await supabase
            .from('product_categories')
            .select('*')
            .order('name');
        setCategories(catData || []);

        // Fetch Collections with Category info
        const { data: colData, error } = await supabase
            .from('product_collections')
            .select('*, product_categories(name)')
            .order('id', { ascending: false });

        if (error) console.error('Error fetching collections:', error);
        else setCollections(colData || []);

        setLoading(false);
    };

    const handleOpenModal = (collection?: ProductCollection) => {
        // Set default category related values
        const defaultCategory = categories.length > 0 ? categories[0].id : 0;

        if (collection) {
            setEditingCollection(collection);
            setFormData({
                name: collection.name,
                category_id: collection.category_id,
                unit: collection.unit,
                price_per_unit: collection.price_per_unit.toString(),
                price_per_unit_platform: collection.price_per_unit_platform?.toString() || '',
                calculation_method: collection.calculation_method || 'area',
                // @ts-ignore
                min_width: collection.min_width?.toString() || '',
                // @ts-ignore
                max_width: collection.max_width?.toString() || '',
                // @ts-ignore
                max_height: collection.max_height?.toString() || '',
                // @ts-ignore
                min_area: collection.min_area?.toString() || '',
                // @ts-ignore
                area_factor: collection.area_factor?.toString() || '',
                // @ts-ignore
                min_billable_width: collection.min_billable_width?.toString() || '',
                // @ts-ignore
                min_billable_height: collection.min_billable_height?.toString() || '',
                // @ts-ignore
                width_step: collection.width_step?.toString() || '',
                // @ts-ignore
                height_step: collection.height_step?.toString() || '',
                // @ts-ignore
                area_rounding: collection.area_rounding?.toString() || '',
                // @ts-ignore
                catalog_url: collection.catalog_url || '',
                // @ts-ignore
                portfolio_url: collection.portfolio_url || ''
            });

            // Set enabled states based on values
            setEnabledConstraints({
                // @ts-ignore
                min_width: !!collection.min_width,
                // @ts-ignore
                max_width: !!collection.max_width,
                // @ts-ignore
                max_height: !!collection.max_height,
                // @ts-ignore
                min_area: !!collection.min_area,
                // @ts-ignore
                area_factor: !!collection.area_factor,
                // @ts-ignore
                min_billable_width: !!collection.min_billable_width,
                // @ts-ignore
                min_billable_height: !!collection.min_billable_height,
                // @ts-ignore
                width_step: !!collection.width_step,
                // @ts-ignore
                height_step: !!collection.height_step,
                // @ts-ignore
                area_rounding: !!collection.area_rounding
            });
        } else {
            setEditingCollection(null);
            setFormData({
                name: '',
                category_id: defaultCategory,
                unit: 'm2',
                price_per_unit: '',
                price_per_unit_platform: '',
                calculation_method: 'area',
                min_width: '',
                max_width: '',
                max_height: '',
                min_area: '',
                area_factor: '',
                min_billable_width: '',
                min_billable_height: '',
                width_step: '',
                height_step: '',
                area_rounding: '',
                catalog_url: '',
                portfolio_url: ''
            });
            setEnabledConstraints({
                min_width: false,
                max_width: false,
                max_height: false,
                min_area: false,
                area_factor: false,
                min_billable_width: false,
                min_billable_height: false,
                width_step: false,
                height_step: false,
                area_rounding: false
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCollection(null);
    };

    const handleDelete = async (id: number) => {
        if (!supabase) return;
        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบคอลเล็กชันนี้?')) return;

        const { error } = await supabase.from('product_collections').delete().eq('id', id);
        if (error) {
            alert('เกิดข้อผิดพลาดในการลบข้อมูล');
            console.error(error);
        } else {
            fetchData();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return;

        try {
            const dataToSave = {
                name: formData.name,
                category_id: Number(formData.category_id),
                unit: formData.unit,
                price_per_unit: Number(formData.price_per_unit),
                price_per_unit_platform: formData.price_per_unit_platform ? Number(formData.price_per_unit_platform) : 0,
                calculation_method: formData.calculation_method,

                // Save value only if enabled, otherwise null
                min_width: enabledConstraints.min_width && formData.min_width ? Number(formData.min_width) : null,
                max_width: enabledConstraints.max_width && formData.max_width ? Number(formData.max_width) : null,
                max_height: enabledConstraints.max_height && formData.max_height ? Number(formData.max_height) : null,
                min_area: enabledConstraints.min_area && formData.min_area ? Number(formData.min_area) : null,
                area_factor: enabledConstraints.area_factor && formData.area_factor ? Number(formData.area_factor) : null,
                min_billable_width: enabledConstraints.min_billable_width && formData.min_billable_width ? Number(formData.min_billable_width) : null,
                min_billable_height: enabledConstraints.min_billable_height && formData.min_billable_height ? Number(formData.min_billable_height) : null,
                width_step: enabledConstraints.width_step && formData.width_step ? Number(formData.width_step) : null,
                height_step: enabledConstraints.height_step && formData.height_step ? Number(formData.height_step) : null,
                area_rounding: enabledConstraints.area_rounding && formData.area_rounding ? Number(formData.area_rounding) : null,
                catalog_url: formData.catalog_url || null,
                portfolio_url: formData.portfolio_url || null
            };

            if (editingCollection) {
                // Update
                const { error } = await supabase
                    .from('product_collections')
                    .update(dataToSave)
                    .eq('id', editingCollection.id);

                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('product_collections')
                    .insert([dataToSave]);

                if (error) throw error;
            }

            handleCloseModal();
            fetchData();
        } catch (error) {
            console.error('Error saving collection:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const filteredCollections = collections.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // @ts-ignore
        c.product_categories?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 font-sans">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">คอลเล็กชัน (Collections)</h1>
                    <p className="text-gray-500 text-sm mt-1">จัดการกลุ่มสินค้า ราคา และวิธีการคำนวณ</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-black text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-lg shadow-black/10 font-medium cursor-pointer"
                >
                    <Plus size={20} />
                    เพิ่มคอลเล็กชัน
                </button>
            </div>

            {/* Filter & View Controls */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อคอลเล็กชัน หรือ หมวดหมู่..."
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse h-48"></div>
                        ))
                    ) : filteredCollections.map((collection) => (
                        <div key={collection.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300 relative">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button onClick={() => handleOpenModal(collection)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg cursor-pointer"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(collection.id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 rounded-lg cursor-pointer"><Trash2 size={16} /></button>
                            </div>

                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-3 bg-gray-100 rounded-xl text-gray-600">
                                    <Folder size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1 line-clamp-1">{collection.name}</h3>
                                    {/* @ts-ignore */}
                                    <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">{collection.product_categories?.name || 'Unknown Category'}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 flex items-center gap-1.5"><Ruler size={14} /> หน่วย</span>
                                    <span className="font-medium text-gray-900">{UNIT_OPTIONS.find(u => u.value === collection.unit)?.label || collection.unit}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 flex items-center gap-1.5"><DollarSign size={14} /> ราคาปกติ</span>
                                    <span className="font-bold text-gray-900">฿{collection.price_per_unit.toLocaleString()}</span>
                                </div>
                                {collection.price_per_unit_platform > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-purple-500 flex items-center gap-1.5"><DollarSign size={14} /> ราคา Platform</span>
                                        <span className="font-bold text-purple-700">฿{collection.price_per_unit_platform?.toLocaleString()}</span>
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
                        <span className="font-semibold text-gray-400 group-hover:text-black transition-colors">เพิ่มคอลเล็กชัน</span>
                    </button>
                </div>
            ) : (
                /* List View */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 pl-6 font-semibold text-gray-600">ชื่อคอลเล็กชัน</th>
                                <th className="p-4 font-semibold text-gray-600">หมวดหมู่</th>
                                <th className="p-4 font-semibold text-gray-600">หน่วยขาย</th>
                                <th className="p-4 font-semibold text-gray-600">ราคาปกติ</th>
                                <th className="p-4 font-semibold text-gray-600">ราคา Platform</th>
                                <th className="p-4 pr-6 font-semibold text-gray-600 text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCollections.map((col) => (
                                <tr key={col.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 pl-6 font-bold text-gray-900">{col.name}</td>
                                    {/* @ts-ignore */}
                                    <td className="p-4 text-gray-600">{col.product_categories?.name}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700 font-medium">
                                            {UNIT_OPTIONS.find(u => u.value === col.unit)?.label || col.unit}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono font-medium">฿{col.price_per_unit.toLocaleString()}</td>
                                    <td className="p-4 font-mono font-medium text-purple-700">
                                        {col.price_per_unit_platform ? `฿${col.price_per_unit_platform.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="p-4 pr-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleOpenModal(col)} className="p-2 text-gray-400 hover:text-blue-600 transition cursor-pointer"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(col.id)} className="p-2 text-gray-400 hover:text-red-600 transition cursor-pointer"><Trash2 size={18} /></button>
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
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-100"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingCollection ? 'แก้ไขคอลเล็กชัน' : 'เพิ่มคอลเล็กชันใหม่'}
                                </h2>
                                <button onClick={handleCloseModal} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500 cursor-pointer">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อคอลเล็กชัน <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition"
                                            placeholder="เช่น ม่านจีบ รุ่น Premium UV"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">เลือกหมวดหมู่</label>
                                        <select
                                            value={formData.category_id}
                                            onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <div className="relative group">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 transition-colors group-focus-within:text-black">
                                                วิธีการคำนวณ
                                            </label>
                                            <div className="relative">
                                                <Calculator className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={18} />
                                                <select
                                                    value={formData.calculation_method}
                                                    onChange={(e) => {
                                                        const method = e.target.value;
                                                        let newFactor = formData.area_factor;
                                                        let newUnit = formData.unit;

                                                        // Auto-set defaults based on method
                                                        if (method === 'area_sq_yard') {
                                                            newFactor = '1.20';
                                                            newUnit = 'sq_yard';
                                                        } else if (method === 'area') {
                                                            newFactor = '1.00';
                                                            newUnit = 'm2';
                                                        }

                                                        setFormData({
                                                            ...formData,
                                                            calculation_method: method,
                                                            area_factor: newFactor,
                                                            unit: newUnit,
                                                            // Set default step for rail width
                                                            width_step: method === 'rail_width' ? '0.10' : formData.width_step
                                                        });

                                                        // Enable width_step constraint by default for rail_width
                                                        if (method === 'rail_width') {
                                                            setEnabledConstraints(prev => ({
                                                                ...prev,
                                                                width_step: true,
                                                                min_billable_width: true,
                                                                max_height: true
                                                            }));
                                                        }
                                                    }}
                                                    className="w-full pl-12 pr-5 py-3.5 bg-gray-50 text-gray-900 font-medium rounded-xl border-2 border-transparent focus:border-black focus:bg-white focus:outline-none focus:ring-4 focus:ring-black/5 transition-all duration-300 appearance-none cursor-pointer"
                                                >
                                                    {CALC_METHODS.map(m => (
                                                        <option key={m.value} value={m.value}>{m.label}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Rail Width Calculation Constraints */}
                                {formData.calculation_method === 'rail_width' && (
                                    <div className="p-6 bg-[#FAFAFA] rounded-2xl border border-dashed border-gray-200 space-y-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg text-purple-700 shadow-sm">
                                                <Ruler size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-base">เงื่อนไขการคำนวณราง</h3>
                                                <p className="text-xs text-gray-500">กำหนดเงื่อนไขสำหรับรางม่าน</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {[
                                                { id: 'min_billable_width', label: 'ความกว้างขั้นต่ำคิดราคา', placeholder: '1.00', unit: 'เมตร', isHighlight: true },
                                                { id: 'width_step', label: 'คิดราคาทุกๆ (Step)', placeholder: '0.10', unit: 'เมตร', isHighlight: true },
                                                { id: 'max_height', label: 'ความสูงสูงสุด (Max Height)', placeholder: '3.00', unit: 'เมตร' },
                                            ].map((field) => (
                                                <div key={field.id} className={`group relative transition-all duration-300 ${!enabledConstraints[field.id as keyof typeof enabledConstraints] ? 'opacity-40' : ''}`}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <label className={`block text-[10px] font-bold uppercase tracking-widest transition-colors ${field.isHighlight && enabledConstraints[field.id as keyof typeof enabledConstraints] ? 'text-orange-500' : 'text-gray-400 group-focus-within:text-black'}`}>
                                                            {field.label}
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEnabledConstraints(prev => ({ ...prev, [field.id]: !prev[field.id as keyof typeof enabledConstraints] }))}
                                                            className={`relative w-9 h-5 rounded-full transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer ${enabledConstraints[field.id as keyof typeof enabledConstraints] ? (field.isHighlight ? 'bg-orange-500' : 'bg-black') : 'bg-gray-300'}`}
                                                        >
                                                            <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${enabledConstraints[field.id as keyof typeof enabledConstraints] ? 'translate-x-4' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            // @ts-ignore
                                                            value={formData[field.id] || ''}
                                                            // @ts-ignore
                                                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                                            disabled={!enabledConstraints[field.id as keyof typeof enabledConstraints]}
                                                            className={`w-full pl-4 pr-14 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all shadow-sm text-sm font-bold font-mono disabled:cursor-not-allowed disabled:bg-gray-100 ${field.isHighlight && enabledConstraints[field.id as keyof typeof enabledConstraints] ? 'border-orange-200 text-orange-900 bg-orange-50/30' : 'border-gray-200 text-gray-900 bg-white'}`}
                                                            placeholder={enabledConstraints[field.id as keyof typeof enabledConstraints] ? field.placeholder : '-'}
                                                        />
                                                        <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold ${field.isHighlight && enabledConstraints[field.id as keyof typeof enabledConstraints] ? 'text-orange-400' : 'text-gray-400'}`}>
                                                            {field.unit}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Area Calculation Constraints - Toggleable */}
                                {(formData.calculation_method === 'area' || formData.calculation_method === 'area_sq_yard') && (
                                    <div className="p-6 bg-[#FAFAFA] rounded-2xl border border-dashed border-gray-200 space-y-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg text-blue-700 shadow-sm">
                                                <Ruler size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-base">เงื่อนไขการคำนวณพื้นที่</h3>
                                                <p className="text-xs text-gray-500">เลือกเปิดใช้งานเงื่อนไขที่ต้องการ</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {[
                                                { id: 'min_width', label: 'ความกว้างต่ำสุด (Min Width)', placeholder: '0.45', unit: 'เมตร' },
                                                { id: 'max_width', label: 'ความกว้างสูงสุด (Max Width)', placeholder: '2.40', unit: 'เมตร' },
                                                { id: 'max_height', label: 'ความสูงสูงสุด (Max Height)', placeholder: '3.00', unit: 'เมตร' },
                                                { id: 'min_billable_width', label: 'ความกว้างขั้นต่ำคิดราคา', placeholder: '1.00', unit: 'เมตร', isHighlight: true },
                                                { id: 'min_billable_height', label: 'ความสูงขั้นต่ำคิดราคา', placeholder: '2.00', unit: 'เมตร', isHighlight: true },
                                                { id: 'height_step', label: 'คิดความสูงทุกๆ (Step)', placeholder: '0.20', unit: 'เมตร', isHighlight: true },
                                                { id: 'min_area', label: 'พื้นที่ขั้นต่ำ (Min Area)', placeholder: '2.5', unit: formData.unit === 'sq_yard' ? 'ตร.หลา' : 'ตร.ม.' },
                                                { id: 'area_factor', label: 'ตัวคูณพื้นที่ (Factor)', placeholder: '1.20', unit: 'X' },
                                                { id: 'area_rounding', label: 'ปัดเศษพื้นที่ขึ้นเป็น (Rounding)', placeholder: '0.50', unit: formData.unit === 'sq_yard' ? 'ตร.หลา' : 'ตร.ม.', isHighlight: true },
                                            ].map((field) => (
                                                <div key={field.id} className={`group relative transition-all duration-300 ${!enabledConstraints[field.id as keyof typeof enabledConstraints] ? 'opacity-40' : ''}`}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <label className={`block text-[10px] font-bold uppercase tracking-widest transition-colors ${field.isHighlight && enabledConstraints[field.id as keyof typeof enabledConstraints] ? 'text-orange-500' : 'text-gray-400 group-focus-within:text-black'}`}>
                                                            {field.label}
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEnabledConstraints(prev => ({ ...prev, [field.id]: !prev[field.id as keyof typeof enabledConstraints] }))}
                                                            className={`relative w-9 h-5 rounded-full transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer ${enabledConstraints[field.id as keyof typeof enabledConstraints] ? (field.isHighlight ? 'bg-orange-500' : 'bg-black') : 'bg-gray-300'}`}
                                                        >
                                                            <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${enabledConstraints[field.id as keyof typeof enabledConstraints] ? 'translate-x-4' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            // @ts-ignore
                                                            value={formData[field.id] || ''}
                                                            // @ts-ignore
                                                            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                                            disabled={!enabledConstraints[field.id as keyof typeof enabledConstraints]}
                                                            className={`w-full pl-4 pr-14 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all shadow-sm text-sm font-bold font-mono disabled:cursor-not-allowed disabled:bg-gray-100 ${field.isHighlight && enabledConstraints[field.id as keyof typeof enabledConstraints] ? 'border-orange-200 text-orange-900 bg-orange-50/30' : 'border-gray-200 text-gray-900 bg-white'}`}
                                                            placeholder={enabledConstraints[field.id as keyof typeof enabledConstraints] ? field.placeholder : '-'}
                                                        />
                                                        <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold ${field.isHighlight && enabledConstraints[field.id as keyof typeof enabledConstraints] ? 'text-orange-400' : 'text-gray-400'}`}>
                                                            {field.unit}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="p-6 bg-[#FAFAFA] rounded-2xl border border-dashed border-gray-200 space-y-6">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <DollarSign size={18} className="text-green-600" />
                                        ตั้งค่าราคาและหน่วย
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">หน่วยขาย (Unit)</label>
                                            <select
                                                value={formData.unit}
                                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition text-sm"
                                            >
                                                {UNIT_OPTIONS.map(u => (
                                                    <option key={u.value} value={u.value}>{u.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">ราคาขายปกติ</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    required
                                                    min="0"
                                                    value={formData.price_per_unit}
                                                    onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition text-sm font-mono"
                                                    placeholder="0.00"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">บาท</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">ราคาขายโปรฯ (Platform)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={formData.price_per_unit_platform}
                                                    onChange={(e) => setFormData({ ...formData, price_per_unit_platform: e.target.value })}
                                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition text-sm font-mono text-purple-700"
                                                    placeholder="0.00"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">บาท</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">* ราคา Platform คือราคาที่ใช้คำนวณเมื่อลูกค้าสั่งซื้อผ่านหน้าเว็บ (ถ้าไม่ใส่จะใช้ราคาปกติ)</p>
                                </div>

                                <div className="p-6 bg-[#FAFAFA] rounded-2xl border border-dashed border-gray-200 space-y-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Link2 size={18} className="text-blue-600" />
                                        ลิงก์ที่เกี่ยวข้อง
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">🗂️ ดูแคตตาล็อก (Catalog URL)</label>
                                            <input
                                                type="url"
                                                value={formData.catalog_url}
                                                onChange={(e) => setFormData({ ...formData, catalog_url: e.target.value })}
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
                                                placeholder="https://example.com/catalog"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">🏗️ ผลงานการผลิตและติดตั้ง (Portfolio URL)</label>
                                            <input
                                                type="url"
                                                value={formData.portfolio_url}
                                                onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
                                                placeholder="https://example.com/portfolio"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">* ลิงก์เหล่านี้จะแสดงให้ลูกค้าเห็นในหน้าคำนวณราคา</p>
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition font-medium cursor-pointer"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition flex items-center gap-2 font-medium shadow-lg shadow-black/10 cursor-pointer"
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
