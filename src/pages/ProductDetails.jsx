import { useEffect, useState } from "react";
import {  doc,  getDoc, } from "firebase/firestore";
import {  useParams, } from "react-router-dom";
import {  db, } from "../firebase/firebase";
import { useCart } from "../context/CartContext";
import ProductReviews from "../components/ProductReviews";
import SEO from "../components/SEO";
import {  trackEvent, } from "../utils/analytics";
import { LazyLoadImage } from "react-lazy-load-image-component";

export default function ProductDetails() {

  const { id } =
    useParams();

  const { addToCart } =
    useCart();

  const [product,
    setProduct] =
    useState(null);

  const [loading,
    setLoading] =
    useState(true);

  // FETCH PRODUCT
  useEffect(() => {

    fetchProduct();

  }, [id]);

  const fetchProduct =
    async () => {

      try {

        const docRef =
          doc(
            db,
            "products",
            id
          );

        const docSnap =
          await getDoc(
            docRef
          );

        if (
          docSnap.exists()
        ) {

          setProduct({

            id:
              docSnap.id,

            ...docSnap.data(),
          });
        }
        trackEvent(
            "Product",
              "View Product",
                product.name
              );

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);
      }
    };

  // LOADING
  if (loading) {

    return (

      <div className="min-h-screen bg-black flex items-center justify-center">

        <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />

      </div>
    );
  }

  // NO PRODUCT
  if (!product) {

    return (

      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        Product Not Found

      </div>
    );
  }

  return (

    <div className="min-h-screen bg-[#0B0B0B] text-white px-6 lg:px-12 py-20">

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

        {/* IMAGE */}
        <div>

          <SEO
          
          title={product.name}
          
          description={
                product.description
                }
                
                image={product.image}
                
          />

          <LazyLoadImage
            src={product.image}
              //effect="blur"

            alt={product.name}

            className="w-full rounded-[40px] object-cover border border-white/10"
          />

        </div>

        {/* CONTENT */}
        <div>

          <p className="uppercase tracking-[0.3em] text-[#D4AF37] text-sm mb-5">

            {product.category}

          </p>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-8">

            {product.name}

          </h1>

          <p className="text-gray-300 text-lg leading-relaxed mb-10">

            {product.description}

          </p>

          <div className="flex flex-wrap items-center gap-8 mb-10">

            <div>

              <p className="text-gray-400 text-sm mb-2">

                Price

              </p>

              <h2 className="text-5xl font-black text-[#D4AF37]">

                ৳{product.price}

              </h2>

            </div>

            <div>

              <p className="text-gray-400 text-sm mb-2">

                Stock

              </p>

              <h2 className="text-4xl font-black">

                {product.stock}

              </h2>

            </div>

          </div>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-5">

            <button

              onClick={() =>
                addToCart(
                  product
                )
              }

              className="px-10 py-5 rounded-2xl bg-[#D4AF37] text-black font-black hover:scale-105 transition"
            >

              Add To Cart

            </button>

            <button className="px-10 py-5 rounded-2xl border border-white/10 bg-white/5">

              Wishlist

            </button>

          </div>

        </div>
      </div>

      {/* REVIEWS */}
      <div className="max-w-7xl mx-auto">

        <ProductReviews
          productId={product.id}
        />

      </div>

    </div>
  );
}