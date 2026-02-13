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
const supabase = createClient(url, key);

async function run() {
    console.log("Checking variants for Collection ID: 4");

    // Check if collection exists
    const { data: col, error: errCol } = await supabase
        .from('product_collections')
        .select('*')
        .eq('id', 4)
        .single();

    if (errCol) console.error("Error fetching col 4:", errCol);
    else console.log("Collection 4:", col ? col.name : "Not Found");

    // Check variants
    const { data: variants, error: err } = await supabase
        .from('product_variants')
        .select('*')
        .eq('collection_id', 4);

    if (err) {
        console.error("Error fetching variants for ID 4:", err);
    } else {
        console.log(`Variants for ID 4: ${variants.length}`);
        variants.forEach(v => console.log(`- [${v.id}] ${v.name} (Stock: ${v.in_stock})`));
    }
}

run();
