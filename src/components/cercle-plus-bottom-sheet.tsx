import { SymbolView } from 'expo-symbols';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface CerclePlusBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

const BENEFITS = [
  {
    emoji: '🏷️',
    title: 'Tasa de gestión a 0 €',
    desc: 'Sin tarifas añadidas en tus reservas. Lo que ves es lo que pagas.',
  },
  {
    emoji: '⚡',
    title: 'Acceso anticipado 1h antes',
    desc: 'Reserva liquidaciones flash antes que el público general.',
  },
  {
    emoji: '🌱',
    title: 'Impacto ecológico x2',
    desc: 'Un árbol plantado por cada 5 artículos que salves.',
  },
  {
    emoji: '👑',
    title: 'Sellos dorados',
    desc: 'Acumula sellos Plus y desbloquea premios exclusivos.',
  },
];

export function CerclePlusBottomSheet({ visible, onClose }: CerclePlusBottomSheetProps) {
  const [showModal, setShowModal] = useState(visible);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

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
          duration: 300,
          easing: Easing.out(Easing.bezier(0.25, 1, 0.5, 1)),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      handleClose();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowModal(false);
      onClose();
    });
  };

  const handleTrial = () => {
    handleClose();
    setTimeout(() => {
      Alert.alert(
        '¡Bienvenido a Cercle+! 🎉',
        'Tu prueba gratuita de 30 días ha comenzado. Ya disfrutas de todos los beneficios Plus.',
        [{ text: 'Empezar a ahorrar', style: 'default' }]
      );
    }, 350);
  };

  if (!showModal) return null;

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={styles.dismissArea} onPress={handleClose} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          {/* Drag handle */}
          <View style={styles.dragHandle} />

          {/* Header row: title + X */}
          <View style={styles.headerRow}>
            <View style={styles.headerCenter}>
              <View style={styles.premiumTitleRow}>
                <Text style={styles.titlePrefix}>Prueba</Text>
                <View style={styles.premiumLogoRow}>
                  <Text style={styles.premiumLogoText}>Cercle</Text>
                  <View style={styles.premiumPlusBadge}>
                    <Text style={styles.premiumPlusText}>+</Text>
                  </View>
                </View>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceStrike}>9,99 € al mes</Text>
                <Text style={styles.priceFree}> · 30 días gratis</Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
              onPress={handleClose}
            >
              <SymbolView name="xmark" size={13} tintColor="#6B7280" />
            </Pressable>
          </View>

          {/* Horizontal benefit cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.benefitsScrollView}
            contentContainerStyle={styles.cardsContainer}
          >
            {BENEFITS.map((b, i) => (
              <View key={i} style={styles.benefitCard}>
                <Text style={styles.benefitEmoji}>{b.emoji}</Text>
                <Text style={styles.benefitTitle}>{b.title}</Text>
                <Text style={styles.benefitDesc}>{b.desc}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Legal text */}
          <Text style={styles.legalText}>
            Ventajas disponibles en tiendas participantes de Cercle. Al unirte, autorizas un cargo de 9,99 € mensual al finalizar el periodo de prueba. Cancela en cualquier momento desde la app.{' '}
            <Text style={styles.legalLink}>Consulta las condiciones</Text>
          </Text>

          {/* Payment row */}
          <View style={styles.paymentRow}>
            <View style={styles.paymentLeft}>
              <SymbolView name="creditcard.fill" size={18} tintColor="#1A1A1A" />
              <Text style={styles.paymentText}>Tarjeta de crédito</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.changeBtn, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.changeBtnText}>Cambiar</Text>
            </Pressable>
          </View>

          {/* CTA */}
          <Pressable
            style={({ pressed }) => [
              styles.ctaBtn,
              pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
            ]}
            onPress={handleTrial}
          >
            <Text style={styles.ctaBtnText}>Pruébalo gratis</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dismissArea: { flex: 1 },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 40,
    shadowColor: '#00',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 20,
  },

  dragHandle: {
    width: 38,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 24,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingRight: 8,
  },
  premiumTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 5,
  },
  titlePrefix: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  premiumLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  premiumLogoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  premiumPlusBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 5,
    borderRadius: 22,
  },
  premiumPlusText: {
    color: '#00',
    fontSize: 16,
    fontWeight: '900',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceStrike: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  priceFree: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#10B981',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 2,
  },

  benefitsScrollView: {
    marginHorizontal: -20,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  benefitCard: {
    width: SCREEN_WIDTH * 0.46,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 22,
    padding: 14,
    gap: 7,
  },
  benefitEmoji: { fontSize: 26 },
  benefitTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 18,
  },
  benefitDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 16.5,
  },

  // Legal
  legalText: {
    fontSize: 11,
    fontWeight: '400',
    color: '#9CA3AF',
    lineHeight: 16,
    marginBottom: 24,
  },
  legalLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
    color: '#6B7280',
  },

  // Payment
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paymentText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  changeBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  changeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },

  // CTA
  ctaBtn: {
    width: '100%',
    height: 52,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});
