import { FeaturedProduct } from '@/constants/homeMockData';
import { homeStyles as styles } from '@/styles/home';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

function AnimatedQuantityNumber({ value, style }: { value: number; style: any }) {
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
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: isIncrement ? -12 : 12, duration: 40, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 0.8, duration: 40, useNativeDriver: true })
        ]).start(() => {
            setDisplayValue(value);
            slideAnim.setValue(isIncrement ? 12 : -12);
            opacityAnim.setValue(0);
            scaleAnim.setValue(0.8);
            Animated.parallel([
                Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 280, friction: 14 }),
                Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 280, friction: 14 }),
                Animated.timing(opacityAnim, { toValue: 1, duration: 40, useNativeDriver: true }),
            ]).start();
        });
    }, [value]);

    return <Animated.Text style={[style, { opacity: opacityAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>{displayValue}</Animated.Text>;
}

function ProductQuantityControl({ qty, onAdd, onRemove, onClear, compact }: any) {
    const entranceAnim = useRef(new Animated.Value(qty > 0 ? 1 : 0)).current;
    const isMounted = useRef(qty > 0);

    useEffect(() => {
        if (qty > 0) {
            if (!isMounted.current) { isMounted.current = true; entranceAnim.setValue(0); }
            Animated.spring(entranceAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }).start();
        } else {
            if (isMounted.current) {
                isMounted.current = false;
                Animated.spring(entranceAnim, { toValue: 0, useNativeDriver: true, tension: 50, friction: 8 }).start();
            }
        }
    }, [qty]);

    return (
        <View style={[{ height: 34, position: 'relative', justifyContent: 'center' }, compact ? styles.dealActionControl : { marginTop: 5, width: '100%' }, compact && qty > 0 && styles.dealActionControlExpanded]}>
            <Animated.View pointerEvents={qty === 0 ? 'auto' : 'none'} style={[StyleSheet.absoluteFill, { opacity: entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), transform: [{ scale: entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.8] }) }] }]}>
                <Pressable style={({ pressed }) => [styles.addButton, { marginTop: 0 }, pressed && { transform: [{ scale: 0.95 }], opacity: 0.85 }]} onPress={(e) => { e.stopPropagation(); onAdd(); }}>
                    <Text style={styles.addButtonText}>Añadir</Text>
                    <SymbolView name="plus" size={11} tintColor="#1F2937" style={{ marginLeft: 3 }} />
                </Pressable>
            </Animated.View>
            <Animated.View pointerEvents={qty > 0 ? 'auto' : 'none'} style={[styles.qtyRowContainer, StyleSheet.absoluteFill, { marginTop: 0, opacity: entranceAnim, transform: [{ translateX: entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [-15, 0] }) }] }]}>
                <Animated.View style={[styles.qtySelector, { transform: [{ translateX: entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [-15, 0] }) }] }]}>
                    <Pressable style={({ pressed }) => [styles.qtyBtn, pressed && { transform: [{ scale: 0.85 }], opacity: 0.7 }]} onPress={(e) => { e.stopPropagation(); onRemove(); }}>
                        <SymbolView name="minus" size={11} tintColor="#1F2937" />
                    </Pressable>
                    <AnimatedQuantityNumber value={qty} style={styles.qtyText} />
                    <Pressable style={({ pressed }) => [styles.qtyBtn, pressed && { transform: [{ scale: 0.85 }], opacity: 0.7 }]} onPress={(e) => { e.stopPropagation(); onAdd(); }}>
                        <SymbolView name="plus" size={11} tintColor="#1F2937" />
                    </Pressable>
                </Animated.View>
                <Animated.View style={{ transform: [{ scale: entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }] }}>
                    <Pressable style={({ pressed }) => [styles.deleteSelectionBtn, pressed && { transform: [{ scale: 0.85 }], opacity: 0.7 }]} onPress={(e) => { e.stopPropagation(); onClear(); }}>
                        <SymbolView name="trash" size={12} tintColor="#EF4444" />
                    </Pressable>
                </Animated.View>
            </Animated.View>
        </View>
    );
}

export function DealProductCard({ prod, qty, onPress, onAdd, onRemove, onClear }: { prod: FeaturedProduct, qty: number, onPress: () => void, onAdd: () => void, onRemove: () => void, onClear: () => void }) {
    const savingsVal = parseFloat(prod.originalPrice.replace(' €', '')) - parseFloat(prod.price.replace(' €', ''));
    const isLowStock = prod.stockRemaining <= 3;
    const stockLabel = prod.stockRemaining === 1 ? '¡Última unidad disponible!' : isLowStock ? `¡Solo quedan ${prod.stockRemaining} unidades!` : null;

    return (
        <Pressable style={({ pressed }) => [styles.dealCard, pressed && { opacity: 0.92 }]} onPress={onPress}>
            <View style={styles.dealImageContainer}>
                <Image source={{ uri: prod.image }} style={styles.dealImage} contentFit="cover" />
                <View style={styles.discountBadge}><Text style={styles.discountText}>Ahorras {savingsVal}€</Text></View>
            </View>
            <View style={styles.dealInfo}>
                <View style={styles.dealHeaderRow}>
                    <View style={styles.dealHeaderCopy}>
                        <Text style={styles.dealNameText} numberOfLines={1}>{prod.name}</Text>
                        <View style={styles.dealMetaLine}>
                            <Text style={styles.dealStoreText} numberOfLines={1}>{prod.store}</Text>
                            <Text style={styles.dealMetaDot}>·</Text>
                            <SymbolView name="star.fill" size={9} tintColor="#F59E0B" style={styles.dealMetaIcon} />
                            <Text style={styles.dealRatingVal}>{prod.rating}</Text>
                            <Text style={styles.dealReviewsText}>{prod.reviewsCount}</Text>
                        </View>
                    </View>
                    <ProductQuantityControl compact qty={qty} onAdd={onAdd} onRemove={onRemove} onClear={onClear} />
                </View>
                <View style={styles.dealPriceRow}>
                    <View style={styles.dealPriceGroup}>
                        <Text style={styles.dealPriceVal}>{prod.price}</Text>
                        <Text style={styles.dealOriginalPriceVal}>{prod.originalPrice}</Text>
                    </View>
                    {stockLabel && (
                        <View style={[styles.dealStockBanner, styles.dealStockBannerRight]}>
                            <View style={styles.dealStockDot} />
                            <Text style={styles.dealStockHint} numberOfLines={1}>{stockLabel}</Text>
                        </View>
                    )}
                </View>
            </View>
        </Pressable>
    );
}