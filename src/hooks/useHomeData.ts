import { Category, NEARBY_STORES, STORE_OFFSETS } from '@/constants/homeMockData';
import { supabase } from '@/lib/supabase';
import { getDistanceInKm } from '@/utils/geo';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function useHomeData() {
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState<Category[]>([{ id: 'todos', title: 'Todos', emoji: '🛍️' }]);
    const [selectedCategory, setSelectedCategory] = useState('todos');
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

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
            console.error(err);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    useEffect(() => {
        async function getUserLocation() {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    setUserLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
                }
            } catch (error) {
                console.log('Error location:', error);
            }
        }
        getUserLocation();
    }, []);

    const filteredStores = useMemo(() => {
        const mappedStores = NEARBY_STORES.map(store => {
            if (userLocation) {
                const offsets = STORE_OFFSETS[store.id as keyof typeof STORE_OFFSETS] || { latOffset: 0, lonOffset: 0 };
                const distKm = getDistanceInKm(
                    userLocation.latitude, userLocation.longitude,
                    userLocation.latitude + offsets.latOffset, userLocation.longitude + offsets.lonOffset
                );
                return { ...store, distanceVal: distKm, distance: distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(1)} km` };
            }
            return { ...store, distanceVal: parseFloat(store.distance.split(' ')[0]) };
        });

        return mappedStores.filter(store => {
            if (searchQuery.trim().length > 0) {
                const query = searchQuery.toLowerCase();
                return store.name.toLowerCase().includes(query) || store.category.toLowerCase().includes(query) || store.tagline.toLowerCase().includes(query);
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
        }).sort((a, b) => a.distanceVal - b.distanceVal);
    }, [userLocation, searchQuery, selectedCategory, categories]);

    return {
        searchQuery, setSearchQuery,
        categories, loadCategories,
        selectedCategory, setSelectedCategory,
        filteredStores
    };
}