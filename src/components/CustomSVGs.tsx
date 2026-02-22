import React from 'react';

// Common Gradient Definitions to be used across SVGs
export const SvgGradients = () => (
    <svg aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        <defs>
            {/* Orange/Red Gradient for Economical / Shopee */}
            <linearGradient id="grad-orange" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF7A00" />
                <stop offset="100%" stopColor="#FF004D" />
            </linearGradient>

            {/* Blue/Cyan Gradient for Measurement */}
            <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00C6FF" />
                <stop offset="100%" stopColor="#0072FF" />
            </linearGradient>

            {/* Yellow/Gold Gradient for Full Service */}
            <linearGradient id="grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE000" />
                <stop offset="100%" stopColor="#799F0C" />
            </linearGradient>

            {/* Premium Emerald/Teal Gradient for Premium Service */}
            <linearGradient id="grad-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#11998e" />
                <stop offset="100%" stopColor="#38ef7d" />
            </linearGradient>

            {/* Purple/Pink Gradient for Quality / Design */}
            <linearGradient id="grad-purple" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8E2DE2" />
                <stop offset="100%" stopColor="#4A00E0" />
            </linearGradient>

            <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.15" />
            </filter>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>
    </svg>
);

// 1. Online Order (Box/Package)
export const BoxIcon = ({ className = "", size = 64 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
        <g filter="url(#drop-shadow)">
            <path d="M32 12L12 22.5L32 33L52 22.5L32 12Z" fill="url(#grad-orange)" opacity="0.9" />
            <path d="M12 22.5V43.5L32 54V33L12 22.5Z" fill="url(#grad-orange)" opacity="0.7" />
            <path d="M52 22.5V43.5L32 54V33L52 22.5Z" fill="url(#grad-orange)" />
            {/* Tape marks */}
            <path d="M22 17.25L42 27.75" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            <path d="M32 33V54" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        </g>
    </svg>
);

// 2. Measurement (Ruler & Compass/Blueprint)
export const MeasurementIcon = ({ className = "", size = 64 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
        <g filter="url(#drop-shadow)">
            <rect x="14" y="24" width="44" height="16" rx="3" transform="rotate(-30 14 24)" fill="url(#grad-blue)" opacity="0.8" />
            <rect x="12" y="38" width="40" height="12" rx="2" fill="url(#grad-blue)" />
            {/* Ticks on ruler */}
            <path d="M16 38V42M22 38V44M28 38V42M34 38V44M40 38V42M46 38V44" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            {/* Center pinpoint */}
            <circle cx="20" cy="20" r="4" fill="#FFFFFF" />
            <circle cx="20" cy="20" r="2" fill="url(#grad-blue)" />
            <path d="M20 24V34" stroke="url(#grad-blue)" strokeWidth="2" strokeDasharray="4 2" />
        </g>
    </svg>
);

// 3. Full Service (Wrench & Sparkles)
export const FullServiceIcon = ({ className = "", size = 64 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
        <g filter="url(#drop-shadow)">
            <path d="M42.4 15.6C46.8 20 46.8 27.2 42.4 31.6L24.4 49.6C21.9 52.1 17.9 52.1 15.4 49.6C12.9 47.1 12.9 43.1 15.4 40.6L33.4 22.6C29 18.2 29 11 33.4 6.6C37.8 2.2 45 2.2 49.4 6.6C53.8 11 53.8 18.2 49.4 22.6L42.4 15.6Z" fill="url(#grad-gold)" />
            <circle cx="41" cy="14" r="3" fill="#FFFFFF" opacity="0.3" />
            {/* Sparkles */}
            <path d="M14 14L16 20L22 22L16 24L14 30L12 24L6 22L12 20L14 14Z" fill="url(#grad-orange)" filter="url(#glow)" />
            <path d="M50 44L51 47L54 48L51 49L50 52L49 49L46 48L49 47L50 44Z" fill="url(#grad-blue)" filter="url(#glow)" />
        </g>
    </svg>
);

// 4. Premium (Shield & Star/Crown)
export const PremiumIcon = ({ className = "", size = 64 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
        <g filter="url(#drop-shadow)">
            <path d="M32 10L14 18V32C14 45 21.5 56.5 32 60C42.5 56.5 50 45 50 32V18L32 10Z" fill="url(#grad-emerald)" opacity="0.9" />
            <path d="M32 10V60C42.5 56.5 50 45 50 32V18L32 10Z" fill="url(#grad-emerald)" />
            <path d="M32 24L34.5 30H41L35.5 34L37.5 40L32 36.5L26.5 40L28.5 34L23 30H29.5L32 24Z" fill="#FFFFFF" filter="url(#glow)" />
        </g>
    </svg>
);

// Feature Icons Map
export const QualityIcon = ({ className = "", size = 64 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
        <g filter="url(#drop-shadow)">
            <path d="M32 6L42 16H52V26L60 32L52 38V48H42L32 58L22 48H12V38L4 32L12 26V16H22L32 6Z" fill="url(#grad-purple)" />
            <path d="M24 32L29 37L42 24" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
    </svg>
);

export const SpeedIcon = ({ className = "", size = 64 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
        <g filter="url(#drop-shadow)">
            <circle cx="32" cy="32" r="24" fill="url(#grad-orange)" />
            <path d="M32 16V32L42 38" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {/* Motion lines */}
            <path d="M8 32H16M12 22H18M12 42H18" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        </g>
    </svg>
);

export const DesignIcon = ({ className = "", size = 64 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
        <g filter="url(#drop-shadow)">
            <path d="M20 54L10 44L36 18C38 16 42 16 44 18L48 22C50 24 50 28 48 30L20 54Z" fill="url(#grad-blue)" />
            <path d="M32 22L42 32" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            <path d="M10 54H20L15 49L10 54Z" fill="url(#grad-orange)" />
        </g>
    </svg>
);

// Abstract Background Orbs for Hero section
export const BackgroundOrbs = () => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <defs>
            <radialGradient id="orb1" cy="50%" cx="50%" r="50%">
                <stop offset="0%" stopColor="#8E2DE2" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#8E2DE2" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="orb2" cy="50%" cx="50%" r="50%">
                <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#FF004D" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="orb3" cy="50%" cx="50%" r="50%">
                <stop offset="0%" stopColor="#00C6FF" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#0072FF" stopOpacity="0" />
            </radialGradient>
        </defs>
        <circle cx="20%" cy="30%" r="30%" fill="url(#orb1)" />
        <circle cx="80%" cy="70%" r="40%" fill="url(#orb2)" />
        <circle cx="50%" cy="50%" r="25%" fill="url(#orb3)" />
    </svg>
);
