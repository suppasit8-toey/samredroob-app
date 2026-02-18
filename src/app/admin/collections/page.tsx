"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ProductCollection, Category, Brand, ProductVariant } from '@/lib/types';
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
    ImageIcon,
    Upload,
    Copy,
    ChevronDown,
    ChevronUp
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
    { value: 'width_range', label: 'Step ราคาตามความกว้าง' },
    { value: 'width_height_range', label: 'Step ราคาตามความกว้างและสูง' },
];


const renderCollectionPrice = (col: ProductCollection, isPlatform = false) => {
    if (col.calculation_method === 'width_range' && Array.isArray(col.price_data)) {
        const prices = col.price_data
            .map((step: any) => isPlatform ? Number(step.price_platform || 0) : Number(step.price))
            .filter((p: number) => p > 0); // Filter out 0 or invalid prices

        if (prices.length > 0) {
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            return min === max
                ? `฿${min.toLocaleString()}`
                : `฿${min.toLocaleString()} - ฿${max.toLocaleString()}`;
        }
    }

    if (col.calculation_method === 'width_height_range' && Array.isArray(col.price_data)) {
        const prices = col.price_data
            .map((step: any) => isPlatform ? Number(step.price_platform || 0) : Number(step.price))
            .filter((p: number) => p > 0);

        if (prices.length > 0) {
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            return min === max
                ? `฿${min.toLocaleString()}`
                : `฿${min.toLocaleString()} - ฿${max.toLocaleString()}`;
        }
    }

    const price = isPlatform ? col.price_per_unit_platform : col.price_per_unit;
    return price ? `฿${price.toLocaleString()}` : '-';
};

export default function AdminCollectionsPage() {
    const [collections, setCollections] = useState<ProductCollection[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState<ProductCollection | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');

    // Tag State
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    // Variants State
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [variantsLoading, setVariantsLoading] = useState(false);
    const [newVariantCode, setNewVariantCode] = useState('');
    const [newVariantDescription, setNewVariantDescription] = useState('');

    // UI State
    const [isConstraintsExpanded, setIsConstraintsExpanded] = useState(false);

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
        portfolio_url: '',
        brand_id: '',
        price_data: [] as any[] // For width_range steps
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
        fetchCollections();
        fetchCategories();
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        if (!supabase) return;
        const { data, error } = await supabase
            .from('product_brands')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching brands:', error);
        } else {
            setBrands(data || []);
        }
    };

    const fetchCategories = async () => {
        if (!supabase) return;
        const { data: catData, error } = await supabase
            .from('product_categories')
            .select('*')
            .order('name');
        if (error) console.error('Error fetching categories:', error);
        else setCategories(catData || []);
    };

    const fetchCollections = async () => {
        if (!supabase) return;
        setLoading(true);

        // Fetch Collections with Category and Brand info
        const { data: colData, error } = await supabase
            .from('product_collections')
            // Using single line to avoid build parsing issues
            .select('*, product_categories(id, name), product_brands(id, name, logo_url)')
            .order('id', { ascending: false });

        if (error) console.error('Error fetching collections:', error);
        else setCollections(colData || []);

        setLoading(false);
    };

    const fetchVariants = async (collectionId: number) => {
        if (!supabase) return;
        setVariantsLoading(true);
        const { data, error } = await supabase
            .from('product_variants')
            .select('*')
            .eq('collection_id', collectionId)
            .order('name');

        if (error) console.error('Error fetching variants:', error);
        else setVariants(data || []);
        setVariantsLoading(false);
    };

    const handleAddVariant = async () => {
        if (!newVariantCode.trim() || !supabase) return;

        try {
            if (editingCollection) {
                // Edit Mode - Add to DB immediately
                const { error } = await supabase
                    .from('product_variants')
                    .insert([{
                        collection_id: editingCollection.id,
                        name: newVariantCode.trim(),
                        description: newVariantDescription.trim() || null,
                        in_stock: true
                    }]);

                if (error) throw error;
                fetchVariants(editingCollection.id);
            } else {
                // Create Mode - Add to local state with temp ID
                const newVariant: ProductVariant = {
                    id: -(Date.now()), // Temp ID
                    collection_id: 0,
                    name: newVariantCode.trim(),
                    description: newVariantDescription.trim() || undefined,
                    in_stock: true,
                    created_at: new Date().toISOString()
                };
                setVariants([...variants, newVariant]);
            }

            setNewVariantCode('');
            setNewVariantDescription('');
        } catch (error) {
            console.error('Error adding variant:', error);
            alert('ไม่สามารถเพิ่มรหัสสินค้าได้');
        }
    };

    const handleDeleteVariant = async (id: number) => {
        if (!confirm('ต้องการลบรหัสสินค้านี้?')) return;

        if (id < 0) {
            // Local delete
            setVariants(variants.filter(v => v.id !== id));
            return;
        }

        if (!supabase) return;

        try {
            const { error } = await supabase
                .from('product_variants')
                .delete()
                .eq('id', id);

            if (error) throw error;

            if (editingCollection) fetchVariants(editingCollection.id);
        } catch (error) {
            console.error('Error deleting variant:', error);
            alert('ลบรายการไม่สำเร็จ');
        }
    };

    const handleToggleVariantStock = async (id: number, currentStatus: boolean) => {
        if (id < 0) {
            setVariants(variants.map(v => v.id === id ? { ...v, in_stock: !v.in_stock } : v));
            return;
        }

        if (!supabase) return;

        try {
            const { error } = await supabase
                .from('product_variants')
                .update({ in_stock: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            if (editingCollection) fetchVariants(editingCollection.id);
        } catch (error) {
            console.error('Error toggling status:', error);
        }
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
                portfolio_url: collection.portfolio_url || '',
                brand_id: collection.brand_id?.toString() || '',
                price_data: collection.price_data || []
            });

            setTags(collection.tags || []);

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

            // Fetch variants
            fetchVariants(collection.id);
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
                portfolio_url: '',
                brand_id: '',
                price_data: []
            });
            setTags([]);
            setVariants([]);
            setNewVariantCode('');
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
        setVariants([]);
        setFormData(prev => ({ ...prev, price_data: [] }));
    };

    const handleDuplicate = async (collection: ProductCollection) => {
        // Set default category related values
        // const defaultCategory = categories.length > 0 ? categories[0].id : 0;

        setEditingCollection(null); // Treat as new
        setFormData({
            name: `${collection.name} (Copy)`,
            category_id: collection.category_id,
            unit: collection.unit,
            price_per_unit: collection.price_per_unit?.toString() || '',
            price_per_unit_platform: collection.price_per_unit_platform?.toString() || '',
            calculation_method: collection.calculation_method || 'area',
            min_width: collection.min_width?.toString() || '',
            max_width: collection.max_width?.toString() || '',
            max_height: collection.max_height?.toString() || '',
            min_area: collection.min_area?.toString() || '',
            area_factor: collection.area_factor?.toString() || '',
            min_billable_width: collection.min_billable_width?.toString() || '',
            min_billable_height: collection.min_billable_height?.toString() || '',
            width_step: collection.width_step?.toString() || '',
            height_step: collection.height_step?.toString() || '',
            area_rounding: collection.area_rounding?.toString() || '',
            catalog_url: collection.catalog_url || '',
            portfolio_url: collection.portfolio_url || '',
            brand_id: collection.brand_id?.toString() || '',
            price_data: collection.price_data || []
        });

        setTags(collection.tags || []);

        // Fetch variants from the original collection to copy
        const { data: sourceVariants } = await supabase!.from('product_variants').select('*').eq('collection_id', collection.id);
        if (sourceVariants && sourceVariants.length > 0) {
            // Map to variants with temporary negative IDs and mark as 'new' (though we don't have a special field, negative ID implies new)
            const variantsToCopy = sourceVariants.map((v, index) => ({
                ...v,
                id: -(index + 1), // Temporary ID
                collection_id: 0, // Not yet assigned
                created_at: new Date().toISOString()
            }));
            setVariants(variantsToCopy);
        } else {
            setVariants([]);
        }

        setNewVariantCode('');

        // Set enabled states based on values to ensure fields are shown
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

        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!supabase) return;
        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบคอลเล็กชันนี้?')) return;

        const { error } = await supabase.from('product_collections').delete().eq('id', id);
        if (error) {
            alert('เกิดข้อผิดพลาดในการลบข้อมูล');
            console.error(error);
        } else {
            fetchCollections();
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
                price_per_unit_platform: formData.price_per_unit_platform ? Number(formData.price_per_unit_platform) : null,
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
                portfolio_url: formData.portfolio_url || null,
                brand_id: formData.brand_id ? Number(formData.brand_id) : null,
                tags: tags,
                price_data: formData.price_data // Save price steps
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
                const { data: newCollection, error } = await supabase
                    .from('product_collections')
                    .insert([dataToSave])
                    .select()
                    .single();

                if (error) throw error;

                // Handle Variants (from local state)
                if (newCollection && variants.length > 0) {
                    const variantsToInsert = variants.map(v => ({
                        collection_id: newCollection.id,
                        name: v.name,
                        description: v.description,
                        in_stock: v.in_stock !== undefined ? v.in_stock : true,
                    }));

                    const { error: variantError } = await supabase
                        .from('product_variants')
                        .insert(variantsToInsert);

                    if (variantError) {
                        console.error('Error copying variants:', variantError);
                        alert('สร้างคอลเล็กชันสำเร็จ แต่บันทึกรหัสสินค้าไม่สำเร็จ');
                    }
                }


            }

            handleCloseModal();
            fetchCollections();
        } catch (error) {
            console.error('Error saving collection full object:', JSON.stringify(error, null, 2));
            // @ts-ignore
            if (error.message) console.error('Error message:', error.message);
            // @ts-ignore
            if (error.details) console.error('Error details:', error.details);
            // @ts-ignore
            if (error.hint) console.error('Error hint:', error.hint);

            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + (error as any)?.message || 'Unknown error');
        }
    };

    const filteredCollections = collections.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            // @ts-ignore
            c.product_categories?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            // @ts-ignore
            c.product_brands?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = selectedCategory === 'all' || c.category_id === selectedCategory;

        return matchesSearch && matchesCategory;
    });

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
                        placeholder="ค้นหาชื่อคอลเล็กชัน, หมวดหมู่ หรือ Tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition"
                    />
                </div>

                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="py-2.5 px-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition w-full md:w-auto md:min-w-[200px]"
                >
                    <option value="all">ทุกหมวดหมู่</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'
                            }`}
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
                            <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDuplicate(collection)} className="p-2 md:p-1.5 text-gray-400 hover:text-green-600 bg-gray-50 rounded-lg cursor-pointer" title="คัดลอก"><Copy size={16} /></button>
                                <button onClick={() => handleOpenModal(collection)} className="p-2 md:p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg cursor-pointer"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(collection.id)} className="p-2 md:p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 rounded-lg cursor-pointer"><Trash2 size={16} /></button>
                            </div>

                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-3 bg-gray-100 rounded-xl text-gray-600">
                                    <Folder size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1 line-clamp-1">{collection.name}</h3>
                                    <div className="flex gap-2 mb-1">
                                        {collection.product_brands && (
                                            <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md border border-gray-200 flex items-center gap-1">
                                                {/* @ts-ignore */}
                                                {collection.product_brands.logo_url && <img src={collection.product_brands.logo_url} className="w-3 h-3 object-contain" />}
                                                {/* @ts-ignore */}
                                                {collection.product_brands.name}
                                            </span>
                                        )}
                                        {/* @ts-ignore */}
                                        <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">{collection.product_categories?.name || 'Unknown Category'}</span>
                                    </div>
                                    {collection.tags && collection.tags.length > 0 && (
                                        <div className="flex gap-1 mt-1 flex-wrap">
                                            {collection.tags.map((tag, idx) => (
                                                <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-md font-medium border border-gray-200">{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 flex items-center gap-1.5"><Ruler size={14} /> หน่วย</span>
                                    <span className="font-medium text-gray-900">{UNIT_OPTIONS.find(u => u.value === collection.unit)?.label || collection.unit}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 flex items-center gap-1.5"><DollarSign size={14} /> ราคาปกติ</span>
                                    <span className="font-bold text-gray-900">{renderCollectionPrice(collection)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-purple-500 flex items-center gap-1.5"><DollarSign size={14} /> ราคา Platform</span>
                                    <span className="font-bold text-purple-700">{renderCollectionPrice(collection, true)}</span>
                                </div>
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
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 pl-6 font-semibold text-gray-600">ชื่อคอลเล็กชัน</th>
                                    <th className="p-4 font-semibold text-gray-600">แบรนด์</th>
                                    <th className="p-4 font-semibold text-gray-600">หมวดหมู่</th>
                                    <th className="p-4 font-semibold text-gray-600">Tags</th>
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
                                        <td className="p-4 text-gray-600">{col.product_brands?.name || '-'}</td>
                                        {/* @ts-ignore */}
                                        <td className="p-4 text-gray-600">{col.product_categories?.name}</td>
                                        <td className="p-4">
                                            <div className="flex gap-1 flex-wrap max-w-[200px]">
                                                {col.tags && col.tags.slice(0, 3).map((tag, idx) => (
                                                    <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-md font-medium border border-gray-200">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {col.tags && col.tags.length > 3 && (
                                                    <span className="text-[10px] px-1.5 py-0.5 text-gray-400">+{col.tags.length - 3}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700 font-medium">
                                                {UNIT_OPTIONS.find(u => u.value === col.unit)?.label || col.unit}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono font-medium">{renderCollectionPrice(col)}</td>
                                        <td className="p-4 font-mono font-medium text-purple-700">
                                            {renderCollectionPrice(col, true)}
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleDuplicate(col)} className="p-2 text-gray-400 hover:text-green-600 transition cursor-pointer" title="คัดลอก"><Copy size={18} /></button>
                                                <button onClick={() => handleOpenModal(col)} className="p-2 text-gray-400 hover:text-blue-600 transition cursor-pointer"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete(col.id)} className="p-2 text-gray-400 hover:text-red-600 transition cursor-pointer"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card List */}
                    <div className="md:hidden space-y-3">
                        {filteredCollections.map((col) => (
                            <div key={col.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 text-base truncate">{col.name}</h3>
                                        <div className="flex gap-2 mt-1">
                                            {col.product_brands && (
                                                <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md border border-gray-200 flex items-center gap-1">
                                                    {/* @ts-ignore */}
                                                    {col.product_brands.logo_url && <img src={col.product_brands.logo_url} className="w-3 h-3 object-contain" />}
                                                    {/* @ts-ignore */}
                                                    {col.product_brands.name}
                                                </span>
                                            )}
                                            {/* @ts-ignore */}
                                            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">{col.product_categories?.name || 'Unknown'}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        <button onClick={() => handleDuplicate(col)} className="p-2 text-gray-400 hover:text-green-600 bg-gray-50 rounded-lg cursor-pointer"><Copy size={16} /></button>
                                        <button onClick={() => handleOpenModal(col)} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg cursor-pointer"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(col.id)} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded-lg cursor-pointer"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                {col.tags && col.tags.length > 0 && (
                                    <div className="flex gap-1 flex-wrap mt-2">
                                        {col.tags.slice(0, 3).map((tag, idx) => (
                                            <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-md font-medium border border-gray-200">{tag}</span>
                                        ))}
                                        {col.tags.length > 3 && (
                                            <span className="text-[10px] px-1.5 py-0.5 text-gray-400">+{col.tags.length - 3}</span>
                                        )}
                                    </div>
                                )}
                                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-400 text-xs">ราคาปกติ</span>
                                        <p className="font-bold font-mono text-gray-900">{renderCollectionPrice(col)}</p>
                                    </div>
                                    <div>
                                        <span className="text-purple-400 text-xs">ราคา Platform</span>
                                        <p className="font-bold font-mono text-purple-700">
                                            {renderCollectionPrice(col, true)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center md:p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] md:max-h-[90vh] flex flex-col border border-gray-100"
                        >
                            <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                                    {editingCollection ? 'แก้ไขคอลเล็กชัน' : 'เพิ่มคอลเล็กชันใหม่'}
                                </h2>
                                <button onClick={handleCloseModal} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500 cursor-pointer">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-5 md:space-y-6 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-1 md:col-span-2">
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

                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Brand (ยี่ห้อ)</label>
                                        <select
                                            value={formData.brand_id}
                                            onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition appearance-none cursor-pointer"
                                        >
                                            <option value="">-- ไม่ระบุ --</option>
                                            {brands.map(brand => (
                                                <option key={brand.id} value={brand.id}>{brand.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Tag Input */}
                                    <div className="col-span-1 md:col-span-2">
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
                                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300">
                                        <div
                                            className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => setIsConstraintsExpanded(!isConstraintsExpanded)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg text-purple-700 shadow-sm">
                                                    <Ruler size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-base">เงื่อนไขการคำนวณราง</h3>
                                                    <p className="text-xs text-gray-500">
                                                        {isConstraintsExpanded ? 'คลิกเพื่อซ่อนเงื่อนไข' : 'คลิกเพื่อกำหนดเงื่อนไขเพิ่มเติม'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`transition-transform duration-300 ${isConstraintsExpanded ? 'rotate-180' : ''}`}>
                                                <ChevronDown size={20} className="text-gray-400" />
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {isConstraintsExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <div className="p-6 pt-0 border-t border-gray-50">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
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
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}



                                {/* Area Calculation Constraints - Toggleable */}
                                {(formData.calculation_method === 'area' || formData.calculation_method === 'area_sq_yard') && (
                                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300">
                                        <div
                                            className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => setIsConstraintsExpanded(!isConstraintsExpanded)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg text-blue-700 shadow-sm">
                                                    <Ruler size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-base">เงื่อนไขการคำนวณพื้นที่</h3>
                                                    <p className="text-xs text-gray-500">
                                                        {isConstraintsExpanded ? 'คลิกเพื่อซ่อนเงื่อนไข' : 'คลิกเพื่อกำหนดเงื่อนไขเพิ่มเติม'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`transition-transform duration-300 ${isConstraintsExpanded ? 'rotate-180' : ''}`}>
                                                <ChevronDown size={20} className="text-gray-400" />
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {isConstraintsExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <div className="p-6 pt-0 border-t border-gray-50">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
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
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}


                                {/* Width Range Constraints */}
                                {(formData.calculation_method === 'width_range' || formData.calculation_method === 'width_height_range') && (
                                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300">
                                        <div
                                            className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => setIsConstraintsExpanded(!isConstraintsExpanded)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg text-orange-700 shadow-sm">
                                                    <Ruler size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-base">เงื่อนไขจำกัดขนาด</h3>
                                                    <p className="text-xs text-gray-500">
                                                        {isConstraintsExpanded ? 'คลิกเพื่อซ่อนเงื่อนไข' : 'คลิกเพื่อกำหนดเงื่อนไขเพิ่มเติม'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`transition-transform duration-300 ${isConstraintsExpanded ? 'rotate-180' : ''}`}>
                                                <ChevronDown size={20} className="text-gray-400" />
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {isConstraintsExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <div className="p-6 pt-0 border-t border-gray-50">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                                                            {[
                                                                { id: 'min_width', label: 'ความกว้างต่ำสุด (Min Width)', placeholder: '0.00', unit: 'เมตร', isHighlight: true },
                                                                { id: 'max_width', label: 'ความกว้างสูงสุด (Max Width)', placeholder: '0.00', unit: 'เมตร', isHighlight: true },
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
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
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

                                        {formData.calculation_method !== 'width_range' && formData.calculation_method !== 'width_height_range' && (
                                            <>
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
                                            </>
                                        )}
                                    </div>

                                    {formData.calculation_method === 'width_range' && (
                                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 mt-4">
                                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gradient-to-br from-green-100 to-green-50 rounded-lg text-green-700 shadow-sm">
                                                        <DollarSign size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-base">กำหนดราคาตามช่วงความกว้าง</h3>
                                                        <p className="text-xs text-gray-500">กำหนดช่วงความกว้างและราคาสำหรับแต่ละช่วง</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newSteps = [...(formData.price_data || [])];
                                                        newSteps.push({ min_width: '', max_width: '', price: '' });
                                                        setFormData({ ...formData, price_data: newSteps });
                                                    }}
                                                    className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition flex items-center gap-1"
                                                >
                                                    <Plus size={14} /> เพิ่มช่วงราคา
                                                </button>
                                            </div>

                                            <div className="p-6 bg-gray-50/50">
                                                {(formData.price_data || []).length === 0 ? (
                                                    <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                                                        ยังไม่มีการกำหนดช่วงราคา
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">
                                                            <div className="col-span-3">ความกว้างเริ่มต้น (ม.)</div>
                                                            <div className="col-span-3">ถึงความกว้าง (ม.)</div>
                                                            <div className="col-span-3">ราคา (บาท)</div>
                                                            <div className="col-span-2 text-orange-600">ราคา Platform</div>
                                                            <div className="col-span-1"></div>
                                                        </div>
                                                        {(formData.price_data || []).map((step: any, index: number) => (
                                                            <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                                                <div className="col-span-3">
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        placeholder="0.00"
                                                                        value={step.min_width}
                                                                        onChange={(e) => {
                                                                            const newSteps = [...(formData.price_data || [])];
                                                                            newSteps[index].min_width = e.target.value;
                                                                            setFormData({ ...formData, price_data: newSteps });
                                                                        }}
                                                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition text-sm text-center"
                                                                    />
                                                                </div>
                                                                <div className="col-span-3">
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        placeholder="0.00"
                                                                        value={step.max_width}
                                                                        onChange={(e) => {
                                                                            const newSteps = [...(formData.price_data || [])];
                                                                            newSteps[index].max_width = e.target.value;
                                                                            setFormData({ ...formData, price_data: newSteps });
                                                                        }}
                                                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition text-sm text-center"
                                                                    />
                                                                </div>
                                                                <div className="col-span-3">
                                                                    <input
                                                                        type="number"
                                                                        placeholder="0.00"
                                                                        value={step.price}
                                                                        onChange={(e) => {
                                                                            const newSteps = [...(formData.price_data || [])];
                                                                            newSteps[index].price = e.target.value;
                                                                            setFormData({ ...formData, price_data: newSteps });
                                                                        }}
                                                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition text-sm text-right font-mono"
                                                                    />
                                                                </div>
                                                                <div className="col-span-2">
                                                                    <input
                                                                        type="number"
                                                                        placeholder="0.00"
                                                                        value={step.price_platform || ''}
                                                                        onChange={(e) => {
                                                                            const newSteps = [...(formData.price_data || [])];
                                                                            newSteps[index].price_platform = e.target.value;
                                                                            setFormData({ ...formData, price_data: newSteps });
                                                                        }}
                                                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-sm text-right font-mono text-orange-600"
                                                                    />
                                                                </div>
                                                                <div className="col-span-1 flex justify-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const newSteps = [...(formData.price_data || [])];
                                                                            newSteps.splice(index, 1);
                                                                            setFormData({ ...formData, price_data: newSteps });
                                                                        }}
                                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {formData.calculation_method === 'width_height_range' && (
                                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 mt-4">
                                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-lg text-indigo-700 shadow-sm">
                                                        <DollarSign size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-base">กำหนดราคาตามช่วงกว้าง x สูง</h3>
                                                        <p className="text-xs text-gray-500">กำหนดช่วงความกว้าง, ความสูง และราคาสำหรับแต่ละช่วง</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newSteps = [...(formData.price_data || [])];
                                                        newSteps.push({ min_width: '', max_width: '', min_height: '', max_height: '', price: '' });
                                                        setFormData({ ...formData, price_data: newSteps });
                                                    }}
                                                    className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition flex items-center gap-1"
                                                >
                                                    <Plus size={14} /> เพิ่มช่วงราคา
                                                </button>
                                            </div>

                                            <div className="p-6 bg-gray-50/50">
                                                {(formData.price_data || []).length === 0 ? (
                                                    <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                                                        ยังไม่มีการกำหนดช่วงราคา
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
                                                            <div className="col-span-2">กว้าง (Min/Max)</div>
                                                            <div className="col-span-2">สูง (Min/Max)</div>
                                                            <div className="col-span-3">ราคา (บาท)</div>
                                                            <div className="col-span-3 text-orange-600">ราคา Platform</div>
                                                            <div className="col-span-1"></div>
                                                        </div>
                                                        {(formData.price_data || []).map((step: any, index: number) => (
                                                            <div key={index} className="grid grid-cols-12 gap-2 items-start bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                                <div className="col-span-2 space-y-1">
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        placeholder="Min W"
                                                                        value={step.min_width}
                                                                        onChange={(e) => {
                                                                            const newSteps = [...(formData.price_data || [])];
                                                                            newSteps[index].min_width = e.target.value;
                                                                            setFormData({ ...formData, price_data: newSteps });
                                                                        }}
                                                                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-center focus:ring-1 focus:ring-black"
                                                                    />
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        placeholder="Max W"
                                                                        value={step.max_width}
                                                                        onChange={(e) => {
                                                                            const newSteps = [...(formData.price_data || [])];
                                                                            newSteps[index].max_width = e.target.value;
                                                                            setFormData({ ...formData, price_data: newSteps });
                                                                        }}
                                                                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-center focus:ring-1 focus:ring-black"
                                                                    />
                                                                </div>
                                                                <div className="col-span-2 space-y-1">
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        placeholder="Min H"
                                                                        value={step.min_height}
                                                                        onChange={(e) => {
                                                                            const newSteps = [...(formData.price_data || [])];
                                                                            newSteps[index].min_height = e.target.value;
                                                                            setFormData({ ...formData, price_data: newSteps });
                                                                        }}
                                                                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-center focus:ring-1 focus:ring-black"
                                                                    />
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        placeholder="Max H"
                                                                        value={step.max_height}
                                                                        onChange={(e) => {
                                                                            const newSteps = [...(formData.price_data || [])];
                                                                            newSteps[index].max_height = e.target.value;
                                                                            setFormData({ ...formData, price_data: newSteps });
                                                                        }}
                                                                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-center focus:ring-1 focus:ring-black"
                                                                    />
                                                                </div>
                                                                <div className="col-span-3 flex items-center h-full">
                                                                    <input
                                                                        type="number"
                                                                        placeholder="Price"
                                                                        value={step.price}
                                                                        onChange={(e) => {
                                                                            const newSteps = [...(formData.price_data || [])];
                                                                            newSteps[index].price = e.target.value;
                                                                            setFormData({ ...formData, price_data: newSteps });
                                                                        }}
                                                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition text-sm text-right font-mono"
                                                                    />
                                                                </div>
                                                                <div className="col-span-3 flex items-center h-full">
                                                                    <input
                                                                        type="number"
                                                                        placeholder="Platform"
                                                                        value={step.price_platform || ''}
                                                                        onChange={(e) => {
                                                                            const newSteps = [...(formData.price_data || [])];
                                                                            newSteps[index].price_platform = e.target.value;
                                                                            setFormData({ ...formData, price_data: newSteps });
                                                                        }}
                                                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 transition text-sm text-right font-mono text-orange-600"
                                                                    />
                                                                </div>
                                                                <div className="col-span-1 flex justify-center items-center h-full">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const newSteps = [...(formData.price_data || [])];
                                                                            newSteps.splice(index, 1);
                                                                            setFormData({ ...formData, price_data: newSteps });
                                                                        }}
                                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {formData.calculation_method !== 'width_range' && formData.calculation_method !== 'width_height_range' && (
                                        <p className="text-xs text-gray-500 mt-2">* ราคา Platform คือราคาที่ใช้คำนวณเมื่อลูกค้าสั่งซื้อผ่านหน้าเว็บ (ถ้าไม่ใส่จะใช้ราคาปกติ)</p>
                                    )}
                                </div>

                                <div className="p-6 bg-[#FAFAFA] rounded-2xl border border-dashed border-gray-200 space-y-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Link2 size={18} className="text-blue-600" />
                                        ลิงก์ที่เกี่ยวข้อง
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">🗂️ ดูแคตตาล็อก (Catalog URL)</label>
                                            <div className="flex gap-3">
                                                <input
                                                    type="url"
                                                    value={formData.catalog_url}
                                                    onChange={(e) => setFormData({ ...formData, catalog_url: e.target.value })}
                                                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
                                                    placeholder="https://example.com/catalog"
                                                />
                                                <div>
                                                    <input
                                                        type="file"
                                                        id="catalog-upload"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            if (!supabase || !e.target.files || e.target.files.length === 0) return;
                                                            const file = e.target.files[0];
                                                            const fileExt = file.name.split('.').pop();
                                                            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt} `;

                                                            try {
                                                                const { error: uploadError } = await supabase.storage
                                                                    .from('catalogs')
                                                                    .upload(fileName, file);

                                                                if (uploadError) throw uploadError;

                                                                const { data } = supabase.storage.from('catalogs').getPublicUrl(fileName);
                                                                setFormData({ ...formData, catalog_url: data.publicUrl });
                                                                alert('อัพโหลดไฟล์เรียบร้อยแล้ว');
                                                            } catch (error) {
                                                                console.error('Upload error:', error);
                                                                alert('เกิดข้อผิดพลาดในการอัพโหลด');
                                                            }
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor="catalog-upload"
                                                        className="flex items-center justify-center p-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition cursor-pointer border border-gray-200"
                                                        title="อัพโหลด PDF หรือ รูปภาพ"
                                                    >
                                                        <Upload size={20} />
                                                    </label>
                                                </div>
                                            </div>
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

                                {/* Product Variants Management */}
                                <div className="p-6 bg-[#FAFAFA] rounded-2xl border border-dashed border-gray-200 space-y-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <div className="w-5 h-5 rounded bg-amber-100 text-amber-600 flex items-center justify-center">
                                            <span className="text-xs font-bold">#</span>
                                        </div>
                                        รหัสสินค้าในคอลเล็กชัน (Product Codes)
                                    </h3>

                                    {/* Add New Variant */}
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            value={newVariantCode}
                                            onChange={(e) => setNewVariantCode(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddVariant(); }}
                                            className="w-full sm:w-1/3 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition text-sm"
                                            placeholder="รหัส (เช่น 850-1)"
                                        />
                                        <input
                                            type="text"
                                            value={newVariantDescription}
                                            onChange={(e) => setNewVariantDescription(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddVariant(); }}
                                            className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition text-sm"
                                            placeholder="รายละเอียด (เช่น สีเทาเข้ม)"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddVariant}
                                            disabled={!newVariantCode.trim()}
                                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-sm font-medium whitespace-nowrap"
                                        >
                                            เพิ่ม
                                        </button>
                                    </div>

                                    {/* Variants List */}
                                    <div className="min-h-[100px] max-h-[200px] overflow-y-auto custom-scrollbar border border-gray-100 rounded-lg bg-white p-1">
                                        {variantsLoading ? (
                                            <div className="flex items-center justify-center h-20 text-gray-400 text-sm">
                                                กำลังโหลด...
                                            </div>
                                        ) : variants.length === 0 ? (
                                            <div className="flex items-center justify-center h-20 text-gray-400 text-sm">
                                                ยังไม่มีรหัสสินค้า
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                                                {variants.map((variant) => (
                                                    <div key={variant.id} className={`flex items - center justify - between p - 2 rounded - lg border ${variant.in_stock ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200'} `}>
                                                        <div className="flex flex-col overflow-hidden mr-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w - 2 h - 2 rounded - full shrink - 0 ${variant.in_stock ? 'bg-green-500' : 'bg-red-500'} `} />
                                                                <span className={`text - sm font - medium truncate ${variant.in_stock ? 'text-gray-900' : 'text-gray-400 line-through'} `}>
                                                                    {variant.name}
                                                                </span>
                                                            </div>
                                                            {variant.description && (
                                                                <span className="text-[10px] text-gray-500 ml-4 truncate">
                                                                    {variant.description}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleVariantStock(variant.id, variant.in_stock ?? true)}
                                                                className={`text - [10px] px - 2 py - 1 rounded border transition cursor - pointer ${variant.in_stock ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'} `}
                                                            >
                                                                {variant.in_stock ? 'มีของ' : 'หมด'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteVariant(variant.id)}
                                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition cursor-pointer"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">* กดที่ปุ่มสถานะเพื่อเปลี่ยนระหว่าง "มีของ" และ "หมด"</p>
                                </div>

                                <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-100 mt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-5 py-3 sm:py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition font-medium cursor-pointer text-center"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 sm:py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-black/10 cursor-pointer"
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
