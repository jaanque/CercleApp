-- 1. Add active_color column with default value
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS active_color TEXT DEFAULT '#5B2333';

-- 2. Update existing categories with custom dynamic active background colors (light pastel tones matching emojis)
UPDATE public.categories SET active_color = '#CCFBF1' WHERE title = 'Moda';       -- Teal/mint dress 👗
UPDATE public.categories SET active_color = '#E0F2FE' WHERE title = 'Tech';       -- Light blue/slate laptop 💻
UPDATE public.categories SET active_color = '#FEF3C7' WHERE title = 'Hogar';      -- Warm gold/yellow house 🏠
UPDATE public.categories SET active_color = '#FFEDD5' WHERE title = 'Deportes';   -- Light orange basketball 🏀
UPDATE public.categories SET active_color = '#FFE4E6' WHERE title = 'Belleza';    -- Light rose lipstick 💄
UPDATE public.categories SET active_color = '#EEF2FF' WHERE title = 'Cercle AI';   -- Light lavender/violet sparkles ✨