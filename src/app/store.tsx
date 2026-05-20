import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { cartStore } from '../utils/cartStore';
import { favoritesStore } from '../utils/favoritesStore';
import React, { useState } from 'react';
import { StoreOptionsSheet } from '@/components/store-options-sheet';
import { ProductDetailsSheet } from '@/components/product-details-sheet';
import {
  Alert,
  Animated,
  Dimensions,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: W } = Dimensions.get('window');
const PRODUCT_W = (W - 40 - 12) / 2;

const STORES: Record<string, any> = {
  '1': {
    name: 'Fashion Hub', category: 'Ropa & Accesorios', rating: '4.8',
    reviews: '1.2K', distance: '0.2 km', deliveryTime: '10-15 min',
    address: 'Calle Gran Vía, 32',
    logo: 'https://logo.clearbit.com/zara.com',
    tagline: 'Colecciones exclusivas y tendencias seleccionadas para redefinir tu estilo personal día a día.', cerclePlus: true, hasStamps: true,
  },
  '2': {
    name: 'Tech Outlet', category: 'Electrónica', rating: '4.6',
    reviews: '890', distance: '0.8 km', deliveryTime: '20-30 min',
    address: 'Av. Diagonal, 15',
    logo: 'https://logo.clearbit.com/apple.com',
    tagline: 'Lo último en tecnología y gadgets de alta gama con garantía oficial y soporte personalizado.', cerclePlus: false, hasStamps: false,
  },
  '3': {
    name: 'Sport Center', category: 'Deportes', rating: '4.5',
    reviews: '540', distance: '1.5 km', deliveryTime: '25-35 min',
    address: 'Paseo de Gracia, 8',
    logo: 'https://logo.clearbit.com/nike.com',
    tagline: 'Equipamiento deportivo premium y calzado de alto rendimiento para atletas exigentes.', cerclePlus: true, hasStamps: true,
  },
  '4': {
    name: 'Home Style', category: 'Decoración', rating: '4.9',
    reviews: '2.1K', distance: '2.1 km', deliveryTime: '30-40 min',
    address: 'Rambla Catalunya, 55',
    logo: 'https://logo.clearbit.com/ikea.com',
    tagline: 'Piezas de diseño, mobiliario funcional y detalles únicos para crear el hogar de tus sueños.', cerclePlus: false, hasStamps: true,
  },
};

const CATEGORIES = ['Destacados', 'Novedades', 'Liquidación', 'Top ventas'];

const ALL_PRODUCTS = [
  { id: 'p1', name: 'Chaqueta Oversize', price: '29 €', originalPrice: '89 €', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80', category: 'Destacados' },
  { id: 'p2', name: 'Zapatillas Blancas', price: '45 €', originalPrice: '120 €', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80', category: 'Destacados' },
  { id: 'p3', name: 'Bolso de Piel', price: '55 €', originalPrice: '180 €', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80', category: 'Novedades' },
  { id: 'p4', name: 'Vestido Floral', price: '19 €', originalPrice: '65 €', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80', category: 'Liquidación' },
  { id: 'p5', name: 'Gafas de Sol', price: '12 €', originalPrice: '40 €', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&q=80', category: 'Top ventas' },
  { id: 'p6', name: 'Jersey de Lana', price: '22 €', originalPrice: '70 €', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=400&q=80', category: 'Novedades' },
];

function AnimatedNumber({ value, style }: { value: number; style: any }) {
  const [displayValue, setDisplayValue] = useState(value);
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const prevValueRef = React.useRef(value);

  React.useEffect(() => {
    const prev = prevValueRef.current;
    if (value === prev) return;

    const isIncrement = value > prev;
    prevValueRef.current = value;

    // Step 1: Quick slide out and fade out of the old number
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
      // Step 2: Instantly snap to the opposite side and swap display value
      setDisplayValue(value);
      slideAnim.setValue(isIncrement ? 12 : -12);
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.8);

      // Step 3: Springy bouncy slide in and scale up of the new number
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
  }, [value]);

  return (
    <Animated.Text
      style={[
        style,
        {
          opacity: opacityAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
        },
      ]}
    >
      {displayValue}
    </Animated.Text>
  );
}

function AnimatedPrice({ value, style }: { value: number; style: any }) {
  const [displayValue, setDisplayValue] = useState(value);
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;
  const prevValueRef = React.useRef(value);

  React.useEffect(() => {
    const prev = prevValueRef.current;
    if (value === prev) return;

    const isIncrement = value > prev;
    prevValueRef.current = value;

    // Step 1: Slide out
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: isIncrement ? -20 : 20,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Step 2: Snap and swap
      setDisplayValue(value);
      slideAnim.setValue(isIncrement ? 20 : -20);

      // Step 3: Slide in
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
  }, [value]);

  return (
    <Animated.View style={{ transform: [{ translateY: slideAnim }], opacity: opacityAnim }}>
      <Text style={style}>{displayValue} €</Text>
    </Animated.View>
  );
}

function AnimatedBadge({ value, style }: { value: number; style: any }) {
  const [displayValue, setDisplayValue] = useState(value);
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;
  const prevValueRef = React.useRef(value);

  React.useEffect(() => {
    const prev = prevValueRef.current;
    if (value === prev) return;

    const isIncrement = value > prev;
    prevValueRef.current = value;

    // Step 1: Slide out
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
    ]).start(() => {
      // Step 2: Snap and swap
      setDisplayValue(value);
      slideAnim.setValue(isIncrement ? 12 : -12);

      // Step 3: Slide in
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
  }, [value]);

  return (
    <Animated.View style={{ transform: [{ translateY: slideAnim }], opacity: opacityAnim }}>
      <Text style={style}>{displayValue}</Text>
    </Animated.View>
  );
}

function discountPct(orig: string, price: string) {
  return Math.round((1 - parseFloat(price) / parseFloat(orig)) * 100);
}

export default function StoreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; updatedCart?: string }>();
  const id = params.id;
  const store = STORES[id ?? '1'] ?? STORES['1'];
  const [saved, setSaved] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Destacados');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>(() => cartStore.get());
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => favoritesStore.get());
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Update global cartStore when quantities change locally
  React.useEffect(() => {
    cartStore.set(quantities);
  }, [quantities]);

  // Sync with global cartStore whenever the screen becomes focused (e.g. going back via gestures/swiping)
  useFocusEffect(
    React.useCallback(() => {
      const shared = cartStore.get();
      setQuantities(shared);
      setFavorites(favoritesStore.get());
    }, [])
  );

  const handleToggleFavorite = (prodId: string) => {
    const updated = favoritesStore.toggle(prodId);
    setFavorites({ ...updated });
  };

  const handleAdd = (prodId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setQuantities(prev => ({
      ...prev,
      [prodId]: (prev[prodId] ?? 0) + 1
    }));
  };

  const handleRemove = (prodId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setQuantities(prev => {
      const current = prev[prodId] ?? 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[prodId];
        return next;
      }
      return {
        ...prev,
        [prodId]: current - 1
      };
    });
  };

  const handleReserve = (name: string) =>
    Alert.alert('Reservar gratis', `¿Reservar "${name}"?\nTe avisaremos cuando esté listo para recogida.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Reservar', style: 'default' },
    ]);

  // Filter products in real-time
  const filteredProducts = ALL_PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Destacados' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

  const totalPrice = Object.entries(quantities).reduce((sum, [prodId, qty]) => {
    const prod = ALL_PRODUCTS.find(p => p.id === prodId);
    if (!prod) return sum;
    const numericPrice = parseFloat(prod.price.replace(' €', ''));
    return sum + numericPrice * qty;
  }, 0);

  const handleCheckout = () => {
    router.push({
      pathname: '/cart',
      params: {
        storeId: id ?? '1',
        storeName: store.name,
        cartData: JSON.stringify(quantities),
      }
    });
  };

  return (
    <View style={s.container}>
      
      {/* ── Top Navigation Bar ────────────────────────── */}
      <View style={s.headerContainer}>
        <SafeAreaView edges={['top']} />
        <View style={s.topRow}>
          {/* Back Chevron */}
          <Pressable
            style={({ pressed }) => [s.headerButton, pressed && { opacity: 0.75 }]}
            onPress={() => router.back()}
          >
            <SymbolView name="chevron.left" size={20} tintColor="#1F2937" />
          </Pressable>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Right Header Controls */}
          <View style={s.navRight}>
            <Pressable
              style={({ pressed }) => [s.headerButton, pressed && { opacity: 0.75 }]}
              onPress={() => setIsOptionsOpen(true)}
            >
              <SymbolView name="ellipsis" size={16} tintColor="#1F2937" />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

        {/* ── Brand Details Block (Borderless, airy layout) ───────── */}
        <View style={s.brandDetailsBlock}>
          {/* Logo — Centered and floating */}
          <View style={s.logoBox}>
            <Image source={{ uri: store.logo }} style={s.logoImg} contentFit="contain" />
          </View>

          {/* Store Name & Category Subtitle */}
          <View style={s.titleBox}>
            <Text style={s.storeName}>{store.name}</Text>
            <Text style={s.storeCategory}>{store.category}</Text>
          </View>

          {/* Programs Badges */}
          {(store.cerclePlus || store.hasStamps) && (
            <View style={s.badgeRow}>
              {store.cerclePlus && (
                <View style={s.cPlusBadge}>
                  <Text style={s.cPlusText}>Cercle+</Text>
                </View>
              )}
              {store.hasStamps && (
                <View style={s.stampBadge}>
                  <SymbolView name="checkmark.seal.fill" size={10} tintColor="#D97706" />
                  <Text style={s.stampBadgeText}>Sellos</Text>
                </View>
              )}
            </View>
          )}

          {/* Stats Row */}
          <View style={s.statsRow}>
            <SymbolView name="star.fill" size={12} tintColor="#F59E0B" style={{ marginRight: 2 }} />
            <Text style={s.statsText}>{store.rating} ({store.reviews})</Text>
            <Text style={s.statsDot}>·</Text>
            <Text style={s.statsText}>Listo en {store.deliveryTime}</Text>
          </View>

          {/* Actionable Location Details (Centered Pill) */}
          <Pressable
            style={({ pressed }) => [s.addressButton, pressed && { opacity: 0.75 }]}
            onPress={() => router.push({ pathname: '/store-details', params: { id: id ?? '1' } })}
          >
            <SymbolView name="mappin.and.ellipse" size={11} tintColor="#6B7280" style={s.locationIcon} />
            <Text style={s.addressText}>{store.address} · {store.distance}</Text>
            <SymbolView name="chevron.right" size={9} tintColor="#9CA3AF" style={{ marginLeft: 1 }} />
          </Pressable>
        </View>

        {/* ── Catalog Section (Search -> Filters -> Products) ─ */}
        <View style={s.catalogSection}>
          {/* Clean Search Bar */}
          <View style={s.searchContainer}>
            <SymbolView name="magnifyingglass" size={15} tintColor="#9CA3AF" style={s.searchIcon} />
            <TextInput
              style={s.searchInput}
              placeholder={`Buscar en ${store.name}...`}
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Minimalist Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
            {CATEGORIES.map(cat => {
              const isSelected = activeCategory === cat;
              return (
                <Pressable
                  key={cat}
                  style={[s.chip, isSelected && s.chipActive]}
                  onPress={() => setActiveCategory(cat)}
                >
                  <Text style={[s.chipText, isSelected && s.chipTextActive]}>{cat}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Frameless 2-column Grid */}
          {filteredProducts.length > 0 ? (
            <View style={s.grid}>
              {filteredProducts.map(p => {
                const qty = quantities[p.id] ?? 0;
                const isFav = !!favorites[p.id];
                return (
                  <Pressable
                    key={p.id}
                    style={({ pressed }) => [
                      s.productCard,
                      pressed && { transform: [{ scale: 0.97 }] }
                    ]}
                    onPress={() => {
                      setSelectedProduct({
                        ...p,
                        store: store.name,
                      });
                      setIsDetailsOpen(true);
                    }}
                  >
                    {/* Frameless Product Image */}
                    <View style={[s.productImgBox, qty > 0 && s.productImgBoxActive]}>
                      <Image source={{ uri: p.image }} style={s.productImg} contentFit="cover" />
                      
                      {/* Floating quantity badge */}
                      {qty > 0 && (
                        <View style={s.qtyBadge}>
                          <Text style={s.qtyBadgeText}>✓ {qty}</Text>
                        </View>
                      )}
                    </View>
                    
                    {/* Clean text info underneath */}
                    <View style={s.productInfo}>
                      <Text style={s.productName} numberOfLines={1}>{p.name}</Text>
                      <View style={s.priceRow}>
                        <Text style={s.productPrice}>{p.price}</Text>
                        <Text style={s.productOriginal}>{p.originalPrice}</Text>
                        <Text style={s.discountText}>-{discountPct(p.originalPrice, p.price)}%</Text>
                      </View>

                      {/* Add / Quantity Button aligned to rounded rectangle style */}
                      {qty === 0 ? (
                        <Pressable
                          style={({ pressed }) => [s.addButton, pressed && { opacity: 0.85 }]}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleAdd(p.id);
                          }}
                        >
                          <Text style={s.addButtonText}>Añadir</Text>
                          <SymbolView name="plus" size={12} tintColor="#1F2937" style={{ marginLeft: 4 }} />
                        </Pressable>
                      ) : (
                        <View style={s.qtyContainer}>
                          <Pressable
                            style={({ pressed }) => [s.qtyBtn, pressed && { opacity: 0.75 }]}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleRemove(p.id);
                            }}
                          >
                            <SymbolView
                              name={qty === 1 ? 'trash' : 'minus'}
                              size={11}
                              tintColor={qty === 1 ? '#EF4444' : '#1F2937'}
                            />
                          </Pressable>
                          
                          <AnimatedNumber value={qty} style={s.qtyText} />
                          
                          <Pressable
                            style={({ pressed }) => [s.qtyBtn, pressed && { opacity: 0.75 }]}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleAdd(p.id);
                            }}
                          >
                            <SymbolView name="plus" size={11} tintColor="#1F2937" />
                          </Pressable>
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={s.emptyState}>
              <SymbolView name="magnifyingglass" size={20} tintColor="#9CA3AF" />
              <Text style={s.emptyText}>No se encontraron productos</Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Floating Cart / Reservation Bar */}
      {totalItems > 0 && (
        <View style={s.floatingCart}>
          <Pressable
            style={({ pressed }) => [s.viewCartBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
            onPress={handleCheckout}
          >
            {/* Green circle with quantity count */}
            <View style={s.cartBadgeCompact}>
              <AnimatedBadge value={totalItems} style={s.cartBadgeTextCompact} />
            </View>
            
            {/* Text */}
            <Text style={s.viewCartTextCompact}>Ver carrito</Text>
          </Pressable>
        </View>
      )}

      <StoreOptionsSheet
        visible={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        onViewDetails={() => router.push({ pathname: '/store-details', params: { id: id ?? '1' } })}
        storeName={store.name}
      />

      <ProductDetailsSheet
        visible={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        quantities={quantities}
        onAdd={handleAdd}
        onRemove={handleRemove}
        isFavorite={selectedProduct ? !!favorites[selectedProduct.id] : false}
        onToggleFavorite={handleToggleFavorite}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  // Top Header Bar
  headerContainer: { backgroundColor: '#FFFFFF', zIndex: 100 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 10,
    zIndex: 100
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerButtonSaved: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  navRight: { flexDirection: 'row', gap: 8 },

  scrollContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120 },

  // 1. Brand Section (Spacious brand details, no boxes)
  brandDetailsBlock: {
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg: { width: 50, height: 50 },
  titleBox: {
    alignItems: 'center',
    gap: 3,
  },
  storeName: {
    fontSize: 21,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.4,
  },
  storeCategory: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#6B7280',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cPlusBadge: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cPlusText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  stampBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stampBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#D97706',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    letterSpacing: 0.1,
  },
  statsDot: {
    color: '#D1D5DB',
    fontWeight: '700',
    marginHorizontal: 2,
  },
  addressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 5,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  locationIcon: {
    marginRight: 2,
  },
  addressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },

  // 3. Description Section (Light gray, breathable tagline)
  descriptionSection: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 24,
  },
  descriptionText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19.5,
  },

  // 4. Catalog Section (Inputs, Filters & Frameless grid)
  catalogSection: {
    paddingTop: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1F2937',
    paddingVertical: 8,
  },
  chipsRow: {
    gap: 8,
    paddingBottom: 18,
  },
  chip: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#1F2937',
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#4B5563',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Product Frameless Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: PRODUCT_W,
    marginBottom: 8,
  },
  productImgBox: {
    width: '100%',
    height: PRODUCT_W * 1.15,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  favButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    zIndex: 3,
  },
  productImgBoxActive: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  qtyBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 20,
    zIndex: 2,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  qtyBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    paddingTop: 5,
    paddingHorizontal: 2,
    gap: 2,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  productPrice: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1F2937',
  },
  productOriginal: {
    fontSize: 12.5,
    color: '#6B7280',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  discountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#9CA3AF',
  },

  // Add / Quantity Buttons (Premium tactile light-gray track design)
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    height: 32,
    marginTop: 4,
    width: '100%',
  },
  addButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1F2937',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    height: 32,
    marginTop: 4,
    width: '100%',
    paddingHorizontal: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 1,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },

  // Floating Cart
  floatingCart: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  viewCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#1A1A1A',
    height: 48,
    width: 170,
    borderRadius: 24,
    paddingLeft: 12,
    paddingRight: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cartBadgeCompact: {
    backgroundColor: '#10B981',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeTextCompact: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
    lineHeight: 13.5,
  },
  viewCartTextCompact: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
