import React, { useState } from 'react';
import { calculatePrice } from '../utils/pricing';
import type { ProductType } from '../utils/pricing';
import { Calculator as CalcIcon, RefreshCw } from 'lucide-react';

const Calculator: React.FC = () => {
    const [width, setWidth] = useState<number | ''>('');
    const [height, setHeight] = useState<number | ''>('');
    const [type, setType] = useState<ProductType>('curtain-uv');
    const [result, setResult] = useState<{ total: number, breakdown: string } | null>(null);

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        if (width && height) {
            const res = calculatePrice(type, Number(width), Number(height));
            setResult(res);
        }
    };

    return (
        <div style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2.5rem' }}>Price Estimator</h1>

            <div className="calculator-grid">
                <style>{`
                    .calculator-grid {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }
                    @media (min-width: 768px) {
                        .calculator-grid {
                            grid-template-columns: 1fr 1fr;
                        }
                    }
                `}</style>
                {/* Form */}
                <form onSubmit={handleCalculate} style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: 'var(--border-radius)',
                    boxShadow: 'var(--shadow-md)'
                }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Product Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as ProductType)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '1rem'
                            }}
                        >
                            <option value="curtain-uv">UV Curtain (Blackout)</option>
                            <option value="curtain-sheer">Sheer Curtain</option>
                            <option value="wallpaper-vinyl">Vinyl Wallpaper</option>
                            <option value="wallpaper-fabric">Fabric Wallpaper</option>
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Width (cm)</label>
                            <input
                                type="number"
                                value={width}
                                onChange={(e) => setWidth(Number(e.target.value))}
                                placeholder="e.g. 200"
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Height (cm)</label>
                            <input
                                type="number"
                                value={height}
                                onChange={(e) => setHeight(Number(e.target.value))}
                                placeholder="e.g. 250"
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '1rem',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            fontWeight: 'bold',
                            borderRadius: '4px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <CalcIcon size={20} /> Calculate
                    </button>
                </form>

                {/* Result */}
                <div style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    padding: '2rem',
                    borderRadius: 'var(--border-radius)',
                    boxShadow: 'var(--shadow-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    minHeight: '300px'
                }}>
                    {result ? (
                        <>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>Estimated Price</h3>
                            <div style={{ fontSize: '3.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                                ฿{result.total.toLocaleString()}
                            </div>
                            <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{result.breakdown}</p>
                            <button
                                onClick={() => setResult(null)}
                                style={{
                                    marginTop: '2rem',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '4px'
                                }}
                            >
                                <RefreshCw size={16} /> Reset
                            </button>
                        </>
                    ) : (
                        <div style={{ color: '#666' }}>
                            <CalcIcon size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>Enter your dimensions to see the estimated price.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Calculator;
