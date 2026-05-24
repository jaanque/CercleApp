import { homeStyles as styles } from '@/styles/home';
import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

export function PremiumBanner({ onPress }: { onPress: () => void }) {
    return (
        <Pressable style={({ pressed }) => [styles.premiumBanner, pressed && { opacity: 0.92, transform: [{ scale: 0.98 }] }]} onPress={onPress}>
            <View style={styles.premiumTopRow}>
                <View style={styles.premiumLogoRow}>
                    <Text style={styles.premiumLogoText}>Cercle</Text>
                    <View style={styles.premiumPlusBadge}><Text style={styles.premiumPlusText}>+</Text></View>
                </View>
                <View style={styles.premiumCTAButtonThin}>
                    <Text style={styles.premiumCTABtnTextThin}>Probar gratis</Text>
                </View>
            </View>
            <View style={styles.premiumBenefitsList}>
                <View style={styles.premiumBenefitItem}>
                    <SymbolView name="checkmark.circle.fill" size={12} tintColor="#10B981" />
                    <Text style={styles.premiumBenefitText}>Sin comisiones en tus pedidos</Text>
                </View>
                <View style={styles.premiumBenefitItem}>
                    <SymbolView name="checkmark.circle.fill" size={12} tintColor="#10B981" />
                    <Text style={styles.premiumBenefitText}>Acceso exclusivo e ilimitado a Cercle AI</Text>
                </View>
                <View style={styles.premiumBenefitItem}>
                    <SymbolView name="checkmark.circle.fill" size={12} tintColor="#10B981" />
                    <Text style={styles.premiumBenefitText}>Envíos gratis y prioridad de entrega</Text>
                </View>
            </View>
        </Pressable>
    );
}