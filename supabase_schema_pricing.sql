-- Create table for storing pricing constants
create table pricing_constants (
  key text primary key,
  value numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default values (Optional)
insert into pricing_constants (key, value) values
('vat_rate', 7),
('installation_fee_min', 1500),
('waste_factor_curtain', 1.2),
('waste_factor_wallpaper', 1.15);

-- Enable Row Level Security (RLS)
alter table pricing_constants enable row level security;

-- Create policy to allow read access to everyone (public)
create policy "Enable read access for all users" on pricing_constants
  for select using (true);

-- Create policy to allow insert/update/delete for authenticated users only (Admin logic to be refined)
create policy "Enable all access for authenticated users only" on pricing_constants
  for all using (auth.role() = 'authenticated');
