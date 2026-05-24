import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { useCallback, useState } from 'react';
import { LayoutAnimation, RefreshControl, ScrollView, Text, View } from 'react-native';

// Estilos, datos y utilidades locales
import { FEATURED_PRODUCTS } from '@/constants/homeMockData';
import { homeStyles as styles } from '@/styles/home';
import { cartStore } from '@/utils/cartStore';
import { favoritesStore } from '@/utils/favoritesStore';

// Modales BottomSheet (estos ya existían en tu proyecto)
import { CerclePlusBottomSheet } from '@/components/cercle-plus-bottom-sheet';
import { PickupBottomSheet } from '@/components/pickup-bottom-sheet';
import { ProductDetailsSheet } from '@/components/product-details-sheet';

// Hooks extraídos
import { useHomeData } from '@/hooks/useHomeData';
import { useStamps } from '@/hooks/useStamps';

// Componentes extraídos
import { CategoryList } from '@/components/home/CategoryList';
import { DealProductCard } from '@/components/home/DealProductCard';
import { HomeHeader } from '@/components/home/HomeHeader';
import { NearbyStoreCard } from '@/components/home/NearbyStoreCard';
import { PremiumBanner } from '@/components/home/PremiumBanner';
import { SectionHeader } from '@/components/home/SectionHeader';
import { StampWidget } from '@/components/home/StampWidget';

export default function HomeScreen() {
  const router = useRouter();

  const [isPickupOpen, setIsPickupOpen] = useState(false);
  const [isCerclePlusOpen, setIsCerclePlusOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { earnedStamps, totalStamps, loadUserStamps } = useStamps();
  const {
    categories, loadCategories, filteredStores,
    searchQuery, setSearchQuery, selectedCategory, setSelectedCategory
  } = useHomeData();

  const [quantities, setQuantities] = useState<Record<string, number>>(() => cartStore.get());
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => favoritesStore.get());
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setQuantities(cartStore.get());
      setFavorites(favoritesStore.get());
      loadUserStamps();
    }, [loadUserStamps])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  }, [loadCategories]);

  const handleAdd = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newQty = { ...quantities, [id]: (quantities[id] || 0) + 1 };
    setQuantities(newQty);
    cartStore.set(newQty);
  };

  const handleRemove = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (!quantities[id]) return;
    let newQty = { ...quantities };
    if (newQty[id] - 1 <= 0) delete newQty[id];
    else newQty[id] -= 1;
    setQuantities(newQty);
    cartStore.set(newQty);
  };

  const handleClearSelection = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    let newQty = { ...quantities };
    delete newQty[id];
    setQuantities(newQty);
    cartStore.set(newQty);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <HomeHeader
        earnedStamps={earnedStamps}
        totalStamps={totalStamps}
        onProfilePress={() => router.push('/profile')}
        onPickupPress={() => setIsPickupOpen(true)}
        onStampsPress={() => router.push('/sellos')}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}
      >
        <View style={styles.contentCard}>

          <CategoryList categories={categories} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />

          <StampWidget earnedStamps={earnedStamps} totalStamps={totalStamps} onPress={() => router.push('/sellos')} />

          <PremiumBanner onPress={() => setIsCerclePlusOpen(true)} />

          {/* Ofertas (Stock Muerto) */}
          <SectionHeader title="Ofertas cerca de ti" />
          <View style={styles.flashSectionWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalSectionContainer}>
              {FEATURED_PRODUCTS.map((prod) => (
                <DealProductCard
                  key={prod.id} prod={prod} qty={quantities[prod.id] ?? 0}
                  onPress={() => { setSelectedProduct(prod); setIsDetailsOpen(true); }}
                  onAdd={() => handleAdd(prod.id)} onRemove={() => handleRemove(prod.id)} onClear={() => handleClearSelection(prod.id)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Últimas Unidades */}
          <SectionHeader title="Últimas unidades" />
          <View style={styles.flashSectionWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalSectionContainer}>
              {FEATURED_PRODUCTS.filter(prod => prod.stockRemaining <= 3).map((prod) => (
                <DealProductCard
                  key={prod.id} prod={prod} qty={quantities[prod.id] ?? 0}
                  onPress={() => { setSelectedProduct(prod); setIsDetailsOpen(true); }}
                  onAdd={() => handleAdd(prod.id)} onRemove={() => handleRemove(prod.id)} onClear={() => handleClearSelection(prod.id)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Locales Cercanos */}
          <SectionHeader title="Cerca de ti" buttonText="Filtros" />
          <View style={styles.storesList}>
            {filteredStores.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateIconBadge}><SymbolView name="storefront.fill" size={24} tintColor="#9CA3AF" /></View>
                <Text style={styles.emptyStateTitle}>No se encontraron locales</Text>
                <Text style={styles.emptyStateText}>Intenta buscar otra palabra clave, marca o explora una categoría diferente.</Text>
              </View>
            ) : (
              filteredStores.map((store) => (
                <NearbyStoreCard key={store.id} store={store} onPress={() => router.push({ pathname: '/store', params: { id: store.id } })} />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sheets (Modales) */}
      <PickupBottomSheet visible={isPickupOpen} onClose={() => setIsPickupOpen(false)} />
      <CerclePlusBottomSheet visible={isCerclePlusOpen} onClose={() => setIsCerclePlusOpen(false)} />
      <ProductDetailsSheet
        visible={isDetailsOpen}
        onClose={() => { setIsDetailsOpen(false); setSelectedProduct(null); }}
        product={selectedProduct}
        quantities={quantities}
        onAdd={handleAdd}
        onRemove={handleRemove}
        isFavorite={selectedProduct ? !!favorites[selectedProduct.id] : false}
        onToggleFavorite={(id) => { setFavorites({ ...favoritesStore.toggle(id) }); }}
      />
    </View>
  );
}