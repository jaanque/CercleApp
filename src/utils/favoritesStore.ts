let favorites: Record<string, boolean> = {};

export const favoritesStore = {
  get: () => favorites,
  set: (newFavs: Record<string, boolean>) => {
    favorites = { ...newFavs };
  },
  toggle: (prodId: string) => {
    const updated = { ...favorites };
    if (updated[prodId]) {
      delete updated[prodId];
    } else {
      updated[prodId] = true;
    }
    favorites = updated;
    return favorites;
  },
  isFavorite: (prodId: string) => !!favorites[prodId],
};
