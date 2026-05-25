import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Category, FeaturedProduct, NearbyStore } from '../constants/homeMockData';
import { supabase } from '../lib/supabase';
import { getDistanceInKm } from '../utils/geo';

export type MappedStore = NearbyStore & { distanceVal: number; distance: string };

export function useHomeData() {
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState<Category[]>([{ id: 'todos', title: 'Todos', emoji: '🛍️' }]);
    const [selectedCategory, setSelectedCategory] = useState('todos');
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    // Estados para tiendas y productos
    const [stores, setStores] = useState<any[]>([]);
    const [rawProducts, setRawProducts] = useState<any[]>([]);

    const loadCategories = useCallback(async () => {
        try {
            const { data, error } = await supabase.from('categories').select('*').order('order_index', { ascending: true });
            if (!error && data) {
                const dbCategories = data.map((cat: any) => ({
                    id: String(cat.id), title: cat.title, emoji: cat.emoji, isAI: cat.is_ai,
                }));
                setCategories([{ id: 'todos', title: 'Todos', emoji: '🛍️' }, ...dbCategories]);
            }
        } catch (err) {
            console.error('Error al cargar categorías:', err);
        }
    }, []);

    const loadStores = useCallback(async () => {
        try {
            const { data, error } = await supabase.from('stores').select('*');
            if (!error && data) setStores(data);
        } catch (err) {
            console.error('Error al cargar tiendas:', err);
        }
    }, []);

    const loadProducts = useCallback(async () => {
        try {
            const { data, error } = await supabase.from('products').select('*');
            if (!error && data) setRawProducts(data);
        } catch (err) {
            console.error('Error al cargar productos:', err);
        }
    }, []);

    const refreshHomeData = useCallback(async () => {
        // Añadimos loadProducts al Promise.all
        await Promise.all([loadCategories(), loadStores(), loadProducts()]);
    }, [loadCategories, loadStores, loadProducts]);

    useEffect(() => {
        refreshHomeData();
    }, [refreshHomeData]);

    useEffect(() => {
        async function getUserLocation() {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    setUserLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
                }
            } catch (error) {
                console.log('Error de ubicación:', error);
            }
        }
        getUserLocation();
    }, []);

    // Mapear productos de Supabase al formato Frontend
    const featuredProducts: FeaturedProduct[] = useMemo(() => {
        return rawProducts.map((prod: any) => ({
            id: prod.id,
            name: prod.name,
            price: prod.price,
            originalPrice: prod.original_price,
            image: prod.image,
            store: prod.store,
            storeId: prod.store_id,
            stock: prod.stock,
            rating: prod.rating,
            reviewsCount: prod.reviews_count,
            popularBadge: prod.popular_badge,
            cerclePlus: prod.cercle_plus,
        }));
    }, [rawProducts]);

    // Filtrado de tiendas y cálculo de distancias
    const filteredStores: MappedStore[] = useMemo(() => {
        const mappedStores: MappedStore[] = stores.map((store: any) => {
            const latOffset = store.lat_offset || 0;
            const lonOffset = store.lon_offset || 0;

            if (userLocation) {
                const distKm = getDistanceInKm(
                    userLocation.latitude, userLocation.longitude,
                    userLocation.latitude + latOffset, userLocation.longitude + lonOffset
                );
                return {
                    id: store.id, name: store.name, category: store.category, rating: store.rating,
                    reviewsCount: store.reviews_count, popularBadge: store.popular_badge,
                    deliveryTime: store.delivery_time, fee: store.fee, image: store.image,
                    logo: store.logo, tagline: store.tagline, cerclePlus: store.cercle_plus,
                    hasStamps: store.has_stamps, distanceVal: distKm,
                    distance: distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(1)} km`
                };
            }
            return {
                id: store.id, name: store.name, category: store.category, rating: store.rating,
                reviewsCount: store.reviews_count, popularBadge: store.popular_badge,
                deliveryTime: store.delivery_time, fee: store.fee, image: store.image,
                logo: store.logo, tagline: store.tagline, cerclePlus: store.cercle_plus,
                hasStamps: store.has_stamps, distanceVal: parseFloat((store.distance_fallback || '0').split(' ')[0]),
                distance: store.distance_fallback || '0 km'
            };
        });

        return mappedStores.filter((store: MappedStore) => {
            if (searchQuery.trim().length > 0) {
                const query = searchQuery.toLowerCase();
                return store.name.toLowerCase().includes(query) ||
                    store.category.toLowerCase().includes(query) ||
                    (store.tagline || '').toLowerCase().includes(query);
            }
            const activeCat = categories.find(c => c.id === selectedCategory);
            if (activeCat && activeCat.title !== 'Todos') {
                if (activeCat.title === 'Moda') return store.category === 'Ropa & Accesorios';
                if (activeCat.title === 'Tech') return store.category === 'Electrónica';
                if (activeCat.title === 'Hogar') return store.category === 'Decoración';
                if (activeCat.title === 'Deportes') return store.category === 'Deportes';
                return store.category.toLowerCase().includes(activeCat.title.toLowerCase());
            }
            return true;
        }).sort((a: MappedStore, b: MappedStore) => a.distanceVal - b.distanceVal);
    }, [stores, userLocation, searchQuery, selectedCategory, categories]);

    return {
        searchQuery, setSearchQuery,
        categories, refreshHomeData,
        selectedCategory, setSelectedCategory,
        filteredStores,
        featuredProducts // Lo exportamos para usarlo en la UI
    };
}