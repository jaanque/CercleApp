import { homeStyles as styles } from '@/styles/home';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

export function StampWidget({ earnedStamps, totalStamps, onPress }: { earnedStamps: number | null, totalStamps: number | null, onPress: () => void }) {
    return (
        <Pressable style={({ pressed }) => [styles.homeStampWidget, pressed && { opacity: 0.92, transform: [{ scale: 0.98 }] }]} onPress={onPress}>
            {earnedStamps === null || totalStamps === null ? (
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 44 }}>
                    <ActivityIndicator size="small" color="#111827" />
                    <Text style={{ marginLeft: 8, fontSize: 12, fontWeight: '600', color: '#6B7280' }}>Sincronizando sellos...</Text>
                </View>
            ) : (
                <>
                    <View style={styles.homeStampLeft}>
                        <View style={styles.homeStampHeaderRow}>
                            <SymbolView name="checkmark.seal.fill" size={13} tintColor="#5B2333" />
                            <Text style={styles.homeStampTitle}>Tarjeta de sellos</Text>
                        </View>
                        <Text style={styles.homeStampSubtitle}>{earnedStamps} de {totalStamps} completados</Text>
                    </View>
                    <View style={styles.homeStampRight}>
                        <View style={styles.homeStampSlots}>
                            {Array.from({ length: totalStamps }).map((_, i) => (
                                <View key={i} style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                                    {i < earnedStamps ? (
                                        <SymbolView name="checkmark.seal.fill" size={20} tintColor="#5B2333" />
                                    ) : (
                                        <SymbolView name="seal" size={20} tintColor="rgba(91, 35, 51, 0.24)" />
                                    )}
                                </View>
                            ))}
                        </View>
                        <SymbolView name="chevron.right" size={13} tintColor="#5B2333" style={{ marginLeft: 4, opacity: 0.8 }} />
                    </View>
                </>
            )}
        </Pressable>
    );
}