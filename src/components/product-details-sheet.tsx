import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

function AnimatedNumber({ value, style }: { value: number; style: any }) {
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

interface ProductDetailsSheetProps {
  visible: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: string;
    originalPrice?: string;
    image: string;
    store?: string;
    stockRemaining?: number;
    maxStock?: number;
    stockText?: string;
  } | null;
  quantities: Record<string, number>;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const MOCK_SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const MOCK_COLORS = [
  { name: 'Negro', value: '#1F2937' },
  { name: 'Beige', value: '#F5F5DC' },
  { name: 'Verde Oliva', value: '#556B2F' },
  { name: 'Terracota', value: '#C2B280' },
];

const SUGGESTED_PRODUCTS = [
  { id: 'p1', name: 'Chaqueta Oversize', price: '29 €', originalPrice: '89 €', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80', store: 'Retro Vintage' },
  { id: 'p2', name: 'Zapatillas Blancas', price: '45 €', originalPrice: '120 €', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80', store: 'Urban Sneaks' },
  { id: 'p3', name: 'Bolso de Piel', price: '55 €', originalPrice: '180 €', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80', store: 'Leather Works' },
  { id: 'p4', name: 'Vestido Floral', price: '19 €', originalPrice: '65 €', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80', store: 'Boho Chic' },
  { id: 'p5', name: 'Gafas de Sol Pro', price: '12 €', originalPrice: '40 €', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&q=80', store: 'Specs Studio' },
  { id: 'p6', name: 'Jersey de Lana', price: '22 €', originalPrice: '70 €', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=400&q=80', store: 'Trendy Wear' },
];

export function ProductDetailsSheet({
  visible,
  onClose,
  product,
  quantities,
  onAdd,
  onRemove,
  isFavorite,
  onToggleFavorite,
}: ProductDetailsSheetProps) {
  const [showModal, setShowModal] = useState(visible);
  const [activeProduct, setActiveProduct] = useState(product);

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('#1F2937');
  const [descExpanded, setDescExpanded] = useState(true);
  const [ecoExpanded, setEcoExpanded] = useState(false);

  // UX Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info'>('success');
  const toastY = useRef(new Animated.Value(-120)).current;
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fullscreen Viewer State
  const [fullscreenImage, setFullscreenImage] = useState(false);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const isSizeAvailable = (size: string) => {
    if (!activeProduct) return true;
    const stock = activeProduct.stockRemaining;
    if (stock === undefined) return true;
    if (stock === 1) return size === 'M';
    if (stock === 2) return size === 'S' || size === 'M';
    if (stock === 3) return size === 'S' || size === 'M' || size === 'L';
    return true;
  };

  const isColorAvailable = (colorVal: string) => {
    if (!activeProduct) return true;
    const stock = activeProduct.stockRemaining;
    if (stock === undefined) return true;
    if (stock === 1) return colorVal === '#1F2937'; // only Negro
    if (stock === 2) return colorVal === '#1F2937' || colorVal === '#F5F5DC'; // Negro and Beige
    return true;
  };

  const handleSizePress = (size: string) => {
    if (!isSizeAvailable(size)) {
      showToast('Esta talla está agotada para este stock muerto local.', 'info');
      return;
    }
    setSelectedSize(size);
  };

  const handleColorPress = (colorVal: string) => {
    if (!isColorAvailable(colorVal)) {
      showToast('Este color está agotado para este stock muerto local.', 'info');
      return;
    }
    setSelectedColor(colorVal);
  };

  // Sync state with product prop
  useEffect(() => {
    if (product) {
      setActiveProduct(product);
      // Pre-select 'M' which is always available for our mock items,
      // or a default available one.
      setSelectedSize('M');
      setSelectedColor('#1F2937');
    }
  }, [product]);

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 340,
          easing: Easing.out(Easing.bezier(0.25, 1, 0.5, 1)),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      handleClose();
    }
  }, [visible]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 260,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowModal(false);
      onClose();
    });
  };

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    setToastType(type);

    Animated.spring(toastY, {
      toValue: 24,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();

    toastTimeoutRef.current = setTimeout(() => {
      Animated.timing(toastY, {
        toValue: -120,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setToastMessage(null);
      });
    }, 3000);
  };

  const handleReserve = (name: string) => {
    showToast(`¡Reserva confirmada! "${name}" reservado 24h gratis.`);
  };

  if (!showModal || !activeProduct) return null;

  const discountPercent = activeProduct.originalPrice
    ? Math.round(
        ((parseFloat(activeProduct.originalPrice.replace(' €', '')) -
          parseFloat(activeProduct.price.replace(' €', ''))) /
          parseFloat(activeProduct.originalPrice.replace(' €', ''))) *
          100
      )
    : 0;

  const savingsVal = activeProduct.originalPrice
    ? parseFloat(activeProduct.originalPrice.replace(' €', '')) - parseFloat(activeProduct.price.replace(' €', ''))
    : 0;

  const qty = quantities[activeProduct.id] ?? 0;

  // Filter out the active product from suggestions
  const relatedProducts = SUGGESTED_PRODUCTS.filter((p) => p.id !== activeProduct.id);

  const toggleDesc = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDescExpanded(!descExpanded);
  };

  const toggleEco = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEcoExpanded(!ecoExpanded);
  };

  return (
    <Modal visible={showModal} transparent animationType="none" onRequestClose={handleClose}>
      <View style={s.container}>
        {/* Backdrop */}
        <Animated.View style={[s.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={s.dismissArea} onPress={handleClose} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
          {/* Drag handle */}
          <View style={s.dragHandle} />

          {/* Top Sticky Header */}
          <View style={s.headerRow}>
            <Text style={s.headerTitle} numberOfLines={1}>
              Detalles del Producto
            </Text>
            <View style={s.headerActions}>
              <Pressable
                style={({ pressed }) => [s.headerBtn, pressed && { opacity: 0.7 }]}
                onPress={handleClose}
              >
                <SymbolView name="xmark" size={14} tintColor="#6B7280" />
              </Pressable>
            </View>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.scrollContent}
            bounces={true}
          >
            {/* Image Box */}
            <Pressable
              style={({ pressed }) => [s.imageBox, pressed && { transform: [{ scale: 0.99 }] }]}
              onPress={() => setFullscreenImage(true)}
            >
              <Image source={{ uri: activeProduct.image }} style={s.productImg} contentFit="cover" />
              {discountPercent > 0 && (
                <View style={s.discountBadge}>
                  <Text style={s.discountText}>Te ahorras {savingsVal}€</Text>
                </View>
              )}
              {/* Overlay swipe indicators to feel premium */}
              <View style={s.imageDots}>
                <View style={[s.imageDot, s.imageDotActive]} />
                <View style={s.imageDot} />
                <View style={s.imageDot} />
              </View>
            </Pressable>

            {/* Info / Title section */}
            <View style={s.infoBox}>
              <View style={s.storeRow}>
                <SymbolView name="storefront.fill" size={12} tintColor="#10B981" />
                <Text style={s.storeText}>{activeProduct.store || 'Tienda Local'}</Text>
                <View style={s.ratingBadge}>
                  <SymbolView name="star.fill" size={10} tintColor="#FFB000" />
                  <Text style={s.ratingText}>4.8</Text>
                </View>
              </View>

              <Text style={s.productName}>{activeProduct.name}</Text>

              <View style={s.priceBox}>
                <Text style={s.priceText}>{activeProduct.price}</Text>
                {activeProduct.originalPrice && (
                  <Text style={s.originalPriceText}>{activeProduct.originalPrice}</Text>
                )}
              </View>

              {/* Urgency Deadstock progress block in Detail Sheet */}
              {activeProduct.stockRemaining !== undefined && activeProduct.maxStock !== undefined && (
                <View style={s.sheetStockProgressContainer}>
                  <View style={s.sheetStockProgressBarBackground}>
                    <View
                      style={[
                        s.sheetStockProgressBarFill,
                        { width: `${((activeProduct.maxStock - activeProduct.stockRemaining) / activeProduct.maxStock) * 100}%` }
                      ]}
                    />
                  </View>
                  <View style={s.sheetStockTextRow}>
                    <SymbolView name="exclamationmark.triangle.fill" size={10.5} tintColor="#D97706" />
                    <Text style={s.sheetStockText}>
                      {activeProduct.stockRemaining === 1
                        ? '¡Última unidad!'
                        : activeProduct.stockRemaining <= 3
                        ? `¡Últimas ${activeProduct.stockRemaining} unidades!`
                        : `Quedan ${activeProduct.stockRemaining} unidades`}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View style={s.divider} />

            {/* Size Selector Widget */}
            <View style={s.selectorWidget}>
              <View style={s.selectorHeader}>
                <Text style={s.selectorTitle}>Selecciona Talla</Text>
                <Pressable style={s.guideBtn}>
                  <SymbolView name="arrow.left.and.right" size={10} tintColor="#6B7280" />
                  <Text style={s.guideText}>Guía de tallas</Text>
                </Pressable>
              </View>
              <View style={s.sizesRow}>
                {MOCK_SIZES.map((size) => {
                  const isSelected = selectedSize === size;
                  const available = isSizeAvailable(size);
                  return (
                    <Pressable
                      key={size}
                      style={[
                        s.sizeChip,
                        isSelected && s.sizeChipActive,
                        !available && s.sizeChipDisabled
                      ]}
                      onPress={() => handleSizePress(size)}
                    >
                      <Text style={[
                        s.sizeText,
                        isSelected && s.sizeTextActive,
                        !available && s.sizeTextDisabled
                      ]}>
                        {size}
                      </Text>
                      {!available && (
                        <View style={s.sizeDisabledLine} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
              <Text style={s.sizeHelperText}>
                Talla {selectedSize} seleccionada {selectedSize === 'S' || selectedSize === 'M' ? '(Ajuste regular / Fiel a la talla)' : selectedSize === 'XS' ? '(Ajuste ceñido / Slim)' : '(Ajuste holgado / Oversize)'}
              </Text>
            </View>

            {/* Color Selector Widget */}
            <View style={s.selectorWidget}>
              <Text style={s.selectorTitle}>Color Disponible</Text>
              <View style={s.colorsRow}>
                {MOCK_COLORS.map((col) => {
                  const isSelected = selectedColor === col.value;
                  const available = isColorAvailable(col.value);
                  return (
                    <Pressable
                      key={col.value}
                      style={[
                        s.colorOuter,
                        isSelected && { borderColor: '#1A1A1A', borderWidth: 2 },
                        !available && { opacity: 0.25 }
                      ]}
                      onPress={() => handleColorPress(col.value)}
                    >
                      <View style={[s.colorInner, { backgroundColor: col.value }]} />
                      {!available && (
                        <View style={s.colorDisabledSlash} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={s.divider} />

            {/* Accordion 1: Descripción */}
            <View style={s.accordionCard}>
              <Pressable style={s.accordionHeader} onPress={toggleDesc}>
                <View style={s.accordionHeaderLeft}>
                  <SymbolView name="list.bullet" size={13} tintColor="#4B5563" />
                  <Text style={s.accordionTitle}>Detalles & Materiales</Text>
                </View>
                <SymbolView
                  name={descExpanded ? 'chevron.up' : 'chevron.down'}
                  size={12}
                  tintColor="#9CA3AF"
                />
              </Pressable>
              {descExpanded && (
                <View style={s.accordionBody}>
                  <Text style={s.descText}>
                    Esta pieza ha sido seleccionada cuidadosamente por su calidad superior y su durabilidad excepcional. Confeccionada con algodón reciclado de alta densidad y fibras seleccionadas para un tacto ultra suave y corte holgado que garantiza comodidad absoluta durante todo el día.
                  </Text>
                  <View style={s.featureRow}>
                    <SymbolView name="checkmark" size={10} tintColor="#10B981" />
                    <Text style={s.featureText}>Diseño ergonómico y costuras reforzadas</Text>
                  </View>
                  <View style={s.featureRow}>
                    <SymbolView name="checkmark" size={10} tintColor="#10B981" />
                    <Text style={s.featureText}>Lavar a máquina en frío, secar en plano</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Accordion 2: Sostenibilidad Ecológica */}
            <View style={s.accordionCard}>
              <Pressable style={s.accordionHeader} onPress={toggleEco}>
                <View style={s.accordionHeaderLeft}>
                  <SymbolView name="leaf.fill" size={13} tintColor="#10B981" />
                  <Text style={s.accordionTitle}>Sostenibilidad Cercle</Text>
                </View>
                <SymbolView
                  name={ecoExpanded ? 'chevron.up' : 'chevron.down'}
                  size={12}
                  tintColor="#9CA3AF"
                />
              </Pressable>
              {ecoExpanded && (
                <View style={s.accordionBody}>
                  <Text style={s.descText}>
                    Al reservar este artículo de forma local, estás eliminando la necesidad de embalajes de plástico desechables y las emisiones de carbono asociadas con los envíos tradicionales de última milla.
                  </Text>
                  <View style={s.ecoMetricsRow}>
                    <View style={s.ecoMetric}>
                      <Text style={s.ecoMetricVal}>-95%</Text>
                      <Text style={s.ecoMetricLbl}>Plásticos</Text>
                    </View>
                    <View style={s.ecoMetric}>
                      <Text style={s.ecoMetricVal}>0 gCO₂</Text>
                      <Text style={s.ecoMetricLbl}>Emisiones</Text>
                    </View>
                    <View style={s.ecoMetric}>
                      <Text style={s.ecoMetricVal}>100%</Text>
                      <Text style={s.ecoMetricLbl}>Local</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            <View style={s.divider} />

            {/* Carousel section "También te puede interesar" */}
            <View style={s.carouselWidget}>
              <Text style={s.carouselTitle}>También te puede gustar</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.carouselContainer}
              >
                {relatedProducts.map((prod) => (
                  <Pressable
                    key={prod.id}
                    style={({ pressed }) => [s.suggestedCard, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
                    onPress={() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setActiveProduct(prod);
                      setSelectedSize('M');
                    }}
                  >
                    <Image source={{ uri: prod.image }} style={s.suggestedImg} contentFit="cover" />
                    <View style={s.suggestedInfo}>
                      <Text style={s.suggestedName} numberOfLines={1}>
                        {prod.name}
                      </Text>
                      <Text style={s.suggestedPrice}>{prod.price}</Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          {/* Sticky Bottom Actions */}
          <View style={s.bottomContainer}>
            {qty === 0 ? (
              <View style={s.actionRow}>
                <Pressable
                  style={({ pressed }) => [s.reserveBtn, pressed && { opacity: 0.85 }]}
                  onPress={() => handleReserve(activeProduct.name)}
                >
                  <Text style={s.reserveBtnText}>Reservar gratis</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [s.addCartBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
                  onPress={() => onAdd(activeProduct.id)}
                >
                  <SymbolView name="cart.fill" size={14} tintColor="#FFFFFF" />
                  <Text style={s.addCartBtnText}>Añadir</Text>
                </Pressable>
              </View>
            ) : (
              <View style={s.actionRow}>
                <Pressable
                  style={({ pressed }) => [s.reserveBtn, pressed && { opacity: 0.85 }]}
                  onPress={() => handleReserve(activeProduct.name)}
                >
                  <Text style={s.reserveBtnText}>Reservar gratis</Text>
                </Pressable>

                <View style={s.qtyTrack}>
                  <Pressable
                    style={({ pressed }) => [s.qtyBtnItem, pressed && { opacity: 0.75 }]}
                    onPress={() => onRemove(activeProduct.id)}
                  >
                    <SymbolView
                      name={qty === 1 ? 'trash' : 'minus'}
                      size={11}
                      tintColor={qty === 1 ? '#EF4444' : '#1F2937'}
                    />
                  </Pressable>
                  
                  <AnimatedNumber value={qty} style={s.qtyTextVal} />
                  
                  <Pressable
                    style={({ pressed }) => [s.qtyBtnItem, pressed && { opacity: 0.75 }]}
                    onPress={() => onAdd(activeProduct.id)}
                  >
                    <SymbolView name="plus" size={11} tintColor="#1F2937" />
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Brand New Fullscreen Image Modal Viewer */}
        <Modal
          visible={fullscreenImage}
          transparent
          animationType="fade"
          onRequestClose={() => setFullscreenImage(false)}
        >
          <View style={s.fullscreenContainer}>
            <Pressable style={s.fullscreenCloseArea} onPress={() => setFullscreenImage(false)} />
            
            <Image
              source={{ uri: activeProduct.image }}
              style={s.fullscreenImg}
              contentFit="contain"
            />
            
            {/* Close Button */}
            <Pressable
              style={({ pressed }) => [s.fullscreenCloseBtn, pressed && { opacity: 0.8 }]}
              onPress={() => setFullscreenImage(false)}
            >
              <SymbolView name="xmark" size={16} tintColor="#FFFFFF" />
            </Pressable>
            
            {/* Elegant visual typography footer card */}
            <View style={s.fullscreenCaption}>
              <Text style={s.fullscreenCaptionTitle}>{activeProduct.name}</Text>
              <Text style={s.fullscreenCaptionSub}>{activeProduct.store || 'Tienda Local'}</Text>
            </View>
          </View>
        </Modal>

        {/* Brand New Floating Premium Toast Notification */}
        {toastMessage !== null && (
          <Animated.View
            style={[
              s.toastContainer,
              { transform: [{ translateY: toastY }] }
            ]}
          >
            <View style={s.toastContent}>
              <SymbolView
                name={toastType === 'success' ? 'checkmark.circle.fill' : 'info.circle.fill'}
                size={16}
                tintColor="#10B981"
              />
              <Text style={s.toastText}>{toastMessage}</Text>
            </View>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dismissArea: { flex: 1 },

  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    height: SCREEN_HEIGHT * 0.88,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 20,
  },

  dragHandle: {
    width: 38,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 12,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.3,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerBtnSaved: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 130,
  },

  imageBox: {
    width: '100%',
    height: SCREEN_WIDTH - 40,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
    marginBottom: 18,
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  imageDots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  imageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  imageDotActive: {
    width: 16,
    backgroundColor: '#FFFFFF',
  },

  infoBox: {
    gap: 8,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  storeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    marginLeft: 6,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  productName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.4,
    lineHeight: 25,
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  priceText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  originalPriceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  savingBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  savingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },

  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 18,
  },

  selectorWidget: {
    marginBottom: 16,
  },
  selectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  selectorTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  guideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guideText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#6B7280',
  },
  sizesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeChip: {
    height: 38,
    flex: 1,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sizeChipActive: {
    backgroundColor: '#1F2937',
    borderColor: '#1F2937',
  },
  sizeText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4B5563',
  },
  sizeTextActive: {
    color: '#FFFFFF',
  },

  colorsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },

  accordionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accordionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  accordionBody: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  descText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 18.5,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  featureText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#4B5563',
  },
  ecoMetricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  ecoMetric: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 8,
    gap: 2,
  },
  ecoMetricVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10B981',
  },
  ecoMetricLbl: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#9CA3AF',
  },

  carouselWidget: {
    marginTop: 12,
  },
  carouselTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  carouselContainer: {
    gap: 12,
    paddingRight: 20,
  },
  suggestedCard: {
    width: 110,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  suggestedImg: {
    width: '100%',
    height: 100,
    backgroundColor: '#F3F4F6',
  },
  suggestedInfo: {
    padding: 8,
    gap: 2,
  },
  suggestedName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  suggestedPrice: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1F2937',
  },

  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  reserveBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reserveBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1F2937',
  },
  addCartBtn: {
    flex: 1.1,
    backgroundColor: '#1A1A1A',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addCartBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  qtyTrack: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 6,
  },
  qtyBtnItem: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 1,
  },
  qtyTextVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
  },
  sizeHelperText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#059669',
    marginTop: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },

  // Fullscreen photo viewer styling
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenCloseArea: {
    ...StyleSheet.absoluteFill,
  },
  fullscreenImg: {
    width: '90%',
    height: '70%',
  },
  fullscreenCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    right: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  fullscreenCaption: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 4,
  },
  fullscreenCaptionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  fullscreenCaptionSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },

  // Floating custom Toast styling
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: '5%',
    right: '5%',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    zIndex: 9999,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },

  // Urgency Stock Progress inside Details Sheet
  sheetStockProgressContainer: {
    marginTop: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    padding: 10,
    borderRadius: 12,
    gap: 6,
  },
  sheetStockProgressBarBackground: {
    height: 4,
    width: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  sheetStockProgressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 2,
  },
  sheetStockTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sheetStockText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#D97706',
  },

  // Size Disabled states
  sizeChipDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    opacity: 0.35,
  },
  sizeTextDisabled: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  sizeDisabledLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#9CA3AF',
    width: '60%',
  },

  // Color Disabled states
  colorDisabledSlash: {
    position: 'absolute',
    width: 28,
    height: 1.5,
    backgroundColor: '#9CA3AF',
    transform: [{ rotate: '45deg' }],
  },
});
