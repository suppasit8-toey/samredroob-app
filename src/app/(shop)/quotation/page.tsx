"use client";

import React from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Trash2, ArrowLeft, Send, Printer } from 'lucide-react';

export default function QuotationPage() {
    const { items, removeFromCart, clearCart } = useCart();

    const totalEstimate = items.reduce((sum, item) => sum + item.totalPrice, 0);

    const handlePrint = () => {
        window.print();
    };

    const handleSendLine = () => {
        let message = "สนใจสั่งทำผ้าม่าน/วอลเปเปอร์ครับ\n\nรายการสินค้า:\n";
        items.forEach((item, index) => {
            message += `${index + 1}. ${item.collection.name}\n   ขนาด: ${item.width}x${item.height} ซม.\n   ราคา: ${item.totalPrice.toLocaleString()} บาท\n`;
        });
        message += `\nราคารวมทั้งหมด: ${totalEstimate.toLocaleString()} บาท`;
        message += `\n\n(ข้อมูลจากเว็บ Samredroob Calculator)`;

        const encodedMessage = encodeURIComponent(message);

        // Use LINE Share URL which is more robust across platforms
        window.open(`https://line.me/R/share?text=${encodedMessage}`, '_blank');
    };

    return (
        <div style={{ padding: '3rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
            <Link
                href="/calculator"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#666',
                    textDecoration: 'none',
                    marginBottom: '2rem'
                }}
            >
                <ArrowLeft size={16} /> กลับไปหน้าคำนวณ
            </Link>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-mitr)' }}>ใบเสนอราคา (จำลอง)</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={handlePrint}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        <Printer size={18} /> พิมพ์ใบเสนอราคา
                    </button>
                </div>
            </div>

            {items.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e5e5' }}>
                                <tr>
                                    <th style={{ padding: '1.25rem', fontWeight: 600, color: '#444' }}>สินค้า</th>
                                    <th style={{ padding: '1.25rem', fontWeight: 600, color: '#444' }}>ขนาด (กxส)</th>
                                    <th style={{ padding: '1.25rem', fontWeight: 600, color: '#444', textAlign: 'right' }}>ราคาประเมิน</th>
                                    <th style={{ padding: '1.25rem', fontWeight: 600, color: '#444', width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{item.collection.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#888' }}>
                                                {item.collection.price_per_unit} บาท/{item.collection.unit}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem', color: '#666' }}>
                                            {item.width} x {item.height} ซม.
                                        </td>
                                        <td style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 600, fontSize: '1.1rem' }}>
                                            ฿{item.totalPrice.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}
                                                title="ลบรายการ"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot style={{ backgroundColor: '#f9fafb', borderTop: '1px solid #e5e5e5' }}>
                                <tr>
                                    <td colSpan={2} style={{ padding: '1.5rem', textAlign: 'right', fontWeight: 600, fontSize: '1.2rem' }}>
                                        ราคารวมทั้งหมด
                                    </td>
                                    <td style={{ padding: '1.5rem', textAlign: 'right', fontWeight: 700, fontSize: '1.5rem', color: 'black' }}>
                                        ฿{totalEstimate.toLocaleString()}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div style={{ backgroundColor: '#F0FDF4', padding: '2rem', borderRadius: '16px', border: '1px solid #BBF7D0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#166534', marginBottom: '0.5rem' }}>พร้อมสั่งทำหรือไม่?</h3>
                            <p style={{ color: '#166534', opacity: 0.8 }}>ส่งรายการนี้ให้แอดมินทาง LINE เพื่อยืนยันราคาและนัดหมายติดตั้งได้เลย</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                            <button
                                onClick={handleSendLine}
                                style={{
                                    backgroundColor: '#06C755', // LINE Green
                                    color: 'white',
                                    padding: '1rem 2rem',
                                    borderRadius: '50px',
                                    border: 'none',
                                    fontWeight: 600,
                                    fontSize: '1.1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(6, 199, 85, 0.3)',
                                    transition: 'transform 0.2s',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <Send size={20} /> ส่งรายการทาง LINE
                            </button>
                            <a
                                href="https://lin.ee/59TaAgG"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: '#06C755',
                                    textDecoration: 'none',
                                    fontWeight: 500,
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}
                            >
                                <span>หรือแอด LINE Official: @samredroob</span>
                            </a>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{
                    padding: '4rem',
                    textAlign: 'center',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    border: '1px dashed #e5e5e5'
                }}>
                    <p style={{ color: '#888', fontSize: '1.2rem', marginBottom: '2rem' }}>ยังไม่มีรายการสินค้าในใบเสนอราคา</p>
                    <Link
                        href="/calculator"
                        style={{
                            display: 'inline-block',
                            backgroundColor: 'black',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: 600
                        }}
                    >
                        ไปหน้าคำนวณราคา
                    </Link>
                </div>
            )}
        </div>
    );
}
