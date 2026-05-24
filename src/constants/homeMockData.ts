export interface Category {
    id: string;
    title: string;
    emoji: string;
    isAI?: boolean;
}

export const FEATURED_PRODUCTS = [
    { id: 'p1', name: 'Chaqueta Oversize', price: '29 €', originalPrice: '89 €', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=300&q=80', store: 'Retro Vintage', stockRemaining: 1, maxStock: 5, stockText: '¡Última disponible en tienda!', rating: '4.8', reviewsCount: '(1.2K)', popularBadge: '#1 Moda', cerclePlus: true },
    { id: 'p2', name: 'Zapatillas Blancas', price: '45 €', originalPrice: '120 €', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80', store: 'Urban Sneaks', stockRemaining: 2, maxStock: 8, stockText: 'Solo quedan 2 unidades', rating: '4.6', reviewsCount: '(800)', popularBadge: 'Destacado', cerclePlus: false },
    { id: 'p3', name: 'Bolso de Piel', price: '55 €', originalPrice: '180 €', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=300&q=80', store: 'Leather Works', stockRemaining: 1, maxStock: 6, stockText: 'Único en stock local', rating: '4.5', reviewsCount: '(250)', popularBadge: 'Exclusivo', cerclePlus: true },
    { id: 'p4', name: 'Vestido Floral', price: '19 €', originalPrice: '65 €', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=300&q=80', store: 'Boho Chic', stockRemaining: 3, maxStock: 10, stockText: 'Últimas 3 unidades residuales', rating: '4.9', reviewsCount: '(3.1K)', popularBadge: 'Tendencia', cerclePlus: true },
    { id: 'p5', name: 'Gafas de Sol Pro', price: '12 €', originalPrice: '40 €', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=300&q=80', store: 'Specs Studio', stockRemaining: 2, maxStock: 7, stockText: 'Solo 2 disponibles', rating: '4.7', reviewsCount: '(150)', popularBadge: 'Clásico', cerclePlus: false },
    { id: 'p6', name: 'Jersey de Lana', price: '22 €', originalPrice: '70 €', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=300&q=80', store: 'Urban Sneaks', stockRemaining: 6, maxStock: 10, stockText: 'Quedan 6 unidades', rating: '4.4', reviewsCount: '(430)', popularBadge: 'Básico', cerclePlus: false },
    { id: 'p7', name: 'Vaqueros Slim', price: '25 €', originalPrice: '75 €', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=300&q=80', store: 'Retro Vintage', stockRemaining: 8, maxStock: 12, stockText: 'Quedan 8 unidades', rating: '4.8', reviewsCount: '(1.1K)', popularBadge: '#2 Moda', cerclePlus: true },
    { id: 'p8', name: 'Camiseta Algodón', price: '9 €', originalPrice: '27 €', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80', store: 'Boho Chic', stockRemaining: 5, maxStock: 10, stockText: 'Quedan 5 unidades', rating: '4.7', reviewsCount: '(680)', popularBadge: 'Fresco', cerclePlus: true }
];

export const NEARBY_STORES = [
    { id: '1', name: 'Fashion Hub', category: 'Ropa & Accesorios', rating: '4.8', reviewsCount: '(2,000+)', popularBadge: '#1 Moda', distance: '0.2 km', deliveryTime: '10-15 min', fee: '0€', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80', logo: 'https://logo.clearbit.com/zara.com', tagline: 'Ropa y accesorios exclusivos seleccionados para ti', cerclePlus: true, hasStamps: true },
    { id: '2', name: 'Tech Outlet', category: 'Electrónica', rating: '4.6', reviewsCount: '(500+)', popularBadge: 'Oferta Especial', distance: '0.8 km', deliveryTime: '20-30 min', fee: '1.50€', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80', logo: 'https://logo.clearbit.com/apple.com', tagline: 'Lo último en tecnología y gadgets con garantía oficial', cerclePlus: false, hasStamps: false },
    { id: '3', name: 'Sport Center', category: 'Deportes', rating: '4.5', reviewsCount: '(120)', popularBadge: '#1 Deporte', distance: '1.5 km', deliveryTime: '25-35 min', fee: '2.00€', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80', logo: 'https://logo.clearbit.com/nike.com', tagline: 'Equipamiento deportivo de alto rendimiento para campeones', cerclePlus: true, hasStamps: true },
    { id: '4', name: 'Home Style', category: 'Decoración', rating: '4.9', reviewsCount: '(3,400+)', popularBadge: 'Recomendado', distance: '2.1 km', deliveryTime: '30-40 min', fee: '2.50€', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80', logo: 'https://logo.clearbit.com/ikea.com', tagline: 'Muebles y decoración de diseño para tu hogar ideal', cerclePlus: false, hasStamps: true },
];

export const STORE_OFFSETS = {
    '1': { latOffset: 0.0012, lonOffset: 0.0018 },
    '2': { latOffset: -0.0034, lonOffset: 0.0045 },
    '3': { latOffset: 0.0078, lonOffset: -0.0062 },
    '4': { latOffset: -0.0124, lonOffset: -0.0098 },
};

export type FeaturedProduct = (typeof FEATURED_PRODUCTS)[number];
export type NearbyStore = (typeof NEARBY_STORES)[number];