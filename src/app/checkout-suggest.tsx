import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React, { useState, useEffect, useRef } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { cartStore } from '../utils/cartStore';
import { ALL_PRODUCTS } from './cart';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRODUCT_W = (SCREEN_WIDTH - 56) / 2;

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

export default function CheckoutSuggestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const storeId = (params.storeId as string) || '1';
  const storeName = (params.storeName as string) || 'Carrefour Express';

  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    return { ...cartStore.get() };
  });

  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const loaderRotation = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;

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

      // Simulate completion after 2 seconds
      const timer = setTimeout(() => {
        router.replace({
          pathname: '/order-success',
          params: {
            storeId,
            storeName,
            totalPrice: totalPrice.toFixed(2),
            totalItems: cartItems.reduce((a, b) => a + b.qty, 0),
            itemsData: JSON.stringify(cartItems),
          }
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [checkoutStatus]);

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

  // Get all recommended products
  const recommendedItems = ALL_PRODUCTS;

  // Calculate updated price parameters
  const cartItems = Object.entries(quantities)
    .map(([prodId, qty]) => {
      const prod = ALL_PRODUCTS.find(p => p.id === prodId);
      return prod ? { ...prod, qty } : null;
    })
    .filter(Boolean) as Array<{ id: string; name: string; price: string; qty: number }>;

  const subtotal = cartItems.reduce((sum, item) => {
    const numericPrice = parseFloat(item.price.replace(' €', ''));
    return sum + numericPrice * item.qty;
  }, 0);

  const commission = 2.99;
  const totalPrice = subtotal + commission;

  const spin = loaderRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleFinishCheckout = () => {
    setCheckoutStatus('processing');
  };

  const handleGoHome = () => {
    // Clear cart and route to home (tabs)
    cartStore.clear();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFFFFF' }} />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.7 }]}
          onPress={() => router.back()}
        >
          <SymbolView name="chevron.left" size={18} tintColor="#1A1A1A" />
        </Pressable>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>¿Te falta algo?</Text>
        </View>
        <View style={styles.headerBtnPlaceholder} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner text */}
        <View style={styles.bannerContainer}>
          <Text style={styles.bannerHeading}>Antes de pagar...</Text>
          <Text style={styles.bannerSubtitle}>
            Añade algunos de los artículos más populares de {storeName} y completa tu pedido sin gastos de envío adicionales.
          </Text>
        </View>

        {recommendedItems.length > 0 ? (
          <View style={styles.gridContainer}>
            {recommendedItems.map(item => {
              const discountPct = item.originalPrice
                ? Math.round(
                    ((parseFloat(item.originalPrice.replace(' €', '')) - parseFloat(item.price.replace(' €', ''))) /
                      parseFloat(item.originalPrice.replace(' €', ''))) *
                      100
                  )
                : 0;

              const qty = quantities[item.id] || 0;

              return (
                <View key={item.id} style={styles.productCard}>
                  {/* Frameless Product Image */}
                  <View style={[styles.productImgBox, qty > 0 && styles.productImgBoxActive]}>
                    <Image source={{ uri: item.image }} style={styles.productImg} contentFit="cover" />
                  </View>
                  
                  {/* Clean text info underneath */}
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                    
                    <View style={styles.priceRow}>
                      <Text style={styles.productPrice}>{item.price}</Text>
                      {item.originalPrice && (
                        <Text style={styles.productOriginalPrice}>{item.originalPrice}</Text>
                      )}
                      {discountPct > 0 && (
                        <Text style={styles.discountText}>-{discountPct}%</Text>
                      )}
                    </View>
                  </View>

                  {/* Add / Quantity Button aligned to rounded rectangle style */}
                  {qty === 0 ? (
                    <Pressable
                      style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.85 }]}
                      onPress={() => handleAdd(item.id)}
                    >
                      <Text style={styles.addButtonText}>Añadir</Text>
                      <SymbolView name="plus" size={12} tintColor="#1F2937" style={{ marginLeft: 4 }} />
                    </Pressable>
                  ) : (
                    <View style={styles.qtyContainer}>
                      <Pressable
                        style={({ pressed }) => [styles.qtyBtn, pressed && { opacity: 0.75 }]}
                        onPress={() => handleRemove(item.id)}
                      >
                        <SymbolView
                          name={qty === 1 ? 'trash' : 'minus'}
                          size={11}
                          tintColor={qty === 1 ? '#EF4444' : '#1F2937'}
                        />
                      </Pressable>
                      
                      <AnimatedNumber value={qty} style={styles.qtyText} />
                      
                      <Pressable
                        style={({ pressed }) => [styles.qtyBtn, pressed && { opacity: 0.75 }]}
                        onPress={() => handleAdd(item.id)}
                      >
                        <SymbolView name="plus" size={11} tintColor="#1F2937" />
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <SymbolView name="checkmark.circle.fill" size={48} tintColor="#10B981" />
            <Text style={styles.emptyText}>¡Lo tienes todo listo!</Text>
            <Text style={styles.emptySubtitle}>Has añadido todas nuestras recomendaciones a tu carrito.</Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>Total del pedido</Text>
            <Text style={styles.totalItemsText}>
              {cartItems.reduce((a, b) => a + b.qty, 0)} {cartItems.reduce((a, b) => a + b.qty, 0) === 1 ? 'artículo' : 'artículos'}
            </Text>
          </View>
          <AnimatedPrice value={totalPrice} style={styles.totalPriceText} />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.payBtn,
            pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] }
          ]}
          onPress={handleFinishCheckout}
        >
          <Text style={styles.payBtnText}>Confirmar y pagar</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.noThanksBtn, pressed && { opacity: 0.6 }]}
          onPress={handleFinishCheckout}
        >
          <Text style={styles.noThanksText}>No, gracias, continuar</Text>
        </Pressable>
      </View>

      {/* Processing Animation Overlay */}
      {checkoutStatus !== 'idle' && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <SymbolView name="arrow.triangle.2.circlepath" size={42} tintColor="#FFFFFF" />
            </Animated.View>
            <Text style={styles.overlayTitle}>Procesando pago...</Text>
            <Text style={styles.overlaySubtitle}>Conectando de forma segura...</Text>
          </View>
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
  headerTitleBox: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  headerBtnPlaceholder: {
    width: 38,
    height: 38,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 180,
  },
  bannerContainer: {
    marginBottom: 24,
    gap: 6,
  },
  bannerHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  bannerSubtitle: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 19.5,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
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
  },
  productImgBoxActive: {
    borderColor: '#1F2937',
    borderWidth: 2,
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    paddingTop: 8,
    paddingHorizontal: 2,
    gap: 3,
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
  productOriginalPrice: {
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    height: 36,
    marginTop: 6,
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
    height: 36,
    marginTop: 6,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18.5,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
    gap: 12,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  totalLabel: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  totalItemsText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 1,
  },
  totalPriceText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
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
  noThanksBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  noThanksText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#6B7280',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    zIndex: 1000,
  },
  overlayContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  overlayTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginTop: 8,
  },
  overlaySubtitle: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 19.5,
  },
  successBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  successSubtitle: {
    fontSize: 14.5,
    fontWeight: '500',
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  goHomeBtn: {
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 13,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  goHomeBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000000',
  },
});
