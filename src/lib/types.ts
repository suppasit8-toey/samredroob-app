export interface Category {
    id: number;
    name: string;
    slug?: string;
    image_url?: string;
    created_at?: string;
}

export interface Brand {
    id: number;
    name: string;
    logo_url?: string;
    created_at?: string;
}

export interface ProductCollection {
    id: number;
    name: string;
    name_en?: string;
    category_id: number;
    unit: string;
    price_per_unit: number;
    price_per_unit_platform?: number;
    calculation_method?: string;
    created_at?: string;
    brand_id?: number;

    // Constraints
    min_width?: number;
    max_width?: number;
    max_height?: number;
    min_area?: number;
    area_factor?: number;
    min_billable_width?: number;
    min_billable_height?: number;
    width_step?: number;
    height_step?: number;
    area_rounding?: number;
    coverage_per_unit?: number; // sq.m. per roll/box (for box calculation)
    roll_width_cm?: number;     // physical roll width in cm (e.g., 50 or 100)
    roll_length_cm?: number;    // physical roll length in cm (e.g., 1000 or 1500)

    // Advanced Pricing
    price_data?: any; // JSONB for storing price steps or ranges

    // Links
    catalog_url?: string;
    portfolio_url?: string;

    // Joined fields (optional)
    product_categories?: Category;
    product_brands?: Brand;
    tags?: string[];
}

export interface ProductVariant {
    id: number;
    collection_id: number;
    name: string;
    image_url?: string;
    created_at?: string;
    in_stock?: boolean;
    description?: string; // New field

    // Joined fields
    product_collections?: ProductCollection;
}
