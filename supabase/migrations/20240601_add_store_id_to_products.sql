-- Migration: Replace textual columns with foreign key relationships
-- Assumes `stores.id` and `categories.id` are BIGINT primary keys.

-- ==== Products table ==== 
-- Drop existing store_id column if it exists (from previous failed attempts)
ALTER TABLE products DROP COLUMN IF EXISTS store_id;

-- Add new nullable store_id column of type BIGINT
ALTER TABLE products
  ADD COLUMN store_id TEXT;

-- Backfill store_id using the store name reference (products.store holds the store name)
UPDATE products
  SET store_id = (
    SELECT id FROM stores WHERE stores.name = products.store
  )
  WHERE store_id IS NULL;

-- Fallback: assign the first store ID for any products that still have NULL (no matching name)
UPDATE products
  SET store_id = (SELECT id FROM stores ORDER BY id LIMIT 1)
  WHERE store_id IS NULL;

-- Drop the old textual store column
ALTER TABLE products DROP COLUMN store;

-- Enforce NOT NULL and add foreign key constraint to stores(id)
ALTER TABLE products
  ALTER COLUMN store_id SET NOT NULL;
ALTER TABLE products
  ADD CONSTRAINT fk_products_store_id
    FOREIGN KEY (store_id)
    REFERENCES stores(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- Create index for faster lookups
CREATE INDEX idx_products_store_id ON products(store_id);

-- ==== Stores table ==== 
-- Drop existing category_id column if it exists (from previous attempts)
ALTER TABLE stores DROP COLUMN IF EXISTS category_id;

-- Add new nullable category_id column of type BIGINT
ALTER TABLE stores
  ADD COLUMN category_id BIGINT;

-- Backfill category_id based on the textual category column in stores
-- Mapping of store.category (text) to categories.title (text)
UPDATE stores SET
  category_id = (
    SELECT id FROM categories WHERE title = CASE stores.category
      WHEN 'Ropa & Accesorios' THEN 'Moda'
      WHEN 'Electrónica' THEN 'Tech'
      WHEN 'Deportes' THEN 'Deportes'
      WHEN 'Decoración' THEN 'Hogar'
      ELSE 'General'
    END
  )
  WHERE category_id IS NULL;

-- Fallback: assign a default category (first one) for any remaining NULLs
UPDATE stores
  SET category_id = (SELECT id FROM categories ORDER BY id LIMIT 1)
  WHERE category_id IS NULL;

-- Drop the old textual category column
ALTER TABLE stores DROP COLUMN category;

-- Enforce NOT NULL and add foreign key constraint to categories(id)
ALTER TABLE stores
  ALTER COLUMN category_id SET NOT NULL;
ALTER TABLE stores
  ADD CONSTRAINT fk_stores_category_id
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;
