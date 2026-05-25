import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { DealProductCard } from '@/components/home/DealProductCard'; // Reuse DealProductCard from components
import { FeaturedProduct } from '@/constants/homeMockData'; // Import type for product
import { supabase } from '../lib/supabase';

export default function BestSellersScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<FeaturedProduct[]>([]);

  useEffect(() => {
    async function loadBestSellers() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .gte('rating', '4.7');

        if (!error && data) {
          const mapped = data.map((prod: any) => ({
            id: prod.id,
            name: prod.name,
            price: prod.price,
            originalPrice: prod.original_price || prod.price,
            image: prod.image,
            store: prod.store || '',
            storeId: prod.store_id || '',
            stock: prod.stock || 5,
            rating: prod.rating || '4.5',
            reviewsCount: prod.reviews_count || '0',
            popularBadge: prod.popular_badge || '',
            cerclePlus: prod.cercle_plus || false,
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error('Error al cargar más vendidos:', err);
      }
    }
    loadBestSellers();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Los más vendidos</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalSectionContainer}
      >
        {products.map(prod => (
          <DealProductCard
            key={prod.id}
            prod={prod}
            qty={0}
            onPress={() => {}}
            onAdd={() => {}}
            onRemove={() => {}}
            onClear={() => {}}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 20 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 16 },
  horizontalSectionContainer: { gap: 14 },
});
