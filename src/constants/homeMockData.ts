export interface Category {
    id: string;
    title: string;
    emoji: string;
    isAI?: boolean;
}

export interface NearbyStore {
    id: string;
    name: string;
    category: string;
    rating: string;
    reviewsCount: string;
    popularBadge: string;
    distance: string;
    deliveryTime: string;
    fee: string;
    image: string;
    logo: string;
    tagline: string;
    cerclePlus: boolean;
    hasStamps: boolean;
}

export interface FeaturedProduct {
    id: string;
    name: string;
    price: string;
    originalPrice: string;
    image: string;
    store: string;
    stock: number;
    rating: string;
    reviewsCount: string;
    popularBadge: string;
    cerclePlus: boolean;
}

export const STORE_OFFSETS = {
    '1': { latOffset: 0.0012, lonOffset: 0.0018 },
    '2': { latOffset: -0.0034, lonOffset: 0.0045 },
    '3': { latOffset: 0.0078, lonOffset: -0.0062 },
    '4': { latOffset: -0.0124, lonOffset: -0.0098 },
};