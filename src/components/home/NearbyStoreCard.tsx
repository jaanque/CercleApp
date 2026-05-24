import { NearbyStore } from '@/constants/homeMockData';
import { homeStyles as styles } from '@/styles/home';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

export function NearbyStoreCard({ store, onPress }: { store: NearbyStore; onPress: () => void }) {
    return (
        <Pressable style={({ pressed }) => [styles.storeCard, pressed && { opacity: 0.92 }]} onPress={onPress}>
            <View style={styles.storeImageContainer}>
                <Image source={{ uri: store.image }} style={styles.storeImage} contentFit="cover" />
                {store.hasStamps && (
                    <View style={styles.stampBadgeOnImage}>
                        <SymbolView name="checkmark.seal.fill" size={11} tintColor="#111827" />
                        <Text style={styles.stampBadgeTextOnImage}>Sellos</Text>
                    </View>
                )}
            </View>
            <View style={styles.storeInfo}>
                <View style={styles.dealHeaderRow}>
                    <View style={styles.dealHeaderCopy}>
                        <View style={styles.storeTitleRow}>
                            <Text style={styles.dealNameText} numberOfLines={1}>{store.name}</Text>
                        </View>
                        <View style={styles.dealMetaLine}>
                            <Text style={styles.dealStoreText} numberOfLines={1}>{store.category}</Text>
                            <Text style={styles.dealMetaDot}>·</Text>
                            <SymbolView name="star.fill" size={9} tintColor="#F59E0B" style={styles.dealMetaIcon} />
                            <Text style={styles.dealRatingVal}>{store.rating}</Text>
                            <Text style={styles.dealReviewsText}>{store.reviewsCount}</Text>
                        </View>
                    </View>
                    <Text style={styles.storeDistancePill}>{store.distance}</Text>
                </View>
                <View style={styles.dealPriceRow}>
                    <Text style={styles.storeDeliveryText} numberOfLines={1}>Listo en {store.deliveryTime}</Text>
                </View>
            </View>
        </Pressable>
    );
}