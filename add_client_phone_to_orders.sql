-- Add client_phone column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS client_phone TEXT;
