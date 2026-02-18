"use client";

import React from 'react';
import { Check, X, Minus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ServiceComparisonTable() {
    const { language } = useLanguage();

    return (
        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '2rem 0' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>
                {language === 'th' ? 'เปรียบเทียบความแตกต่าง' : 'Service Comparison'}
            </h2>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="p-4 text-left font-semibold text-gray-600 min-w-[150px]">
                                {language === 'th' ? 'หัวข้อเปรียบเทียบ' : 'Features'}
                            </th>
                            <th className="p-4 text-center font-semibold text-gray-900 min-w-[140px]">
                                {language === 'th' ? '1. สั่งซื้อออนไลน์' : '1. Online'}<br />
                                <span className="text-xs font-normal text-gray-500">
                                    {language === 'th' ? '(ประหยัด)' : '(Economical)'}
                                </span>
                            </th>
                            <th className="p-4 text-center font-semibold text-gray-900 min-w-[140px]">
                                {language === 'th' ? '2. วัดหน้างาน' : '2. Measurement'}<br />
                                <span className="text-xs font-normal text-gray-500">
                                    {language === 'th' ? '(ติดตั้งเอง)' : '(DIY)'}
                                </span>
                            </th>
                            <th className="p-4 text-center font-semibold text-yellow-600 min-w-[140px]">
                                {language === 'th' ? '3. ครบวงจร' : '3. Full Service'}<br />
                                <span className="text-xs font-normal text-yellow-600">
                                    {language === 'th' ? '(แนะนำ)' : '(Recommended)'}
                                </span>
                            </th>
                            <th className="p-4 text-center font-semibold text-emerald-600 min-w-[140px] bg-emerald-50">
                                {language === 'th' ? '4. Premium' : '4. Premium'}<br />
                                <span className="text-xs font-normal text-emerald-600">
                                    {language === 'th' ? '(รับประกัน 2 ปี)' : '(2 Year Warranty)'}
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {/* Consultation */}
                        <tr className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-gray-700">{language === 'th' ? 'การให้คำปรึกษา' : 'Consultation'}</td>
                            <td className="p-4 text-center text-gray-600">{language === 'th' ? 'ออนไลน์' : 'Online'}</td>
                            <td className="p-4 text-center text-gray-600">{language === 'th' ? 'หน้างาน' : 'On-site'}</td>
                            <td className="p-4 text-center text-gray-600">{language === 'th' ? 'หน้างาน' : 'On-site'}</td>
                            <td className="p-4 text-center font-medium text-emerald-700 bg-emerald-50/30">
                                {language === 'th' ? <React.Fragment>ปรึกษาและออกแบบ<br />โดยผู้เชี่ยวชาญ</React.Fragment> : <React.Fragment>Expert Consultation<br />& Design</React.Fragment>}
                            </td>
                        </tr>

                        {/* Measurement */}
                        <tr className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-gray-700">{language === 'th' ? 'การวัดพื้นที่' : 'Measurement'}</td>
                            <td className="p-4 text-center text-gray-500">
                                <span className="inline-flex items-center gap-1"><Minus size={16} /> {language === 'th' ? 'ลูกค้าวัดเอง' : 'Self-Measure'}</span>
                            </td>
                            <td className="p-4 text-center text-green-600 font-medium">
                                <span className="inline-flex items-center gap-1"><Check size={16} /> {language === 'th' ? 'ช่างเข้าวัดให้' : 'Pro Measure'}</span>
                            </td>
                            <td className="p-4 text-center text-green-600 font-medium">
                                <span className="inline-flex items-center gap-1"><Check size={16} /> {language === 'th' ? 'ช่างเข้าวัดให้' : 'Pro Measure'}</span>
                            </td>
                            <td className="p-4 text-center text-emerald-700 font-medium bg-emerald-50/30">
                                <span className="inline-flex items-center gap-1"><Check size={16} /> {language === 'th' ? 'ช่างเข้าวัดให้' : 'Pro Measure'}</span>
                            </td>
                        </tr>

                        {/* Installation */}
                        <tr className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-gray-700">{language === 'th' ? 'การติดตั้ง' : 'Installation'}</td>
                            <td className="p-4 text-center text-gray-500">{language === 'th' ? 'ลูกค้าติดตั้งเอง' : 'Self-Install'}</td>
                            <td className="p-4 text-center text-gray-500">{language === 'th' ? 'ลูกค้าติดตั้งเอง' : 'Self-Install'}</td>
                            <td className="p-4 text-center text-green-600 font-medium">{language === 'th' ? 'ทีมช่างมืออาชีพ' : 'Pro Team'}</td>
                            <td className="p-4 text-center text-emerald-700 font-medium bg-emerald-50/30">
                                {language === 'th' ? <React.Fragment>ทีมช่าง + QC<br />ควบคุมคุณภาพ</React.Fragment> : <React.Fragment>Pro Team + QC<br />Control</React.Fragment>}
                            </td>
                        </tr>

                        {/* Warranty */}
                        <tr className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-gray-700">{language === 'th' ? 'การรับประกัน' : 'Warranty'}</td>
                            <td className="p-4 text-center text-gray-400">-</td>
                            <td className="p-4 text-center text-gray-400">-</td>
                            <td className="p-4 text-center text-gray-600">{language === 'th' ? 'รับประกันงานติดตั้ง 1 ปี' : '1 Year Warranty'}</td>
                            <td className="p-4 text-center text-emerald-700 font-bold bg-emerald-50/30">
                                {language === 'th' ? 'รับประกันงานติดตั้ง 2 ปี' : '2 Year Warranty'}
                            </td>
                        </tr>

                        {/* Price Model */}
                        <tr className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-gray-700">{language === 'th' ? 'รูปแบบราคา' : 'Pricing'}</td>
                            <td className="p-4 text-center text-gray-600 text-sm">{language === 'th' ? 'สินค้า + ส่ง' : 'Product + Delivery'}</td>
                            <td className="p-4 text-center text-gray-600 text-sm">{language === 'th' ? 'วัด + สินค้า + ส่ง' : 'Measure + Product + Delivery'}</td>
                            <td className="p-4 text-center text-gray-600 text-sm">{language === 'th' ? 'วัด + สินค้า + ติดตั้ง' : 'Measure + Product + Install'}</td>
                            <td className="p-4 text-center text-emerald-700 font-bold bg-emerald-50/30">
                                {language === 'th' ? 'ราคาเหมางาน' : 'Package Price'}
                            </td>
                        </tr>

                        {/* Payment Terms */}
                        <tr className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-gray-700">{language === 'th' ? 'การชำระเงิน' : 'Payment'}</td>
                            <td className="p-4 text-center text-gray-600 text-sm">{language === 'th' ? 'ชำระ 100% ก่อนผลิต' : '100% Pre-production'}</td>
                            <td className="p-4 text-center text-gray-600 text-sm">{language === 'th' ? 'ชำระ 100% ก่อนผลิต' : '100% Pre-production'}</td>
                            <td className="p-4 text-center text-gray-600 text-sm">{language === 'th' ? 'ชำระ 100% ก่อนผลิต' : '100% Pre-production'}</td>
                            <td className="p-4 text-center text-emerald-700 font-bold bg-emerald-50/30">
                                {language === 'th' ? <React.Fragment>มัดจำ 50%<br />จบงาน 50%</React.Fragment> : <React.Fragment>50% Deposit<br />50% Completion</React.Fragment>}
                            </td>
                        </tr>

                        {/* Suitability */}
                        <tr className="hover:bg-gray-50 transition-colors border-t border-gray-100">
                            <td className="p-4 font-medium text-gray-700">{language === 'th' ? 'เหมาะกับใคร' : 'Suitable for'}</td>
                            <td className="p-4 text-center text-gray-600 text-sm">{language === 'th' ? 'ติดตั้งเป็น / ประหยัดงบ' : 'DIY / Budget'}</td>
                            <td className="p-4 text-center text-gray-600 text-sm">{language === 'th' ? 'ต้องการความแม่นยำ / ติดตั้งเอง' : 'Precision / Self-Install'}</td>
                            <td className="p-4 text-center text-gray-600 text-sm">{language === 'th' ? 'เน้นความสะดวกสบาย' : 'Focus on Convenience'}</td>
                            <td className="p-4 text-center text-emerald-700 font-bold bg-emerald-50/30">
                                {language === 'th' ? 'เน้นบริการพิเศษ' : 'Premium Service'}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
