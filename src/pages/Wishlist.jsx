import {
  useWishlist,
} from "../context/WishlistContext";

import { useCart } from "../context/CartContext";

export default function Wishlist() {

  const {
    wishlistItems,
    removeFromWishlist,
  } = useWishlist();

  const { addToCart } = useCart();

  return (

    <div className="min-h-screen bg-[#0B0B0B] text-white p-6 lg:p-10">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-14">

          <p className="uppercase tracking-[0.3em] text-[#D4AF37] text-sm mb-4">
            Luxury Favorites
          </p>

          <h1 className="text-5xl font-black">
            Wishlist
          </h1>
        </div>

        {/* EMPTY */}
        {wishlistItems.length === 0 ? (

          <div className="rounded-[40px] border border-white/10 bg-white/5 p-20 text-center">

            <h2 className="text-4xl font-black mb-5">
              Wishlist is Empty
            </h2>

            <p className="text-gray-400">
              Save your favorite luxury products.
            </p>
          </div>

        ) : (

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">

            {wishlistItems.map((product) => (

              <div
                key={product.id}
                className="rounded-[32px] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl"
              >

                {/* IMAGE */}
                <div className="relative">

                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-80 w-full object-cover"
                  />

                  <div className="absolute top-5 left-5 px-4 py-2 rounded-full bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-widest">
                    {product.category}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-7">

                  <h3 className="text-2xl font-bold mb-3">
                    {product.name}
                  </h3>

                  <p className="text-gray-400 mb-6">
                    Premium imported collection.
                  </p>

                  <div className="flex justify-between items-center mb-6">

                    <h4 className="text-3xl font-black text-[#D4AF37]">
                      ৳{product.price}
                    </h4>

                    <button
                      onClick={() =>
                        removeFromWishlist(
                          product.id
                        )
                      }
                      className="w-12 h-12 rounded-xl bg-red-500 text-white"
                    >
                      ❤
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      addToCart(product)
                    }
                    className="w-full py-4 rounded-2xl bg-[#D4AF37] text-black font-black"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}