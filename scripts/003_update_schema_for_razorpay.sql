-- Update orders table to use Razorpay fields instead of Stripe
ALTER TABLE public.orders 
DROP COLUMN IF EXISTS stripe_payment_intent_id;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON public.orders(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);
