
const price = 600;
const widthCm = 120;
const widthM = widthCm / 100; // 1.2

const width_step = 0.1;

// Logic from naming
let billableWidth = Math.max(widthM, 0);
billableWidth = Math.ceil(billableWidth / width_step) * width_step;

console.log(`Width: ${widthCm} -> ${widthM}`);
console.log(`Step: ${width_step}`);
console.log(`Billable Width (raw):`, billableWidth);
console.log(`Billable Width (toFixed 20):`, billableWidth.toFixed(20));

const total = billableWidth * price;
console.log(`Total (raw):`, total);
console.log(`Total (ceil):`, Math.ceil(total));

// Check other cases
const cases = [
    { price: 600, width: 120 },
    { price: 800, width: 120 },
    { price: 1000, width: 120 },
    { price: 1050, width: 120 },
    { price: 1150, width: 120 },
];

cases.forEach(c => {
    const w = c.width / 100;
    let bw = Math.ceil(w / width_step) * width_step;
    const t = bw * c.price;
    console.log(`Price ${c.price}, Width ${c.width}: Total Raw = ${t}, Ceil = ${Math.ceil(t)}`);
});
