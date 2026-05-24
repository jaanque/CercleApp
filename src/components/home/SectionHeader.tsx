import { homeStyles as styles } from '@/styles/home';
import { Pressable, Text, View } from 'react-native';

export function SectionHeader({ title, buttonText = "Ver más" }: { title: string, buttonText?: string }) {
    return (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Pressable style={({ pressed }) => [styles.seeAllButton, pressed && { opacity: 0.85 }]}>
                <Text style={styles.seeAllText}>{buttonText}</Text>
            </Pressable>
        </View>
    );
}