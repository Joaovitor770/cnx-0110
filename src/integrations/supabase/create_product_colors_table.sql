-- Create Product Colors Table
create table public.product_colors (
  id uuid default uuid_generate_v4() primary key,
  product_id bigint references public.products(id) on delete cascade not null,
  name text not null,
  color_value text not null, -- HEX code or RGB
  images text[] default '{}', -- Specific images for this color
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.product_colors enable row level security;

-- Policies
create policy "Public product colors are viewable by everyone" on public.product_colors for select using (true);
create policy "Authenticated users can insert product colors" on public.product_colors for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update product colors" on public.product_colors for update using (auth.role() = 'authenticated');
create policy "Authenticated users can delete product colors" on public.product_colors for delete using (auth.role() = 'authenticated');
