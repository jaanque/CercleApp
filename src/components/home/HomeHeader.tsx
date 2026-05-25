import { homeStyles as styles } from '@/styles/home';
import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
    onProfilePress: () => void;
    onPickupPress: () => void;
    onStampsPress: () => void;
    earnedStamps: number | null;
    totalStamps: number | null;
    isHeaderShadow: boolean;
}

export function HomeHeader({ onProfilePress, onPickupPress, onStampsPress, earnedStamps, totalStamps, isHeaderShadow }: Props) {
    return (
        <View style={[styles.headerContainer, isHeaderShadow && { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 }]}>

            <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }} />
            <View style={styles.topRow}>
                <Pressable style={({ pressed }) => [styles.headerButton, pressed && { opacity: 0.7 }]} onPress={onProfilePress}>
                    <SymbolView name="person" size={20} tintColor="#1A1A1A" />
                </Pressable>

                <Pressable style={({ pressed }) => [styles.deliverySelector, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]} onPress={onPickupPress}>
                    <SymbolView name="storefront.fill" size={14} tintColor="#5B2333" />
                    <Text style={styles.deliveryText} numberOfLines={1}>Recogida en tienda</Text>
                </Pressable>

                <Pressable style={({ pressed }) => [styles.pointsPill, pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] }]} onPress={onStampsPress}>
                    <SymbolView name="checkmark.seal.fill" size={16} tintColor="#5B2333" />
                    <Text style={styles.pointsPillText}>{earnedStamps !== null && totalStamps !== null ? `${earnedStamps}/${totalStamps}` : '...'}</Text>
                </Pressable>
            </View>
        </View>
    );
}