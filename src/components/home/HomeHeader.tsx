import { homeStyles as styles } from '@/styles/home';
import { SymbolView } from 'expo-symbols';
import { useCallback, useRef, useState } from 'react';
import { Animated, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
    onProfilePress: () => void;
    onPickupPress: () => void;
    onStampsPress: () => void;
    earnedStamps: number | null;
    totalStamps: number | null;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
}

export function HomeHeader({ onProfilePress, onPickupPress, onStampsPress, earnedStamps, totalStamps, searchQuery, setSearchQuery }: Props) {
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const searchAnim = useRef(new Animated.Value(0)).current;
    const searchInputRef = useRef<TextInput>(null);

    const toggleSearch = useCallback(() => {
        if (isSearchExpanded) {
            searchInputRef.current?.blur();
            Animated.timing(searchAnim, { toValue: 0, duration: 180, useNativeDriver: false }).start(() => {
                setIsSearchExpanded(false);
                setSearchQuery('');
            });
        } else {
            setIsSearchExpanded(true);
            Animated.timing(searchAnim, { toValue: 1, duration: 180, useNativeDriver: false }).start(() => {
                searchInputRef.current?.focus();
            });
        }
    }, [isSearchExpanded, searchAnim, setSearchQuery]);

    return (
        <View style={styles.headerContainer}>
            <SafeAreaView edges={['top']} />
            <View style={styles.topRow}>
                <Pressable style={({ pressed }) => [styles.headerButton, pressed && { opacity: 0.7 }]} onPress={onProfilePress}>
                    <SymbolView name="person" size={20} tintColor="#1A1A1A" />
                </Pressable>

                <Pressable style={({ pressed }) => [styles.deliverySelector, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]} onPress={onPickupPress}>
                    <SymbolView name="storefront.fill" size={14} tintColor="#10B981" />
                    <Text style={styles.deliveryText} numberOfLines={1}>Recogida en tienda</Text>
                </Pressable>

                <Pressable style={({ pressed }) => [styles.headerButton, isSearchExpanded && styles.headerButtonActive, pressed && { opacity: 0.7 }]} onPress={toggleSearch}>
                    <SymbolView name={isSearchExpanded ? "xmark" : "magnifyingglass"} size={isSearchExpanded ? 18 : 20} tintColor={isSearchExpanded ? "#10B981" : "#1A1A1A"} />
                </Pressable>

                <Pressable style={({ pressed }) => [styles.pointsPill, pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] }]} onPress={onStampsPress}>
                    <SymbolView name="checkmark.seal.fill" size={16} tintColor="#111827" />
                    <Text style={styles.pointsPillText}>{earnedStamps !== null && totalStamps !== null ? `${earnedStamps}/${totalStamps}` : '...'}</Text>
                </Pressable>
            </View>

            <Animated.View style={[styles.searchBarContainer, {
                height: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 60] }),
                opacity: searchAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0, 1] }),
                transform: [{ translateY: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [-15, 0] }) }],
                overflow: 'hidden',
            }]}>
                <View style={styles.searchBarInputWrapper}>
                    <SymbolView name="magnifyingglass" size={15} tintColor="#9CA3AF" style={styles.searchIcon} />
                    <TextInput
                        ref={searchInputRef}
                        style={styles.searchInput}
                        placeholder="Buscar locales o categorías..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
                            <SymbolView name="xmark.circle.fill" size={16} tintColor="#9CA3AF" />
                        </Pressable>
                    )}
                </View>
            </Animated.View>
        </View>
    );
}