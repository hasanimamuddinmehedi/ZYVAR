import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";

import {
  useParams,
  Link,
} from "react-router-dom";

import {
  db,
} from "../firebase/firebase";

import {
  useCart,
} from "../context/CartContext";

import ProductReviews from "../components/ProductReviews";

import SEO from "../components/SEO";

import {
  trackEvent,
} from "../utils/analytics";

import {
  LazyLoadImage,
} from "react-lazy-load-image-component";

import {
  useWishlist,
} from "../context/WishlistContext";

import {
  successAlert,
  errorAlert,
} from "../utils/alerts";

// SLUG UTILITY — must match exactly how slugs are generated everywhere else
const toSlug = (name = "") =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

export default function ProductDetails() {

  const { id } =
    useParams();

  const { addToCart } =
    useCart();

  const { addToWishlist } =
    useWishlist();

  const [product,
    setProduct] =
    useState(null);

  const [loading,
    setLoading] =
    useState(true);

  // IMAGE ZOOM STATE
  const [zoomOpen,
    setZoomOpen] =
    useState(false);

  const [zoomPos,
    setZoomPos] =
    useState({ x: 50, y: 50 });

  // PRODUCT IMAGES SLIDER STATE
  const [activeImage,
    setActiveImage] =
    useState(0);

  // FETCH PRODUCT
  useEffect(() => {

    if (id) {
      fetchProduct();
    }

  }, [id]);

  const fetchProduct =
    async () => {

      try {

        setLoading(true);

        // STEP 1 — TRY FETCHING BY slug FIELD
        const slugQuery =
          query(
            collection(db, "products"),
            where("slug", "==", id)
          );

        const slugSnapshot =
          await getDocs(slugQuery);

        if (!slugSnapshot.empty) {

          const docItem =
            slugSnapshot.docs[0];

          setProduct({
            id: docItem.id,
            quantity: 1,
            ...docItem.data(),
          });

          trackEvent("Product", "View Product", docItem.data().name);

          return;
        }

        // STEP 2 — FETCH ALL PRODUCTS AND MATCH BY GENERATED SLUG FROM NAME
        // Handles existing products that don't have a slug field yet
        const allSnapshot =
          await getDocs(
            collection(db, "products")
          );

        const matched =
          allSnapshot.docs.find(
            (docItem) =>
              toSlug(
                docItem.data().name || ""
              ) === id
          );

        if (matched) {

          setProduct({
            id: matched.id,
            quantity: 1,
            ...matched.data(),
          });

          trackEvent("Product", "View Product", matched.data().name);

          return;
        }

        // STEP 3 — FALLBACK: TRY AS FIRESTORE DOC ID
        // Handles old bookmarked links that used the raw doc ID
        try {

          const docRef =
            doc(db, "products", id);

          const docSnap =
            await getDoc(docRef);

          if (docSnap.exists()) {

            setProduct({
              id: docSnap.id,
              quantity: 1,
              ...docSnap.data(),
            });

            trackEvent("Product", "View Product", docSnap.data().name);

            return;
          }

        } catch (err) {

          // Invalid doc ID format — safe to ignore, fall through to null
          console.log("Doc ID lookup failed:", err.message);
        }

        // NOTHING FOUND
        setProduct(null);

      } catch (error) {

        console.log(error);

        setProduct(null);

      } finally {

        setLoading(false);
      }
    };

  // RESET ACTIVE IMAGE WHENEVER A NEW PRODUCT LOADS
  useEffect(() => {

    setActiveImage(0);

  }, [product?.id]);

  // AUTO SLIDING IMAGES — advances every 3 seconds
  useEffect(() => {

    if (
      !product?.images?.length
    ) return;

    const interval =
      setInterval(() => {

        setActiveImage(
          (prev) =>

            (
              prev + 1
            ) %

            product.images.length
        );

      }, 3000);

    return () =>
      clearInterval(
        interval
      );

  }, [product]);

  // CURRENT IMAGE TO DISPLAY — supports new images[] array with fallback to old single image field
  const currentImage =
    product?.images?.[activeImage] ||
    product?.image;

  // IMAGE ZOOM — track mouse position
  const handleMouseMove =
    (e) => {

      const rect =
        e.currentTarget.getBoundingClientRect();

      const x =
        ((e.clientX - rect.left) /
          rect.width) *
        100;

      const y =
        ((e.clientY - rect.top) /
          rect.height) *
        100;

      setZoomPos({ x, y });
    };

  // LOADING
  if (loading) {

    return (

      <div className="min-h-screen bg-black flex items-center justify-center">

        <div className="w-16 h-16 border-4 border-[#C6922B] border-t-transparent rounded-full animate-spin" />

      </div>
    );
  }

  // NO PRODUCT
  if (!product) {

    return (

      <div className="min-h-screen bg-black text-white flex items-center justify-center text-3xl font-bold">

        Product Not Found

      </div>
    );
  }

  return (

    <div className="min-h-screen bg-[#0B0B0B] text-white px-6 lg:px-12 py-20">

      <SEO

        title={product?.name}

        description={
          product?.description
        }

        image={
          product?.images?.[0] ||
          product?.image
        }

      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

        {/* IMAGE WITH ZOOM */}
        <div>

          <div
            className="
              relative
              overflow-hidden
              rounded-[40px]
              border
              border-white/10
              shadow-2xl
              cursor-zoom-in
            "
            onMouseMove={
              handleMouseMove
            }
            onMouseEnter={() =>
              setZoomOpen(true)
            }
            onMouseLeave={() =>
              setZoomOpen(false)
            }
          >

            <LazyLoadImage

              src={currentImage}

              alt={product?.name}

              className="
                w-full
                h-[500px]
                object-cover
                rounded-3xl
              "

            />

            {/* ZOOM LENS OVERLAY */}
            {
              zoomOpen && (

                <div
                  className="
                    absolute
                    inset-0
                    pointer-events-none
                  "
                  style={{
                    backgroundImage:
                      `url(${currentImage})`,
                    backgroundSize:
                      "250%",
                    backgroundPosition:
                      `${zoomPos.x}% ${zoomPos.y}%`,
                    backgroundRepeat:
                      "no-repeat",
                  }}
                />
              )
            }

          </div>

          {/* ZOOM HINT */}
          <p className="mt-4 text-center text-gray-500 text-sm">

            Hover over image to zoom

          </p>

          {/* THUMBNAIL SLIDER */}
          {
            product.images?.length > 1 && (

              <div className="flex gap-3 mt-4">

                {product.images?.map(
                  (img, index) => (

                    <img
                      key={index}
                      src={img}
                      alt=""
                      onClick={() =>
                        setActiveImage(
                          index
                        )
                      }
                      className={`
                        w-20 h-20
                        object-cover
                        rounded-xl
                        cursor-pointer
                        border

                        ${
                          activeImage === index

                          ? "border-[#C6922B]"

                          : "border-white/10"
                        }
                      `}
                    />

                  )
                )}

              </div>
            )
          }

        </div>

        {/* CONTENT */}
        <div>

          <p className="uppercase tracking-[0.3em] text-[#C6922B] text-sm mb-5">

            {product?.category}

          </p>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-8">

            {product?.name}

          </h1>

          {/* PARTNER / UPLOADER LINK */}
          {product?.partnerSlug && (

            <Link
              to={`/${product.partnerSlug}`}
              className="
                text-[#C6922B]
                font-semibold
                hover:underline
                block
                mb-6
              "
            >
              Products From {product.uploadedBy}
            </Link>
          )}

          <p className="text-gray-300 text-lg leading-relaxed mb-10">

            {product?.description}

          </p>

          <div className="flex flex-wrap items-center gap-8 mb-10">

            <div>

              <p className="text-gray-400 text-sm mb-2">

                Price

              </p>

              <h2 className="text-5xl font-black text-[#C6922B]">

                ৳{product?.price}

              </h2>

            </div>

            <div>

              <p className="text-gray-400 text-sm mb-2">

                Stock

              </p>

              <h2 className="text-4xl font-black">

                {product?.stock}

              </h2>

            </div>

          </div>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-5">

            <button

              onClick={async () => {

                addToCart(product);

                await successAlert(
                  "Added To Cart!",
                  `${product.name} has been added to your cart.`
                );
              }}

              className="px-10 py-5 rounded-2xl bg-[#C6922B] text-black font-black hover:scale-105 transition"
            >

              Add To Cart

            </button>

            <button

              onClick={async () => {

                try {

                  addToWishlist(product);

                  await successAlert(
                    "Added To Wishlist!",
                    `${product.name} has been added to your wishlist.`
                  );

                } catch (error) {

                  await errorAlert(
                    "Failed",
                    error.message
                  );
                }
              }}

              className="px-10 py-5 rounded-2xl border border-white/10 bg-white/5 hover:border-[#C6922B] hover:text-[#C6922B] transition"
            >

              Wishlist

            </button>

          </div>

        </div>

      </div>

      {/* REVIEWS */}
      <div className="max-w-7xl mx-auto mt-20">

        <ProductReviews
          productId={product?.id}
        />

      </div>

    </div>
  );
}