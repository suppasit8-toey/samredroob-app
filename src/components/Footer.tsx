"use client";

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer: React.FC = () => {
    const { language } = useLanguage();

    return (
        <footer style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            padding: '3rem 1rem',
            marginTop: 'auto'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '2rem'
            }}>
                <div>
                    <div style={{ marginBottom: '1rem' }}>
                        <img
                            src="https://res.cloudinary.com/dcspjhgdj/image/upload/v1770868240/xq5odkgk3lkto43nzvgh.png"
                            alt="SAMREDROOB"
                            style={{ height: '50px', width: 'auto' }}
                        />
                    </div>
                    <p>{language === 'th' ? 'ผ้าม่านและวอลเปเปอร์เกรดพรีเมียมสำหรับบ้านของคุณ' : 'Premium curtains and wallpapers for your home'}</p>
                </div>
                <div>
                    <h4 style={{ marginBottom: '1rem' }}>{language === 'th' ? 'ติดต่อเรา' : 'Contact Us'}</h4>
                    <p>{language === 'th' ? 'โทร' : 'Tel'}: 094-746-1744</p>
                    <p>Line ID: @samredroob</p>
                    <p>{language === 'th' ? 'ที่อยู่: 5/59 มิตรไมตรี แขวงคู้ฝั่งเหนือ เขตหนองจอก กรุงเทพมหานคร ประเทศไทย 10530' : 'Address: 5/59 Mit Maitri, Khu Fang Nuea, Nong Chok, Bangkok 10530'}</p>
                </div>
            </div>
            <div style={{
                textAlign: 'center',
                marginTop: '3rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                fontSize: '0.9rem',
                color: '#aaa'
            }}>
                © {new Date().getFullYear()} สำเร็จรูป-Samredroob. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
