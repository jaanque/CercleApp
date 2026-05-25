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
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SettingsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

const ACCOUNT_SETTINGS = [
  { id: 'payment', icon: 'creditcard.fill', label: 'Métodos de pago', desc: 'Tarjetas de crédito, débito o Apple Pay' },
  { id: 'addresses', icon: 'mappin.and.ellipse', label: 'Direcciones & Recogida', desc: 'Tus direcciones y puntos de recogida preferidos' },
  { id: 'security', icon: 'lock.fill', label: 'Seguridad & Contraseña', desc: 'Cambiar clave, autenticación de dos factores' },
];

const PREFERENCES_SETTINGS = [
  { id: 'notifications', icon: 'bell.fill', label: 'Notificaciones', desc: 'Alertas de ofertas, stock y mensajes de tiendas' },
  { id: 'privacy', icon: 'shield.fill', label: 'Privacidad', desc: 'Gestionar cookies, datos y permisos de ubicación' },
  { id: 'app', icon: 'slider.horizontal.3', label: 'Preferencias de la App', desc: 'Idioma, modo de visualización y caché' },
];

const HELP_SETTINGS = [
  { id: 'support', icon: 'questionmark.circle.fill', label: 'Soporte Técnico', desc: 'Preguntas frecuentes, chat de soporte y reportar fallos' },
  { id: 'legal', icon: 'doc.text.fill', label: 'Términos & Legal', desc: 'Condiciones de uso, políticas de privacidad y cookies' },
];

export function SettingsBottomSheet({ visible, onClose }: SettingsBottomSheetProps) {
  const [showModal, setShowModal] = useState(visible);
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.bezier(0.2, 0.8, 0.2, 1)),
        useNativeDriver: true,
      }).start();
    } else {
      handleClose();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').height,
      duration: 280,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowModal(false);
      onClose();
    });
  };

  const handlePressOption = (label: string) => {
    Alert.alert('Configuración', `"${label}" estará disponible en la siguiente versión.`);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar cuenta',
      '¿Estás seguro de que deseas eliminar tu cuenta permanentemente? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => Alert.alert('Cuenta eliminada', 'Tu cuenta ha sido borrada.') },
      ]
    );
  };

  if (!showModal) return null;

  return (
    <Modal
      visible={showModal}
      transparent={false}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          
          {/* Header Bar */}
          <View style={styles.headerContainer}>
            <SafeAreaView edges={['top']} />
            <View style={styles.headerRow}>
              <Pressable
                style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
                onPress={handleClose}
              >
                <SymbolView name="chevron.left" size={20} tintColor="#1F2937" />
              </Pressable>
              
              <Text style={styles.headerTitle}>Configuración</Text>
              
              <View style={styles.placeholderBtn} />
            </View>
          </View>

          {/* Settings Options Scroll */}
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            
            {/* Section 1: Cuenta y Datos */}
            <Text style={styles.sectionHeading}>Cuenta y Datos</Text>
            <View style={styles.menuCard}>
              {ACCOUNT_SETTINGS.map((item, i) => (
                <View key={item.id}>
                  <Pressable
                    style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: '#F9FAFB' }]}
                    onPress={() => handlePressOption(item.label)}
                  >
                    <View style={styles.menuIconBox}>
                      <SymbolView name={item.icon as any} size={16} tintColor="#374151" />
                    </View>
                    <View style={styles.textGroup}>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                      <Text style={styles.menuDesc}>{item.desc}</Text>
                    </View>
                    <SymbolView name="chevron.right" size={13} tintColor="#9CA3AF" />
                  </Pressable>
                  {i < ACCOUNT_SETTINGS.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>

            {/* Section 2: Preferencias */}
            <Text style={styles.sectionHeading}>Preferencias</Text>
            <View style={styles.menuCard}>
              {PREFERENCES_SETTINGS.map((item, i) => (
                <View key={item.id}>
                  <Pressable
                    style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: '#F9FAFB' }]}
                    onPress={() => handlePressOption(item.label)}
                  >
                    <View style={styles.menuIconBox}>
                      <SymbolView name={item.icon as any} size={16} tintColor="#374151" />
                    </View>
                    <View style={styles.textGroup}>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                      <Text style={styles.menuDesc}>{item.desc}</Text>
                    </View>
                    <SymbolView name="chevron.right" size={13} tintColor="#9CA3AF" />
                  </Pressable>
                  {i < PREFERENCES_SETTINGS.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>

            {/* Section 3: Ayuda & Soporte */}
            <Text style={styles.sectionHeading}>Información & Ayuda</Text>
            <View style={styles.menuCard}>
              {HELP_SETTINGS.map((item, i) => (
                <View key={item.id}>
                  <Pressable
                    style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: '#F9FAFB' }]}
                    onPress={() => handlePressOption(item.label)}
                  >
                    <View style={styles.menuIconBox}>
                      <SymbolView name={item.icon as any} size={16} tintColor="#374151" />
                    </View>
                    <View style={styles.textGroup}>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                      <Text style={styles.menuDesc}>{item.desc}</Text>
                    </View>
                    <SymbolView name="chevron.right" size={13} tintColor="#9CA3AF" />
                  </Pressable>
                  {i < HELP_SETTINGS.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>

            {/* Section 4: Acciones de cuenta */}
            <Text style={styles.sectionHeading}>Acciones</Text>
            <View style={styles.menuCard}>
              <Pressable
                style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: '#FEF2F2' }]}
                onPress={handleDeleteAccount}
              >
                <View style={styles.menuIconBox}>
                  <SymbolView name="trash.fill" size={16} tintColor="#EF4444" />
                </View>
                <View style={styles.textGroup}>
                  <Text style={[styles.menuLabel, { color: '#EF4444' }]}>Eliminar cuenta</Text>
                  <Text style={styles.menuDesc}>Borrar permanentemente tus datos y tu cuenta</Text>
                </View>
                <SymbolView name="chevron.right" size={13} tintColor="#FECACA" />
              </Pressable>
            </View>

            {/* Footer */}
            <View style={styles.footnoteBox}>
              <Text style={styles.footnoteText}>Cercle App • Versión 1.0.0 (Build 42)</Text>
              <Text style={styles.footnoteSub}>Tus datos están cifrados de extremo a extremo.</Text>
            </View>
          </ScrollView>

        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  sheet: { flex: 1, backgroundColor: '#FFFFFF' },

  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2937',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  placeholderBtn: {
    width: 40,
    height: 40,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 60,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 24,
  },
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
  textGroup: {
    flex: 1,
    gap: 2,
  },
  menuLabel: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#1F2937',
  },
  menuDesc: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },

  footnoteBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 24,
  },
  footnoteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  footnoteSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#D1D5DB',
  },
});
