-- Migration: Create cart_items table linked to auth.users and products
CREATE TABLE IF NOT EXISTS public.cart_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    guest_id TEXT, -- to track guest carts locally/session based
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT null,
    
    CONSTRAINT check_user_or_guest CHECK (
        (user_id IS NOT NULL AND guest_id IS NULL) OR 
        (user_id IS NULL AND guest_id IS NOT NULL)
    ),
    CONSTRAINT unique_user_product UNIQUE (user_id, product_id),
    CONSTRAINT unique_guest_product UNIQUE (guest_id, product_id)
);

-- Enable RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Policies for public access (anonymous inserts, reads, and updates)
CREATE POLICY "Allow read access for anyone"
ON public.cart_items FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow insert/write access for anyone"
ON public.cart_items FOR ALL
TO public
USING (true)
WITH CHECK (true);
