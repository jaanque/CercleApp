import { CerclePlusBottomSheet } from '@/components/cercle-plus-bottom-sheet';
import { PickupBottomSheet } from '@/components/pickup-bottom-sheet';
import { ProductDetailsSheet } from '@/components/product-details-sheet';
import { supabase } from '@/lib/supabase';
import { cartStore } from '@/utils/cartStore';
import { favoritesStore } from '@/utils/favoritesStore';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Easing, LayoutAnimation, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export const FEATURED_PRODUCTS = [
  {
    id: 'p1',
    name: 'Chaqueta Oversize',
    price: '29 €',
    originalPrice: '89 €',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=300&q=80',
    store: 'Retro Vintage',
    stockRemaining: 1,
    maxStock: 5,
    stockText: '¡Última disponible en tienda!',
    rating: '4.8',
    reviewsCount: '(1.2K)',
    popularBadge: '#1 Moda',
    cerclePlus: true
  },
  {
    id: 'p2',
    name: 'Zapatillas Blancas',
    price: '45 €',
    originalPrice: '120 €',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80',
    store: 'Urban Sneaks',
    stockRemaining: 2,
    maxStock: 8,
    stockText: 'Solo quedan 2 unidades',
    rating: '4.6',
    reviewsCount: '(800)',
    popularBadge: 'Destacado',
    cerclePlus: false
  },
  {
    id: 'p3',
    name: 'Bolso de Piel',
    price: '55 €',
    originalPrice: '180 €',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=300&q=80',
    store: 'Leather Works',
    stockRemaining: 1,
    maxStock: 6,
    stockText: 'Único en stock local',
    rating: '4.5',
    reviewsCount: '(250)',
    popularBadge: 'Exclusivo',
    cerclePlus: true
  },
  {
    id: 'p4',
    name: 'Vestido Floral',
    price: '19 €',
    originalPrice: '65 €',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=300&q=80',
    store: 'Boho Chic',
    stockRemaining: 3,
    maxStock: 10,
    stockText: 'Últimas 3 unidades residuales',
    rating: '4.9',
    reviewsCount: '(3.1K)',
    popularBadge: 'Tendencia',
    cerclePlus: true
  },
  {
    id: 'p5',
    name: 'Gafas de Sol Pro',
    price: '12 €',
    originalPrice: '40 €',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=300&q=80',
    store: 'Specs Studio',
    stockRemaining: 2,
    maxStock: 7,
    stockText: 'Solo 2 disponibles',
    rating: '4.7',
    reviewsCount: '(150)',
    popularBadge: 'Clásico',
    cerclePlus: false
  },
  {
    id: 'p6',
    name: 'Jersey de Lana',
    price: '22 €',
    originalPrice: '70 €',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=300&q=80',
    store: 'Urban Sneaks',
    stockRemaining: 6,
    maxStock: 10,
    stockText: 'Quedan 6 unidades',
    rating: '4.4',
    reviewsCount: '(430)',
    popularBadge: 'Básico',
    cerclePlus: false
  },
  {
    id: 'p7',
    name: 'Vaqueros Slim',
    price: '25 €',
    originalPrice: '75 €',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=300&q=80',
    store: 'Retro Vintage',
    stockRemaining: 8,
    maxStock: 12,
    stockText: 'Quedan 8 unidades',
    rating: '4.8',
    reviewsCount: '(1.1K)',
    popularBadge: '#2 Moda',
    cerclePlus: true
  },
  {
    id: 'p8',
    name: 'Camiseta Algodón',
    price: '9 €',
    originalPrice: '27 €',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80',
    store: 'Boho Chic',
    stockRemaining: 5,
    maxStock: 10,
    stockText: 'Quedan 5 unidades',
    rating: '4.7',
    reviewsCount: '(680)',
    popularBadge: 'Fresco',
    cerclePlus: true
  }
];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DEAL_CARD_WIDTH = 274;
const DEAL_IMAGE_HEIGHT = 142;
const STORE_IMAGE_HEIGHT = Math.round((SCREEN_WIDTH - 40) * (9 / 16));


export interface Category {
  id: string;
  title: string;
  emoji: string;
  isAI?: boolean;
}

const NEARBY_STORES = [
  {
    id: '1',
    name: 'Fashion Hub',
    category: 'Ropa & Accesorios',
    rating: '4.8',
    reviewsCount: '(2,000+)',
    popularBadge: '#1 Moda',
    distance: '0.2 km',
    deliveryTime: '10-15 min',
    fee: '0€',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
    logo: 'https://logo.clearbit.com/zara.com',
    tagline: 'Ropa y accesorios exclusivos seleccionados para ti',
    cerclePlus: true,
    hasStamps: true,
  },
  {
    id: '2',
    name: 'Tech Outlet',
    category: 'Electrónica',
    rating: '4.6',
    reviewsCount: '(500+)',
    popularBadge: 'Oferta Especial',
    distance: '0.8 km',
    deliveryTime: '20-30 min',
    fee: '1.50€',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
    logo: 'https://logo.clearbit.com/apple.com',
    tagline: 'Lo último en tecnología y gadgets con garantía oficial',
    cerclePlus: false,
    hasStamps: false,
  },
  {
    id: '3',
    name: 'Sport Center',
    category: 'Deportes',
    rating: '4.5',
    reviewsCount: '(120)',
    popularBadge: '#1 Deporte',
    distance: '1.5 km',
    deliveryTime: '25-35 min',
    fee: '2.00€',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
    logo: 'https://logo.clearbit.com/nike.com',
    tagline: 'Equipamiento deportivo de alto rendimiento para campeones',
    cerclePlus: true,
    hasStamps: true,
  },
  {
    id: '4',
    name: 'Home Style',
    category: 'Decoración',
    rating: '4.9',
    reviewsCount: '(3,400+)',
    popularBadge: 'Recomendado',
    distance: '2.1 km',
    deliveryTime: '30-40 min',
    fee: '2.50€',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    logo: 'https://logo.clearbit.com/ikea.com',
    tagline: 'Muebles y decoración de diseño para tu hogar ideal',
    cerclePlus: false,
    hasStamps: true,
  },
];



const NEW_STORES_CERCLE = [
  { id: '1', name: 'Trendy Wear', category: 'Moda', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=200&q=80' },
  { id: '2', name: 'Tech Reborn', category: 'Electrónica', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=200&q=80' },
];

const FEATURED_STORES = [
  { id: '1', name: 'EcoStyle', category: 'Moda', image: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=128&q=80' },
  { id: '2', name: 'StyleMarket', category: 'Accesorios', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=128&q=80' },
  { id: '3', name: 'ZeroWaste', category: 'Hogar', image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=128&q=80' },
];

const BRANDS = [
  { id: '1', logo: 'https://logo.clearbit.com/nike.com' },
  { id: '2', logo: 'https://logo.clearbit.com/adidas.com' },
  { id: '3', logo: 'https://logo.clearbit.com/zara.com' },
  { id: '4', logo: 'https://logo.clearbit.com/apple.com' },
  { id: '5', logo: 'https://logo.clearbit.com/sony.com' },
];

const STORE_OFFSETS = {
  '1': { latOffset: 0.0012, lonOffset: 0.0018 },
  '2': { latOffset: -0.0034, lonOffset: 0.0045 },
  '3': { latOffset: 0.0078, lonOffset: -0.0062 },
  '4': { latOffset: -0.0124, lonOffset: -0.0098 },
};

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

interface ProductQuantityControlProps {
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
  onClear: () => void;
  compact?: boolean;
}

function AnimatedQuantityNumber({ value, style }: { value: number; style: any }) {
  const [displayValue, setDisplayValue] = React.useState(value);
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

function ProductQuantityControl({ qty, onAdd, onRemove, onClear, compact }: ProductQuantityControlProps) {
  const entranceAnim = React.useRef(new Animated.Value(qty > 0 ? 1 : 0)).current;
  const isMounted = React.useRef(qty > 0);

  React.useEffect(() => {
    if (qty > 0) {
      if (!isMounted.current) {
        isMounted.current = true;
        entranceAnim.setValue(0);
      }
      Animated.spring(entranceAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      if (isMounted.current) {
        isMounted.current = false;
        Animated.spring(entranceAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }).start();
      }
    }
  }, [qty > 0]);

  const addButtonOpacity = entranceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const addButtonScale = entranceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.8],
  });

  const selectorOpacity = entranceAnim;

  const selectorTranslateX = entranceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-15, 0],
  });

  const deleteScale = entranceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  return (
    <View
      style={[
        { height: 34, position: 'relative', justifyContent: 'center' },
        compact ? styles.dealActionControl : { marginTop: 5, width: '100%' },
        compact && qty > 0 && styles.dealActionControlExpanded,
      ]}
    >
      {/* 1. Add Button */}
      <Animated.View
        pointerEvents={qty === 0 ? 'auto' : 'none'}
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: addButtonOpacity,
            transform: [{ scale: addButtonScale }],
          }
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            { marginTop: 0 },
            pressed && { transform: [{ scale: 0.95 }], opacity: 0.85 }
          ]}
          onPress={(e) => {
            e.stopPropagation();
            onAdd();
          }}
        >
          <Text style={styles.addButtonText}>Añadir</Text>
          <SymbolView name="plus" size={11} tintColor="#1F2937" style={{ marginLeft: 3 }} />
        </Pressable>
      </Animated.View>

      {/* 2. Selector row */}
      <Animated.View
        pointerEvents={qty > 0 ? 'auto' : 'none'}
        style={[
          styles.qtyRowContainer,
          StyleSheet.absoluteFill,
          {
            marginTop: 0,
            opacity: selectorOpacity,
            transform: [
              { translateX: selectorTranslateX },
            ],
          }
        ]}
      >
        {/* Selector */}
        <Animated.View
          style={[
            styles.qtySelector,
            {
              transform: [{ translateX: selectorTranslateX }],
            }
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.qtyBtn,
              pressed && { transform: [{ scale: 0.85 }], opacity: 0.7 }
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <SymbolView name="minus" size={11} tintColor="#1F2937" />
          </Pressable>

          <AnimatedQuantityNumber value={qty} style={styles.qtyText} />

          <Pressable
            style={({ pressed }) => [
              styles.qtyBtn,
              pressed && { transform: [{ scale: 0.85 }], opacity: 0.7 }
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onAdd();
            }}
          >
            <SymbolView name="plus" size={11} tintColor="#1F2937" />
          </Pressable>
        </Animated.View>

        {/* Delete Button */}
        <Animated.View
          style={{
            transform: [{ scale: deleteScale }],
          }}
        >
          <Pressable
            style={({ pressed }) => [
              styles.deleteSelectionBtn,
              pressed && { transform: [{ scale: 0.85 }], opacity: 0.7 }
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onClear();
            }}
          >
            <SymbolView name="trash" size={12} tintColor="#EF4444" />
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

export type FeaturedProduct = (typeof FEATURED_PRODUCTS)[number];

interface DealProductCardProps {
  prod: FeaturedProduct;
  qty: number;
  onPress: () => void;
  onAdd: () => void;
  onRemove: () => void;
  onClear: () => void;
}

type NearbyStore = (typeof NEARBY_STORES)[number];

function NearbyStoreCard({ store, onPress }: { store: NearbyStore; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.storeCard, pressed && { opacity: 0.92 }]}
      onPress={onPress}
    >
      <View style={styles.storeImageContainer}>
        <Image source={{ uri: store.image }} style={styles.storeImage} contentFit="cover" />
        {store.hasStamps ? (
          <View style={styles.stampBadgeOnImage}>
            <SymbolView name="checkmark.seal.fill" size={11} tintColor="#111827" />
            <Text style={styles.stampBadgeTextOnImage}>Sellos</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.storeInfo}>
        <View style={styles.dealHeaderRow}>
          <View style={styles.dealHeaderCopy}>
            <View style={styles.storeTitleRow}>
              <Text style={styles.dealNameText} numberOfLines={1} ellipsizeMode="tail">
                {store.name}
              </Text>
            </View>
            <View style={styles.dealMetaLine}>
              <Text style={styles.dealStoreText} numberOfLines={1} ellipsizeMode="tail">
                {store.category}
              </Text>
              <Text style={styles.dealMetaDot}>·</Text>
              <SymbolView name="star.fill" size={9} tintColor="#F59E0B" style={styles.dealMetaIcon} />
              <Text style={styles.dealRatingVal} numberOfLines={1}>
                {store.rating}
              </Text>
              <Text style={styles.dealReviewsText} numberOfLines={1} ellipsizeMode="tail">
                {store.reviewsCount}
              </Text>
            </View>
          </View>
          <Text style={styles.storeDistancePill} numberOfLines={1}>
            {store.distance}
          </Text>
        </View>

        <View style={styles.dealPriceRow}>
          <Text style={styles.storeDeliveryText} numberOfLines={1} ellipsizeMode="tail">
            Listo en {store.deliveryTime}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function DealProductCard({ prod, qty, onPress, onAdd, onRemove, onClear }: DealProductCardProps) {
  const savingsVal =
    parseFloat(prod.originalPrice.replace(' €', '')) - parseFloat(prod.price.replace(' €', ''));
  const isLowStock = prod.stockRemaining <= 3;
  const stockLabel =
    prod.stockRemaining === 1
      ? '¡Última unidad disponible!'
      : isLowStock
        ? `¡Solo quedan ${prod.stockRemaining} unidades!`
        : null;

  return (
    <Pressable
      style={({ pressed }) => [styles.dealCard, pressed && { opacity: 0.92 }]}
      onPress={onPress}
    >
      <View style={styles.dealImageContainer}>
        <Image source={{ uri: prod.image }} style={styles.dealImage} contentFit="cover" />
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>Ahorras {savingsVal}€</Text>
        </View>
      </View>

      <View style={styles.dealInfo}>
        <View style={styles.dealHeaderRow}>
          <View style={styles.dealHeaderCopy}>
            <Text style={styles.dealNameText} numberOfLines={1} ellipsizeMode="tail">
              {prod.name}
            </Text>
            <View style={styles.dealMetaLine}>
              <Text style={styles.dealStoreText} numberOfLines={1} ellipsizeMode="tail">
                {prod.store}
              </Text>
              <Text style={styles.dealMetaDot}>·</Text>
              <SymbolView name="star.fill" size={9} tintColor="#F59E0B" style={styles.dealMetaIcon} />
              <Text style={styles.dealRatingVal} numberOfLines={1}>
                {prod.rating}
              </Text>
              <Text style={styles.dealReviewsText} numberOfLines={1} ellipsizeMode="tail">
                {prod.reviewsCount}
              </Text>
            </View>
          </View>
          <ProductQuantityControl
            compact
            qty={qty}
            onAdd={onAdd}
            onRemove={onRemove}
            onClear={onClear}
          />
        </View>

        <View style={styles.dealPriceRow}>
          <View style={styles.dealPriceGroup}>
            <Text style={styles.dealPriceVal} numberOfLines={1}>
              {prod.price}
            </Text>
            <Text style={styles.dealOriginalPriceVal} numberOfLines={1}>
              {prod.originalPrice}
            </Text>
          </View>
          {stockLabel ? (
            <View style={[styles.dealStockBanner, styles.dealStockBannerRight]}>
              <View style={styles.dealStockDot} />
              <Text style={styles.dealStockHint} numberOfLines={1} ellipsizeMode="tail">
                {stockLabel}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
export { DealProductCard };


export default function HomeScreen() {

  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<Category[]>([
    { id: 'todos', title: 'Todos', emoji: '🛍️' },
  ]);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPickupOpen, setIsPickupOpen] = useState(false);
  const [isCerclePlusOpen, setIsCerclePlusOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const [earnedStamps, setEarnedStamps] = useState<number | null>(null);
  const [totalStamps, setTotalStamps] = useState<number | null>(null);

  const loadUserStamps = React.useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setEarnedStamps(1); // Offline welcome fallback
        setTotalStamps(5);
        return;
      }

      const { data, error } = await supabase
        .from('user_stamps')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setEarnedStamps(data.earned_stamps);
        setTotalStamps(data.total_stamps);
      } else {
        setEarnedStamps(1); // Welcome fallback until table is created
        setTotalStamps(5);
      }
    } catch (err: any) {
      console.warn('Error loading stamps in Home:', err?.message || err);
      setEarnedStamps(1);
      setTotalStamps(5);
    }
  }, []);

  const loadCategories = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error loading categories from Supabase:', error);
        return;
      }

      if (data && data.length > 0) {
        const dbCategories: Category[] = data.map((cat: any) => ({
          id: String(cat.id),
          title: cat.title,
          emoji: cat.emoji,
          isAI: cat.is_ai,
        }));

        setCategories([
          { id: 'todos', title: 'Todos', emoji: '🛍️' },
          ...dbCategories
        ]);
      }
    } catch (err) {
      console.error('Exception loading categories:', err);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const [quantities, setQuantities] = useState<Record<string, number>>(() => cartStore.get());
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => favoritesStore.get());
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [activeLookId, setActiveLookId] = useState<'l1' | 'l2'>('l1');
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const pulsingAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulsingAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);


  useFocusEffect(
    React.useCallback(() => {
      setQuantities(cartStore.get());
      setFavorites(favoritesStore.get());
      loadUserStamps();
    }, [loadUserStamps])
  );

  const handleAdd = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const updatedQty = (quantities[id] || 0) + 1;
    const newQuantities = { ...quantities, [id]: updatedQty };
    setQuantities(newQuantities);
    cartStore.set(newQuantities);
  };

  const handleRemove = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (!quantities[id]) return;
    const updatedQty = quantities[id] - 1;
    let newQuantities = { ...quantities };
    if (updatedQty <= 0) {
      delete newQuantities[id];
    } else {
      newQuantities[id] = updatedQty;
    }
    setQuantities(newQuantities);
    cartStore.set(newQuantities);
  };

  const handleClearSelection = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    let newQuantities = { ...quantities };
    delete newQuantities[id];
    setQuantities(newQuantities);
    cartStore.set(newQuantities);
  };

  const handleToggleFavorite = (prodId: string) => {
    const updated = favoritesStore.toggle(prodId);
    setFavorites({ ...updated });
  };

  const searchAnim = React.useRef(new Animated.Value(0)).current;
  const searchInputRef = React.useRef<TextInput>(null);

  React.useEffect(() => {
    async function getUserLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.log('Error fetching user location:', error);
      }
    }
    getUserLocation();
  }, []);

  const toggleSearch = React.useCallback(() => {
    if (isSearchExpanded) {
      searchInputRef.current?.blur();
      Animated.timing(searchAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: false,
      }).start(() => {
        setIsSearchExpanded(false);
        setSearchQuery('');
      });
    } else {
      setIsSearchExpanded(true);
      Animated.timing(searchAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: false,
      }).start(() => {
        searchInputRef.current?.focus();
      });
    }
  }, [isSearchExpanded, searchAnim]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  }, [loadCategories]);

  const insets = useSafeAreaInsets();

  // Dynamic stores filtering, mapping distance, and sorting by userLocation
  const filteredStores = React.useMemo(() => {
    // 1. Map dynamic calculated distances using Haversine formula
    const mappedStores = NEARBY_STORES.map(store => {
      if (userLocation) {
        const offsets = STORE_OFFSETS[store.id as keyof typeof STORE_OFFSETS] || { latOffset: 0, lonOffset: 0 };
        const storeLat = userLocation.latitude + offsets.latOffset;
        const storeLon = userLocation.longitude + offsets.lonOffset;
        const distKm = getDistanceInKm(userLocation.latitude, userLocation.longitude, storeLat, storeLon);
        return {
          ...store,
          distanceVal: distKm,
          distance: distKm < 1
            ? `${Math.round(distKm * 1000)} m`
            : `${distKm.toFixed(1)} km`,
        };
      }
      // Fallback if location not granted yet
      const distanceNum = parseFloat(store.distance.split(' ')[0]);
      return {
        ...store,
        distanceVal: distanceNum,
      };
    });

    // 2. Filter list by search query & selected category
    const filtered = mappedStores.filter(store => {
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchesName = store.name.toLowerCase().includes(query);
        const matchesCategory = store.category.toLowerCase().includes(query);
        const matchesTagline = store.tagline.toLowerCase().includes(query);
        return matchesName || matchesCategory || matchesTagline;
      }

      const activeCat = categories.find(c => c.id === selectedCategory);
      if (activeCat) {
        if (activeCat.title === 'Todos') return true;
        if (activeCat.title === 'Moda') return store.category === 'Ropa & Accesorios';
        if (activeCat.title === 'Tech') return store.category === 'Electrónica';
        if (activeCat.title === 'Hogar') return store.category === 'Decoración';
        if (activeCat.title === 'Deportes') return store.category === 'Deportes';
        return store.category.toLowerCase().includes(activeCat.title.toLowerCase());
      }
      return true;
    });

    // 3. Sort list by distance ascending (nearest first)
    return filtered.sort((a, b) => a.distanceVal - b.distanceVal);
  }, [userLocation, searchQuery, selectedCategory, categories]);

  const searchHeight = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 60],
  });
  const searchOpacity = searchAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0, 1],
  });
  const searchTranslateY = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-15, 0],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Sticky Header Container */}
      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top']} />
        <View style={styles.topRow}>
          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              pressed && { opacity: 0.7 }
            ]}
            onPress={() => router.push('/profile')}
          >
            <SymbolView name="person" size={20} tintColor="#1A1A1A" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.deliverySelector,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }
            ]}
            onPress={() => setIsPickupOpen(true)}
          >
            <SymbolView
              name="storefront.fill"
              size={14}
              tintColor="#10B981"
            />
            <Text style={styles.deliveryText} numberOfLines={1} ellipsizeMode="tail">
              Recogida en tienda
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              isSearchExpanded && styles.headerButtonActive,
              pressed && { opacity: 0.7 }
            ]}
            onPress={toggleSearch}
          >
            <SymbolView
              name={isSearchExpanded ? "xmark" : "magnifyingglass"}
              size={isSearchExpanded ? 18 : 20}
              tintColor={isSearchExpanded ? "#10B981" : "#1A1A1A"}
            />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.pointsPill,
              pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] }
            ]}
            onPress={() => router.push('/sellos')}
          >
            <SymbolView
              name="checkmark.seal.fill"
              size={16}
              tintColor="#111827"
            />
            <Text style={styles.pointsPillText}>
              {earnedStamps !== null && totalStamps !== null ? `${earnedStamps}/${totalStamps}` : '...'}
            </Text>
          </Pressable>
        </View>

        {/* Search Input Bar (Unfolds with fast premium animation) */}
        <Animated.View style={[
          styles.searchBarContainer,
          {
            height: searchHeight,
            opacity: searchOpacity,
            transform: [{ translateY: searchTranslateY }],
            overflow: 'hidden',
          }
        ]}>
          <View style={styles.searchBarInputWrapper}>
            <SymbolView name="magnifyingglass" size={15} tintColor="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Buscar locales o categorías..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchButton}
              >
                <SymbolView name="xmark.circle.fill" size={16} tintColor="#9CA3AF" />
              </Pressable>
            )}
          </View>
        </Animated.View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
            progressBackgroundColor="#FFFFFF"
          />
        }
      >
        <View style={styles.contentCard}>

          {/* Categories Section */}
          <View style={styles.categoriesWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categories.map((cat) => {
                if (!cat || !cat.id) return null;
                const isSelected = selectedCategory === cat.id;
                const isAI = 'isAI' in cat && cat.isAI;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => {
                      if (isAI) {
                        router.push('/ai-chat');
                        return;
                      }
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setSelectedCategory(cat.id);
                    }}
                    style={({ pressed }) => [
                      styles.categoryItem,
                      pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] }
                    ]}
                  >
                    <View
                      style={[
                        styles.categorySquare,
                        isSelected && styles.categorySquareSelected,
                        isAI && styles.categorySquareAI,
                      ]}
                    >
                      <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                    </View>
                    <Text
                      style={[
                        styles.categoryText,
                        isSelected && styles.categoryTextSelected,
                        isAI && styles.categoryTextAI
                      ]}
                    >
                      {cat.title}
                    </Text>
                    {isSelected && !isAI && (
                      <View style={styles.categoryActiveDot} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* 4. Discrete Loyalty Stamp Widget */}
          <Pressable
            style={({ pressed }) => [
              styles.homeStampWidget,
              pressed && { opacity: 0.92, transform: [{ scale: 0.98 }] }
            ]}
            onPress={() => router.push('/sellos')}
          >
            {earnedStamps === null || totalStamps === null ? (
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 44 }}>
                <ActivityIndicator size="small" color="#111827" />
                <Text style={{ marginLeft: 8, fontSize: 12, fontWeight: '600', color: '#6B7280' }}>
                  Sincronizando sellos...
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.homeStampLeft}>
                  <View style={styles.homeStampHeaderRow}>
                    <SymbolView name="checkmark.seal.fill" size={13} tintColor="#111827" />
                    <Text style={styles.homeStampTitle}>Tarjeta de sellos</Text>
                  </View>
                  <Text style={styles.homeStampSubtitle}>{earnedStamps} de {totalStamps} completados</Text>
                </View>
                <View style={styles.homeStampRight}>
                  <View style={styles.homeStampSlots}>
                    {Array.from({ length: totalStamps }).map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.homeStampDot,
                          i < earnedStamps && styles.homeStampDotFilled
                        ]}
                      >
                        {i < earnedStamps && <SymbolView name="checkmark" size={6} tintColor="#111827" />}
                      </View>
                    ))}
                  </View>
                  <SymbolView name="chevron.right" size={13} tintColor="#9CA3AF" style={{ marginLeft: 4 }} />
                </View>
              </>
            )}
          </Pressable>



          {/* 3. Cercle+ Premium Banner (Taller Stacked Style) */}
          <Pressable
            style={({ pressed }) => [
              styles.premiumBanner,
              pressed && { opacity: 0.92, transform: [{ scale: 0.98 }] }
            ]}
            onPress={() => setIsCerclePlusOpen(true)}
          >
            <View style={styles.premiumTopRow}>
              <View style={styles.premiumLogoRow}>
                <Text style={styles.premiumLogoText}>Cercle</Text>
                <View style={styles.premiumPlusBadge}>
                  <Text style={styles.premiumPlusText}>+</Text>
                </View>
              </View>
              <View style={styles.premiumCTAButtonThin}>
                <Text style={styles.premiumCTABtnTextThin}>Probar gratis</Text>
              </View>
            </View>

            <View style={styles.premiumBenefitsList}>
              <View style={styles.premiumBenefitItem}>
                <SymbolView name="checkmark.circle.fill" size={12} tintColor="#10B981" />
                <Text style={styles.premiumBenefitText}>Sin comisiones en tus pedidos</Text>
              </View>
              <View style={styles.premiumBenefitItem}>
                <SymbolView name="checkmark.circle.fill" size={12} tintColor="#10B981" />
                <Text style={styles.premiumBenefitText}>Acceso exclusivo e ilimitado a Cercle AI</Text>
              </View>
              <View style={styles.premiumBenefitItem}>
                <SymbolView name="checkmark.circle.fill" size={12} tintColor="#10B981" />
                <Text style={styles.premiumBenefitText}>Envíos gratis y prioridad de entrega</Text>
              </View>
            </View>
          </Pressable>



          {/* 8. Ofertas cerca de ti Section (Stock Muerto de Comercios Locales) */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ofertas cerca de ti</Text>
            <Pressable
              style={({ pressed }) => [
                styles.seeAllButton,
                pressed && { opacity: 0.85 }
              ]}
            >
              <Text style={styles.seeAllText}>Ver más</Text>
            </Pressable>
          </View>

          <View style={styles.flashSectionWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalSectionContainer}
            >
              {FEATURED_PRODUCTS.map((prod) => (
                <DealProductCard
                  key={prod.id}
                  prod={prod}
                  qty={quantities[prod.id] ?? 0}
                  onPress={() => {
                    setSelectedProduct(prod);
                    setIsDetailsOpen(true);
                  }}
                  onAdd={() => handleAdd(prod.id)}
                  onRemove={() => handleRemove(prod.id)}
                  onClear={() => handleClearSelection(prod.id)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Nueva Sección de Últimas Unidades (Filtrados con stock crítico) */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimas unidades</Text>
            <Pressable
              style={({ pressed }) => [
                styles.seeAllButton,
                pressed && { opacity: 0.85 }
              ]}
            >
              <Text style={styles.seeAllText}>Ver más</Text>
            </Pressable>
          </View>

          <View style={styles.flashSectionWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalSectionContainer}
            >
              {FEATURED_PRODUCTS.filter((prod) => prod.stockRemaining <= 3).map((prod) => (
                <DealProductCard
                  key={prod.id}
                  prod={prod}
                  qty={quantities[prod.id] ?? 0}
                  onPress={() => {
                    setSelectedProduct(prod);
                    setIsDetailsOpen(true);
                  }}
                  onAdd={() => handleAdd(prod.id)}
                  onRemove={() => handleRemove(prod.id)}
                  onClear={() => handleClearSelection(prod.id)}
                />
              ))}
            </ScrollView>
          </View>

          {/* 9. Nearby Stores Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cerca de ti</Text>
            <Pressable
              style={({ pressed }) => [
                styles.seeAllButton,
                pressed && { opacity: 0.85 }
              ]}
            >
              <Text style={styles.seeAllText}>Filtros</Text>
            </Pressable>
          </View>

          <View style={styles.storesList}>
            {filteredStores.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateIconBadge}>
                  <SymbolView name="storefront.fill" size={24} tintColor="#9CA3AF" />
                </View>
                <Text style={styles.emptyStateTitle}>No se encontraron locales</Text>
                <Text style={styles.emptyStateText}>
                  Intenta buscar otra palabra clave, marca o explora una categoría diferente.
                </Text>
              </View>
            ) : (
              filteredStores.map((store) => (
                <NearbyStoreCard
                  key={store.id}
                  store={store}
                  onPress={() => router.push({ pathname: '/store', params: { id: store.id } })}
                />
              ))
            )}
          </View>

        </View>
      </ScrollView>
      <PickupBottomSheet
        visible={isPickupOpen}
        onClose={() => setIsPickupOpen(false)}
      />
      <CerclePlusBottomSheet
        visible={isCerclePlusOpen}
        onClose={() => setIsCerclePlusOpen(false)}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  contentCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 20, paddingTop: 0, minHeight: SCREEN_HEIGHT },

  headerContainer: {
    backgroundColor: '#FFFFFF',
    zIndex: 100,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    gap: 8,
    zIndex: 100
  },
  deliverySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 22,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flex: 1,
  },
  deliveryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerButtonActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  searchBarContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  searchBarInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    color: '#1F2937',
    padding: 0,
  },
  clearSearchButton: {
    padding: 4,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyStateIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  emptyStateText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 22,
    paddingHorizontal: 12,
  },
  pointsPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },

  categoriesWrapper: { marginHorizontal: -20, marginBottom: 24 },
  categoriesContainer: { paddingHorizontal: 20, gap: 12, paddingVertical: 6 },
  categoryItem: { alignItems: 'center', width: 62, position: 'relative' },
  categorySquare: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 6,
  },
  categorySquareSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#111827',
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryEmoji: { fontSize: 26 },
  categoryText: { fontSize: 11.5, fontWeight: '600', color: '#6B7280', textAlign: 'center' },
  categoryTextSelected: {
    color: '#111827',
    fontWeight: '800',
  },
  categoryActiveDot: {
    width: 6,
    height: 4,
    borderRadius: 22,
    backgroundColor: '#111827',
    marginTop: 4,
  },
  categorySquareAI: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
    borderWidth: 1.5,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryTextAI: {
    color: '#4F46E5',
    fontWeight: '700',
  },

  mainPromoWrapper: { marginBottom: 24 },
  mainPromoCard: {
    height: 180,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    justifyContent: 'flex-end',
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  mainPromoOverlay: { zIndex: 2 },
  mainPromoTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  mainPromoSubtitle: { fontSize: 13, fontWeight: '600', color: '#FFFFFF', opacity: 0.95 },
  promoBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 22,
    zIndex: 2
  },
  promoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  paginationDots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 16 },
  dot: { width: 6, height: 6, borderRadius: 22, backgroundColor: '#E5E7EB' },
  dotActive: { width: 18, height: 6, borderRadius: 22, backgroundColor: '#1F2937' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  seeAllButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center'
  },
  seeAllText: { fontSize: 12, fontWeight: '600', color: '#1F2937' },

  storesList: { gap: 20, marginBottom: 24 },
  storeCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingBottom: 4,
  },
  storeImageContainer: {
    width: '100%',
    height: STORE_IMAGE_HEIGHT,
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    overflow: 'hidden',
  },
  storeImage: {
    width: '100%',
    height: '100%',
  },
  storeInfo: {
    paddingHorizontal: 2,
    paddingTop: 10,
    gap: 4,
  },
  storeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  stampBadgeOnImage: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  stampBadgeTextOnImage: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#111827',
  },
  storeDistancePill: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    flexShrink: 0,
    paddingTop: 2,
  },
  storeDeliveryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    flexShrink: 1,
    minWidth: 0,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 22,
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },


  horizontalSectionWrapper: { marginHorizontal: -20, marginBottom: 24 },
  horizontalSectionContainer: { paddingHorizontal: 20, gap: 14 },

  // Redesigned local deadstock headers and wrapper
  flashSectionWrapper: {
    marginHorizontal: -20,
    paddingVertical: 8,
    marginBottom: 24,
  },

  dealCard: {
    width: DEAL_CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    paddingBottom: 4,
  },
  dealImageContainer: {
    width: '100%',
    height: DEAL_IMAGE_HEIGHT,
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  favButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 3,
  },

  dealImage: { width: '100%', height: '100%' },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(17, 24, 39, 0.72)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 22,
    zIndex: 2,
  },
  discountText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  dealInfo: {
    paddingHorizontal: 2,
    paddingTop: 10,
    gap: 4,
  },
  dealHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dealHeaderCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
    paddingRight: 2,
  },
  dealNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.2,
    lineHeight: 19,
    flexShrink: 1,
    minWidth: 0,
  },
  dealMetaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  dealStoreText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    flexShrink: 1,
    minWidth: 0,
  },
  dealMetaDot: {
    fontSize: 12,
    color: '#D1D5DB',
    fontWeight: '600',
    flexShrink: 0,
  },
  dealMetaIcon: {
    flexShrink: 0,
  },
  dealPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    minWidth: 0,
    marginTop: 1,
  },
  dealPriceGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flexShrink: 0,
  },
  dealStockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    borderRadius: 22,
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexShrink: 1,
    minWidth: 0,
  },
  dealStockBannerRight: {
    marginLeft: 'auto',
  },
  dealStockDot: {
    width: 5,
    height: 5,
    borderRadius: 22,
    backgroundColor: '#F59E0B',
    flexShrink: 0,
  },
  dealStockHint: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B45309',
    lineHeight: 14,
    flexShrink: 1,
  },
  dealActionControl: {
    width: 96,
    flexShrink: 0,
  },
  dealActionControlExpanded: {
    width: 132,
  },
  dealPlusMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D9488',
    borderRadius: 22,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginLeft: 6,
  },
  dealPlusMiniText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dealPopularMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 22,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginLeft: 6,
  },
  dealPopularMiniText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#047857',
  },
  dealRatingVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    flexShrink: 0,
  },
  dealReviewsText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    flexShrink: 0,
  },
  dealPopularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 22,
  },
  dealPopularBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
  },

  // Urgency Deadstock elements
  stockProgressContainer: {
    marginTop: 4,
    marginBottom: 3,
    gap: 3,
  },
  stockProgressBarBackground: {
    height: 4,
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    overflow: 'hidden',
  },
  stockProgressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 22,
  },
  stockText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#D97706',
  },

  dealPriceVal: { fontSize: 15, fontWeight: '800', color: '#111827' },
  dealOriginalPriceVal: { fontSize: 12, fontWeight: '500', color: '#9CA3AF', textDecorationLine: 'line-through' },

  savingsBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 22,
    alignSelf: 'flex-start',
    marginTop: 2,
    marginBottom: 4,
  },
  savingsBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    height: 34,
    borderRadius: 22,
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
    height: 34,
    borderRadius: 22,
    marginTop: 5,
    paddingHorizontal: 6,
  },
  qtyRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
  },
  qtySelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    height: 34,
    borderRadius: 22,
    paddingHorizontal: 4,
    minWidth: 0,
  },
  deleteSelectionBtn: {
    width: 34,
    height: 34,
    flexShrink: 0,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2937',
  },
  flashBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 22,
  },
  flashBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
  },

  impactBanner: { backgroundColor: '#ECFDF5', padding: 16, borderRadius: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  impactContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  impactTitle: { fontSize: 16, fontWeight: '800', color: '#065F46' },
  impactSubtitle: { fontSize: 12, fontWeight: '500', color: '#047857' },
  impactStats: { alignItems: 'flex-end' },
  impactStatValue: { fontSize: 18, fontWeight: '900', color: '#059669' },
  impactStatLabel: { fontSize: 10, fontWeight: '700', color: '#10B981', textTransform: 'uppercase' },

  mysteryCard: { width: 280, height: 160, borderRadius: 22, overflow: 'hidden', backgroundColor: '#F3F4F6' },

  rescuerItem: { width: 90, alignItems: 'center', gap: 8 },
  rescuerAvatarWrapper: {
    width: 70,
    height: 70,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden'
  },
  rescuerAvatar: { width: '100%', height: '100%', borderRadius: 22, backgroundColor: '#F3F4F6' },
  medalBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#3B82F6',
    width: 20,
    height: 20,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF'
  },
  rescuerName: { fontSize: 13, fontWeight: '700', color: '#1F2937', marginTop: 2, textAlign: 'center' },
  rescuerPoints: { fontSize: 11, fontWeight: '500', color: '#9CA3AF', textAlign: 'center' },

  homeStampWidget: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  homeStampLeft: {
    gap: 3,
  },
  homeStampHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  homeStampTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1F2937',
  },
  homeStampSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#6B7280',
  },
  homeStampRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  homeStampSlots: {
    flexDirection: 'row',
    gap: 4,
  },
  homeStampDot: {
    width: 16,
    height: 16,
    borderRadius: 22,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeStampDotFilled: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },

  premiumBanner: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 22,
    marginBottom: 24,
    flexDirection: 'column',
    alignItems: 'stretch',
    overflow: 'hidden',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  premiumTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  premiumLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  premiumLogoText: { color: '#1F2937', fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  premiumPlusBadge: { backgroundColor: '#FFD700', paddingHorizontal: 4, borderRadius: 22 },
  premiumPlusText: { color: '#000', fontSize: 14, fontWeight: '900' },
  premiumBenefitsList: {
    gap: 6,
    marginTop: 2,
  },
  premiumBenefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  premiumBenefitText: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '600',
  },
  premiumCTAButtonThin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 100,
  },
  premiumCTABtnTextThin: {
    color: '#1F2937',
    fontSize: 12.5,
    fontWeight: '700'
  },

  aiBanner: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 22,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  aiLeftContent: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, overflow: 'hidden' },
  aiLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiTitle: { color: '#1F2937', fontSize: 13.5, fontWeight: '800', letterSpacing: -0.5 },
  aiBetaBadge: { backgroundColor: '#111827', paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 22 },
  aiBetaText: { color: '#FFFFFF', fontSize: 8, fontWeight: '900', letterSpacing: 0.2 },
  aiSubtitle: { color: '#4B5563', fontSize: 12.5, fontWeight: '600', flexShrink: 1 },
  aiCTAButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  aiCTABtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800'
  },

  brandLogoCard: { width: 100, height: 60, backgroundColor: '#F9FAFB', borderRadius: 22, alignItems: 'center', justifyContent: 'center', padding: 12 },
  brandLogo: { width: '100%', height: '100%' },

  tipCard: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  tipImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F3F4F6',
  },
  tipInfo: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 6,
  },
  tipTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937', lineHeight: 18 },
  tipTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tipTime: { fontSize: 11, fontWeight: '500', color: '#9CA3AF' },

  recentItem: { width: 140, gap: 8 },
  recentImage: { width: 140, height: 140, borderRadius: 22, backgroundColor: '#F3F4F6' },
  recentLine: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 22, width: '90%' },

  newStoreItem: { width: 120, gap: 6 },
  newStoreImage: { width: 120, height: 120, borderRadius: 22, backgroundColor: '#F3F4F6' },
  newStoreBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 22 },
  newStoreBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  newStoreName: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginTop: 4 },
  newStoreCat: { fontSize: 12, color: '#6B7280', textAlign: 'center' },

  // El Estilo del Barrio Premium Lookbook Styling
  lookbookHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 6,
  },
  lookbookTitleContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  lookbookSectionTitle: {
    fontSize: 18.5,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  lookbookSectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 16,
  },
  lookbookTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 12,
    gap: 8,
  },
  lookbookTabButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  lookbookTabButtonActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  lookbookTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  lookbookTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  lookbookCanvasCard: {
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 24,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    height: 480,
    position: 'relative',
  },
  lookbookImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  hotspotContainer: {
    position: 'absolute',
    width: 32,
    height: 32,
    marginLeft: -16,
    marginTop: -16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  hotspotPulse: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 22,
    backgroundColor: '#A855F7',
  },
  hotspotDot: {
    width: 24,
    height: 24,
    borderRadius: 22,
    backgroundColor: '#A855F7',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  hotspotDotActive: {
    backgroundColor: '#111827',
    borderColor: '#FFFFFF',
  },
  tooltipCard: {
    position: 'absolute',
    bottom: 38,
    left: -90,
    width: 212,
    padding: 12,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 20,
  },
  tooltipHeader: {
    marginBottom: 6,
  },
  tooltipName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  tooltipStore: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  tooltipPricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  tooltipPriceGroup: {
    flexDirection: 'column',
  },
  tooltipPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  tooltipOrigPrice: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  tooltipAddBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 22,
    backgroundColor: '#A855F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipAddBtnActive: {
    backgroundColor: '#10B981',
  },
  tooltipAddBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  tooltipAddBtnTextActive: {
    color: '#FFFFFF',
  },
  lookbookComboBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  comboInfoColumn: {
    flexDirection: 'column',
    flex: 1,
    marginRight: 10,
  },
  comboTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  comboSavings: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  comboPriceWrapper: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  comboOriginalPrice: {
    color: '#9CA3AF',
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  comboPriceText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  comboAddButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#A855F7',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 105,
  },
  comboAddButtonActive: {
    backgroundColor: '#10B981',
  },
  comboAddButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  comboAddButtonTextActive: {
    color: '#FFFFFF',
  },
});
