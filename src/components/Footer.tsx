import React from 'react';

const Footer: React.FC = () => {
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
                    <p>ผ้าม่านและวอลเปเปอร์เกรดพรีเมียมสำหรับบ้านของคุณ</p>
                </div>
                <div>
                    <h4 style={{ marginBottom: '1rem' }}>ติดต่อเรา</h4>
                    <p>โทร: 094-746-1744</p>
                    <p>Line ID: @samredroob</p>
                    <p>ที่อยู่: 44/10 มิตรไมตรี แขวงคู้ฝั่งเหนือ เขต หนองจอก กทม.</p>
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
                © {new Date().getFullYear()} SAMREDROOB. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
