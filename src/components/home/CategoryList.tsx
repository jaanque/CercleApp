import { Category } from '@/constants/homeMockData';
import { homeStyles as styles } from '@/styles/home';
import { useRouter } from 'expo-router';
import { LayoutAnimation, Pressable, ScrollView, Text, View } from 'react-native';

export function CategoryList({ categories, selectedCategory, onSelect }: { categories: Category[], selectedCategory: string, onSelect: (id: string) => void }) {
    const router = useRouter();

    return (
        <View style={styles.categoriesWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
                {categories.map((cat) => {
                    if (!cat?.id) return null;
                    const isSelected = selectedCategory === cat.id;
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
                            <View style={[styles.categorySquare, isSelected && styles.categorySquareSelected, cat.isAI && styles.categorySquareAI]}>
                                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                            </View>
                            <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected, cat.isAI && styles.categoryTextAI]}>{cat.title}</Text>
                            {isSelected && !cat.isAI && <View style={styles.categoryActiveDot} />}
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
}