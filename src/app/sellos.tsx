import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TOTAL_STAMPS = 5;
const EARNED_STAMPS = 1;

const REWARD = { icon: 'crown.fill', label: 'Recompensa especial', desc: 'Completa los 5 sellos y elige tu premio: descuento exclusivo, reserva sin tasa o acceso VIP.' };

export default function SellosScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top']} />
        <View style={styles.topRow}>
          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => router.back()}
          >
            <SymbolView name="chevron.left" size={20} tintColor="#1A1A1A" />
          </Pressable>

          <View style={styles.selectorContainer}>
            <View style={styles.deliverySelector}>
              <Text style={styles.deliveryText} numberOfLines={1}>
                Mis Sellos
              </Text>
            </View>
          </View>

          {/* Placeholder to balance flex */}
          <View style={styles.headerButtonPlaceholder} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <View style={styles.contentCard}>

          {/* Hero caption */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Tu tarjeta de fidelización</Text>
            <Text style={styles.heroSubtitle}>
              Recoge un sello por cada reserva completada. Al llegar a 5 desbloqueas una recompensa especial.
            </Text>
          </View>

          {/* Loyalty Card */}
          <View style={styles.loyaltyCard}>
            {/* Card header */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>Tarjeta de sellos</Text>
              <View style={styles.cardProgressPill}>
                <Text style={styles.cardProgressText}>
                  {EARNED_STAMPS}/{TOTAL_STAMPS}
                </Text>
              </View>
            </View>

            {/* Stamp slots */}
            <View style={styles.stampsGrid}>
              {Array.from({ length: TOTAL_STAMPS }).map((_, i) => {
                const filled = i < EARNED_STAMPS;
                return (
                  <View
                    key={i}
                    style={[
                      styles.stampSlot,
                      filled && styles.stampSlotFilled,
                    ]}
                  >
                    {filled ? (
                      <>
                        <SymbolView
                          name="checkmark.seal.fill"
                          size={32}
                          tintColor="#F59E0B"
                        />
                        <Text style={styles.stampNumber}>{i + 1}</Text>
                      </>
                    ) : (
                      <>
                        <SymbolView
                          name="seal"
                          size={26}
                          tintColor="#D1D5DB"
                        />
                        <Text style={styles.stampNumberEmpty}>{i + 1}</Text>
                      </>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Progress bar */}
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${(EARNED_STAMPS / TOTAL_STAMPS) * 100}%` },
                ]}
              />
            </View>

            <Text style={styles.cardFooter}>
              Te faltan {TOTAL_STAMPS - EARNED_STAMPS} sellos para tu próxima recompensa
            </Text>
          </View>

          {/* Rewards section */}
          <View style={styles.rewardsSection}>
            <Text style={styles.rewardsSectionTitle}>Tu recompensa</Text>

            <View style={styles.rewardRow}>
              <View style={styles.rewardIconBox}>
                <SymbolView
                  name={REWARD.icon as any}
                  size={16}
                  tintColor="#9CA3AF"
                />
              </View>
              <View style={styles.rewardTextGroup}>
                <Text style={styles.rewardLabel}>{REWARD.label}</Text>
                <Text style={styles.rewardThreshold}>{REWARD.desc}</Text>
              </View>
              <View style={styles.rewardLockedBadge}>
                <SymbolView name="lock.fill" size={10} tintColor="#9CA3AF" />
                <Text style={styles.rewardLockedText}>5 sellos</Text>
              </View>
            </View>
          </View>

          {/* How it works */}
          <View style={styles.howSection}>
            <Text style={styles.howTitle}>¿Cómo funciona?</Text>
            <View style={styles.howRow}>
              <View style={styles.howStep}><Text style={styles.howStepNum}>1</Text></View>
              <Text style={styles.howText}>Reserva un artículo en cualquier tienda de Cercle.</Text>
            </View>
            <View style={styles.howRow}>
              <View style={styles.howStep}><Text style={styles.howStepNum}>2</Text></View>
              <Text style={styles.howText}>Recoge el pedido en tienda — consigues un sello automáticamente.</Text>
            </View>
            <View style={styles.howRow}>
              <View style={styles.howStep}><Text style={styles.howStepNum}>3</Text></View>
              <Text style={styles.howText}>Al completar 5 sellos, elige tu recompensa y canjéala.</Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  // ── Header (matches app design system) ──────────────────────────────
  headerContainer: { backgroundColor: '#FFFFFF', zIndex: 100 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    zIndex: 100,
  },
  selectorContainer: { flex: 1, alignItems: 'center', zIndex: 100 },
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
  deliverySelectorEmoji: { fontSize: 14 },
  deliveryText: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerButtonPlaceholder: { width: 40, height: 40 },

  // ── Content ──────────────────────────────────────────────────────────
  contentCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  heroSection: { marginBottom: 24 },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 19,
  },

  // ── Loyalty Card ─────────────────────────────────────────────────────
  loyaltyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  cardProgressPill: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  cardProgressText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: -0.3,
  },

  stampsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 22,
    gap: 8,
  },
  stampSlot: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  stampSlotFilled: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderStyle: 'solid',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  stampNumber: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D97706',
    letterSpacing: 0.2,
  },
  stampNumberEmpty: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
  },

  progressBarTrack: {
    marginHorizontal: 20,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 10,
  },
  cardFooter: {
    textAlign: 'center',
    fontSize: 12.5,
    fontWeight: '500',
    color: '#6B7280',
    paddingBottom: 18,
    paddingHorizontal: 20,
  },

  // ── Rewards ───────────────────────────────────────────────────────────
  rewardsSection: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  rewardsSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 14,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 2,
  },
  rewardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  rewardTextGroup: { flex: 1, gap: 2 },
  rewardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  rewardThreshold: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
    lineHeight: 17,
  },
  rewardLockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rewardLockedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  dashedDivider: {
    borderStyle: 'dashed',
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    marginVertical: 10,
  },

  // ── How it works ──────────────────────────────────────────────────────
  howSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    gap: 12,
    marginBottom: 8,
  },
  howTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  howRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  howStep: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  howStepNum: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  howText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
    lineHeight: 18,
  },
});
