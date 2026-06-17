import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import {
  FaFacebook,
  FaInstagram,
  FaPhone,
  FaMapMarkerAlt,
  FaStar,
} from "react-icons/fa";

import { db } from "../firebase/firebase";

export default function PartnerStorePage() {

  const {
    partnerSlug,
  } = useParams();

  const [
    partner,
    setPartner,
  ] = useState(null);

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {

    fetchPartner();

  }, [partnerSlug]);

  const fetchPartner = async () => {

    try {

      setLoading(true);

      const partnerQuery =
        query(
          collection(
            db,
            "partners"
          ),
          where(
            "slug",
            "==",
            partnerSlug
          )
        );

      const partnerSnapshot =
        await getDocs(
          partnerQuery
        );

      if (
        partnerSnapshot.empty
      ) {
        setLoading(false);
        return;
      }

      const partnerData =
        {
          id:
            partnerSnapshot.docs[0]
              .id,

          ...partnerSnapshot.docs[0]
            .data(),
        };

      setPartner(
        partnerData
      );

      const productQuery =
        query(
          collection(
            db,
            "products"
          ),
          where(
            "partnerSlug",
            "==",
            partnerSlug
          )
        );

      const productSnapshot =
        await getDocs(
          productQuery
        );

      const productData =
        productSnapshot.docs.map(
          (docItem) => ({
            id:
              docItem.id,

            ...docItem.data(),
          })
        );

      setProducts(
        productData
      );

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  if (loading) {

    return (

      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        Loading Store...

      </div>
    );
  }

  if (!partner) {

    return (

      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        Store Not Found

      </div>
    );
  }

  return (

    <div className="min-h-screen bg-black text-white">

      {/* HERO */}

      <div className="relative">

        <div className="h-[320px] bg-gradient-to-r from-[#C6922B] to-black" />

        <div className="max-w-7xl mx-auto px-6">

          <div className="-mt-24">

            <img
              src={
                partner.logo
              }
              alt={
                partner.shopName
              }
              className="
              w-44
              h-44
              rounded-3xl
              object-cover
              border-4
              border-black
            "
            />

            <div className="mt-6">

              <h1 className="text-5xl font-black">

                {
                  partner.shopName
                }

              </h1>

              <p className="text-gray-300 mt-3 max-w-3xl">

                {
                  partner.description
                }

              </p>

              <div className="flex flex-wrap gap-6 mt-6 text-sm">

                {
                  partner.phone && (

                    <div className="flex items-center gap-2">

                      <FaPhone />

                      {
                        partner.phone
                      }

                    </div>
                  )
                }

                {
                  partner.address && (

                    <div className="flex items-center gap-2">

                      <FaMapMarkerAlt />

                      {
                        partner.address
                      }

                    </div>
                  )
                }

                <div className="flex items-center gap-2">

                  <FaStar />

                  {
                    partner.rating || 0
                  }

                  / 5

                </div>

              </div>

              <div className="flex gap-4 mt-6">

                {
                  partner.facebook && (

                    <a
                      href={
                        partner.facebook
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FaFacebook className="text-3xl text-[#C6922B]" />
                    </a>
                  )
                }

                {
                  partner.instagram && (

                    <a
                      href={
                        partner.instagram
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FaInstagram className="text-3xl text-[#C6922B]" />
                    </a>
                  )
                }

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* STATS */}

      <div className="max-w-7xl mx-auto px-6 mt-14">

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-white/5 rounded-3xl p-8">

            <h3 className="text-gray-400">

              Products

            </h3>

            <p className="text-4xl font-black text-[#C6922B]">

              {
                products.length
              }

            </p>

          </div>

          <div className="bg-white/5 rounded-3xl p-8">

            <h3 className="text-gray-400">

              Total Reviews

            </h3>

            <p className="text-4xl font-black text-[#C6922B]">

              {
                partner.totalReviews || 0
              }

            </p>

          </div>

          <div className="bg-white/5 rounded-3xl p-8">

            <h3 className="text-gray-400">

              Total Sales

            </h3>

            <p className="text-4xl font-black text-[#C6922B]">

              {
                partner.totalSales || 0
              }

            </p>

          </div>

        </div>

      </div>

      {/* PRODUCTS */}

      <div className="max-w-7xl mx-auto px-6 py-20">

        <h2 className="text-4xl font-black mb-10">

          Products From

          <span className="text-[#C6922B]">

            {" "}
            {
              partner.shopName
            }

          </span>

        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {
            products.map(
              (
                product
              ) => (

                <div
                  key={
                    product.id
                  }
                  className="
                  bg-white/5
                  rounded-3xl
                  overflow-hidden
                "
                >

                  <img
                    src={
                      product.image
                    }
                    alt={
                      product.name
                    }
                    className="
                    w-full
                    h-64
                    object-cover
                  "
                  />

                  <div className="p-6">

                    <h3 className="font-bold text-lg">

                      {
                        product.name
                      }

                    </h3>

                    <p className="text-[#C6922B] font-black text-2xl mt-3">

                      ৳
                      {
                        product.price
                      }

                    </p>

                  </div>

                </div>
              )
            )
          }

        </div>

      </div>

    </div>
  );
}