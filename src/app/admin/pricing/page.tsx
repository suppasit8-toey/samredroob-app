"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, RefreshCw } from 'lucide-react';

interface PricingConfig {
    vat_rate: number;
    installation_fee_min: number;
    waste_factor_curtain: number;
    waste_factor_wallpaper: number;
}

const DEFAULT_CONFIG: PricingConfig = {
    vat_rate: 7,
    installation_fee_min: 1500,
    waste_factor_curtain: 1.2, // 20% waste
    waste_factor_wallpaper: 1.15 // 15% waste
};

export default function PricingPage() {
    const [config, setConfig] = useState<PricingConfig>(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            // Try to fetch from a table named 'pricing_constants'
            // Structure: key (string), value (numeric)
            const { data, error } = await supabase.from('pricing_constants').select('*');

            if (error) {
                console.warn("Could not fetch pricing constants (Table might not exist yet). Using defaults.");
            } else if (data && data.length > 0) {
                const newConfig = { ...DEFAULT_CONFIG };
                data.forEach((item: any) => {
                    if (item.key in newConfig) {
                        (newConfig as any)[item.key] = Number(item.value);
                    }
                });
                setConfig(newConfig);
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!supabase) return;
        setSaving(true);

        try {
            // Upsert each key
            const updates = Object.entries(config).map(([key, value]) => ({
                key,
                value
            }));

            const { error } = await supabase.from('pricing_constants').upsert(updates, { onConflict: 'key' });

            if (error) {
                throw error;
            }
            alert('บันทึกการตั้งค่าเรียบร้อยแล้ว');
        } catch (err) {
            console.error(err);
            alert('เกิดข้อผิดพลาดในการบันทึก (ตรวจสอบว่ามีตาราง pricing_constants หรือยัง)');
        }
        setSaving(false);
    };

    const handleChange = (key: keyof PricingConfig, value: string) => {
        setConfig(prev => ({
            ...prev,
            [key]: parseFloat(value) || 0
        }));
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">ตั้งค่าการคำนวณราคา</h1>
                <button
                    onClick={fetchConfig}
                    className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition"
                    title="รีโหลดข้อมูล"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">

                <div className="pb-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold mb-4">ภาษีและค่าบริการพื้นฐาน</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">VAT (%)</label>
                            <input
                                type="number"
                                value={config.vat_rate}
                                onChange={(e) => handleChange('vat_rate', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                            />
                            <p className="text-xs text-gray-400 mt-1">ภาษีมูลค่าเพิ่ม</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ค่าติดตั้งขั้นต่ำ (บาท)</label>
                            <input
                                type="number"
                                value={config.installation_fee_min}
                                onChange={(e) => handleChange('installation_fee_min', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                            />
                            <p className="text-xs text-gray-400 mt-1">ค่าบริการขั้นต่ำหากยอดไม่ถึงเป้า</p>
                        </div>
                    </div>
                </div>

                <div className="pb-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold mb-4">เผื่อเสีย (Waste Factor)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ผ้าม่าน (เช่น 1.2 = เผื่อ 20%)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={config.waste_factor_curtain}
                                onChange={(e) => handleChange('waste_factor_curtain', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">วอลเปเปอร์ (เช่น 1.15 = เผื่อ 15%)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={config.waste_factor_wallpaper}
                                onChange={(e) => handleChange('waste_factor_wallpaper', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={loading || saving}
                        className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save size={20} />
                        {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                    </button>
                </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
                <p className="font-bold mb-1">หมายเหตุสำหรับผู้ดูแลระบบ:</p>
                <p>หากกดบันทึกแล้วเกิดข้อผิดพลาด โปรดตรวจสอบว่าได้สร้างตาราง <code>pricing_constants</code> ใน Supabase แล้ว (คอลัมน์: <code>key</code> (text, primary), <code>value</code> (numeric))</p>
            </div>
        </div>
    );
}
