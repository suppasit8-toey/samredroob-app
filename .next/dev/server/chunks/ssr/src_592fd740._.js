module.exports = [
"[project]/src/lib/supabase.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-ssr] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://qrrrqjizdtqsumedhqxq.supabase.co");
const supabaseKey = ("TURBOPACK compile-time value", "sb_publishable_Z6yH4xx-Xct8Z7i3s6ZmsA_EY4QFnWY");
const supabase = ("TURBOPACK compile-time truthy", 1) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseKey) : "TURBOPACK unreachable";
}),
"[project]/src/utils/pricing.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculatePrice",
    ()=>calculatePrice
]);
const calculatePrice = (collection, widthCm, heightCm, priceOverride // Optional override (e.g., for platform pricing)
)=>{
    // 1. Convert inputs to meters
    const widthM = widthCm / 100;
    const heightM = heightCm / 100;
    const method = collection.calculation_method || 'area';
    // Use override if provided, otherwise default to collection price
    const price = priceOverride !== undefined ? priceOverride : collection.price_per_unit || 0;
    // 2. Validate Max Constraints (throw error or just warn in breakdown)
    if (collection.max_width && widthM > collection.max_width) {
        return {
            total: 0,
            breakdown: `ความกว้างเกินกำหนด (${collection.max_width} ม.)`
        };
    }
    if (collection.max_height && heightM > collection.max_height) {
        return {
            total: 0,
            breakdown: `ความสูงเกินกำหนด (${collection.max_height} ม.)`
        };
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
        return {
            total: 0,
            breakdown: 'Box calculation not fully implemented'
        };
    }
    // --- LOGIC: FIXED ---
    if (method === 'fixed') {
        return {
            total: price,
            breakdown: `ราคาเหมา: ฿${price}`
        };
    }
    return {
        total: 0,
        breakdown: 'รูปแบบการคำนวณไม่ถูกต้อง'
    };
};
}),
"[project]/src/app/(shop)/calculator/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CalculatorPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$pricing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/pricing.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calculator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calculator$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calculator.js [app-ssr] (ecmascript) <export default as Calculator>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-ssr] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/external-link.js [app-ssr] (ecmascript) <export default as ExternalLink>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-cart.js [app-ssr] (ecmascript) <export default as ShoppingCart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-ssr] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$store$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Store$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/store.js [app-ssr] (ecmascript) <export default as Store>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-bag.js [app-ssr] (ecmascript) <export default as ShoppingBag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/info.js [app-ssr] (ecmascript) <export default as Info>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$CartContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/CartContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
function CalculatorPage() {
    const { addToCart, cartCount } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$CartContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCart"])();
    const [categories, setCategories] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [collections, setCollections] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    // Form State
    const [width, setWidth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [height, setHeight] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [selectedCategoryId, setSelectedCategoryId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [priceMode, setPriceMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('shop');
    const [results, setResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [addedItems, setAddedItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const initData = async ()=>{
            if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"]) return;
            try {
                setLoading(true);
                // Fetch Categories
                const { data: catData, error: catError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('product_categories').select('*').order('name');
                if (catError) throw catError;
                setCategories(catData || []);
                // Fetch Collections
                const { data: colData, error: colError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('product_collections').select('*').order('name');
                if (colError) throw colError;
                setCollections(colData || []);
                // Set Default Category if exists
                if (catData && catData.length > 0) {
                    setSelectedCategoryId(catData[0].id.toString());
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally{
                setLoading(false);
            }
        };
        initData();
    }, []);
    // Filter collections based on selected category
    const filteredCollections = collections.filter((c)=>selectedCategoryId ? c.category_id.toString() === selectedCategoryId : true);
    const handleCalculate = (e)=>{
        e.preventDefault();
        setAddedItems(new Set()); // Reset added state on new calculation
        if (width && height && filteredCollections.length > 0) {
            const calculatedResults = filteredCollections.map((collection)=>{
                // Determine price based on mode
                // If platform mode, use platform price. If not available, fallback to shop price?
                // Or maybe use 0 if not available? Let's use standard fallback logic in pricing util if we pass undefined,
                // but here we want to be explicit.
                let priceToUse = collection.price_per_unit;
                if (priceMode === 'platform') {
                    // Check if platform price exists and is > 0
                    if (collection.price_per_unit_platform && collection.price_per_unit_platform > 0) {
                        priceToUse = collection.price_per_unit_platform;
                    } else {
                        // Fallback or warning? For now use standard
                        priceToUse = collection.price_per_unit;
                    }
                }
                const res = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$pricing$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculatePrice"])(collection, Number(width), Number(height), priceToUse);
                return {
                    collection,
                    total: res.total,
                    breakdown: res.breakdown
                };
            });
            // Sort by price (lowest first)
            calculatedResults.sort((a, b)=>a.total - b.total);
            setResults(calculatedResults);
        }
    };
    const handleAddToCart = (item)=>{
        addToCart({
            collection: item.collection,
            width: Number(width),
            height: Number(height),
            totalPrice: item.total,
            breakdown: item.breakdown
        });
        setAddedItems((prev)=>new Set(prev).add(item.collection.id.toString()));
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex justify-center items-center min-h-[50vh]",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                className: "animate-spin text-gray-400",
                size: 48
            }, void 0, false, {
                fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                lineNumber: 123,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/(shop)/calculator/page.tsx",
            lineNumber: 122,
            columnNumber: 13
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            padding: '2rem 1rem',
            maxWidth: '1200px',
            margin: '0 auto',
            position: 'relative'
        },
        children: [
            cartCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                href: "/quotation",
                className: "fixed right-4 bottom-28 md:bottom-8 z-50 flex items-center gap-3 bg-black text-white px-6 py-4 rounded-full shadow-2xl hover:scale-105 transition-transform duration-200",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__["ShoppingCart"], {
                                size: 24
                            }, void 0, false, {
                                fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                lineNumber: 138,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-black",
                                children: cartCount
                            }, void 0, false, {
                                fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                lineNumber: 139,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                        lineNumber: 137,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-semibold text-base font-[family-name:var(--font-mitr)]",
                        children: "ดูใบเสนอราคา"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                        lineNumber: 143,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                lineNumber: 133,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                style: {
                    textAlign: 'center',
                    marginBottom: '2rem',
                    fontSize: '2.5rem',
                    fontFamily: 'var(--font-mitr)'
                },
                children: "คำนวณราคา"
            }, void 0, false, {
                fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                lineNumber: 147,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-f07ef469939759f5" + " " + "calculator-layout",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        id: "f07ef469939759f5",
                        children: ".calculator-layout.jsx-f07ef469939759f5{flex-direction:column;gap:2rem;display:flex}.results-grid.jsx-f07ef469939759f5{grid-template-columns:1fr;gap:1.5rem;display:grid}@media (width>=768px){.calculator-layout.jsx-f07ef469939759f5{flex-direction:row;align-items:flex-start}.input-section.jsx-f07ef469939759f5{width:350px;position:sticky;top:2rem}.results-section.jsx-f07ef469939759f5{flex:1}.results-grid.jsx-f07ef469939759f5{grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}}"
                    }, void 0, false, void 0, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-f07ef469939759f5" + " " + "input-section",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: handleCalculate,
                            style: {
                                backgroundColor: 'white',
                                padding: '2rem',
                                borderRadius: '16px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                border: '1px solid #f0f0f0'
                            },
                            className: "jsx-f07ef469939759f5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    style: {
                                        fontSize: '1.25rem',
                                        marginBottom: '1.5rem',
                                        fontWeight: 600
                                    },
                                    className: "jsx-f07ef469939759f5",
                                    children: "กรอกข้อมูล"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                    lineNumber: 189,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        marginBottom: '1.5rem'
                                    },
                                    className: "jsx-f07ef469939759f5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            style: {
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: 500,
                                                color: '#666'
                                            },
                                            className: "jsx-f07ef469939759f5",
                                            children: "หมวดหมู่สินค้า"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                            lineNumber: 193,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            value: selectedCategoryId,
                                            onChange: (e)=>{
                                                setSelectedCategoryId(e.target.value);
                                                setResults(null); // Clear results on category change
                                            },
                                            style: {
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: '1px solid #e5e5e5',
                                                borderRadius: '8px',
                                                fontSize: '1rem',
                                                fontFamily: 'var(--font-mitr)',
                                                backgroundColor: '#fff'
                                            },
                                            className: "jsx-f07ef469939759f5",
                                            children: categories.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: c.id,
                                                    className: "jsx-f07ef469939759f5",
                                                    children: c.name
                                                }, c.id, false, {
                                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                    lineNumber: 211,
                                                    columnNumber: 37
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                            lineNumber: 194,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                    lineNumber: 192,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        marginBottom: '1.5rem'
                                    },
                                    className: "jsx-f07ef469939759f5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginBottom: '1rem'
                                            },
                                            className: "jsx-f07ef469939759f5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    style: {
                                                        display: 'block',
                                                        marginBottom: '0.5rem',
                                                        fontWeight: 500,
                                                        color: '#666'
                                                    },
                                                    className: "jsx-f07ef469939759f5",
                                                    children: "ความกว้าง (ซม.)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                    lineNumber: 220,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "number",
                                                    value: width,
                                                    onChange: (e)=>setWidth(Number(e.target.value)),
                                                    placeholder: "เช่น 200",
                                                    required: true,
                                                    style: {
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        border: '1px solid #e5e5e5',
                                                        borderRadius: '8px',
                                                        fontSize: '1rem',
                                                        fontFamily: 'var(--font-mitr)'
                                                    },
                                                    className: "jsx-f07ef469939759f5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                    lineNumber: 221,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                            lineNumber: 219,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-f07ef469939759f5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    style: {
                                                        display: 'block',
                                                        marginBottom: '0.5rem',
                                                        fontWeight: 500,
                                                        color: '#666'
                                                    },
                                                    className: "jsx-f07ef469939759f5",
                                                    children: "ความสูง (ซม.)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                    lineNumber: 238,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "number",
                                                    value: height,
                                                    onChange: (e)=>setHeight(Number(e.target.value)),
                                                    placeholder: "เช่น 250",
                                                    required: true,
                                                    style: {
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        border: '1px solid #e5e5e5',
                                                        borderRadius: '8px',
                                                        fontSize: '1rem',
                                                        fontFamily: 'var(--font-mitr)'
                                                    },
                                                    className: "jsx-f07ef469939759f5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                    lineNumber: 239,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                            lineNumber: 237,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                    lineNumber: 218,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        marginBottom: '1.5rem'
                                    },
                                    className: "jsx-f07ef469939759f5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            style: {
                                                display: 'block',
                                                marginBottom: '0.5rem',
                                                fontWeight: 500,
                                                color: '#666'
                                            },
                                            className: "jsx-f07ef469939759f5",
                                            children: "ช่องทางการสั่งซื้อ"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                            lineNumber: 258,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                gap: '0.5rem',
                                                backgroundColor: '#f5f5f5',
                                                padding: '0.25rem',
                                                borderRadius: '8px'
                                            },
                                            className: "jsx-f07ef469939759f5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>{
                                                        setPriceMode('shop');
                                                        setResults(null);
                                                    },
                                                    style: {
                                                        flex: 1,
                                                        padding: '0.5rem',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        backgroundColor: priceMode === 'shop' ? 'white' : 'transparent',
                                                        color: priceMode === 'shop' ? 'black' : '#666',
                                                        boxShadow: priceMode === 'shop' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                        fontWeight: 600,
                                                        fontSize: '0.9rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.4rem',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    },
                                                    className: "jsx-f07ef469939759f5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$store$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Store$3e$__["Store"], {
                                                            size: 16
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                            lineNumber: 284,
                                                            columnNumber: 37
                                                        }, this),
                                                        " หน้าร้าน"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                    lineNumber: 260,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>{
                                                        setPriceMode('platform');
                                                        setResults(null);
                                                    },
                                                    style: {
                                                        flex: 1,
                                                        padding: '0.5rem',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        backgroundColor: priceMode === 'platform' ? 'white' : 'transparent',
                                                        color: priceMode === 'platform' ? '#f97316' : '#666',
                                                        boxShadow: priceMode === 'platform' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                        fontWeight: 600,
                                                        fontSize: '0.9rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.4rem',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    },
                                                    className: "jsx-f07ef469939759f5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$bag$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBag$3e$__["ShoppingBag"], {
                                                            size: 16
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                            lineNumber: 310,
                                                            columnNumber: 37
                                                        }, this),
                                                        " แพลตฟอร์ม"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                    lineNumber: 286,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                            lineNumber: 259,
                                            columnNumber: 29
                                        }, this),
                                        priceMode === 'platform' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: '0.75rem',
                                                color: '#f97316',
                                                marginTop: '0.5rem',
                                                display: 'flex',
                                                gap: '0.25rem'
                                            },
                                            className: "jsx-f07ef469939759f5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                                                    size: 12,
                                                    style: {
                                                        marginTop: '2px'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                    lineNumber: 315,
                                                    columnNumber: 37
                                                }, this),
                                                " ราคาอาจสูงกว่าหน้าร้านเนื่องจากมีค่าธรรมเนียม"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                            lineNumber: 314,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                    lineNumber: 257,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    style: {
                                        width: '100%',
                                        padding: '1rem',
                                        backgroundColor: 'black',
                                        color: 'white',
                                        fontWeight: 600,
                                        borderRadius: '8px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer',
                                        border: 'none',
                                        fontSize: '1rem'
                                    },
                                    className: "jsx-f07ef469939759f5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calculator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calculator$3e$__["Calculator"], {
                                            size: 20
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                            lineNumber: 339,
                                            columnNumber: 29
                                        }, this),
                                        " คำนวณราคา ",
                                        priceMode === 'platform' ? '(Platform)' : ''
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                    lineNumber: 320,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                            lineNumber: 182,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                        lineNumber: 181,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-f07ef469939759f5" + " " + "results-section",
                        children: results ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '1.5rem'
                                    },
                                    className: "jsx-f07ef469939759f5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            style: {
                                                fontSize: '1.5rem',
                                                fontWeight: 600
                                            },
                                            className: "jsx-f07ef469939759f5",
                                            children: [
                                                "ผลลัพธ์การคำนวณ (",
                                                results.length,
                                                " รายการ)"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                            lineNumber: 349,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setResults(null),
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                color: '#666',
                                                fontSize: '0.9rem',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '20px',
                                                backgroundColor: '#f5f5f5',
                                                border: 'none',
                                                cursor: 'pointer'
                                            },
                                            className: "jsx-f07ef469939759f5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                    size: 14
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                    lineNumber: 367,
                                                    columnNumber: 37
                                                }, this),
                                                " ล้างค่าใหม่"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                            lineNumber: 352,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                    lineNumber: 348,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-f07ef469939759f5" + " " + "results-grid",
                                    children: results.map((item, index)=>{
                                        const isAdded = addedItems.has(item.collection.id.toString());
                                        const isError = item.total === 0;
                                        // Determine display unit price
                                        let displayUnitPrice = item.collection.price_per_unit;
                                        if (priceMode === 'platform' && item.collection.price_per_unit_platform) {
                                            displayUnitPrice = item.collection.price_per_unit_platform;
                                        }
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                backgroundColor: 'white',
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                border: isAdded ? '2px solid #22c55e' : isError ? '1px solid #fee2e2' : '1px solid #f0f0f0',
                                                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                opacity: isError ? 0.8 : 1
                                            },
                                            className: "jsx-f07ef469939759f5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        padding: '1.5rem',
                                                        flex: 1
                                                    },
                                                    className: "jsx-f07ef469939759f5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'flex-start',
                                                                marginBottom: '1rem'
                                                            },
                                                            className: "jsx-f07ef469939759f5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                    style: {
                                                                        fontSize: '1.1rem',
                                                                        fontWeight: 600,
                                                                        color: '#1a1a1a',
                                                                        lineHeight: 1.4
                                                                    },
                                                                    className: "jsx-f07ef469939759f5",
                                                                    children: item.collection.name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                                    lineNumber: 396,
                                                                    columnNumber: 53
                                                                }, this),
                                                                index === 0 && !isError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontSize: '0.7rem',
                                                                        padding: '0.2rem 0.6rem',
                                                                        backgroundColor: '#DCFCE7',
                                                                        color: '#166534',
                                                                        borderRadius: '12px',
                                                                        fontWeight: 700,
                                                                        whiteSpace: 'nowrap'
                                                                    },
                                                                    className: "jsx-f07ef469939759f5",
                                                                    children: "คุ้มค่าที่สุด"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                                    lineNumber: 400,
                                                                    columnNumber: 57
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                            lineNumber: 395,
                                                            columnNumber: 49
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                marginBottom: '1rem'
                                                            },
                                                            className: "jsx-f07ef469939759f5",
                                                            children: isError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '1.5rem',
                                                                    fontWeight: 700,
                                                                    color: '#ef4444'
                                                                },
                                                                className: "jsx-f07ef469939759f5",
                                                                children: "เกินเงื่อนไข"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                                lineNumber: 416,
                                                                columnNumber: 57
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '2rem',
                                                                    fontWeight: 700,
                                                                    color: 'black'
                                                                },
                                                                className: "jsx-f07ef469939759f5",
                                                                children: [
                                                                    "฿",
                                                                    item.total.toLocaleString()
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                                lineNumber: 420,
                                                                columnNumber: 57
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                            lineNumber: 414,
                                                            columnNumber: 49
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                fontSize: '0.85rem',
                                                                color: '#666',
                                                                lineHeight: 1.6,
                                                                backgroundColor: '#f9fafb',
                                                                padding: '0.75rem',
                                                                borderRadius: '8px',
                                                                marginBottom: '1rem'
                                                            },
                                                            className: "jsx-f07ef469939759f5",
                                                            children: [
                                                                "ราคาต่อหน่วย: ",
                                                                displayUnitPrice,
                                                                " บาท/",
                                                                item.collection.unit,
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {
                                                                    className: "jsx-f07ef469939759f5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                                    lineNumber: 428,
                                                                    columnNumber: 53
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        opacity: 0.8,
                                                                        color: isError ? '#ef4444' : 'inherit'
                                                                    },
                                                                    className: "jsx-f07ef469939759f5",
                                                                    children: isError ? item.breakdown : item.breakdown.split(' (')[0]
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                                    lineNumber: 429,
                                                                    columnNumber: 53
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                            lineNumber: 426,
                                                            columnNumber: 49
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>handleAddToCart(item),
                                                            disabled: isAdded || isError,
                                                            style: {
                                                                width: '100%',
                                                                padding: '0.75rem',
                                                                backgroundColor: isAdded ? '#dcfce7' : isError ? '#e5e5e5' : 'black',
                                                                color: isAdded ? '#166534' : isError ? '#a3a3a3' : 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                fontWeight: 600,
                                                                cursor: isAdded || isError ? 'default' : 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '0.5rem',
                                                                transition: 'all 0.2s'
                                                            },
                                                            className: "jsx-f07ef469939759f5",
                                                            children: isAdded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                                        size: 18
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                                        lineNumber: 455,
                                                                        columnNumber: 61
                                                                    }, this),
                                                                    " เพิ่มแล้ว"
                                                                ]
                                                            }, void 0, true) : isError ? 'ไม่สามารถสั่งซื้อได้' : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__["ShoppingCart"], {
                                                                        size: 18
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                                        lineNumber: 461,
                                                                        columnNumber: 61
                                                                    }, this),
                                                                    " เพิ่มรายการ"
                                                                ]
                                                            }, void 0, true)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                            lineNumber: 434,
                                                            columnNumber: 49
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                    lineNumber: 394,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        padding: '1rem 1.5rem',
                                                        borderTop: '1px solid #f5f5f5',
                                                        display: 'flex',
                                                        gap: '0.5rem',
                                                        backgroundColor: '#fafafa'
                                                    },
                                                    className: "jsx-f07ef469939759f5",
                                                    children: item.collection.catalog_url && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: item.collection.catalog_url,
                                                        target: "_blank",
                                                        rel: "noopener noreferrer",
                                                        style: {
                                                            flex: 1,
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            gap: '0.4rem',
                                                            padding: '0.5rem',
                                                            backgroundColor: 'white',
                                                            border: '1px solid #e5e5e5',
                                                            borderRadius: '6px',
                                                            fontSize: '0.85rem',
                                                            color: '#333',
                                                            textDecoration: 'none',
                                                            fontWeight: 500
                                                        },
                                                        className: "jsx-f07ef469939759f5",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                                                                size: 14
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                                lineNumber: 495,
                                                                columnNumber: 57
                                                            }, this),
                                                            " Catalog"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                        lineNumber: 475,
                                                        columnNumber: 53
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                                    lineNumber: 467,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, item.collection.id, true, {
                                            fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                            lineNumber: 383,
                                            columnNumber: 41
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                    lineNumber: 371,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                minHeight: '300px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '16px',
                                border: '2px dashed #e5e5e5',
                                color: '#888'
                            },
                            className: "jsx-f07ef469939759f5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calculator$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calculator$3e$__["Calculator"], {
                                    size: 48,
                                    style: {
                                        opacity: 0.2,
                                        marginBottom: '1rem'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                    lineNumber: 517,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        fontSize: '1.1rem',
                                        fontWeight: 500
                                    },
                                    className: "jsx-f07ef469939759f5",
                                    children: "กรอกขนาดเพื่อเปรียบเทียบราคา"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                    lineNumber: 518,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        fontSize: '0.9rem',
                                        opacity: 0.7
                                    },
                                    className: "jsx-f07ef469939759f5",
                                    children: "ระบบจะคำนวณราคาสินค้าทั้งหมดในหมวดหมู่นี้ให้ทันที"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                                    lineNumber: 519,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                            lineNumber: 505,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                        lineNumber: 345,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(shop)/calculator/page.tsx",
                lineNumber: 149,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(shop)/calculator/page.tsx",
        lineNumber: 129,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=src_592fd740._.js.map