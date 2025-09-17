export function computeTotal(items = []) {
  return items.reduce((sum, it) => sum + (Number(it.priceSnapshot) || 0) * (Number(it.qty) || 0), 0);
}

export function serializeCart(cart) {
  const items = (cart?.items || []).map((it) => ({
    _id: it._id.toString(),
    qty: it.qty,
    priceSnapshot: it.priceSnapshot,
    product: it.product && {
      _id: it.product._id.toString?.() || it.product._id,
      title: it.product.title,
      image: it.product.image,
      category: it.product.category,
      slug: it.product.slug,
    },
  }));
  const total = computeTotal(items);
  return { items, total };
}
