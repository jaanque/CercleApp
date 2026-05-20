import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import {
  Dimensions,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cartStore } from '../utils/cartStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OrderSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const storeName = (params.storeName as string) || 'Carrefour Express';
  const totalPrice = parseFloat((params.totalPrice as string) || '0.00');
  
  let itemsList: Array<{ id: string; name: string; price: string; qty: number }> = [];
  if (params.itemsData) {
    try {
      itemsList = JSON.parse(params.itemsData as string);
    } catch (e) {
      console.error('Failed to parse itemsData', e);
    }
  }

  const [minPickupTime, setMinPickupTime] = React.useState('00:00');

  React.useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    setMinPickupTime(`${hours}:${minutes}`);
  }, []);

  const handleOpenMap = () => {
    const address = 'Calle de Alcalá, 142, 28009 Madrid';
    const url = Platform.select({
      ios: `maps://?q=${encodeURIComponent(address)}`,
      android: `geo:0,0?q=${encodeURIComponent(address)}`
    });
    if (url) {
      Linking.openURL(url).catch(err => console.error('Error opening maps', err));
    }
  };

  const handleFinish = () => {
    cartStore.clear();
    router.replace('/(tabs)');
  };

  const orderId = 'CRL-' + Math.floor(100000 + Math.random() * 900000);

  // Real static map image URL of Calle de Alcalá 142, Madrid (using a reliable map provider)
  const staticMapUrl = 'https://static-maps.yandex.ru/1.x/?lang=es_ES&ll=-3.67634,40.42484&z=16&l=map&size=600,280&pt=-3.67634,40.42484,pm2rdm';

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFFFFF' }} />
      
      {/* Top Header Row matching the Home Screen design */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Pedido Confirmado</Text>
          <Text style={styles.headerSubtitle}>Código: {orderId}</Text>
        </View>
        <View style={styles.headerBadge}>
          <SymbolView name="checkmark.seal.fill" size={20} tintColor="#10B981" />
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Success Banner Card */}
        <View style={styles.successBanner}>
          <Text style={styles.bannerHeading}>¡Gracias por tu compra!</Text>
          <Text style={styles.bannerText}>
            Tu pedido en {storeName} ha sido procesado de forma segura. Ya estamos preparando tus artículos.
          </Text>
        </View>

        {/* Card 1: QR Code Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeaderTitle}>Pase de Recogida QR</Text>
          <View style={styles.qrContainer}>
            <SymbolView name="qrcode" size={150} tintColor="#111827" />
          </View>
          <Text style={styles.qrDescription}>
            Presenta este código QR al personal de la tienda para retirar tu pedido sin hacer colas en caja.
          </Text>
        </View>

        {/* Card 2: Interactive Real Map Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeaderTitle}>Ubicación de la tienda</Text>
          
          <View style={styles.locationDetailRow}>
            <View style={styles.iconBox}>
              <SymbolView name="mappin.circle.fill" size={16} tintColor="#111827" />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationTitle}>Calle de Alcalá, 142</Text>
              <Text style={styles.locationSubtitle}>28009 Madrid (Junto al Metro Goya)</Text>
            </View>
          </View>

          {/* Real Map Image Frame */}
          <Pressable style={styles.mapFrame} onPress={handleOpenMap}>
            <Image 
              source={{ uri: staticMapUrl }} 
              style={styles.mapImage} 
              contentFit="cover" 
            />
            {/* Overlay Gradient for high-end look */}
            <View style={styles.mapOverlay} />
            
            {/* Absolute Map Pin (Double confirmed design) */}
            <View style={styles.mapPinContainer}>
              <SymbolView name="mappin.circle.fill" size={26} tintColor="#EF4444" />
            </View>

            {/* Float map button */}
            <View style={styles.mapFloatingBtn}>
              <SymbolView name="map.fill" size={11} tintColor="#FFFFFF" />
              <Text style={styles.mapFloatingBtnText}>Abrir en Mapas</Text>
            </View>
          </Pressable>
        </View>

        {/* Card 3: Important Pick-up details */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeaderTitle}>Detalles de recogida</Text>

          <View style={styles.detailItem}>
            <View style={styles.iconBox}>
              <SymbolView name="clock.fill" size={15} tintColor="#111827" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Hora de recogida estimada</Text>
              <Text style={styles.detailValue}>Disponible hoy desde las {minPickupTime}</Text>
              <Text style={styles.detailSubvalue}>Horario de recogida de la tienda: 09:00 a 21:30</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailItem}>
            <View style={styles.iconBox}>
              <SymbolView name="phone.fill" size={14} tintColor="#111827" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Contacto de la tienda</Text>
              <Text style={styles.detailValue}>+34 912 345 678</Text>
              <Text style={styles.detailSubvalue}>Atención al cliente telefónica inmediata</Text>
            </View>
          </View>
        </View>

        {/* Card 4: Order Breakdown Summary */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeaderTitle}>Resumen del pedido</Text>

          <View style={styles.itemsListContainer}>
            {itemsList.map(item => (
              <View key={item.id} style={styles.productRow}>
                <Text style={styles.productQty}>{item.qty}x</Text>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.productPrice}>{item.price}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.totalPaymentRow}>
            <Text style={styles.totalLabel}>Total Pagado</Text>
            <Text style={styles.totalValueText}>{totalPrice.toFixed(2).replace('.', ',')} €</Text>
          </View>
        </View>

        {/* Card 5: Instruction Banner matching Home Screen announcements */}
        <View style={styles.instructionBanner}>
          <SymbolView name="info.circle.fill" size={16} tintColor="#1E3A8A" style={{ marginTop: 1 }} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.instructionTitle}>¿Cómo recojo mi pedido?</Text>
            <Text style={styles.instructionText}>
              No esperes colas. Dirígete directamente al mostrador de "Click & Collect" o Atención al Cliente, muestra tu pase QR y te entregarán tus bolsas en segundos.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions matching the home page UI */}
      <View style={styles.bottomBar}>
        <Pressable
          style={({ pressed }) => [
            styles.doneBtn,
            pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] }
          ]}
          onPress={handleFinish}
        >
          <Text style={styles.doneBtnText}>Volver a Inicio</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  headerLeft: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.6,
  },
  headerSubtitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#6B7280',
  },
  headerBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  successBanner: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    gap: 4,
  },
  bannerHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
    lineHeight: 18.5,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 16,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  qrContainer: {
    backgroundColor: '#F9FAFB',
    alignSelf: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  qrDescription: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  locationDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  locationInfo: {
    flex: 1,
    gap: 2,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  locationSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#6B7280',
  },
  mapFrame: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.02)',
  },
  mapPinContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -13 }, { translateY: -13 }],
  },
  mapFloatingBtn: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  mapFloatingBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  detailTextContainer: {
    flex: 1,
    gap: 2,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  detailValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
  },
  detailSubvalue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  itemsListContainer: {
    gap: 10,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productQty: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    width: 24,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  totalPaymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  totalValueText: {
    fontSize: 16.5,
    fontWeight: '900',
    color: '#10B981',
  },
  instructionBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
  },
  instructionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2563EB',
    lineHeight: 17.5,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
  },
  doneBtn: {
    backgroundColor: '#111827',
    height: 52,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
