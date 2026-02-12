export type ProductType = 'curtain-uv' | 'curtain-sheer' | 'wallpaper-vinyl' | 'wallpaper-fabric';

// Define specific interfaces for different product types
interface CurtainPricing {
    pricePerYard: number;
    laborCost: number;
}

interface WallpaperPricing {
    pricePerRoll: number;
    laborPerRoll: number;
    areaPerRoll: number;
}

export const CURTAIN_PRICING: Record<string, CurtainPricing> = {
    'curtain-uv': { pricePerYard: 500, laborCost: 1000 },
    'curtain-sheer': { pricePerYard: 350, laborCost: 800 },
};

export const WALLPAPER_PRICING: Record<string, WallpaperPricing> = {
    'wallpaper-vinyl': { pricePerRoll: 1200, laborPerRoll: 300, areaPerRoll: 5 },
    'wallpaper-fabric': { pricePerRoll: 2500, laborPerRoll: 500, areaPerRoll: 5 },
};

export const calculatePrice = (
    type: ProductType,
    widthCm: number,
    heightCm: number
): { total: number, breakdown: string } => {

    // Check if it's a curtain type
    if (type in CURTAIN_PRICING) {
        const widthM = widthCm / 100;
        const heightM = heightCm / 100;

        // Use 2.5x fullness
        const fabricWidthNeeded = widthM * 2.5;
        const yardsNeeded = Math.ceil(fabricWidthNeeded * (heightM + 0.3)); // +30cm for hem

        const priceConfig = CURTAIN_PRICING[type];
        const materialCost = yardsNeeded * priceConfig.pricePerYard;
        const total = materialCost + priceConfig.laborCost;

        return {
            total,
            breakdown: `Fabric: ${yardsNeeded} yards @ ${priceConfig.pricePerYard} | Labor: ${priceConfig.laborCost}`
        };
    }

    // Check if it's a wallpaper type
    if (type in WALLPAPER_PRICING) {
        const widthM = widthCm / 100;
        const heightM = heightCm / 100;
        const areaSqM = widthM * heightM;

        const priceConfig = WALLPAPER_PRICING[type];
        const rollsNeeded = Math.ceil(areaSqM / priceConfig.areaPerRoll);

        const materialCost = rollsNeeded * priceConfig.pricePerRoll;
        const laborCost = rollsNeeded * priceConfig.laborPerRoll;
        const total = materialCost + laborCost;

        return {
            total,
            breakdown: `Rolls: ${rollsNeeded} @ ${priceConfig.pricePerRoll} | Labor: ${laborCost}`
        };
    }

    return { total: 0, breakdown: '' };
};
