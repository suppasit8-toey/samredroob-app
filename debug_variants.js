const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env manually
const envPath = path.resolve(process.cwd(), '.env.local');
let env = {};
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/"/g, '');
            env[key] = value;
        }
    });
} catch (e) {
    console.log("Could not read .env.local");
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error("Missing credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
    console.log("Searching for 'Dimout' or 'ม่านจีบ' collections...");
    const { data: collections, error: err1 } = await supabase
        .from('product_collections')
        .select('*')
        .or('name.ilike.%Dimout%,name.ilike.%ม่านจีบ%');

    if (err1) {
        console.error('Error fetching collections:', err1);
        return;
    }

    if (!collections || collections.length === 0) {
        console.log("No collections found.");
        return;
    }

    console.log(`Found ${collections.length} collections.`);

    for (const col of collections) {
        console.log(`Checking variants for: ${col.name} (ID: ${col.id})`);
        const { data: variants, error: err2 } = await supabase
            .from('product_variants')
            .select('*')
            .eq('collection_id', col.id);

        if (err2) {
            console.error(`Error fetching variants for ${col.id}:`, err2);
        } else {
            console.log(`- Variants found: ${variants.length}`);
            variants.forEach(v => {
                console.log(`  - [${v.id}] ${v.name} (Stock: ${v.in_stock})`);
            });
        }
    }
}

run();
