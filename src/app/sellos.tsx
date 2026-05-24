import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const REWARD = { icon: 'percent', label: 'Descuento especial', desc: 'Consigue tu tarjeta de 5 sellos completa y obtén un descuento automático en tu próxima reserva.' };

export default function SellosScreen() {
  const router = useRouter();

  const [earnedStamps, setEarnedStamps] = React.useState<number | null>(null);
  const [totalStamps, setTotalStamps] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [userId, setUserId] = React.useState<string | null>(null);

  useEffect(() => {
    async function loadUserStamps() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          console.log('User is not logged in or auth error:', authError);
          setEarnedStamps(1); // Offline welcome fallback
          setTotalStamps(5);
          setLoading(false);
          return;
        }

        setUserId(user.id);

        // Fetch user's stamp card
        const { data, error } = await supabase
          .from('user_stamps')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          // If row doesn't exist, create one
          if (error.code === 'PGRST116') {
            const { data: insertData, error: insertError } = await supabase
              .from('user_stamps')
              .insert([{ user_id: user.id, earned_stamps: 1, total_stamps: 5 }])
              .select()
              .single();

            if (!insertError && insertData) {
              setEarnedStamps(insertData.earned_stamps);
              setTotalStamps(insertData.total_stamps);
            }
          } else {
            console.warn('Stamps table not initialized yet:', error.message);
            setEarnedStamps(1); // Welcome fallback until table is created
            setTotalStamps(5);
          }
        } else if (data) {
          setEarnedStamps(data.earned_stamps);
          setTotalStamps(data.total_stamps);
        }
      } catch (err: any) {
        console.warn('Exception loading stamps:', err?.message || err);
        setEarnedStamps(1);
        setTotalStamps(5);
      } finally {
        setLoading(false);
      }
    }

    loadUserStamps();
  }, []);

  const [isClaimModalVisible, setIsClaimModalVisible] = React.useState(false);
  const [claimStore, setClaimStore] = React.useState('');
  const [claimDetails, setClaimDetails] = React.useState('');
  const [isClaimSubmitting, setIsClaimSubmitting] = React.useState(false);
  const [isClaimSuccess, setIsClaimSuccess] = React.useState(false);

  // Senior UX Toast States
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const toastY = React.useRef(new Animated.Value(150)).current;
  const toastTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);

    Animated.spring(toastY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();

    toastTimeoutRef.current = setTimeout(() => {
      Animated.timing(toastY, {
        toValue: 150,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setToastMessage(null);
      });
    }, 3000);
  };

  React.useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const slideAnim = React.useRef(new Animated.Value(800)).current;
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;
  const successScale = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isClaimModalVisible) {
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
    }
  }, [isClaimModalVisible]);

  React.useEffect(() => {
    if (isClaimSuccess) {
      successScale.setValue(0);
      Animated.spring(successScale, {
        toValue: 1,
        tension: 100,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }
  }, [isClaimSuccess]);

  const handleCloseClaimModal = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 800,
        duration: 220,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsClaimModalVisible(false);
      setClaimStore('');
      setClaimDetails('');
      setIsClaimSuccess(false);
      setIsClaimSubmitting(false);
    });
  };

  const handleSendClaim = () => {
    if (!claimStore.trim() || !claimDetails.trim()) {
      Alert.alert('Campos obligatorios', 'Por favor, rellena todos los campos para poder procesar tu solicitud.');
      return;
    }
    setIsClaimSubmitting(true);
    setTimeout(() => {
      setIsClaimSubmitting(false);
      setIsClaimSuccess(true);
    }, 1800);
  };

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

          {/* Symmetrical Help Button for clean Senior UX */}
          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => {
              setIsClaimModalVisible(true);
            }}
          >
            <SymbolView name="questionmark.circle" size={18} tintColor="#4B5563" />
          </Pressable>
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
            {earnedStamps === null || totalStamps === null ? (
              <View style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#111827" />
                <Text style={{ marginTop: 12, fontSize: 13, fontWeight: '600', color: '#6B7280' }}>
                  Cargando tu tarjeta de sellos...
                </Text>
              </View>
            ) : (
              <>
                {/* Card header */}
                <View style={styles.cardHeader}>
                  <Text style={styles.cardLabel}>Tarjeta de sellos</Text>
                  <View style={styles.cardProgressPill}>
                    <Text style={styles.cardProgressText}>
                      {earnedStamps}/{totalStamps}
                    </Text>
                  </View>
                </View>

                {/* Stamp slots */}
                <View style={styles.stampsGrid}>
                  {Array.from({ length: totalStamps }).map((_, i) => {
                    const filled = i < earnedStamps;
                    return (
                      <Pressable
                        key={i}
                        style={({ pressed }) => [
                          styles.stampSlot,
                          filled && styles.stampSlotFilled,
                          { transform: [{ scale: pressed ? 0.95 : 1 }] }
                        ]}
                        onPress={() => {
                          if (filled) {
                            showToast(`✓ Sello ${i + 1} conseguido el 22/05 en Zara (Fashion Hub)`);
                          } else {
                            showToast(`Sello ${i + 1}: ¡Reserva tu próximo artículo para sumarlo!`);
                          }
                        }}
                      >
                        {filled ? (
                          <>
                            <SymbolView
                              name="checkmark.seal.fill"
                              size={32}
                              tintColor="#111827"
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
                      </Pressable>
                    );
                  })}
                </View>

                {/* Progress bar */}
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${(earnedStamps / totalStamps) * 100}%` },
                    ]}
                  />
                </View>

                {earnedStamps >= totalStamps ? (
                  <Pressable
                    style={({ pressed }) => [
                      styles.claimRewardBtn,
                      pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
                    ]}
                    onPress={() => { }}
                  >
                    <SymbolView name="crown.fill" size={16} tintColor="#111827" />
                    <Text style={styles.claimRewardBtnText}>Reclamar Recompensa</Text>
                  </Pressable>
                ) : (
                  <Text style={styles.cardFooter}>
                    Te faltan {totalStamps - earnedStamps} sellos para tu próxima recompensa
                  </Text>
                )}
              </>
            )}
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
                <SymbolView name="lock.fill" size={10} tintColor="#111827" />
                <Text style={styles.rewardLockedText}>
                  Progreso {earnedStamps !== null && totalStamps !== null ? Math.round((earnedStamps / totalStamps) * 100) : 0}%
                </Text>
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

          {/* Sleek, Discrete Support Footer (Apple/Airbnb-style UX) */}
          <View style={styles.discreteHelpContainer}>
            <View style={styles.discreteHelpDivider} />
            <Text style={styles.discreteHelpText}>
              ¿Tienes dudas o problemas con tus sellos?
            </Text>
            <View style={styles.discreteHelpLinksRow}>
              <Pressable
                style={({ pressed }) => [styles.discreteHelpLink, pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }]}
                onPress={() => router.push('/ai-chat')}
              >
                <SymbolView name="sparkles" size={11} tintColor="#A855F7" />
                <Text style={[styles.discreteHelpLinkLabel, { color: '#8B5CF6' }]}>Preguntar a AI</Text>
              </Pressable>
              <View style={styles.discreteHelpLinkSeparator} />
              <Pressable
                style={({ pressed }) => [styles.discreteHelpLink, pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }]}
                onPress={() => {
                  setIsClaimModalVisible(true);
                }}
              >
                <SymbolView name="exclamationmark.triangle.fill" size={11} tintColor="#111827" />
                <Text style={[styles.discreteHelpLinkLabel, { color: '#111827' }]}>Reclamar Sello</Text>
              </Pressable>
            </View>
            <Text style={styles.supportDirectInfoText}>
              O escríbenos a soporte@cercleapp.com · +34 900 123 456
            </Text>
          </View>

        </View>
      </ScrollView>

      {/* Interactive Stamp Claim Modal */}
      <Modal
        visible={isClaimModalVisible}
        transparent
        animationType="none"
        onRequestClose={handleCloseClaimModal}
      >
        <View style={styles.modalContainer}>
          {/* Animated Backdrop */}
          <Animated.View style={[styles.modalBackdrop, { opacity: backdropOpacity }]}>
            <Pressable style={styles.modalDismissArea} onPress={handleCloseClaimModal} />
          </Animated.View>

          {/* Animated Sheet */}
          <Animated.View style={[styles.modalSheet, { transform: [{ translateY: slideAnim }] }]}>
            {/* Top Drag Handle */}
            <View style={styles.modalDragHandle} />

            {/* Header */}
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeaderTitle}>Reclamar Sello no Recibido</Text>
              <Pressable
                style={({ pressed }) => [styles.modalCloseBtn, pressed && { opacity: 0.7 }]}
                onPress={handleCloseClaimModal}
              >
                <SymbolView name="xmark" size={13} tintColor="#6B7280" />
              </Pressable>
            </View>

            {!isClaimSuccess ? (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalFormContent}>
                <Text style={styles.modalInstructions}>
                  Si realizaste una recogida física pero tu sello no se cargó automáticamente, envíanos los detalles y te ayudaremos a solucionarlo.
                </Text>

                {/* Input 1: Store Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    ¿En qué tienda realizaste la compra? *
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={claimStore}
                    onChangeText={setClaimStore}
                    placeholder="Ej: Fashion Hub, Tech Outlet..."
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {/* Input 2: Details */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Detalles del pedido (Fecha y hora aproximada) *
                  </Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={claimDetails}
                    onChangeText={setClaimDetails}
                    placeholder="Ej: Ayer por la tarde compré un vestido floral en Boho Chic. Tengo el ticket físico pero no se sumó mi sello..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                {/* Info Tip banner */}
                <View style={styles.modalInfoBanner}>
                  <SymbolView name="info.circle.fill" size={13} tintColor="#111827" style={{ marginTop: 1 }} />
                  <Text style={styles.modalInfoBannerText}>
                    Nuestro equipo verificará tu compra con la base de datos de la tienda física. Recibirás tu sello en un plazo máximo de 24 horas laborables.
                  </Text>
                </View>

                {/* Send Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.modalSendBtn,
                    pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                  ]}
                  onPress={handleSendClaim}
                  disabled={isClaimSubmitting}
                >
                  {isClaimSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSendBtnText}>Enviar Reclamación</Text>
                  )}
                </Pressable>
              </ScrollView>
            ) : (
              <View style={styles.successContainer}>
                <Animated.View style={[styles.successIconBox, { transform: [{ scale: successScale }] }]}>
                  <SymbolView name="checkmark.seal.fill" size={54} tintColor="#10B981" />
                </Animated.View>

                <Text style={styles.successTitle}>¡Reclamación Recibida!</Text>
                <Text style={styles.successMessage}>
                  Hemos registrado tu reclamación con el identificador <Text style={styles.successRef}>#CRL-CLM-{Math.floor(10000 + Math.random() * 90000)}</Text>.
                </Text>
                <Text style={styles.successSubmessage}>
                  Nuestro equipo de soporte está validando los datos con la tienda. Te enviaremos una notificación cuando el sello sea acreditado a tu cuenta.
                </Text>

                <Pressable
                  style={({ pressed }) => [
                    styles.successCloseBtn,
                    pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
                  ]}
                  onPress={handleCloseClaimModal}
                >
                  <Text style={styles.successCloseBtnText}>Entendido</Text>
                </Pressable>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* Floating Premium Toast Notification - Senior UX detail */}
      {toastMessage !== null && (
        <Animated.View
          style={[
            styles.toastContainer,
            { transform: [{ translateY: toastY }] }
          ]}
        >
          <View style={styles.toastContent}>
            <SymbolView
              name="info.circle.fill"
              size={14}
              tintColor="#38BDF8"
            />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </Animated.View>
      )}
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
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  deliverySelectorEmoji: { fontSize: 14 },
  deliveryText: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
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
    borderColor: '#FEF3C7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  cardProgressText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
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
    borderColor: '#FEF3C7',
    borderStyle: 'solid',
  },
  stampNumber: {
    fontSize: 9,
    fontWeight: '700',
    color: '#111827',
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
    backgroundColor: '#FEF3C7',
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
    borderColor: '#FEF3C7',
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

  // ── Help & Support Section ──────────────────────────────────────────
  helpSection: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    padding: 18,
    marginTop: 20,
    marginBottom: 20,
    gap: 8,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  helpSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  helpCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  helpCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 14,
    justifyContent: 'space-between',
    minHeight: 140,
  },
  helpCardPurple: {
    borderColor: '#E9D5FF',
    backgroundColor: '#FAF5FF',
  },
  helpCardOrange: {
    borderColor: '#FEF3C7',
    backgroundColor: '#FEFBF0',
  },
  helpCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  helpIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2937',
    flex: 1,
  },
  helpCardDesc: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 10,
  },
  helpCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  helpCardLinkText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  supportContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 6,
    gap: 16,
  },
  supportContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  supportContactText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  supportContactDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#D1D5DB',
  },

  // ── Modal Styles ───────────────────────────────────────────────────
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '85%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 20,
  },
  modalDragHandle: {
    width: 38,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 16,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalFormContent: {
    gap: 16,
    paddingBottom: 20,
  },
  modalInstructions: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 18,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#374151',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 13.5,
    color: '#1F2937',
    fontWeight: '500',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  modalInfoBanner: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  modalInfoBannerText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '500',
    color: '#1E40AF',
    lineHeight: 16,
  },
  modalSendBtn: {
    backgroundColor: '#111827',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  modalSendBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // ── Modal Success Screen Styles ──────────────────────────────────
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  successIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 18.5,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 19,
  },
  successRef: {
    fontWeight: '800',
    color: '#10B981',
  },
  successSubmessage: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 17.5,
    marginBottom: 16,
  },
  successCloseBtn: {
    backgroundColor: '#111827',
    height: 50,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCloseBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // ── Sleek, Discrete Support Footer UX ──────────────────────────────
  discreteHelpContainer: {
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center',
    gap: 12,
  },
  discreteHelpDivider: {
    width: 60,
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 8,
  },
  discreteHelpText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
  },
  discreteHelpLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  discreteHelpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  discreteHelpLinkLabel: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  discreteHelpLinkSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  supportDirectInfoText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },

  claimRewardBtn: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FEF3C7',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  claimRewardBtnText: {
    color: '#111827',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  // ── Floating Custom Toast styling ──────────────────────────────────
  toastContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: '5%',
    right: '5%',
    backgroundColor: 'rgba(31, 41, 55, 0.96)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 9999,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toastText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 17,
  },
});
