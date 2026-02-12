"use client";

import React from 'react';
import { Check, X, Minus } from 'lucide-react';

export default function ServiceComparisonTable() {
    return (
        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '2rem 0' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>
                เปรียบเทียบความแตกต่าง
            </h2>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="p-4 text-left font-semibold text-gray-600 min-w-[150px]">หัวข้อเปรียบเทียบ</th>
                            <th className="p-4 text-center font-semibold text-gray-900 min-w-[140px]">
                                1. สั่งซื้อออนไลน์<br />
                                <span className="text-xs font-normal text-gray-500">(ประหยัด)</span>
                            </th>
                            <th className="p-4 text-center font-semibold text-gray-900 min-w-[140px]">
                                2. วัดหน้างาน<br />
                                <span className="text-xs font-normal text-gray-500">(ติดตั้งเอง)</span>
                            </th>
                            <th className="p-4 text-center font-semibold text-yellow-600 min-w-[140px]">
                                3. ครบวงจร<br />
                                <span className="text-xs font-normal text-yellow-600">(แนะนำ)</span>
                            </th>
                            <th className="p-4 text-center font-semibold text-emerald-600 min-w-[140px] bg-emerald-50">
                                4. Premium<br />
                                <span className="text-xs font-normal text-emerald-600">(รับประกัน 2 ปี)</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {/* Consultation */}
                        <tr className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-gray-700">การให้คำปรึกษา</td>
                            <td className="p-4 text-center text-gray-600">ออนไลน์</td>
                            <td className="p-4 text-center text-gray-600">หน้างาน</td>
                            <td className="p-4 text-center text-gray-600">หน้างาน</td>
                            <td className="p-4 text-center font-medium text-emerald-700 bg-emerald-50/30">
                                ปรึกษาและออกแบบ<br />โดยผู้เชี่ยวชาญ
                            </td>
                        </tr>

                        {/* Measurement */}
                        <tr className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-gray-700">การวัดพื้นที่</td>
                            <td className="p-4 text-center text-gray-500">
                                <span className="inline-flex items-center gap-1"><Minus size={16} /> ลูกค้าวัดเอง</span>
                            </td>
                            <td className="p-4 text-center text-green-600 font-medium">
                                <span className="inline-flex items-center gap-1"><Check size={16} /> ช่างเข้าวัดให้</span>
                            </td>
                            <td className="p-4 text-center text-green-600 font-medium">
                                <span className="inline-flex items-center gap-1"><Check size={16} /> ช่างเข้าวัดให้</span>
                            </td>
                            <td className="p-4 text-center text-emerald-700 font-medium bg-emerald-50/30">
                                <span className="inline-flex items-center gap-1"><Check size={16} /> ช่างเข้าวัดให้</span>
                            </td>
                        </tr>

                        {/* Installation */}
                        <tr className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-gray-700">การติดตั้ง</td>
                            <td className="p-4 text-center text-gray-500">ลูกค้าติดตั้งเอง</td>
                            <td className="p-4 text-center text-gray-500">ลูกค้าติดตั้งเอง</td>
                            <td className="p-4 text-center text-green-600 font-medium">ทีมช่างมืออาชีพ</td>
                            <td className="p-4 text-center text-emerald-700 font-medium bg-emerald-50/30">
                                ทีมช่าง + QC<br />ควบคุมคุณภาพ
                            </td>
                        </tr>

                        {/* Warranty */}
                        <tr className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-gray-700">การรับประกัน</td>
                            <td className="p-4 text-center text-gray-400">-</td>
                            <td className="p-4 text-center text-gray-400">-</td>
                            <td className="p-4 text-center text-gray-600">รับประกันงานติดตั้ง 1 ปี</td>
                            <td className="p-4 text-center text-emerald-700 font-bold bg-emerald-50/30">
                                รับประกันงานติดตั้ง 2 ปี
                            </td>
                        </tr>

                        {/* Price Model */}
                        <tr className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-gray-700">รูปแบบราคา</td>
                            <td className="p-4 text-center text-gray-600 text-sm">สินค้า + ส่ง</td>
                            <td className="p-4 text-center text-gray-600 text-sm">วัด + สินค้า + ส่ง</td>
                            <td className="p-4 text-center text-gray-600 text-sm">วัด + สินค้า + ติดตั้ง</td>
                            <td className="p-4 text-center text-emerald-700 font-bold bg-emerald-50/30">
                                ราคาเหมางาน
                            </td>
                        </tr>

                        {/* Payment Terms */}
                        <tr className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-gray-700">การชำระเงิน</td>
                            <td className="p-4 text-center text-gray-600 text-sm">ชำระ 100% ก่อนผลิต</td>
                            <td className="p-4 text-center text-gray-600 text-sm">ชำระ 100% ก่อนผลิต</td>
                            <td className="p-4 text-center text-gray-600 text-sm">ชำระ 100% ก่อนผลิต</td>
                            <td className="p-4 text-center text-emerald-700 font-bold bg-emerald-50/30">
                                มัดจำ 50%<br />จบงาน 50%
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
