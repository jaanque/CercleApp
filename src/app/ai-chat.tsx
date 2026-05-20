import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
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
import { cartStore } from '../utils/cartStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.35; // Double column style for products inside chat bubbles

function AnimatedNumber({ value, style }: { value: number; style: any }) {
  const [displayValue, setDisplayValue] = React.useState(value);
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const prevValueRef = React.useRef(value);

  React.useEffect(() => {
    const prev = prevValueRef.current;
    if (value === prev) return;

    const isIncrement = value > prev;
    prevValueRef.current = value;

    // Step 1: Quick slide out and fade out of the old number
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: isIncrement ? -12 : 12,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 40,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Step 2: Instantly snap to the opposite side and swap display value
      setDisplayValue(value);
      slideAnim.setValue(isIncrement ? 12 : -12);
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.8);

      // Step 3: Springy bouncy slide in and scale up of the new number
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 280,
          friction: 14,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 280,
          friction: 14,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 40,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [value]);

  return (
    <Animated.Text
      style={[
        style,
        {
          opacity: opacityAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
        },
      ]}
    >
      {displayValue}
    </Animated.Text>
  );
}

interface ProductItem {
  id: string;
  name: string;
  price: string;
  store: string;
  image: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  products?: ProductItem[];
}

const PRESET_ANSWERS: Record<string, { text: string; products: ProductItem[] }> = {
  '🎁 Regalo original para mi madre': {
    text: 'Para tu madre, te recomiendo detalles sofisticados e inspiradores para el hogar o moda elegante. Aquí tienes las mejores opciones seleccionadas en nuestras tiendas locales hoy:',
    products: [
      { 
        id: 'ai_1', 
        name: 'Vela Soja Higo', 
        price: '18,50 €', 
        store: 'Home Style',
        image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=300&q=80' 
      },
      { 
        id: 'ai_2', 
        name: 'Bolso Piel Vegan', 
        price: '45,00 €', 
        store: 'Fashion Hub',
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=300&q=80' 
      }
    ]
  },
  '💻 Gadgets de oficina minimalista': {
    text: 'Para una mesa limpia y productiva, te propongo accesorios con diseño nórdico y de alta calidad técnica. Mira estas recomendaciones:',
    products: [
      { 
        id: 'ai_3', 
        name: 'Organidador Roble', 
        price: '29,90 €', 
        store: 'Home Style',
        image: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?auto=format&fit=crop&w=300&q=80' 
      },
      { 
        id: 'ai_4', 
        name: 'Cargador Qi Rápido', 
        price: '39,00 €', 
        store: 'Tech Outlet',
        image: 'https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&w=300&q=80' 
      }
    ]
  },
  '👗 Ropa sostenible por menos de 50€': {
    text: 'Moda consciente fabricada con materiales orgánicos y procesos respetuosos en talleres locales. Estas son excelentes opciones:',
    products: [
      { 
        id: 'ai_5', 
        name: 'Camiseta Orgánica', 
        price: '24,00 €', 
        store: 'Fashion Hub',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80' 
      },
      { 
        id: 'ai_6', 
        name: 'Sudadera Reciclada', 
        price: '48,00 €', 
        store: 'Fashion Hub',
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80' 
      }
    ]
  }
};

export default function AIChatScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: '¡Hola! Soy tu asistente de compras inteligente Cercle AI. ✨\n\nPregúntame cualquier duda sobre qué regalar a un ser querido o cómo decorar tu espacio, y te encontraré los mejores productos locales al instante.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>(() => cartStore.get());

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      
      const match = PRESET_ANSWERS[textToSend];
      const aiResponse: ChatMessage = {
        id: Math.random().toString(),
        sender: 'ai',
        text: match 
          ? match.text 
          : '¡Qué gran consulta! He analizado nuestras tiendas colaboradoras y te propongo los siguientes artículos premium de nuestro stock local:',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        products: match 
          ? match.products 
          : [
              { 
                id: 'ai_gen_1', 
                name: 'Auriculares Pro', 
                price: '89,00 €', 
                store: 'Tech Outlet',
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80'
              },
              { 
                id: 'ai_gen_2', 
                name: 'Libreta Cuero', 
                price: '19,50 €', 
                store: 'Home Style',
                image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80'
              }
            ]
      };

      setMessages(prev => [...prev, aiResponse]);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500);
  };

  const handleAddProduct = (id: string) => {
    const updatedQty = (quantities[id] || 0) + 1;
    const newQuantities = { ...quantities, [id]: updatedQty };
    setQuantities(newQuantities);
    cartStore.set(newQuantities);
  };

  const handleRemoveProduct = (id: string) => {
    if (!quantities[id]) return;
    const updatedQty = quantities[id] - 1;
    
    let newQuantities = { ...quantities };
    if (updatedQty <= 0) {
      delete newQuantities[id];
    } else {
      newQuantities[id] = updatedQty;
    }
    
    setQuantities(newQuantities);
    cartStore.set(newQuantities);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFFFFF' }} />
      
      {/* Premium Chat Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backBtn,
            pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] }
          ]}
          onPress={() => router.back()}
        >
          <SymbolView name="chevron.left" size={16} tintColor="#111827" />
        </Pressable>
        
        <View style={styles.headerTitleBox}>
          <View style={styles.titleRow}>
            <SymbolView name="sparkles" size={13} tintColor="#1F2937" />
            <Text style={styles.headerTitle}>Cercle AI</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusText}>Asistente Activo</Text>
          </View>
        </View>
        
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View 
              key={msg.id} 
              style={[
                styles.messageRow,
                msg.sender === 'user' ? styles.messageRowUser : styles.messageRowAI
              ]}
            >
              {msg.sender === 'ai' && (
                <View style={styles.aiAvatar}>
                  <SymbolView name="sparkles" size={12} tintColor="#FFFFFF" />
                </View>
              )}
              
              <View style={{ flex: 1, alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <View 
                  style={[
                    styles.messageBubble,
                    msg.sender === 'user' ? styles.bubbleUser : styles.bubbleAI
                  ]}
                >
                  <Text 
                    style={[
                      styles.messageText,
                      msg.sender === 'user' ? styles.textUser : styles.textAI
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
                
                {/* Visual Product Grid matching store.tsx exact UI */}
                {msg.products && msg.products.length > 0 && (
                  <View style={styles.productsGrid}>
                    {msg.products.map(prod => {
                      const qty = quantities[prod.id] ?? 0;
                      return (
                        <View key={prod.id} style={styles.productCard}>
                          {/* Image Box matching store.tsx */}
                          <View style={[styles.productImgBox, qty > 0 && styles.productImgBoxActive]}>
                            <Image source={{ uri: prod.image }} style={styles.productImg} contentFit="cover" />
                          </View>
                          
                          {/* Product Info details aligned underneath */}
                          <View style={styles.productInfo}>
                            <Text style={styles.productName} numberOfLines={1}>{prod.name}</Text>
                            <Text style={styles.productStore} numberOfLines={1}>{prod.store}</Text>
                            <Text style={styles.productPrice}>{prod.price}</Text>

                            {/* Quantity Controls aligned to Cercle's home/store page style */}
                            {qty === 0 ? (
                              <Pressable
                                style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.85 }]}
                                onPress={() => handleAddProduct(prod.id)}
                              >
                                <Text style={styles.addButtonText}>Añadir</Text>
                                <SymbolView name="plus" size={11} tintColor="#1F2937" style={{ marginLeft: 3 }} />
                              </Pressable>
                            ) : (
                                <View style={styles.qtyContainer}>
                                <Pressable
                                  style={({ pressed }) => [styles.qtyBtn, pressed && { opacity: 0.75 }]}
                                  onPress={() => handleRemoveProduct(prod.id)}
                                >
                                  <SymbolView
                                    name={qty === 1 ? 'trash' : 'minus'}
                                    size={11}
                                    tintColor={qty === 1 ? '#EF4444' : '#1F2937'}
                                  />
                                </Pressable>
                                
                                <AnimatedNumber value={qty} style={styles.qtyText} />
                                
                                <Pressable
                                  style={({ pressed }) => [styles.qtyBtn, pressed && { opacity: 0.75 }]}
                                  onPress={() => handleAddProduct(prod.id)}
                                >
                                  <SymbolView name="plus" size={11} tintColor="#1F2937" />
                                </Pressable>
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
                
                <Text style={styles.timestampText}>{msg.timestamp}</Text>
              </View>
            </View>
          ))}

          {/* Typing Loader */}
          {isTyping && (
            <View style={[styles.messageRow, styles.messageRowAI]}>
              <View style={styles.aiAvatar}>
                <SymbolView name="sparkles" size={12} tintColor="#FFFFFF" />
              </View>
              <View style={styles.typingBubble}>
                <ActivityIndicator size="small" color="#1F2937" />
                <Text style={styles.typingText}>Cercle AI está buscando...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Suggestion Chips */}
        {messages.length === 1 && (
          <View style={styles.suggestionsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
              {Object.keys(PRESET_ANSWERS).map((preset) => (
                <Pressable
                  key={preset}
                  style={({ pressed }) => [
                    styles.suggestionChip,
                    pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }
                  ]}
                  onPress={() => handleSendMessage(preset)}
                >
                  <Text style={styles.suggestionText}>{preset}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Text Input Footer Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Pregunta a Cercle AI..."
            placeholderTextColor="#9CA3AF"
            returnKeyType="send"
            onSubmitEditing={() => handleSendMessage(inputText)}
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendBtn,
              !inputText.trim() && styles.sendBtnDisabled,
              pressed && { opacity: 0.8 }
            ]}
            onPress={() => handleSendMessage(inputText)}
            disabled={!inputText.trim()}
          >
            <SymbolView 
              name="arrow.up" 
              size={13} 
              tintColor={inputText.trim() ? '#FFFFFF' : '#9CA3AF'} 
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBox: {
    alignItems: 'center',
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },
  chatScroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  chatScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    gap: 18,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    width: '100%',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAI: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    maxWidth: SCREEN_WIDTH * 0.78,
  },
  bubbleUser: {
    backgroundColor: '#111827',
    borderTopRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: '#F3F4F6',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 19.5,
  },
  textUser: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  textAI: {
    color: '#1F2937',
    fontWeight: '500',
  },
  timestampText: {
    fontSize: 9,
    color: '#9CA3AF',
    fontWeight: '700',
    marginTop: 4,
    marginRight: 4,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 8,
  },
  typingText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#6B7280',
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
  },
  suggestionsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
    gap: 10,
  },
  textInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#F3F4F6',
    borderRadius: 21,
    paddingHorizontal: 16,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
    width: SCREEN_WIDTH * 0.78,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    paddingBottom: 10,
  },
  productImgBox: {
    width: '100%',
    height: CARD_WIDTH * 1.1,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  productImgBoxActive: {
    borderWidth: 2,
    borderColor: '#111827',
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    paddingTop: 8,
    paddingHorizontal: 10,
    gap: 3,
  },
  productName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1F2937',
  },
  productStore: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  productPrice: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 32,
    borderRadius: 10,
    marginTop: 6,
  },
  addButtonText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1F2937',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    height: 32,
    borderRadius: 10,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1F2937',
  },
});
