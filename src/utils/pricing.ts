import { ProductCollection } from '@/lib/types';

export const calculatePrice = (
    collection: ProductCollection,
    widthCm: number,
    heightCm: number,
    priceOverride?: number // Optional override (e.g., for platform pricing)
): { total: number, breakdown: string } => {
    // 1. Convert inputs to meters
    const widthM = widthCm / 100;
    const heightM = heightCm / 100;

    const method = collection.calculation_method || 'area';
    // Use override if provided, otherwise default to collection price
    const price = priceOverride !== undefined ? priceOverride : (collection.price_per_unit || 0);

    // 2. Validate Max Constraints (throw error or just warn in breakdown)
    if (collection.max_width && widthM > collection.max_width) {
        return { total: 0, breakdown: `ความกว้างเกินกำหนด (${collection.max_width} ม.)` };
    }
    if (collection.max_height && heightM > collection.max_height) {
        return { total: 0, breakdown: `ความสูงเกินกำหนด (${collection.max_height} ม.)` };
    }

    // --- LOGIC: RAIL WIDTH ---
    if (method === 'rail_width') {
        // Step 1: Apply Min Billable Width
        let billableWidth = Math.max(widthM, collection.min_billable_width || 0);

        // Step 2: Apply Width Step (e.g., every 0.10m)
        if (collection.width_step && collection.width_step > 0) {
            billableWidth = Math.ceil(billableWidth / collection.width_step) * collection.width_step;
        }

        // Price Calculation
        const total = billableWidth * price;
        return {
            total: Math.ceil(total),
            breakdown: `ราง: ${billableWidth.toFixed(2)} ม. x ฿${price}`
        };
    }

    // --- LOGIC: AREA / AREA_SQ_YARD ---
    if (method === 'area' || method === 'area_sq_yard') {
        const isSqYard = method === 'area_sq_yard' || collection.unit === 'sq_yard' || collection.unit === 'yard'; // Fallback check

        // Step 1: Apply Min Billable Dimensions
        let billableWidth = Math.max(widthM, collection.min_billable_width || 0);
        let billableHeight = Math.max(heightM, collection.min_billable_height || 0);

        // Step 2: Apply Height Step (e.g., every 0.20m)
        // "สูง 210cm ต้องคิดที่ 220 cm" -> ceil(2.1 / 0.2) * 0.2 = 2.2
        if (collection.height_step && collection.height_step > 0) {
            billableHeight = Math.ceil(billableHeight / collection.height_step) * collection.height_step;
        }

        // Step 3: Calculate Base Area
        // Note: For sq_yard, usually we calculate in M2 first then convert, OR convert dimensions first?
        // Standard Thai curtain practice: W x H x Factor -> Area
        // If unit is sq_yard, factor usually includes conversion (1.2 or similar) or is explicit.

        let area = billableWidth * billableHeight;

        // Step 4: Apply Area Factor (Conversion or Fullness)
        if (collection.area_factor && collection.area_factor > 0) {
            area = area * collection.area_factor;
        }

        // Step 5: Apply Min Area
        // "พื้นที่ 4.2 ตร.หลา"
        if (collection.min_area && area < collection.min_area) {
            area = collection.min_area;
        }

        // Step 6: Apply Area Rounding
        // "4.2 -> 4.5" (Round up to nearest 0.5? or 0.1?)
        // Assuming area_rounding is the step (e.g. 0.5)
        // Step 6: Apply Area Rounding
        // "4.2 -> 4.5" (Round up to nearest 0.5? or 0.1?)
        if (collection.area_rounding && collection.area_rounding > 0) {
            area = Math.ceil(area / collection.area_rounding) * collection.area_rounding;
        }

        // Avoid floating point errors (e.g., 1.20000000000002)
        area = Number(area.toFixed(4));

        const total = area * price;
        const totalRounded = Math.ceil(Number(total.toFixed(2))); // Fix epsilon before ceil
        const unitLabel = isSqYard ? 'ตร.หลา' : 'ตร.ม.';

        return {
            total: totalRounded,
            breakdown: `${billableWidth.toFixed(2)}m x ${billableHeight.toFixed(2)}m x ${collection.area_factor || 1} = ${area.toFixed(2)} ${unitLabel} (@฿${price})`
        };
    }

    // --- LOGIC: BOX / ROLL ---
    if (method === 'box') {
        // Simple logic: Area / Coverage per box?
        // Current requirement doesn't specify box logic details, use basic area coverage if available or fallback
        // For now, return 0 or basic calc if possible, but let's stick to requested logic.
        return { total: 0, breakdown: 'Box calculation not fully implemented' };
    }

    // --- LOGIC: FIXED ---
    if (method === 'fixed') {
        return { total: price, breakdown: `ราคาเหมา: ฿${price}` };
    }

    return { total: 0, breakdown: 'รูปแบบการคำนวณไม่ถูกต้อง' };
};
