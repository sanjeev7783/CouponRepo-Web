-- Temporarily make user_id nullable and remove foreign key constraint
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

ALTER TABLE public.orders 
ALTER COLUMN user_id DROP NOT NULL;

-- Add email column to store user email
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Fix order_items table to handle both coupons and prashads
ALTER TABLE public.order_items 
DROP CONSTRAINT IF EXISTS order_items_coupon_id_fkey;

ALTER TABLE public.order_items 
ALTER COLUMN coupon_id DROP NOT NULL;

ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS prashad_id UUID REFERENCES public.prashad(id);

ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'coupon';

-- Add constraint to ensure either coupon_id or prashad_id is set
ALTER TABLE public.order_items 
ADD CONSTRAINT check_item_type CHECK (
  (coupon_id IS NOT NULL AND prashad_id IS NULL) OR 
  (coupon_id IS NULL AND prashad_id IS NOT NULL)
);