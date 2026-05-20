import { CerclePlusBottomSheet } from '@/components/cercle-plus-bottom-sheet';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TOTAL_STAMPS = 5;
const EARNED_STAMPS = 1;

function getInitials(email: string, fullName?: string): string {
  if (fullName && fullName.trim().length > 0) {
    const parts = fullName.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

// ─── Auth Form ───────────────────────────────────────────────────────────────
function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setError('');
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Por favor completa todos los campos.');
      return;
    }
    if (mode === 'signup' && trimmedPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPassword,
        });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: trimmedPassword,
          options: { data: { full_name: fullName.trim() } },
        });
        if (err) throw err;
        Alert.alert(
          '¡Cuenta creada! 🎉',
          'Revisa tu correo para confirmar tu cuenta.',
          [{ text: 'Entendido' }]
        );
      }
    } catch (err: any) {
      const msg: string = err?.message ?? '';
      if (msg.includes('Invalid login credentials')) setError('Email o contraseña incorrectos.');
      else if (msg.includes('User already registered')) setError('Email ya registrado. Inicia sesión.');
      else if (msg.includes('Email not confirmed')) setError('Confirma tu email antes de iniciar sesión.');
      else setError(msg || 'Ha ocurrido un error. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.authScroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand */}
        <View style={styles.authBrand}>
          <View style={styles.authLogo}>
            <Text style={styles.authLogoText}>C</Text>
          </View>
          <Text style={styles.authBrandName}>Cercle</Text>
          <Text style={styles.authBrandTagline}>Tu mercado de stock local</Text>
        </View>

        {/* Toggle */}
        <View style={styles.segmentedControl}>
          <Pressable
            style={[styles.segmentBtn, mode === 'login' && styles.segmentBtnActive]}
            onPress={() => { setMode('login'); setError(''); }}
          >
            <Text style={[styles.segmentText, mode === 'login' && styles.segmentTextActive]}>
              Iniciar sesión
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segmentBtn, mode === 'signup' && styles.segmentBtnActive]}
            onPress={() => { setMode('signup'); setError(''); }}
          >
            <Text style={[styles.segmentText, mode === 'signup' && styles.segmentTextActive]}>
              Crear cuenta
            </Text>
          </Pressable>
        </View>

        {/* Form */}
        <View style={styles.card}>
          {mode === 'signup' && (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nombre completo</Text>
              <View style={styles.inputWrapper}>
                <SymbolView name="person" size={16} tintColor="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Ana García"
                  placeholderTextColor="#9CA3AF"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <View style={styles.inputWrapper}>
              <SymbolView name="envelope" size={16} tintColor="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="tu@email.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <SymbolView name="lock" size={16} tintColor="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : '••••••••'}
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {error.length > 0 && (
            <View style={styles.errorBox}>
              <SymbolView name="exclamationmark.circle" size={14} tintColor="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.ctaBtn,
              pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
              loading && { opacity: 0.7 },
            ]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" size="small" />
              : <Text style={styles.ctaBtnText}>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</Text>
            }
          </Pressable>
        </View>

        {/* Trust */}
        <View style={styles.trustRow}>
          <SymbolView name="lock.shield" size={13} tintColor="#9CA3AF" />
          <Text style={styles.trustText}>Datos cifrados con SSL</Text>
          <View style={styles.trustDot} />
          <SymbolView name="leaf" size={13} tintColor="#9CA3AF" />
          <Text style={styles.trustText}>100% local</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Profile View ────────────────────────────────────────────────────────────
function ProfileView({ session, onOpenCerclePlus }: { session: Session; onOpenCerclePlus: () => void }) {
  const router = useRouter();
  const user = session.user;
  const fullName: string = user.user_metadata?.full_name ?? '';
  const initials = getInitials(user.email ?? '', fullName);
  const displayName = fullName.length > 0 ? fullName : user.email ?? 'Usuario';

  const handleMenu = (label: string) =>
    Alert.alert('Próximamente', `"${label}" estará disponible en la siguiente versión.`);

  const handleSignOut = () =>
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: async () => { await supabase.auth.signOut(); } },
    ]);

  const MENU_ITEMS = [
    { icon: 'bag.fill', label: 'Mis Compras & Rescates' },
    { icon: 'heart.fill', label: 'Locales Guardados' },
    { icon: 'questionmark.circle.fill', label: 'Soporte & Ayuda' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.contentCard}>

        {/* Avatar + name */}
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
        </View>

        {/* Stamp card widget */}
        <Pressable
          style={({ pressed }) => [styles.stampWidget, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
          onPress={() => router.push('/sellos')}
        >
          <View style={styles.stampWidgetLeft}>
            <Text style={styles.stampWidgetTitle}>Tarjeta de sellos</Text>
            <Text style={styles.stampWidgetSub}>Completa 5 sellos y gana tu premio</Text>
          </View>
          <View style={styles.stampSlots}>
            {Array.from({ length: TOTAL_STAMPS }).map((_, i) => (
              <View key={i} style={[styles.stampDot, i < EARNED_STAMPS && styles.stampDotFilled]}>
                {i < EARNED_STAMPS && <SymbolView name="checkmark" size={8} tintColor="#92650A" />}
              </View>
            ))}
          </View>
          <Text style={styles.stampFraction}>{EARNED_STAMPS}/{TOTAL_STAMPS}</Text>
        </Pressable>

        {/* Cercle+ banner */}
        <Pressable
          style={({ pressed }) => [
            styles.premiumBanner,
            pressed && { opacity: 0.92, transform: [{ scale: 0.98 }] },
          ]}
          onPress={onOpenCerclePlus}
        >
          <View style={styles.premiumLeft}>
            <Text style={styles.premiumBrandText}>Cercle</Text>
            <View style={styles.premiumPlusBadge}>
              <Text style={styles.premiumPlusText}>+</Text>
            </View>
            <Text style={styles.premiumSubText}>· Unirte te ahorra dinero</Text>
          </View>
          <View style={styles.premiumCTA}>
            <Text style={styles.premiumCTAText}>Probar gratis</Text>
          </View>
        </Pressable>

        {/* Menu */}
        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleText}>Mi cuenta</Text>
        </View>
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <View key={item.label}>
              <Pressable
                style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: '#F9FAFB' }]}
                onPress={() => handleMenu(item.label)}
              >
                <View style={styles.menuIconBox}>
                  <SymbolView name={item.icon as any} size={17} tintColor="#374151" />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <SymbolView name="chevron.right" size={13} tintColor="#9CA3AF" />
              </Pressable>
              {i < MENU_ITEMS.length - 1 && <View style={styles.dashedDivider} />}
            </View>
          ))}
        </View>

        {/* Account info */}
        <View style={styles.infoRow}>
          <SymbolView name="info.circle" size={14} tintColor="#9CA3AF" />
          <Text style={styles.infoText}>
            Cuenta creada el{' '}
            <Text style={{ fontWeight: '700', color: '#1F2937' }}>
              {new Date(user.created_at).toLocaleDateString('es-ES', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </Text>
          </Text>
        </View>

        {/* Sign out */}
        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
          onPress={handleSignOut}
        >
          <SymbolView name="rectangle.portrait.and.arrow.right" size={15} tintColor="#EF4444" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>

      </View>
    </ScrollView>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCerclePlusOpen, setIsCerclePlusOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top']} />
        <View style={styles.topRow}>
          <Pressable
            style={({ pressed }) => [styles.headerButton, pressed && { opacity: 0.7 }]}
            onPress={() => router.back()}
          >
            <SymbolView name="chevron.left" size={20} tintColor="#1A1A1A" />
          </Pressable>

          <View style={styles.selectorContainer}>
            <View style={styles.deliverySelector}>
              <SymbolView name="person.fill" size={13} tintColor="#1F2937" />
              <Text style={styles.deliveryText} numberOfLines={1}>Mi Perfil</Text>
            </View>
          </View>

          {session ? (
            <Pressable
              style={({ pressed }) => [styles.headerButton, pressed && { opacity: 0.7 }]}
              onPress={() => router.push('/settings')}
            >
              <SymbolView name="gearshape.fill" size={18} tintColor="#1A1A1A" />
            </Pressable>
          ) : (
            <View style={styles.headerButtonPlaceholder} />
          )}
        </View>
      </View>

      {/* Body */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : session ? (
        <ProfileView session={session} onOpenCerclePlus={() => setIsCerclePlusOpen(true)} />
      ) : (
        <AuthForm />
      )}

      <CerclePlusBottomSheet
        visible={isCerclePlusOpen}
        onClose={() => setIsCerclePlusOpen(false)}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  // Header
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
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Auth
  authScroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 60 },
  authBrand: { alignItems: 'center', marginBottom: 32 },
  authLogo: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: '#10B981',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  authLogoText: { fontSize: 32, fontWeight: '900', color: '#FFFFFF' },
  authBrandName: { fontSize: 26, fontWeight: '800', color: '#111827' },
  authBrandTagline: { fontSize: 13.5, color: '#6B7280', marginTop: 4, fontWeight: '500' },

  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center' },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  segmentText: { fontSize: 13.5, fontWeight: '600', color: '#6B7280' },
  segmentTextActive: { color: '#111827', fontWeight: '700' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 16,
    gap: 14,
  },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 12.5, fontWeight: '700', color: '#374151', marginLeft: 2 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  input: { flex: 1, fontSize: 14.5, fontWeight: '500', color: '#111827' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: { flex: 1, fontSize: 12.5, fontWeight: '600', color: '#EF4444' },
  ctaBtn: {
    height: 52, borderRadius: 13, backgroundColor: '#1A1A1A',
    alignItems: 'center', justifyContent: 'center',
  },
  ctaBtnText: { fontSize: 15.5, fontWeight: '800', color: '#FFFFFF' },
  trustRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  trustText: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  trustDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#D1D5DB' },

  // Profile view
  contentCard: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 8 },

  userSection: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#1A1A1A',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarInitials: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  userName: { fontSize: 20, fontWeight: '800', color: '#111827', maxWidth: SCREEN_WIDTH - 80 },
  userEmail: { fontSize: 13, color: '#6B7280', marginTop: 3, maxWidth: SCREEN_WIDTH - 80 },

  // Stamp widget
  stampWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9EC',
    borderWidth: 1,
    borderColor: '#F9C74F',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    gap: 12,
  },
  stampWidgetLeft: { flex: 1 },
  stampWidgetTitle: { fontSize: 13.5, fontWeight: '700', color: '#92650A' },
  stampWidgetSub: { fontSize: 11.5, fontWeight: '500', color: '#B07A10', marginTop: 2 },
  stampSlots: { flexDirection: 'row', gap: 5 },
  stampDot: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#FFF8DC',
    borderWidth: 1.5, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  stampDotFilled: { backgroundColor: '#FEF9EC', borderColor: '#F9C74F' },
  stampFraction: { fontSize: 14, fontWeight: '800', color: '#92650A', marginLeft: 4 },

  // Cercle+ banner
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 24,
    gap: 8,
  },
  premiumLeft: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1, overflow: 'hidden' },
  premiumBrandText: { fontSize: 15, fontWeight: '900', color: '#1F2937', letterSpacing: -0.3 },
  premiumPlusBadge: { backgroundColor: '#FFD700', paddingHorizontal: 4, borderRadius: 6 },
  premiumPlusText: { fontSize: 12, fontWeight: '900', color: '#000' },
  premiumSubText: { fontSize: 12.5, fontWeight: '500', color: '#6B7280', flexShrink: 1 },
  premiumCTA: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumCTAText: { fontSize: 12.5, fontWeight: '700', color: '#1F2937' },

  // Section title
  sectionTitle: { marginBottom: 12 },
  sectionTitleText: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },

  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
  },

  // Menu
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuIconBox: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: { fontSize: 14.5, fontWeight: '500', color: '#1F2937', flex: 1 },
  dashedDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },

  // Info row
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 14, paddingVertical: 11, marginBottom: 16,
  },
  infoText: { fontSize: 12.5, color: '#6B7280', fontWeight: '500', flex: 1 },

  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 12, borderWidth: 1, borderColor: '#FECACA',
    paddingVertical: 14,
    marginBottom: 8,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
});
