import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { DealProductCard } from '@/app/(tabs)/index'; // Reuse DealProductCard from main screen
import { FEATURED_PRODUCTS } from '@/constants/featuredProducts'; // Import featured products
import { FeaturedProduct } from '@/app/(tabs)/index'; // Import type for product

export default function BestSellersScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Los más vendidos</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalSectionContainer}
      >
        {FEATURED_PRODUCTS.filter(p => parseFloat(p.rating) >= 4.7).map(prod => (
          <DealProductCard
            key={prod.id}
            prod={prod}
            qty={0}
            onPress={() => { /* open details if needed */ }}
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
