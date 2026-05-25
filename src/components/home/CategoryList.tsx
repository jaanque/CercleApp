import { Category } from '@/constants/homeMockData';
import { homeStyles as styles } from '@/styles/home';
import { useRouter } from 'expo-router';
import { LayoutAnimation, Pressable, ScrollView, Text, View } from 'react-native';

function getDarkColor(activeColor?: string) {
    if (!activeColor) return '#5B2333';
    switch (activeColor.toLowerCase()) {
        case '#ccfbf1': return '#0F766E'; // Dark teal for Moda
        case '#e0f2fe': return '#0369A1'; // Dark blue for Tech
        case '#fef3c7': return '#92400E'; // Dark brown/amber for Hogar
        case '#ffedd5': return '#C2410C'; // Dark orange for Deportes
        case '#ffe4e6': return '#BE123C'; // Dark crimson/rose for Belleza
        case '#eef2ff': return '#4F46E5'; // Dark indigo for Cercle AI
        default: return '#5B2333';        // Brand burgundy default
    }
}

export function CategoryList({ categories, selectedCategory, onSelect }: { categories: Category[], selectedCategory: string, onSelect: (id: string) => void }) {
    const router = useRouter();

    return (
        <View style={styles.categoriesWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
                {categories.map((cat) => {
                    if (!cat?.id) return null;
                    const isSelected = selectedCategory === cat.id;
                    const darkColor = getDarkColor(cat.activeColor);
                    return (
                        <Pressable
                            key={cat.id}
                            onPress={() => {
                                if (cat.isAI) { router.push('/ai-chat'); return; }
                                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                onSelect(cat.id);
                            }}
                            style={({ pressed }) => [styles.categoryItem, pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] }]}
                        >
                            <View style={[
                                styles.categorySquare, 
                                isSelected && styles.categorySquareSelected, 
                                isSelected && cat.activeColor && { backgroundColor: cat.activeColor, borderColor: 'transparent', borderWidth: 0 },
                                cat.isAI && styles.categorySquareAI
                            ]}>
                                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                            </View>
                            <Text style={[
                                styles.categoryText, 
                                isSelected && styles.categoryTextSelected, 
                                isSelected && cat.activeColor && { color: darkColor },
                                cat.isAI && styles.categoryTextAI
                            ]}>{cat.title}</Text>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
}