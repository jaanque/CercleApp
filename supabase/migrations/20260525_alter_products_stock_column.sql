-- Migration: Alter products table to use a single 'stock' column instead of multiple stock columns

-- 1. Add the new 'stock' column as integer
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- 2. Backfill 'stock' from 'stock_remaining' if it exists, otherwise set to a default (e.g. 5)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='products' AND column_name='stock_remaining'
    ) THEN
        UPDATE public.products SET stock = COALESCE(stock_remaining, 0);
    ELSE
        UPDATE public.products SET stock = 5;
    END IF;
END $$;

-- 3. Drop obsolete stock columns if they exist
ALTER TABLE public.products DROP COLUMN IF EXISTS stock_remaining;
ALTER TABLE public.products DROP COLUMN IF EXISTS max_stock;
ALTER TABLE public.products DROP COLUMN IF EXISTS stock_text;
