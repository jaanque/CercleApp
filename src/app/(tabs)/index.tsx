import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { useCallback, useState, useRef, useEffect } from 'react';
import { Animated, LayoutAnimation, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, View, NativeSyntheticEvent, NativeScrollEvent, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Estilos y utilidades locales
import { homeStyles as styles } from '@/styles/home';
import { cartStore } from '@/utils/cartStore';
import { favoritesStore } from '@/utils/favoritesStore';
import { supabase } from '@/lib/supabase';

// Modales BottomSheet
import { CerclePlusBottomSheet } from '@/components/cercle-plus-bottom-sheet';
import { PickupBottomSheet } from '@/components/pickup-bottom-sheet';

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

// Componente de Badge animado para el número de items con transición de deslizamiento arriba/abajo
function AnimatedBadge({ count }: { count: number }) {
  const [displayCount, setDisplayCount] = useState(count);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevCountRef = useRef(count);

  useEffect(() => {
    const prev = prevCountRef.current;
    if (count === prev) return;

    const isIncrement = count > prev;
    prevCountRef.current = count;

    // Paso 1: Deslizar hacia afuera y desvanecer el número anterior
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: isIncrement ? -12 : 12,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 40,
        useNativeDriver: true,
      })
    ]).start(() => {
      setDisplayCount(count);
      // Paso 2: Colocar el nuevo número en la posición inicial opuesta
      slideAnim.setValue(isIncrement ? 12 : -12);
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.8);

      // Paso 3: Deslizar con resorte hacia el centro
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 280,
          friction: 14,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 280,
          friction: 14,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 40,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [count]);

  return (
    <View style={styles.cartBadgeWrapper}>
      <Animated.Text
        style={[
          styles.cartBadgeText,
          {
            opacity: opacityAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
          },
        ]}
      >
        {displayCount}
      </Animated.Text>
    </View>
  );
}

// Componente de Precio animado para transiciones más fluidas (subir/bajar dígitos)
function AnimatedPrice({ price }: { price: number }) {
  const [displayPrice, setDisplayPrice] = useState(price);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const prevPriceRef = useRef(price);

  useEffect(() => {
    const prev = prevPriceRef.current;
    if (price === prev) return;

    const isIncrement = price > prev;
    prevPriceRef.current = price;

    // Paso 1: Deslizar y desvanecer
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: isIncrement ? -16 : 16,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDisplayPrice(price);
      // Paso 2: Cambiar posición inicial
      slideAnim.setValue(isIncrement ? 16 : -16);

      // Paso 3: Deslizar hacia el centro
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [price]);

  return (
    <Animated.View style={{ transform: [{ translateY: slideAnim }], opacity: opacityAnim }}>
      <Text style={styles.floatingCartPrice}>{displayPrice.toFixed(2).replace('.', ',')} €</Text>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  const [isPickupOpen, setIsPickupOpen] = useState(false);
  const [isCerclePlusOpen, setIsCerclePlusOpen] = useState(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);

  const { earnedStamps, totalStamps, loadUserStamps } = useStamps();

  // Extraemos featuredProducts del hook en lugar de importarlo como constante
  const {
    categories, refreshHomeData, filteredStores, featuredProducts,
    searchQuery, setSearchQuery, selectedCategory, setSelectedCategory
  } = useHomeData();

  const [quantities, setQuantities] = useState<Record<string, number>>(() => cartStore.get());
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => favoritesStore.get());
  const [isHeaderShadow, setIsHeaderShadow] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Cálculos dinámicos del carrito
  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(quantities).reduce((sum, [prodId, qty]) => {
    const prod = featuredProducts.find(p => p.id === prodId);
    if (!prod) return sum;
    const priceNum = parseFloat((prod.price ?? '').replace(' €', ''));
    return sum + priceNum * qty;
  }, 0);

  // Estados y valores animados para transiciones premium del pill de carrito
  const initialItemsCount = Object.values(cartStore.get()).reduce((a, b) => a + b, 0);
  const [isCartVisible, setIsCartVisible] = useState(initialItemsCount > 0);
  const cartSlideAnim = useRef(new Animated.Value(initialItemsCount > 0 ? 0 : 120)).current;
  const cartOpacityAnim = useRef(new Animated.Value(initialItemsCount > 0 ? 1 : 0)).current;

  useEffect(() => {
    if (totalItems > 0) {
      if (!isCartVisible) {
        setIsCartVisible(true);
        Animated.parallel([
          Animated.spring(cartSlideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 9,
          }),
          Animated.timing(cartOpacityAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          })
        ]).start();
      }
    } else {
      if (isCartVisible) {
        Animated.parallel([
          Animated.timing(cartSlideAnim, {
            toValue: 120,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(cartOpacityAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          })
        ]).start(({ finished }) => {
          if (finished) {
            setIsCartVisible(false);
          }
        });
      }
    }
  }, [totalItems, isCartVisible]);

  // Animar suavemente los cambios de amplitud (ancho) de la cápsula al actualizar precios o cantidades
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [totalItems, totalPrice]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setIsHeaderShadow(offsetY > 0);
  }, []);

  // Sync local quantities with Supabase cart_items
  const syncCartFromDB = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const query = supabase.from('cart_items').select('product_id, quantity');
      if (user) {
        query.eq('user_id', user.id);
      } else {
        query.eq('guest_id', 'guest');
      }
      
      const { data, error } = await query;
      if (!error && data) {
        const dbQty: Record<string, number> = {};
        data.forEach((item: any) => {
          if (item.quantity > 0) {
            dbQty[item.product_id] = item.quantity;
          }
        });
        setQuantities(dbQty);
        cartStore.set(dbQty);
      }
    } catch (err) {
      console.error('Error syncing cart from DB:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setQuantities(cartStore.get());
      setFavorites(favoritesStore.get());
      loadUserStamps();
      syncCartFromDB();
    }, [loadUserStamps, syncCartFromDB])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshHomeData();
    setRefreshing(false);
  }, [refreshHomeData]);

  const handleAdd = async (id: string) => {
    const prod = featuredProducts.find(p => p.id === id);
    const currentQty = quantities[id] || 0;
    if (prod && currentQty >= prod.stock) {
      // No permitir seleccionar más artículos que el stock disponible en la pantalla de inicio
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newQtyVal = currentQty + 1;
    const newQty = { ...quantities, [id]: newQtyVal };
    setQuantities(newQty);
    cartStore.set(newQty);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('cart_items').upsert({
        user_id: user ? user.id : null,
        guest_id: user ? null : 'guest',
        product_id: id,
        quantity: newQtyVal,
        updated_at: new Date().toISOString()
      }, {
        onConflict: user ? 'user_id,product_id' : 'guest_id,product_id'
      });
    } catch (err) {
      console.error('Error adding to DB cart:', err);
    }
  };

  const handleRemove = async (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (!quantities[id]) return;
    const newQtyVal = quantities[id] - 1;
    let newQty = { ...quantities };
    if (newQtyVal <= 0) {
      delete newQty[id];
    } else {
      newQty[id] = newQtyVal;
    }
    setQuantities(newQty);
    cartStore.set(newQty);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (newQtyVal <= 0) {
        if (user) {
          await supabase.from('cart_items').delete().match({ user_id: user.id, product_id: id });
        } else {
          await supabase.from('cart_items').delete().match({ guest_id: 'guest', product_id: id });
        }
      } else {
        await supabase.from('cart_items').upsert({
          user_id: user ? user.id : null,
          guest_id: user ? null : 'guest',
          product_id: id,
          quantity: newQtyVal,
          updated_at: new Date().toISOString()
        }, {
          onConflict: user ? 'user_id,product_id' : 'guest_id,product_id'
        });
      }
    } catch (err) {
      console.error('Error removing from DB cart:', err);
    }
  };

  const handleClearSelection = async (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    let newQty = { ...quantities };
    delete newQty[id];
    setQuantities(newQty);
    cartStore.set(newQty);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('cart_items').delete().match({ user_id: user.id, product_id: id });
      } else {
        await supabase.from('cart_items').delete().match({ guest_id: 'guest', product_id: id });
      }
    } catch (err) {
      console.error('Error clearing selection in DB cart:', err);
    }
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
        isHeaderShadow={isHeaderShadow}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5B2333" colors={['#5B2333']} />}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.contentCard}>

          <CategoryList categories={categories} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />

          <StampWidget earnedStamps={earnedStamps} totalStamps={totalStamps} onPress={() => router.push('/sellos')} />

          {/* Ofertas cerca de ti */}
          <SectionHeader title="Ofertas cerca de ti" />
          <View style={styles.flashSectionWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalSectionContainer}>
              {featuredProducts.map((prod) => (
                <DealProductCard
                  key={prod.id} prod={prod} qty={quantities[prod.id] ?? 0}
                  onPress={() => {}}
                  onAdd={() => handleAdd(prod.id)} onRemove={() => handleRemove(prod.id)} onClear={() => handleClearSelection(prod.id)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Últimas unidades */}
          <SectionHeader title="Últimas unidades" />
          <View style={styles.flashSectionWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalSectionContainer}>
              {featuredProducts.filter(prod => prod.stock < 5 && prod.stock > 0).map((prod) => (
                <DealProductCard
                  key={prod.id} prod={prod} qty={quantities[prod.id] ?? 0}
                  onPress={() => {}}
                  onAdd={() => handleAdd(prod.id)} onRemove={() => handleRemove(prod.id)} onClear={() => handleClearSelection(prod.id)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Banner Premium */}
          <PremiumBanner onPress={() => setIsCerclePlusOpen(true)} />

          {/* Cerca de ti */}
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
                <NearbyStoreCard key={store.id} store={store} onPress={() => {}} />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sheets (Modales) */}
      <PickupBottomSheet visible={isPickupOpen} onClose={() => setIsPickupOpen(false)} />
      <CerclePlusBottomSheet visible={isCerclePlusOpen} onClose={() => setIsCerclePlusOpen(false)} />

      {/* Search Modal Overlay */}
      <Modal
        visible={isSearchModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSearchModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.98)', paddingTop: Platform.OS === 'ios' ? 60 : 30, paddingHorizontal: 20 }}>
          {/* Header of Search Modal */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#1F2937' }}>Buscar</Text>
            <Pressable 
              onPress={() => setIsSearchModalVisible(false)} 
              style={{ width: 32, height: 32, borderRadius: 22, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}
            >
              <SymbolView name="xmark" size={12} tintColor="#6B7280" />
            </Pressable>
          </View>

          {/* Search Input */}
          <View style={styles.searchBarInputWrapper}>
            <SymbolView name="magnifyingglass" size={15} tintColor="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar marcas, locales o categorías..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
                <SymbolView name="xmark.circle.fill" size={16} tintColor="#9CA3AF" />
              </Pressable>
            )}
          </View>

          {/* Results List */}
          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 20 }} contentContainerStyle={{ paddingBottom: 40 }}>
            {searchQuery.trim().length === 0 ? (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                <SymbolView name="sparkles" size={24} tintColor="#9CA3AF" />
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#6B7280', marginTop: 10, textAlign: 'center' }}>
                  Escribe algo para empezar a buscar en el barrio...
                </Text>
              </View>
            ) : filteredStores.length === 0 ? (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                <SymbolView name="exclamationmark.triangle" size={24} tintColor="#9CA3AF" />
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#6B7280', marginTop: 10, textAlign: 'center' }}>
                  No se encontraron resultados
                </Text>
              </View>
            ) : (
              <View style={{ gap: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Locales y tiendas ({filteredStores.length})
                </Text>
                {filteredStores.map((store) => (
                  <Pressable 
                    key={store.id} 
                    onPress={() => { setIsSearchModalVisible(false); }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 }}
                  >
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6', overflow: 'hidden' }}>
                      <View style={{ flex: 1, backgroundColor: '#5B2333', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>{store.name[0]}</Text>
                      </View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937' }}>{store.name}</Text>
                      <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{store.category} · {store.distance}</Text>
                    </View>
                    <SymbolView name="chevron.right" size={12} tintColor="#9CA3AF" />
                  </Pressable>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Floating Buttons Control Row at the Bottom */}
      <View style={styles.floatingButtonsContainer}>
        {/* Floating Search Pill */}
        <Pressable
          style={({ pressed }) => [
            styles.floatingSearchPill,
            pressed && { opacity: 0.9, transform: [{ scale: 0.96 }] }
          ]}
          onPress={() => setIsSearchModalVisible(true)}
        >
          <SymbolView name="magnifyingglass" size={15} tintColor="#5B2333" />
          <Text style={styles.floatingCartText}>Buscar</Text>
        </Pressable>

        {/* Floating Cart Pill */}
        {isCartVisible && (
          <Animated.View
            style={{
              transform: [{ translateY: cartSlideAnim }],
              opacity: cartOpacityAnim
            }}
          >
            <Pressable
              style={({ pressed }) => [
                styles.floatingCartPill,
                pressed && { opacity: 0.9, transform: [{ scale: 0.96 }] }
              ]}
              onPress={() => router.push('/checkout')}
            >
              {/* Left: Icon + badge + text */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View style={{ position: 'relative' }}>
                  <SymbolView name="cart.fill" size={18} tintColor="#5B2333" style={{ marginRight: 6 }} />
                  <View style={{ position: 'absolute', right: -6, top: -8 }}>
                    <AnimatedBadge count={totalItems} />
                  </View>
                </View>
                <Text style={styles.floatingCartText}>Ver carrito</Text>
              </View>
              
              {/* Right: Price + chevron */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <AnimatedPrice price={totalPrice} />
                <SymbolView 
                  name="chevron.right" 
                  size={11} 
                  tintColor="#5B2333" 
                  style={{ opacity: 0.8 }}
                />
              </View>
            </Pressable>
          </Animated.View>
        )}
      </View>

    </View>
  );
}