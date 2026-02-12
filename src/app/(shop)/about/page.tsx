import React from 'react';
import ServiceList from '@/components/ServiceList';

export default function AboutPage() {
    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>เกี่ยวกับเรา</h1>
                <p style={{ fontSize: '1.2rem', color: '#333', maxWidth: '600px', margin: '0 auto' }}>
                    เราคือ <strong>SAMREDROOB</strong> มุ่งมั่นที่จะทำให้บ้านของคุณสวยงามน่าอยู่
                    ด้วยบริการผ้าม่านและวอลเปเปอร์คุณภาพครบวงจร
                </p>
            </div>

            <ServiceList />
        </div>
    );
}
