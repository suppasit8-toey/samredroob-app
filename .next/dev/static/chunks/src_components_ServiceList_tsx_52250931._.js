(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/ServiceList.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ServiceList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/package.js [app-client] (ecmascript) <export default as Package>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wrench.js [app-client] (ecmascript) <export default as Wrench>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.js [app-client] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
"use client";
;
;
;
function ServiceList() {
    const services = [
        {
            title: "1. สั่งซื้อออนไลน์",
            subtitle: "(ประหยัดที่สุด)",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"], {
                size: 32,
                className: "text-gray-700"
            }, void 0, false, {
                fileName: "[project]/src/components/ServiceList.tsx",
                lineNumber: 12,
                columnNumber: 19
            }, this),
            description: "เลือกสินค้าออนไลน์ วัดพื้นที่ สั่งผลิต และติดตั้งเอง",
            details: [
                "เลือกสินค้าออนไลน์",
                "วัดพื้นที่เอง",
                "สั่งผลิตส่งถึงบ้าน",
                "ติดตั้งเอง"
            ],
            price: "ราคาสินค้า + ค่าจัดส่ง",
            highlight: false
        },
        {
            title: "2. บริการวัดหน้างาน",
            subtitle: "(ติดตั้งเอง)",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                size: 32,
                className: "text-gray-700"
            }, void 0, false, {
                fileName: "[project]/src/components/ServiceList.tsx",
                lineNumber: 26,
                columnNumber: 19
            }, this),
            description: "วัดพื้นที่และเลือกแบบถึงบ้าน (ลูกค้าติดตั้งเอง)",
            details: [
                "เลือกแบบเบื้องต้น",
                "นัดวัดพื้นที่หน้างาน",
                "เลือกแบบจริงหน้างาน",
                "สั่งผลิตส่งถึงบ้าน",
                "ติดตั้งเอง"
            ],
            price: "ค่าวัดหน้างาน + ราคาสินค้า + ค่าจัดส่ง",
            highlight: false
        },
        {
            title: "3. บริการครบวงจร",
            subtitle: "(แนะนำ)",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__["Wrench"], {
                size: 32,
                className: "text-yellow-600"
            }, void 0, false, {
                fileName: "[project]/src/components/ServiceList.tsx",
                lineNumber: 41,
                columnNumber: 19
            }, this),
            description: "ดูแลครบวงจร ตั้งแต่เลือกแบบ ผลิต จนถึงติดตั้ง",
            details: [
                "เลือกแบบเบื้องต้น",
                "นัดวัดพื้นที่หน้างาน",
                "เลือกแบบจริงหน้างาน",
                "ติดตั้งโดยทีมช่าง",
                "รับประกันงานติดตั้ง 1 ปี"
            ],
            price: "ค่าวัดหน้างาน + ราคาสินค้า + ค่าติดตั้ง",
            highlight: false
        },
        {
            title: "4. บริการครบวงจร (Premium)",
            subtitle: "(รับประกัน 2 ปี)",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                size: 32,
                className: "text-emerald-600"
            }, void 0, false, {
                fileName: "[project]/src/components/ServiceList.tsx",
                lineNumber: 56,
                columnNumber: 19
            }, this),
            description: "บริการพรีเมียม คุมงาน A-Z พร้อมออกแบบ & ประกัน 2 ปี",
            details: [
                "ปรึกษา & ออกแบบ",
                "นัดวัดพื้นที่หน้างาน",
                "เลือกแบบจริงหน้างาน",
                "คุมงานโดยผู้เชี่ยวชาญ",
                "รับประกันงานติดตั้ง 2 ปี"
            ],
            price: "ราคาเหมางาน",
            highlight: true
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            maxWidth: '100%',
            margin: '0 auto',
            padding: '2rem 0'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                style: {
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    marginBottom: '2rem',
                    textAlign: 'center'
                },
                children: "รูปแบบการให้บริการของเรา"
            }, void 0, false, {
                fileName: "[project]/src/components/ServiceList.tsx",
                lineNumber: 72,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
                style: {},
                children: services.map((service, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            opacity: 0,
                            y: 20
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        transition: {
                            delay: index * 0.1
                        },
                        style: {
                            backgroundColor: service.highlight ? 'white' : 'white',
                            border: service.highlight ? '2px solid var(--color-accent)' : '1px solid #eee',
                            borderRadius: 'var(--radius-lg)',
                            padding: '1.5rem',
                            boxShadow: service.highlight ? 'var(--shadow-lg)' : 'var(--shadow-card)',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column'
                        },
                        children: [
                            service.highlight && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    position: 'absolute',
                                    top: '-10px',
                                    right: '10px',
                                    backgroundColor: 'var(--color-accent)',
                                    color: 'white',
                                    padding: '2px 10px',
                                    borderRadius: '15px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700
                                },
                                children: "แนะนำ"
                            }, void 0, false, {
                                fileName: "[project]/src/components/ServiceList.tsx",
                                lineNumber: 98,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    justifyContent: 'center'
                                },
                                children: service.icon
                            }, void 0, false, {
                                fileName: "[project]/src/components/ServiceList.tsx",
                                lineNumber: 113,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    marginBottom: '0.5rem',
                                    textAlign: 'center'
                                },
                                children: [
                                    service.title,
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                        fileName: "[project]/src/components/ServiceList.tsx",
                                        lineNumber: 118,
                                        columnNumber: 45
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: '0.9rem',
                                            fontWeight: 500,
                                            color: '#555'
                                        },
                                        children: service.subtitle
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ServiceList.tsx",
                                        lineNumber: 119,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/ServiceList.tsx",
                                lineNumber: 117,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    color: '#444',
                                    marginBottom: '1rem',
                                    textAlign: 'center',
                                    minHeight: '3rem',
                                    fontWeight: 400,
                                    fontSize: '0.9rem',
                                    lineHeight: '1.4'
                                },
                                children: service.description
                            }, void 0, false, {
                                fileName: "[project]/src/components/ServiceList.tsx",
                                lineNumber: 124,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '0.75rem',
                                    marginBottom: '1rem',
                                    flex: 1
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                    style: {
                                        paddingLeft: '1.2rem',
                                        margin: 0
                                    },
                                    children: service.details.map((detail, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            style: {
                                                marginBottom: '0.25rem',
                                                fontSize: '0.85rem',
                                                color: '#333',
                                                fontWeight: 500
                                            },
                                            children: detail
                                        }, idx, false, {
                                            fileName: "[project]/src/components/ServiceList.tsx",
                                            lineNumber: 137,
                                            columnNumber: 37
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ServiceList.tsx",
                                    lineNumber: 135,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/ServiceList.tsx",
                                lineNumber: 128,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    textAlign: 'center',
                                    paddingTop: '0.75rem',
                                    borderTop: '1px solid #eee',
                                    fontWeight: 600,
                                    color: service.highlight ? 'var(--color-accent)' : 'var(--color-primary)',
                                    whiteSpace: 'normal',
                                    fontSize: '0.85rem'
                                },
                                children: service.price
                            }, void 0, false, {
                                fileName: "[project]/src/components/ServiceList.tsx",
                                lineNumber: 144,
                                columnNumber: 25
                            }, this)
                        ]
                    }, index, true, {
                        fileName: "[project]/src/components/ServiceList.tsx",
                        lineNumber: 81,
                        columnNumber: 21
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/ServiceList.tsx",
                lineNumber: 76,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ServiceList.tsx",
        lineNumber: 71,
        columnNumber: 9
    }, this);
}
_c = ServiceList;
var _c;
__turbopack_context__.k.register(_c, "ServiceList");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_ServiceList_tsx_52250931._.js.map