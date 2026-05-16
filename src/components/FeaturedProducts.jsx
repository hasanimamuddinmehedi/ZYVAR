import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

import { useCart } from "../context/CartContext";

import { useNavigate } from "react-router-dom";

export default function FeaturedProducts() {

  const [products, setProducts] = useState([]);

  const { addToCart } = useCart();

  const navigate = useNavigate();

  useEffect(() => {

    fetchProducts();

  }, []);

  const fetchProducts = async () => {

    try {

      const querySnapshot =
        await getDocs(
          collection(db, "products")
        );

      const productList =
        querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      setProducts(productList);

    } catch (error) {

      console.log(error);
    }
  };

  return (

    <section className="py-24 px-6 lg:px-10 bg-[#0B0B0B] text-white relative overflow-hidden">

      {/* Glow */}
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full bg-[#C6922B]/10 blur-[120px]" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-16">

          <div>

            <p className="uppercase tracking-[0.3em] text-[#C6922B] text-sm mb-4">

              Trending Products

            </p>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black  leading-tight">

              Featured
              <span className="block text-[#C6922B]">

                Luxury Products

              </span>

            </h2>

          </div>

          <button

            onClick={() =>
              navigate("/products")
            }

            className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#C6922B] hover:text-[#C6922B] transition"
          >

            View All Products

          </button>

        </div>

        {/* Products */}
        {products.length === 0 ? (

          <div className="rounded-[40px] border border-white/10 bg-white/5 p-16 text-center">

            <h3 className="text-4xl font-black  mb-5">

              No Products Found

            </h3>

            <p className="text-gray-400">

              Upload products from admin dashboard.

            </p>

          </div>

        ) : (

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-8">

            {products.slice(0, 8).map((product, index) => (

              <motion.div

                key={product.id}

                initial={{
                  opacity: 0,
                  y: 40,
                }}

                whileInView={{
                  opacity: 1,
                  y: 0,
                }}

                transition={{
                  duration: 0.7,
                  delay: index * 0.1,
                }}

                viewport={{
                  once: true,
                }}

                className="
                  group
                  rounded-[32px]
                  overflow-hidden
                  border border-white/10
                  bg-white/5
                  backdrop-blur-xl
                  hover:border-[#C6922B]
                  transition
                  duration-500
                  hover:-translate-y-3
                "
              >

                {/* Image */}
                <div className="relative overflow-hidden">

                  <img
                    src={product.image}
                    alt={product.name}

                    className="
                      h-80
                      w-full
                      object-cover
                      group-hover:scale-110
                      transition
                      duration-700
                    "
                  />

                  {/* Category */}
                  <div className="absolute top-5 left-5 px-4 py-2 rounded-full bg-[#C6922B] text-black text-xs font-bold uppercase tracking-widest">

                    {product.category}

                  </div>

                </div>

                {/* Content */}
                <div className="p-7">

                  <h3 className="text-2xl font-black  mb-3">

                    {product.name}

                  </h3>

                  <p className="text-gray-400 mb-6 line-clamp-2">

                    {product.description ||
                      "Premium imported luxury collection."}

                  </p>

                  {/* Price */}
                  <div className="flex justify-between items-center mb-6">

                    <div>

                      <p className="text-gray-400 text-sm mb-1">

                        Price

                      </p>

                      <h4 className="text-3xl font-black  text-[#C6922B]">

                        ৳{product.price}

                      </h4>

                    </div>

                    <div className="text-right">

                      <p className="text-gray-400 text-sm mb-1">

                        Stock

                      </p>

                      <h4 className="text-xl font-bold">

                        {product.stock}

                      </h4>

                    </div>

                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">

                    <button

                      onClick={() =>
                        addToCart(product)
                      }

                      className="flex-1 py-4 rounded-2xl bg-[#C6922B] text-black font-black  hover:scale-[1.02] transition duration-300"
                    >

                      Add To Cart

                    </button>

                    <button

                      onClick={() =>
                        navigate(`/product/${product.id}`)
                      }

                      className="px-5 rounded-2xl border border-white/10 bg-white/5 hover:border-[#C6922B] transition"
                    >

                      View

                    </button>

                  </div>

                </div>

              </motion.div>

            ))}

          </div>

        )}

      </div>

    </section>
  );
}