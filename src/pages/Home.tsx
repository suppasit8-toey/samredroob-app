import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, CheckCircle } from 'lucide-react';

const Home: React.FC = () => {
    return (
        <div>
            {/* Hero Section */}
            <section style={{
                position: 'relative',
                height: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#333',
                color: 'white',
                textAlign: 'center',
                overflow: 'hidden'
            }}>
                {/* Background Image Placeholder - using a dark overlay for now */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'url("https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1920&auto=format&fit=crop")', // Open source image for demo
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'brightness(0.4)'
                }}></div>

                <div style={{ position: 'relative', zIndex: 1, padding: '1rem' }}>
                    <h1 style={{
                        fontSize: '3.5rem',
                        marginBottom: '1rem',
                        fontWeight: 700,
                        letterSpacing: '-1px'
                    }}>
                        Elevate Your Space with <span style={{ color: 'var(--color-accent)' }}>SAMREDROOB</span>
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        maxWidth: '600px',
                        margin: '0 auto 2rem',
                        color: 'rgba(255,255,255,0.9)'
                    }}>
                        Premium Curtains, Wallpapers, and Interior Solutions tailored to your lifestyle.
                        Get an instant price estimate today.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link to="/calculator" style={{
                            padding: '1rem 2rem',
                            backgroundColor: 'var(--color-accent)',
                            color: '#000',
                            fontWeight: 'bold',
                            borderRadius: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'transform 0.2s'
                        }}>
                            <Calculator size={20} />
                            Calculate Price
                        </Link>
                        <Link to="/products" style={{
                            padding: '1rem 2rem',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            color: 'white',
                            fontWeight: 'bold',
                            borderRadius: '50px',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            View Catalog <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features / Services */}
            <section style={{ padding: '5rem 1rem', backgroundColor: 'white' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem' }}>Why Choose Us</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {[
                            { title: 'Premium Quality', desc: 'Sourced from the finest materials globally.' },
                            { title: 'Expert Installation', desc: 'Professional team ensuring perfect fit.' },
                            { title: 'Custom Solutions', desc: 'Tailored designs to match your unique style.' }
                        ].map((feature, idx) => (
                            <div key={idx} style={{
                                padding: '2rem',
                                border: '1px solid #eee',
                                borderRadius: 'var(--border-radius)',
                                textAlign: 'center'
                            }}>
                                <CheckCircle size={40} style={{ color: 'var(--color-accent)', marginBottom: '1rem' }} />
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{feature.title}</h3>
                                <p style={{ color: '#666' }}>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
