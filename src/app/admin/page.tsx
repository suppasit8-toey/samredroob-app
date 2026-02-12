"use client";

import Link from 'next/link';
import {
    Package,
    Calculator,
    TrendingUp,
    Users,
    ArrowRight,
    Clock,
    AlertCircle
} from 'lucide-react';

export default function AdminPage() {
    // Mock Data for Dashboard
    const stats = [
        {
            label: 'สินค้าทั้งหมด',
            value: '12',
            icon: <Package size={24} className="text-blue-600" />,
            bg: 'bg-blue-50',
            trend: '+2 items',
            trendUp: true
        },
        {
            label: 'คำนวณราคา (วันนี้)',
            value: '5',
            icon: <Calculator size={24} className="text-purple-600" />,
            bg: 'bg-purple-50',
            trend: '+12%',
            trendUp: true
        },
        {
            label: 'ผู้เข้าชม (วันนี้)',
            value: '108',
            icon: <Users size={24} className="text-green-600" />,
            bg: 'bg-green-50',
            trend: '-5%',
            trendUp: false
        },
    ];

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                {stat.icon}
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${stat.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.label}</h3>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">เมนูลัด (Quick Actions)</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/admin/products" className="group p-4 rounded-xl border border-gray-100 hover:border-black hover:bg-gray-50 transition-all duration-200 flex items-center gap-4">
                            <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                                <Package size={24} className="text-gray-600 group-hover:text-black" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">จัดการสินค้า</h4>
                                <p className="text-sm text-gray-500">เพิ่ม ลบ หรือแก้ไขข้อมูลสินค้า</p>
                            </div>
                            <ArrowRight size={18} className="ml-auto text-gray-300 group-hover:text-black transform group-hover:translate-x-1 transition-all" />
                        </Link>

                        <Link href="/admin/pricing" className="group p-4 rounded-xl border border-gray-100 hover:border-black hover:bg-gray-50 transition-all duration-200 flex items-center gap-4">
                            <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                                <Calculator size={24} className="text-gray-600 group-hover:text-black" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">ตั้งค่าราคา</h4>
                                <p className="text-sm text-gray-500">กำหนด VAT และค่าบริการต่างๆ</p>
                            </div>
                            <ArrowRight size={18} className="ml-auto text-gray-300 group-hover:text-black transform group-hover:translate-x-1 transition-all" />
                        </Link>
                    </div>
                </div>

                {/* Notifications / Updates */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">การแจ้งเตือน</h3>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="mt-1">
                                <AlertCircle size={16} className="text-orange-500" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-800 font-medium">สต็อกผ้าเหลือน้อย</p>
                                <p className="text-xs text-gray-500 mt-1">ผ้า Dimout รหัส D-001 ใกล้หมดแล้ว</p>
                            </div>
                        </div>
                        <div className="w-full h-px bg-gray-50"></div>
                        <div className="flex gap-3">
                            <div className="mt-1">
                                <Clock size={16} className="text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-800 font-medium">อัปเดตระบบล่าสุด</p>
                                <p className="text-xs text-gray-500 mt-1">เมื่อ 2 ชม. ที่แล้ว</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
