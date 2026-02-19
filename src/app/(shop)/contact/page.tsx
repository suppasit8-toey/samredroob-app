"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import { Phone, MapPin, Clock, MessageCircle, ExternalLink } from 'lucide-react';

export default function ContactPage() {
    const { language } = useLanguage();

    const t = {
        th: {
            contactUs: 'ติดต่อเรา',
            contactSub: 'สำเร็จรูป — พร้อมบริการ ให้คำปรึกษา ทุกวัน',
            phone: 'โทรศัพท์',
            lineId: 'Line ID',
            officeHours: 'เวลาทำการ',
            officeHoursDetail: 'ทุกวัน 09:00 – 18:00',
            addressTitle: 'ที่อยู่ร้าน',
            addressLine1: '5/59 มิตรไมตรี แขวงคู้ฝั่งเหนือ',
            addressLine2: 'เขตหนองจอก กรุงเทพมหานคร ประเทศไทย 10530',
            openMap: 'เปิดใน Google Maps'
        },
        en: {
            contactUs: 'Contact Us',
            contactSub: 'Ready-made — Service & Consultation Available Daily',
            phone: 'Phone',
            lineId: 'Line ID',
            officeHours: 'Business Hours',
            officeHoursDetail: 'Every day 09:00 – 18:00',
            addressTitle: 'Store Address',
            addressLine1: '5/59 Mit Maitri, Khu Fang Nuea',
            addressLine2: 'Nong Chok, Bangkok, Thailand 10530',
            openMap: 'Open in Google Maps'
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
            {/* Hero */}
            <div style={{
                position: 'relative',
                textAlign: 'center',
                padding: '3rem 1.5rem 3rem',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)',
                    borderRadius: '0 0 2rem 2rem',
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{
                        fontSize: '2.2rem',
                        fontWeight: 700,
                        color: 'white',
                        fontFamily: 'var(--font-mitr)',
                        margin: '0 0 0.5rem',
                        letterSpacing: '-0.01em',
                    }}>{t[language].contactUs}</h1>
                    <p style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '0.95rem',
                        margin: 0,
                        fontWeight: 400,
                    }}>{t[language].contactSub}</p>
                </div>
            </div>

            {/* Contact Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                padding: '0 1rem',
                marginTop: '-1.5rem',
                position: 'relative',
                zIndex: 2,
            }}>
                {/* Phone */}
                <a href="tel:0947461744" style={{
                    background: 'white',
                    borderRadius: '18px',
                    padding: '1.5rem',
                    textDecoration: 'none',
                    color: 'inherit',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    border: '1px solid #f0f0f0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                }}>
                    <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
                    }}>
                        <Phone size={24} color="white" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{t[language].phone}</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111' }}>094-746-1744</div>
                    </div>
                </a>

                {/* Line */}
                <a href="https://line.me/R/ti/p/@samredroob" target="_blank" rel="noopener noreferrer" style={{
                    background: 'white',
                    borderRadius: '18px',
                    padding: '1.5rem',
                    textDecoration: 'none',
                    color: 'inherit',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    border: '1px solid #f0f0f0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                }}>
                    <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #06c755, #00b843)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(6,199,85,0.3)',
                    }}>
                        <MessageCircle size={24} color="white" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{t[language].lineId}</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111', display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}>
                            @samredroob
                            <ExternalLink size={14} color="#aaa" />
                        </div>
                    </div>
                </a>

                {/* Hours */}
                <div style={{
                    background: 'white',
                    borderRadius: '18px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    border: '1px solid #f0f0f0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '0.75rem',
                }}>
                    <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
                    }}>
                        <Clock size={24} color="white" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{t[language].officeHours}</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111' }}>{t[language].officeHoursDetail}</div>
                    </div>
                </div>
            </div>

            {/* Address + Map Section */}
            <div style={{
                margin: '1.5rem 1rem 2rem',
                background: 'white',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                border: '1px solid #f0f0f0',
            }}>
                {/* Address Header */}
                <div style={{
                    padding: '1.5rem 1.5rem 1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                    }}>
                        <MapPin size={22} color="white" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>{t[language].addressTitle}</div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#111', lineHeight: 1.6 }}>
                            {t[language].addressLine1}
                        </div>
                        <div style={{ fontSize: '0.95rem', color: '#555', lineHeight: 1.6 }}>
                            {t[language].addressLine2}
                        </div>
                    </div>
                </div>

                {/* Google Map */}
                <div style={{
                    width: '100%',
                    height: '280px',
                    borderTop: '1px solid #f0f0f0',
                }}>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3874.8!2d100.85!3d13.83!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z44CA!5e0!3m2!1sth!2sth!4v1700000000000!5m2!1sth!2sth"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>

                {/* Open in Google Maps Button */}
                <div style={{ padding: '1rem 1.5rem' }}>
                    <a
                        href="https://maps.google.com/?q=5/59+มิตรไมตรี+แขวงคู้ฝั่งเหนือ+เขตหนองจอก+กรุงเทพมหานคร+10530"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            width: '100%',
                            padding: '0.85rem',
                            background: 'linear-gradient(135deg, #111 0%, #333 100%)',
                            color: 'white',
                            fontWeight: 700,
                            borderRadius: '12px',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            fontFamily: 'var(--font-mitr)',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                            transition: 'all 0.25s',
                        }}
                    >
                        <MapPin size={18} />
                        {t[language].openMap}
                        <ExternalLink size={14} />
                    </a>
                </div>
            </div>
        </div>
    );
}
