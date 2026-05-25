import { SymbolView } from 'expo-symbols';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StoreOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  onViewDetails: () => void;
  storeName: string;
}

const OPTIONS = [
  { id: 'details', icon: 'info.circle.fill', label: 'Ver detalles del local', color: '#1A1A1A', bg: '#F3F4F6' },
  { id: 'problem', icon: 'exclamationmark.triangle.fill', label: 'Avisar de un problema', color: '#F59E0B', bg: '#FFFBEB' },
  { id: 'report', icon: 'flag.fill', label: 'Denunciar local', color: '#EF4444', bg: '#FEF2F2' },
];

export function StoreOptionsSheet({ visible, onClose, onViewDetails, storeName }: StoreOptionsSheetProps) {
  const [showModal, setShowModal] = useState(visible);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, easing: Easing.out(Easing.bezier(0.25, 1, 0.5, 1)), useNativeDriver: true }),
      ]).start();
    } else {
      handleClose();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 220, easing: Easing.in(Easing.ease), useNativeDriver: true }),
    ]).start(() => { setShowModal(false); onClose(); });
  };

  const handlePress = (id: string) => {
    handleClose();
    setTimeout(() => {
      if (id === 'details') { onViewDetails(); }
      else if (id === 'problem') {
        // Would open a form in a real app
      }
      else if (id === 'report') {
        // Would open a report form in a real app
      }
    }, 280);
  };

  if (!showModal) return null;

  return (
    <Modal visible={showModal} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={styles.dismissArea} onPress={handleClose} />
        </Animated.View>

        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.dragHandle} />

          {/* Store label */}
          <View style={styles.storeLabel}>
            <SymbolView name="storefront.fill" size={13} tintColor="#9CA3AF" />
            <Text style={styles.storeLabelText} numberOfLines={1}>{storeName}</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsList}>
            {OPTIONS.map((opt, i) => (
              <View key={opt.id}>
                <Pressable
                  style={({ pressed }) => [styles.optionRow, pressed && { backgroundColor: '#F9FAFB' }]}
                  onPress={() => handlePress(opt.id)}
                >
                  <View style={[styles.optionIconBox, { backgroundColor: opt.bg }]}>
                    <SymbolView name={opt.icon as any} size={16} tintColor={opt.color} />
                  </View>
                  <Text style={[styles.optionLabel, { color: opt.color === '#1A1A1A' ? '#1F2937' : opt.color }]}>
                    {opt.label}
                  </Text>
                  <SymbolView name="chevron.right" size={13} tintColor="#D1D5DB" />
                </Pressable>
                {i < OPTIONS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>

          {/* Cancel */}
          <Pressable
            style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.7 }]}
            onPress={handleClose}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.4)' },
  dismissArea: { flex: 1 },
  sheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingTop: 12, paddingHorizontal: 20, paddingBottom: 40,
    shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 20,
  },
  dragHandle: {
    width: 38, height: 5, borderRadius: 2.5, backgroundColor: '#E5E7EB',
    alignSelf: 'center', marginBottom: 24,
  },
  storeLabel: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 24, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  storeLabelText: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
  optionsList: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 22, overflow: 'hidden', marginBottom: 24,
  },
  optionRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, gap: 12,
    backgroundColor: '#FFFFFF',
  },
  optionIconBox: {
    width: 36, height: 36, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
  },
  optionLabel: { flex: 1, fontSize: 14.5, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 14 },
  cancelBtn: {
    height: 50, borderRadius: 22, backgroundColor: '#F3F4F6',
    borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '700', color: '#6B7280' },
});
