import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React, { useState, useEffect, useRef } from 'react';
import { Animated, Dimensions, LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, UIManager, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { cartStore } from '../utils/cartStore';
import { Colors as COLORS, Spacing as SPACING } from '@/constants/theme';

export const ALL_PRODUCTS = [
  { id: 'p1', name: 'Chaqueta Oversize', price: '29 €', originalPrice: '89 €', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80', category: 'Destacados' },
  { id: 'p2', name: 'Zapatillas Blancas', price: '45 €', originalPrice: '120 €', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80', category: 'Destacados' },
  { id: 'p3', name: 'Bolso de Piel', price: '55 €', originalPrice: '180 €', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80', category: 'Novedades' },
  { id: 'p4', name: 'Vestido Floral', price: '19 €', originalPrice: '65 €', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80', category: 'Liquidación' },
  { id: 'p5', name: 'Gafas de Sol', price: '12 €', originalPrice: '40 €', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&q=80', category: 'Top ventas' },
  { id: 'p6', name: 'Jersey de Lana', price: '22 €', originalPrice: '70 €', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=400&q=80', category: 'Novedades' },
];

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function AnimatedNumber({ value, style }: { value: number; style: any }) {
  const [displayValue, setDisplayValue] = useState(value);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevValueRef = useRef(value);

  useEffect(() => {
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
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const prevValueRef = useRef(value);

  useEffect(() => {
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

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const storeId = (params.storeId as string) || '1';
  const storeName = (params.storeName as string) || 'PUNT DE CAFÈ (Pet food)';

  // Sync cart quantities
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    return { ...cartStore.get() };
  });

  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'processing'>('idle');
  const loaderRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    cartStore.set(quantities);
  }, [quantities]);

  useEffect(() => {
    if (checkoutStatus === 'processing') {
      loaderRotation.setValue(0);
      Animated.loop(
        Animated.timing(loaderRotation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();

      // Navigate to order-success after 2 seconds
      const timer = setTimeout(() => {
        router.replace({
          pathname: '/order-success',
          params: {
            storeId,
            storeName,
            totalPrice: totalPrice.toFixed(2),
            totalItems: totalCount,
            itemsData: JSON.stringify(cartItems),
          }
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [checkoutStatus]);

  const handleIncrement = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setQuantities(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleDecrement = (id: string) => {
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

  // Calculations
  const cartItems = Object.entries(quantities)
    .map(([prodId, qty]) => {
      const prod = ALL_PRODUCTS.find(p => p.id === prodId);
      return prod ? { ...prod, qty } : null;
    })
    .filter(Boolean) as Array<{ id: string; name: string; price: string; originalPrice?: string; image: string; qty: number }>;

  const totalCount = cartItems.reduce((a, b) => a + b.qty, 0);

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
  const totalPrice = basePrice > 0 ? basePrice + commission : 4.99;

  const spin = loaderRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFFFFF' }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
        >
          <SymbolView name="arrow.left" size={20} tintColor="#111827" />
        </Pressable>
        <View style={styles.headerSpacer} />
      </View>

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

                {/* Quantity Selector Tracker */}
                <View style={styles.qtyTrack}>
                  <Pressable
                    style={({ pressed }) => [styles.qtyActionBtn, pressed && { opacity: 0.7 }]}
                    onPress={() => handleDecrement(item.id)}
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
                    onPress={() => handleIncrement(item.id)}
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
              router.replace('/(tabs)');
            }
          }}
        >
          <SymbolView name="plus" size={13} tintColor="#1A1A1A" style={{ marginRight: 4 }} />
          <Text style={styles.addItemsBtnText}>Añadir artículos</Text>
        </Pressable>


        {/* Payment Method Card */}
        <View style={styles.paymentCard}>
          <Text style={styles.paymentCardTitle}>MÉTODO DE PAGO</Text>
          <View style={styles.paymentRow}>
            {/* Apple Pay Emblem */}
            <View style={styles.applePayEmblem}>
              <Text style={styles.applePayEmblemText}>Pay</Text>
            </View>
            <Text style={styles.paymentLabel}>Apple Pay</Text>
            
            <Pressable style={({ pressed }) => [styles.changeBtn, pressed && { opacity: 0.6 }]}>
              <Text style={styles.changeBtnText}>Cambiar</Text>
            </Pressable>
          </View>
        </View>

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
        </View>

        {/* Terms Disclaimer */}
        <Text style={styles.disclaimerText}>
          Reservando esta comida aceptas los{' '}
          <Text style={styles.linkText}>Términos y condiciones</Text>
          {'\n'}de Too Good To Go.
        </Text>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {/* Apple Pay Button with embedded credit card badge */}
        <Pressable
          disabled={totalCount === 0}
          style={({ pressed }) => [
            styles.payBtn,
            totalCount === 0 && { opacity: 0.5 },
            totalCount > 0 && pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] }
          ]}
          onPress={() => setCheckoutStatus('processing')}
        >
          <View style={styles.payBtnContent}>
            <Text style={styles.payBtnLogoText}> Pay</Text>
            <View style={styles.dividerLine} />
            
            {/* Embedded Credit Card Icon exactly matching the screenshot */}
            <View style={styles.creditCardIcon}>
              <View style={styles.creditCardLine} />
            </View>
          </View>
        </Pressable>
      </View>

      {/* Loader Overlay */}
      {checkoutStatus === 'processing' && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <SymbolView name="arrow.triangle.2.circlepath" size={38} tintColor="#FFFFFF" />
            </Animated.View>
            <Text style={styles.overlayTitle}>Confirmando reserva...</Text>
            <Text style={styles.overlaySubtitle}>Por favor, no cierres la aplicación.</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light.background },
  header: { height: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.four, backgroundColor: COLORS.light.background },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: COLORS.light.backgroundElement, borderWidth: 1, borderColor: '#E5E7EB' },
  headerSpacer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 130,
  },
  initialsContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5FAEE3',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  initialsText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  storeTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  pickupPill: {
    backgroundColor: '#F9ECEF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 22,
  },
  pickupPillText: {
    color: '#1A1A1A',
    fontSize: 12.5,
    fontWeight: '700',
  },
  timeText: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '500',
  },
  productsList: {
    gap: 24,
    marginBottom: 24,
  },
  addItemsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  addItemsBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  productRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.light.backgroundElement, borderRadius: 22, borderWidth: 1, borderColor: '#E5E7EB', padding: SPACING.three, marginBottom: SPACING.two },
  productImg: {
    width: 58,
    height: 58,
    borderRadius: 22,
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
  productPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 2,
  },
  productOriginalPrice: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  qtyTrack: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.light.backgroundElement, borderRadius: 22, height: 32, paddingHorizontal: SPACING.half },
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
  paymentCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 24,
  },
  paymentCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4B5563',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applePayEmblem: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 10,
  },
  applePayEmblemText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },
  paymentLabel: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  changeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  changeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F766E',
  },
  breakdownContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
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
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  linkText: {
    textDecorationLine: 'underline',
    color: '#0F766E',
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
  payBtn: { backgroundColor: '#111827', height: 52, borderRadius: 22, alignItems: 'center', justifyContent: 'center', width: '100%' },
  payBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payBtnLogoText: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  dividerLine: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    marginHorizontal: 12,
  },
  creditCardIcon: {
    width: 24,
    height: 16,
    borderRadius: 2.5,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  creditCardLine: {
    position: 'absolute',
    top: 3,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: '#FFFFFF',
  },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  overlayContent: {
    alignItems: 'center',
    gap: 16,
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  overlaySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});
