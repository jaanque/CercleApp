import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STORE_META: Record<string, {
  name: string; category: string; rating: string; reviews: string;
  distance: string; deliveryTime: string; address: string; city: string;
  phone: string; email: string; hours: { day: string; time: string }[];
  lat: number; lon: number; cerclePlus: boolean; tagline: string; logo: string;
}> = {
  '1': {
    name: 'Fashion Hub', category: 'Ropa & Accesorios', rating: '4.8', reviews: '1.241',
    distance: '0.2 km', deliveryTime: '10-15 min',
    address: 'Calle Gran Vía, 32', city: 'Madrid, 28013',
    phone: '+34 910 123 456', email: 'hola@fashionhub.es',
    hours: [{ day: 'Lun – Vie', time: '10:00 – 21:00' }, { day: 'Sábado', time: '10:00 – 22:00' }, { day: 'Domingo', time: '11:00 – 20:00' }],
    lat: 40.4168, lon: -3.7038, cerclePlus: true,
    tagline: 'Ropa y accesorios exclusivos seleccionados para ti', logo: 'https://logo.clearbit.com/zara.com',
  },
  '2': {
    name: 'Tech Outlet', category: 'Electrónica', rating: '4.6', reviews: '893',
    distance: '0.8 km', deliveryTime: '20-30 min',
    address: 'Av. Diagonal, 15', city: 'Barcelona, 08019',
    phone: '+34 932 456 789', email: 'info@techoutlet.es',
    hours: [{ day: 'Lun – Vie', time: '09:30 – 20:30' }, { day: 'Sábado', time: '10:00 – 21:00' }, { day: 'Domingo', time: 'Cerrado' }],
    lat: 41.3851, lon: 2.1734, cerclePlus: false,
    tagline: 'Lo último en tecnología y gadgets con garantía oficial', logo: 'https://logo.clearbit.com/apple.com',
  },
  '3': {
    name: 'Sport Center', category: 'Deportes', rating: '4.5', reviews: '541',
    distance: '1.5 km', deliveryTime: '25-35 min',
    address: 'Paseo de Gracia, 8', city: 'Barcelona, 08007',
    phone: '+34 933 654 321', email: 'hola@sportcenter.es',
    hours: [{ day: 'Lun – Vie', time: '09:00 – 21:00' }, { day: 'Sábado', time: '09:00 – 21:00' }, { day: 'Domingo', time: '10:00 – 19:00' }],
    lat: 41.3917, lon: 2.1649, cerclePlus: true,
    tagline: 'Equipamiento deportivo de alto rendimiento', logo: 'https://logo.clearbit.com/nike.com',
  },
  '4': {
    name: 'Home Style', category: 'Decoración', rating: '4.9', reviews: '2.108',
    distance: '2.1 km', deliveryTime: '30-40 min',
    address: 'Rambla Catalunya, 55', city: 'Barcelona, 08007',
    phone: '+34 934 789 012', email: 'contacto@homestyle.es',
    hours: [{ day: 'Lun – Vie', time: '10:00 – 20:00' }, { day: 'Sábado', time: '10:00 – 20:00' }, { day: 'Domingo', time: 'Cerrado' }],
    lat: 41.3886, lon: 2.1623, cerclePlus: false,
    tagline: 'Muebles y decoración de diseño para tu hogar', logo: 'https://logo.clearbit.com/ikea.com',
  },
};

const TODAY_IDX = (() => {
  const d = new Date().getDay();
  if (d >= 1 && d <= 5) return 0;
  if (d === 6) return 1;
  return 2;
})();

export default function StoreDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = STORE_META[id ?? '1'] ?? STORE_META['1'];

  // Map tile (OSM — no extra packages)
  const zoom = 15;
  const tileX = Math.floor((store.lon + 180) / 360 * Math.pow(2, zoom));
  const tileY = Math.floor((1 - Math.log(Math.tan(store.lat * Math.PI / 180) + 1 / Math.cos(store.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
  const mapUrl = `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`;

  const openMaps = () =>
    Linking.openURL(`https://maps.apple.com/?q=${encodeURIComponent(store.name)}&ll=${store.lat},${store.lon}`);

  return (
    <View style={s.container}>

      {/* ── Header ──────────────────────────────────────────── */}
      <View style={s.headerContainer}>
        <SafeAreaView edges={['top']} />
        <View style={s.topRow}>
          <Pressable
            style={({ pressed }) => [s.headerButton, pressed && { opacity: 0.7 }]}
            onPress={() => router.back()}
          >
            <SymbolView name="chevron.left" size={20} tintColor="#1A1A1A" />
          </Pressable>

          <View style={s.selectorContainer}>
            <View style={s.selectorPill}>
              <SymbolView name="info.circle" size={13} tintColor="#1F2937" />
              <Text style={s.selectorText} numberOfLines={1}>Detalles del local</Text>
            </View>
          </View>

          <View style={s.headerButton} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={s.content}>

          {/* ── Identity ──────────────────────────────────────── */}
          <View style={s.identityRow}>
            <View style={s.logoBox}>
              <Image source={{ uri: store.logo }} style={s.logoImg} contentFit="contain" />
            </View>
            <View style={s.identityMeta}>
              <View style={s.nameRow}>
                <Text style={s.storeName} numberOfLines={1}>{store.name}</Text>
                {store.cerclePlus && (
                  <View style={s.cPlusBadge}>
                    <Text style={s.cPlusText}>C+</Text>
                  </View>
                )}
              </View>
              <Text style={s.categoryLabel}>{store.category}</Text>
              <Text style={s.taglineText} numberOfLines={2}>{store.tagline}</Text>
            </View>
          </View>

          <View style={s.dashedDivider} />

          {/* ── Stats ─────────────────────────────────────────── */}
          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Text style={s.statValue}>{store.rating}</Text>
              <Text style={s.statLabel}>⭐ Valoración</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statValue}>{store.distance}</Text>
              <Text style={s.statLabel}>Distancia</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statValue}>{store.deliveryTime}</Text>
              <Text style={s.statLabel}>Listo en</Text>
            </View>
          </View>

          <View style={s.dashedDivider} />

          {/* ── Information ───────────────────────────────────── */}
          <Text style={s.sectionTitle}>Información</Text>
          <View style={s.card}>
            {/* Address */}
            <View style={s.row}>
              <View style={s.rowIconBox}>
                <SymbolView name="location" size={15} tintColor="#6B7280" />
              </View>
              <View style={s.rowTexts}>
                <Text style={s.rowLabel}>Dirección</Text>
                <Text style={s.rowValue}>{store.address}</Text>
                <Text style={s.rowSub}>{store.city}</Text>
              </View>
            </View>

            <View style={s.dashedDivider} />

            {/* Phone */}
            <Pressable
              style={({ pressed }) => [s.row, pressed && s.rowPressed]}
              onPress={() => Linking.openURL(`tel:${store.phone}`)}
            >
              <View style={s.rowIconBox}>
                <SymbolView name="phone" size={15} tintColor="#6B7280" />
              </View>
              <View style={s.rowTexts}>
                <Text style={s.rowLabel}>Teléfono</Text>
                <Text style={[s.rowValue, s.rowValueTappable]}>{store.phone}</Text>
              </View>
              <SymbolView name="chevron.right" size={13} tintColor="#D1D5DB" />
            </Pressable>

            <View style={s.dashedDivider} />

            {/* Email */}
            <Pressable
              style={({ pressed }) => [s.row, pressed && s.rowPressed]}
              onPress={() => Linking.openURL(`mailto:${store.email}`)}
            >
              <View style={s.rowIconBox}>
                <SymbolView name="envelope" size={15} tintColor="#6B7280" />
              </View>
              <View style={s.rowTexts}>
                <Text style={s.rowLabel}>Email</Text>
                <Text style={[s.rowValue, s.rowValueTappable]}>{store.email}</Text>
              </View>
              <SymbolView name="chevron.right" size={13} tintColor="#D1D5DB" />
            </Pressable>
          </View>

          {/* ── Schedule ──────────────────────────────────────── */}
          <Text style={s.sectionTitle}>Horario</Text>
          <View style={s.card}>
            {store.hours.map((h, i) => {
              const isToday = i === TODAY_IDX;
              const isClosed = h.time === 'Cerrado';
              return (
                <View key={i}>
                  <View style={[s.row, isToday && s.rowHighlight]}>
                    <View style={s.rowIconBox}>
                      <SymbolView name="clock" size={15} tintColor="#6B7280" />
                    </View>
                    <View style={s.rowTexts}>
                      <View style={s.hourLabelRow}>
                        <Text style={[s.rowValue, isToday && s.rowValueBold]}>{h.day}</Text>
                        {isToday && <View style={s.todayDot} />}
                      </View>
                    </View>
                    <Text style={[s.hourTime, isClosed && s.hourClosed]}>
                      {h.time}
                    </Text>
                  </View>
                  {i < store.hours.length - 1 && <View style={s.dashedDivider} />}
                </View>
              );
            })}
          </View>

          {/* ── Map ───────────────────────────────────────────── */}
          <Text style={s.sectionTitle}>Ubicación</Text>
          <Pressable style={s.mapBox} onPress={openMaps}>
            <Image source={{ uri: mapUrl }} style={s.mapImage} contentFit="cover" cachePolicy="memory-disk" />

            {/* Pin — square rounded, same language as the app */}
            <View style={s.pinWrapper}>
              <View style={s.pin}>
                <SymbolView name="storefront.fill" size={14} tintColor="#FFFFFF" />
              </View>
              <View style={s.pinTail} />
            </View>

            {/* Open in Maps pill */}
            <View style={s.mapPill}>
              <SymbolView name="location" size={12} tintColor="#6B7280" />
              <Text style={s.mapPillText}>Abrir en Mapas</Text>
            </View>
          </Pressable>
          <Text style={s.mapCaption}>{store.address}, {store.city}</Text>

        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  /* ── Header — identical to sellos.tsx / profile.tsx ── */
  headerContainer: { backgroundColor: '#FFFFFF', zIndex: 100 },
  topRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14,
  },
  selectorContainer: { flex: 1, alignItems: 'center' },
  selectorPill: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F3F4F6', paddingHorizontal: 12, height: 40,
    borderRadius: 12, gap: 6, borderWidth: 1, borderColor: '#E5E7EB',
  },
  selectorText: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
  headerButton: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E5E7EB',
  },

  content: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 },

  /* ── Identity ── */
  identityRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 16,
  },
  logoBox: {
    width: 56, height: 56,
    borderRadius: 12,                  // ← same as header buttons
    backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  logoImg: { width: 40, height: 40 },
  identityMeta: { flex: 1, gap: 3, paddingTop: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  storeName: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.3, flexShrink: 1 },
  cPlusBadge: {
    backgroundColor: '#1F2937', paddingHorizontal: 5, paddingVertical: 2,
    borderRadius: 6, flexShrink: 0,
  },
  cPlusText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  categoryLabel: { fontSize: 12, fontWeight: '700', color: '#10B981' },
  taglineText: { fontSize: 12.5, fontWeight: '500', color: '#6B7280', lineHeight: 17 },

  /* ── Dashed divider — same as rest of app ── */
  dashedDivider: {
    borderStyle: 'dashed', borderWidth: 0.5, borderColor: '#E5E7EB', marginVertical: 12,
  },

  /* ── Stats row — plain text, no boxes ── */
  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: { alignItems: 'center', gap: 3 },
  statValue: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  statLabel: { fontSize: 11.5, fontWeight: '500', color: '#9CA3AF' },
  statDivider: { width: 1, height: 32, backgroundColor: '#E5E7EB' },

  /* ── Section title ── */
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', marginBottom: 12 },

  /* ── Card — same pattern as menu cards in profile ── */
  card: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16,
    paddingHorizontal: 12, paddingVertical: 4, marginBottom: 24,
  },

  /* ── Row — reusable ── */
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12,
    borderRadius: 12,
  },
  rowPressed: { backgroundColor: '#F9FAFB' },
  rowHighlight: { backgroundColor: '#F9FAFB', marginHorizontal: -4, paddingHorizontal: 16 },
  rowIconBox: {
    width: 36, height: 36,
    borderRadius: 10,                   // ← square-ish, not circular
    backgroundColor: '#F3F4F6',
    borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  rowTexts: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 11, fontWeight: '600', color: '#9CA3AF', letterSpacing: 0.3 },
  rowValue: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  rowValueBold: { fontWeight: '700', color: '#1A1A1A' },
  rowValueTappable: { textDecorationLine: 'underline' },
  rowSub: { fontSize: 12, fontWeight: '500', color: '#9CA3AF' },

  /* ── Hours extras ── */
  hourLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  todayDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  hourTime: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  hourClosed: { color: '#EF4444' },

  /* ── Map ── */
  mapBox: {
    height: 200,
    borderRadius: 16,                   // ← card border radius
    overflow: 'hidden',
    borderWidth: 1, borderColor: '#E5E7EB',
    marginBottom: 8, position: 'relative',
  },
  mapImage: { width: '100%', height: '100%' },
  pinWrapper: {
    position: 'absolute', top: '50%', left: '50%',
    alignItems: 'center',
    transform: [{ translateX: -18 }, { translateY: -48 }],
  },
  pin: {
    width: 36, height: 36,
    borderRadius: 12,                   // ← square rounded pin
    backgroundColor: '#1A1A1A',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6,
  },
  pinTail: {
    width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 10,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#1A1A1A',
  },
  mapPill: {
    position: 'absolute', bottom: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  mapPillText: { fontSize: 12.5, fontWeight: '700', color: '#1A1A1A' },
  mapCaption: { fontSize: 12, fontWeight: '500', color: '#9CA3AF', textAlign: 'center' },
});
