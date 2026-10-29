export default function productImage(product) {
  const candidate =
    (Array.isArray(product?.images) ? product.images[0] : product?.images) ||
    product?.imageUrl ||
    product?.image ||
    product?.thumbnail;

  if (typeof candidate === "string") return candidate;
  return candidate?.url || candidate?.secure_url || candidate?.src || "";
}
