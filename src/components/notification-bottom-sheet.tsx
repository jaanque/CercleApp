import { SymbolView } from 'expo-symbols';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, Dimensions, Animated, Easing } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NotificationBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: '¡Bajada de precio! 📉',
    message: 'El artículo "Zapatillas Air Max 90" en Fashion Hub ha bajado a 60€ (¡Ahorras 90€!).',
    time: 'Hace 10 min',
    icon: 'tag.fill',
  },
  {
    id: '2',
    title: '¡Stock rescatado! 📦',
    message: 'Has recogido con éxito tu pedido #CR-884920 en Fashion Hub. ¡Gracias por salvar stock muerto!',
    time: 'Hace 2 h',
    icon: 'leaf.fill',
  },
  {
    id: '3',
    title: 'Alerta de Stock Cercano 📍',
    message: 'EcoStyle acaba de subir 5 vestidos de fiesta a precio de liquidación a 0.2 km de ti.',
    time: 'Ayer',
    icon: 'bell.fill',
  },
];

export function NotificationBottomSheet({ visible, onClose }: NotificationBottomSheetProps) {
  const [showModal, setShowModal] = useState(visible);
  
  // Animation Values
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      // Soft fade in of the dark backdrop and fluid slide up of the sheet
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.bezier(0.25, 1, 0.5, 1)), // Fluid iOS-like ease out
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      handleClose();
    }
  }, [visible]);

  const handleClose = () => {
    // Soft fade out of the backdrop and slide down of the sheet
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
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Animated backdrop overlay with separate opacity fade */}
        <Animated.View 
          style={[
            styles.backdrop, 
            { opacity: backdropOpacity }
          ]}
        >
          <Pressable style={styles.dismissArea} onPress={handleClose} />
        </Animated.View>
        
        {/* Animated bottomsheet card container with separate translation slide */}
        <Animated.View 
          style={[
            styles.sheetContainer, 
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Drag Handle Indicator */}
          <View style={styles.dragHandle} />
          
          {/* Sticky-Style Header Row (Matches HomeScreen Header) */}
          <View style={styles.headerTopRow}>
            <Pressable 
              style={({ pressed }) => [
                styles.headerButton,
                pressed && { opacity: 0.7 }
              ]} 
              onPress={handleClose}
            >
              <SymbolView name="chevron.left" size={20} tintColor="#1A1A1A" />
            </Pressable>

            <View style={styles.selectorContainer}>
              <View style={styles.deliverySelector}>
                <SymbolView name="bell.fill" size={13} tintColor="#1F2937" />
                <Text style={styles.deliveryText} numberOfLines={1}>
                  Notificaciones
                </Text>
              </View>
            </View>

            {/* Symmetrical Balancer */}
            <View style={{ width: 40 }} />
          </View>

          {/* List Scroll Area */}
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {MOCK_NOTIFICATIONS.map((notif) => (
              <Pressable 
                key={notif.id}
                style={({ pressed }) => [
                  styles.notificationCard,
                  pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }
                ]}
              >
                <View style={styles.iconBadge}>
                  <SymbolView name={notif.icon as any} size={15} tintColor="#10B981" />
                </View>
                <View style={styles.textContainer}>
                  <View style={styles.notifHeaderRow}>
                    <Text style={styles.notifTitle} numberOfLines={1}>{notif.title}</Text>
                    <Text style={styles.notifTime}>{notif.time}</Text>
                  </View>
                  <Text style={styles.notifMessage}>{notif.message}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  dismissArea: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.75,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 20,
  },
  dragHandle: {
    width: 38,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectorContainer: {
    flex: 1,
    alignItems: 'center',
  },
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
  deliveryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  notifTime: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  notifMessage: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#4B5563',
    lineHeight: 17.5,
  },
});
