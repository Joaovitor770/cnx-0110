-- Create Hero Slides Table
create table public.hero_slides (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  subtitle text,
  image_url text,
  button_text text,
  button_link text,
  background_type text default 'Imagem + Texto',
  background_color text,
  order_index integer default 0,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.hero_slides enable row level security;

-- Create Policies
-- Everyone can read active slides (for the frontend)
create policy "Public hero_slides are viewable by everyone" on public.hero_slides for select using (true);

-- Only authenticated users (admins) can insert, update, delete
create policy "Authenticated users can insert hero_slides" on public.hero_slides for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update hero_slides" on public.hero_slides for update using (auth.role() = 'authenticated');
create policy "Authenticated users can delete hero_slides" on public.hero_slides for delete using (auth.role() = 'authenticated');

-- Storage Bucket for Hero Images
insert into storage.buckets (id, name, public) values ('hero', 'hero', true);

-- Storage Policies
create policy "Public Access Hero" on storage.objects for select using ( bucket_id = 'hero' );
create policy "Authenticated Upload Hero" on storage.objects for insert with check ( bucket_id = 'hero' and auth.role() = 'authenticated' );
create policy "Authenticated Delete Hero" on storage.objects for delete using ( bucket_id = 'hero' and auth.role() = 'authenticated' );
