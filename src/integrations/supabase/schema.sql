-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Products Table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price numeric not null,
  images text[] not null default '{}',
  category text,
  sizes text[] not null default '{}',
  featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Orders Table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  client_name text not null,
  total numeric not null,
  status text not null default 'Pendente',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  items jsonb not null default '[]'
);

-- Create Site Settings Table
create table public.site_settings (
  id uuid default uuid_generate_v4() primary key,
  store_name text not null default 'Conexão 011',
  shipping_price numeric not null default 0,
  pix_key text,
  whatsapp_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default settings
insert into public.site_settings (store_name, shipping_price, pix_key, whatsapp_number)
values ('Conexão 011', 0, 'conexao011.loja@gmail.com', '3398263040');

-- Enable Row Level Security (RLS)
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.site_settings enable row level security;

-- Create Policies (Public Read, Authenticated Write for Admin)
-- For simplicity in this demo, we'll allow public read/write but in production you should restrict write to admins.
-- Ideally, you'd check for a specific user role or ID.

-- Products: Everyone can read, only authenticated can write
create policy "Public products are viewable by everyone" on public.products for select using (true);
create policy "Authenticated users can insert products" on public.products for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update products" on public.products for update using (auth.role() = 'authenticated');
create policy "Authenticated users can delete products" on public.products for delete using (auth.role() = 'authenticated');

-- Orders: Everyone can insert (place order), only authenticated can view all
create policy "Everyone can insert orders" on public.orders for insert with check (true);
create policy "Authenticated users can view all orders" on public.orders for select using (auth.role() = 'authenticated');

-- Settings: Everyone can read, only authenticated can update
create policy "Public settings are viewable by everyone" on public.site_settings for select using (true);
create policy "Authenticated users can update settings" on public.site_settings for update using (auth.role() = 'authenticated');

-- Storage Buckets
insert into storage.buckets (id, name, public) values ('products', 'products', true);

-- Storage Policies
create policy "Public Access" on storage.objects for select using ( bucket_id = 'products' );
create policy "Authenticated Upload" on storage.objects for insert with check ( bucket_id = 'products' and auth.role() = 'authenticated' );
create policy "Authenticated Delete" on storage.objects for delete using ( bucket_id = 'products' and auth.role() = 'authenticated' );
