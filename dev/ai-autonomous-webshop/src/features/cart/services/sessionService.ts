export const sessionService = {
  generateShareLink: (cartItems: any[]) => {
    // In a real app, we'd save this to the DB and return a short ID.
    // For this 2026 mock, we'll encode the cart in the URL.
    const data = btoa(JSON.stringify(cartItems.map(i => ({ id: i.product_id, q: i.quantity }))));
    return `${window.location.origin}?cart_session=${data}`;
  },
  loadSharedCart: (encodedData: string) => {
    try {
      const decoded = JSON.parse(atob(encodedData));
      return decoded; // Array of {id, q}
    } catch (e) {
      console.error('Failed to decode shared cart', e);
      return null;
    }
  }
};
