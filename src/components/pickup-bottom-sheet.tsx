import { SymbolView } from 'expo-symbols';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PickupBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    icon: 'cart.fill',
    color: '#5B2333',
    bg: '#FDF2F4',
    title: 'Reserva en la app',
    desc: '100% gratis, sin pagar nada por adelantado. Tu artículo queda apartado durante 24h.',
  },
  {
    icon: 'storefront.fill',
    color: '#5B2333',
    bg: '#FDF2F4',
    title: 'Recógelo en tienda',
    desc: 'Ve a la tienda física, muestra tu código QR y llévate el artículo al momento.',
  },
  {
    icon: 'leaf.fill',
    color: '#5B2333',
    bg: '#FDF2F4',
    title: 'Sin embalajes ni emisiones',
    desc: 'Eliminamos el transporte de paquetes y todo el plástico de embalaje. Comercio local y sostenible.',
  },
];

export function PickupBottomSheet({ visible, onClose }: PickupBottomSheetProps) {
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

  if (!showModal) return null;

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={styles.dismissArea} onPress={handleClose} />
        </Animated.View>

        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          {/* Drag handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <SymbolView name="storefront.fill" size={16} tintColor="#5B2333" />
              <Text style={styles.headerTitle}>Recogida en tienda</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
              onPress={handleClose}
            >
              <SymbolView name="xmark" size={14} tintColor="#6B7280" />
            </Pressable>
          </View>

          {/* Tagline */}
          <View style={styles.taglineBox}>
            <Text style={styles.taglineText}>
              En Cercle <Text style={styles.taglineBold}>no hay envíos</Text>. Reservas el artículo gratis y lo recoges directamente en la tienda.
            </Text>
          </View>

          {/* Steps */}
          <View style={styles.stepsContainer}>
            {STEPS.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                {/* Icon + connector line */}
                <View style={styles.stepLeft}>
                  <View style={[styles.stepIconBox, { backgroundColor: step.bg }]}>
                    <SymbolView name={step.icon as any} size={16} tintColor={step.color} />
                  </View>
                  {i < STEPS.length - 1 && <View style={styles.stepConnector} />}
                </View>
                {/* Text */}
                <View style={styles.stepTextBox}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* CTA dismiss */}
          <Pressable
            style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
            onPress={handleClose}
          >
            <Text style={styles.ctaBtnText}>Entendido</Text>
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
    paddingHorizontal: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 20,
  },

  dragHandle: {
    width: 38,
    height: 5,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 24,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  taglineBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 24,
  },
  taglineText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#4B5563',
    lineHeight: 20,
  },
  taglineBold: {
    fontWeight: '700',
    color: '#1F2937',
  },

  stepsContainer: {
    marginBottom: 24,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 14,
  },
  stepLeft: {
    alignItems: 'center',
    width: 36,
  },
  stepIconBox: {
    width: 36,
    height: 36,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepConnector: {
    width: 1.5,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  stepTextBox: {
    flex: 1,
    paddingBottom: 20,
    gap: 3,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  stepDesc: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 18,
  },

  ctaBtn: {
    height: 50,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
