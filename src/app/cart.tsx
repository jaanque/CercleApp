import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React, { useState } from 'react';
import {
  Animated,
  Dimensions,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { cartStore } from '../utils/cartStore';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ALL_PRODUCTS = [
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

    // Slide out
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
      setDisplayValue(value);
      slideAnim.setValue(isIncrement ? 20 : -20);

      // Slide in
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
      <Text style={style}>{displayValue.toFixed(2).replace('.', ',')} €</Text>
    </Animated.View>
  );
}

export default function CartScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const storeName = (params.storeName as string) || 'Carrefour Express';
  const storeId = (params.storeId as string) || '1';

  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const shared = cartStore.get();
    if (Object.keys(shared).length > 0) return shared;
    if (params.cartData) {
      try {
        const parsed = JSON.parse(params.cartData as string);
        cartStore.set(parsed);
        return parsed;
      } catch (e) {
        console.error('Failed to parse cartData', e);
      }
    }
    return {};
  });

  const [giftWrapped, setGiftWrapped] = useState(false);

  React.useEffect(() => {
    cartStore.set(quantities);
  }, [quantities]);

  const handleAdd = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setQuantities(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleRemove = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setQuantities(prev => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return {
        ...prev,
        [id]: current - 1,
      };
    });
  };

  const cartItems = Object.entries(quantities)
    .map(([prodId, qty]) => {
      const prod = ALL_PRODUCTS.find(p => p.id === prodId);
      return prod ? { ...prod, qty } : null;
    })
    .filter(Boolean) as Array<{ id: string; name: string; price: string; originalPrice?: string; image: string; qty: number }>;

  const recommendedProducts = ALL_PRODUCTS.filter(p => !quantities[p.id]);

  const basePrice = cartItems.reduce((sum, item) => {
    const numericPrice = parseFloat(item.price.replace(' €', ''));
    return sum + numericPrice * item.qty;
  }, 0);

  const originalSubtotal = cartItems.reduce((sum, item) => {
    const origStr = item.originalPrice || item.price;
    const numericOrig = parseFloat(origStr.replace(' €', ''));
    return sum + numericOrig * item.qty;
  }, 0);

  const totalSavings = originalSubtotal - basePrice;

  const commission = 2.99;
  const totalPrice = basePrice + commission + (giftWrapped ? 2 : 0);

  const totalItems = cartItems.reduce((a, b) => a + b.qty, 0);

  const handleCheckout = () => {
    router.push({
      pathname: '/checkout-suggest',
      params: {
        storeId,
        storeName,
      }
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFFFFF' }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.7 }]}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace({
                pathname: '/store',
                params: { id: storeId }
              });
            }
          }}
        >
          <SymbolView name="chevron.left" size={20} tintColor="#1A1A1A" />
        </Pressable>

        <View style={styles.selectorContainer}>
          <View style={styles.deliverySelector}>
            <Text style={styles.deliveryText}>Carrito</Text>
          </View>
        </View>

        {/* Balanced spacing placeholder */}
        <View style={{ width: 38 }} />
      </View>

      {totalItems === 0 ? (
        <View style={styles.emptyContainer}>
          <SymbolView name="cart" size={48} tintColor="#9CA3AF" />
          <Text style={styles.emptyText}>Tu carrito está vacío</Text>
          <Pressable
            style={({ pressed }) => [styles.emptyBtn, pressed && { opacity: 0.85 }]}
            onPress={() => router.back()}
          >
            <Text style={styles.emptyBtnText}>Volver a la tienda</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Cart Products List */}
          <View style={styles.productsList}>
            {cartItems.map((item) => {
              const numericPrice = parseFloat(item.price.replace(' €', ''));
              const itemTotal = numericPrice * item.qty;

              return (
                <View key={item.id} style={styles.productRow}>
                  {/* Product Image */}
                  <Image source={{ uri: item.image }} style={styles.productImg} />

                  {/* Product Info */}
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.name}
                    </Text>

                    {/* Price Row */}
                    <View style={styles.priceRow}>
                      <Text style={styles.productPrice}>
                        {itemTotal.toFixed(2).replace('.', ',')} €
                      </Text>
                      {item.originalPrice && (
                        <Text style={styles.productOriginalPrice}>
                          {(parseFloat(item.originalPrice.replace(' €', '')) * item.qty).toFixed(2).replace('.', ',')} €
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Quantity Selector Carousel (Premium app UI style) */}
                  <View style={styles.qtyTrack}>
                    <Pressable
                      style={({ pressed }) => [styles.qtyActionBtn, pressed && { opacity: 0.7 }]}
                      onPress={() => handleRemove(item.id)}
                    >
                      {item.qty === 1 ? (
                        <SymbolView name="trash" size={14} tintColor="#1A1A1A" />
                      ) : (
                        <SymbolView name="minus" size={14} tintColor="#1A1A1A" />
                      )}
                    </Pressable>

                    <View style={styles.qtyNumberBox}>
                      <AnimatedNumber value={item.qty} style={styles.qtyNumberText} />
                    </View>

                    <Pressable
                      style={({ pressed }) => [styles.qtyActionBtn, pressed && { opacity: 0.7 }]}
                      onPress={() => handleAdd(item.id)}
                    >
                      <SymbolView name="plus" size={14} tintColor="#1A1A1A" />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Add Items Pill Button */}
          <Pressable
            style={({ pressed }) => [styles.addItemsBtn, pressed && { opacity: 0.8 }]}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace({
                  pathname: '/store',
                  params: { id: storeId }
                });
              }
            }}>
            <SymbolView name="plus" size={13} tintColor="#1A1A1A" style={{ marginRight: 4 }} />
            <Text style={styles.addItemsBtnText}>Añadir artículos</Text>
          </Pressable>
          {/* Gift Wrapping Toggle Row Card */}
          <Pressable
            style={({ pressed }) => [styles.giftWrapRow, pressed && { opacity: 0.8 }]}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setGiftWrapped(prev => !prev);
            }}
          >
            <View style={styles.giftLeft}>
              <View style={styles.giftIconContainer}>
                <SymbolView
                  name={giftWrapped ? "gift.fill" : "gift"}
                  size={16}
                  tintColor={giftWrapped ? "#10B981" : "#4B5563"}
                />
              </View>
              <View style={styles.giftTextContainer}>
                <Text style={styles.giftTitle}>Embalar para regalo</Text>
                <Text style={styles.giftSubtitle}>Añade bolsa de regalo premium (+2,00 €)</Text>
              </View>
            </View>

            <View style={[styles.giftCheckbox, giftWrapped && styles.giftCheckboxChecked]}>
              {giftWrapped && (
                <SymbolView name="checkmark" size={10} tintColor="#FFFFFF" />
              )}
            </View>
          </Pressable>

          {/* Breakdown Section */}
          <View style={styles.breakdownContainer}>
            <Text style={styles.breakdownTitle}>Resumen de compra</Text>

            {/* Products (Original Price) */}
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Productos</Text>
              <Text style={styles.breakdownValue}>{originalSubtotal.toFixed(2).replace('.', ',')} €</Text>
            </View>

            {/* Applied Savings */}
            {totalSavings > 0 && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabelSavings}>Descuento aplicado</Text>
                <Text style={styles.breakdownValueSavings}>-{totalSavings.toFixed(2).replace('.', ',')} €</Text>
              </View>
            )}

            {/* Service Commission */}
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Comisión de servicio</Text>
              <Text style={styles.breakdownValue}>2,99 €</Text>
            </View>

            {/* Gift Wrapping Fee */}
            {giftWrapped && (
              <View style={styles.breakdownRow}>
                <Text style={styles.giftWrappedLabel}>Embalaje regalo</Text>
                <Text style={styles.breakdownValue}>2,00 €</Text>
              </View>
            )}

            <View style={styles.dividerTiny} />

            {/* Total Section */}
            <View style={styles.totalRowContainer}>
              <View>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalSubtitle}>Impuestos incluidos</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <AnimatedPrice value={totalPrice} style={styles.totalPriceText} />
              </View>
            </View>

            {/* Legal text/Disclaimer directly under Total */}
            <Text style={styles.disclaimerText}>
              En el caso de un artículo de sustitución "Sustituir por cualquier artículo similar", si el precio del artículo de sustitución es inferior al original, se cobrará el precio más bajo; si el precio es superior, se mantendrá el precio del artículo original.
            </Text>
          </View>
        </ScrollView>
      )}

      {/* Bottom Pay Button */}
      {totalItems > 0 && (
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Pressable
            style={({ pressed }) => [styles.payBtn, pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] }]}
            onPress={handleCheckout}
          >
            <Text style={styles.payBtnText}>Pagar</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  deliverySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  deliveryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 110,
  },
  productsList: {
    gap: 20,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImg: {
    width: 58,
    height: 58,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
    gap: 3,
  },
  productName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 18,
  },
  substituteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  substituteText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 2,
  },
  qtyTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    height: 32,
    paddingHorizontal: 4,
  },
  qtyActionBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyNumberBox: {
    width: 22,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  qtyNumberText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  addItemsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignSelf: 'flex-end',
    marginTop: 18,
  },
  addItemsBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 20,
  },
  giftWrapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  giftLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  giftIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftTextContainer: {
    gap: 2,
  },
  giftTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  giftSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  giftCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  giftCheckboxChecked: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  breakdownContainer: {
    marginTop: 24,
    gap: 12,
  },
  breakdownTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  giftWrappedLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },
  breakdownLabelSavings: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  breakdownValueSavings: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  productOriginalPrice: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  inlineSavingsText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  dividerTiny: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  totalRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  totalSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 1,
  },
  totalPriceText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
  },
  disclaimerText: {
    fontSize: 11,
    fontWeight: '400',
    color: '#9CA3AF',
    lineHeight: 16.5,
    marginTop: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
  },
  payBtn: {
    backgroundColor: '#000000',
    height: 52,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBtnText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
    paddingBottom: 80,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  emptyBtn: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
