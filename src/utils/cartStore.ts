let cartQuantities: Record<string, number> = {};

export const cartStore = {
  get: () => cartQuantities,
  set: (newQty: Record<string, number>) => {
    cartQuantities = { ...newQty };
  },
  clear: () => {
    cartQuantities = {};
  }
};
