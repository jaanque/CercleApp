import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BENEFITS = [
  {
    emoji: '🏷️',
    title: 'Tasa de gestión a 0 €',
    desc: 'Sin tarifas añadidas en tus reservas. Lo que ves es lo que pagas.',
  },
  {
    emoji: '⚡',
    title: 'Acceso anticipado 1 hora antes',
    desc: 'Reserva liquidaciones flash antes que nadie.',
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

export default function CerclePlusScreen() {
  const router = useRouter();

  const handleTrial = () => {
    Alert.alert(
      '¡Bienvenido a Cercle+! 🎉',
      'Tu prueba gratuita de 30 días ha comenzado. Ya disfrutas de todos los beneficios Plus.',
      [{ text: 'Empezar a ahorrar', onPress: () => router.replace('/') }]
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top']} />
        <View style={styles.topRow}>
          <Pressable
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.back()}
          >
            <SymbolView name="xmark" size={15} tintColor="#6B7280" />
          </Pressable>
        </View>
      </View>

      {/* ── Main content ───────────────────────────────────────── */}
      <View style={styles.content}>

        {/* Title block */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Prueba Cercle+</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceStrike}>9,99 € al mes</Text>
            <Text style={styles.priceFree}> · 30 días gratis</Text>
          </View>
        </View>

        {/* Horizontal benefit cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
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
          Ventajas disponibles en tiendas participantes de Cercle. Al unirte, autorizas un cargo de 9,99 € mensual una vez finalizado el periodo de prueba, hasta que canceles la suscripción. Cancela en cualquier momento desde la app.{' '}
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
            onPress={() => {}}
          >
            <Text style={styles.changeBtnText}>Cambiar</Text>
          </Pressable>
        </View>

        {/* CTA */}
        <Pressable
          style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] }]}
          onPress={handleTrial}
        >
          <Text style={styles.ctaBtnText}>Pruébalo gratis</Text>
        </Pressable>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  // ── Header ─────────────────────────────────────────────────────────
  headerContainer: { backgroundColor: '#FFFFFF', zIndex: 100 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
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

  // ── Content ────────────────────────────────────────────────────────
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Title block
  titleBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -0.6,
    marginBottom: 6,
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceStrike: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  priceFree: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },

  // Benefit cards
  cardsContainer: {
    paddingLeft: 0,
    paddingRight: 20,
    gap: 12,
    marginLeft: -20,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  benefitCard: {
    width: SCREEN_WIDTH * 0.48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 22,
    padding: 16,
    gap: 8,
    justifyContent: 'flex-start',
  },
  benefitEmoji: {
    fontSize: 28,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 19,
  },
  benefitDesc: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 17,
  },

  // Legal
  legalText: {
    fontSize: 11.5,
    fontWeight: '400',
    color: '#9CA3AF',
    lineHeight: 17,
    marginBottom: 24,
  },
  legalLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
    color: '#6B7280',
  },

  // Payment row
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingVertical: 4,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    height: 54,
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
