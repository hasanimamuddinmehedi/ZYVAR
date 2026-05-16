import { useEffect, useState }
from "react";

import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase/firebase";

export default function ProductReviews({

  productId,

}) {

  const [reviews,
    setReviews] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  const [comment,
    setComment] =
    useState("");

  const [rating,
    setRating] =
    useState(5);

  // FETCH REVIEWS
  useEffect(() => {

    fetchReviews();

  }, [productId]);

  const fetchReviews =
    async () => {

      try {

        const q =
          query(

            collection(
              db,
              "reviews"
            ),

            where(
              "productId",
              "==",
              productId
            )
          );

        const snapshot =
          await getDocs(q);

        const reviewList =
          snapshot.docs.map(

            (doc) => ({

              id:
                doc.id,

              ...doc.data(),
            })
          );

        setReviews(
          reviewList
        );

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);
      }
    };

  // SUBMIT REVIEW
  const handleReview =
    async (e) => {

      e.preventDefault();

      try {

        if (!auth.currentUser) {

          alert(
            "Please login first"
          );

          return;
        }

        await addDoc(

          collection(
            db,
            "reviews"
          ),

          {

            productId,

            userId:
              auth.currentUser.uid,

            userName:
              auth.currentUser.displayName ||
              "User",

            userEmail:
              auth.currentUser.email,

            rating,

            comment,

            createdAt:
              new Date(),
          }
        );

        alert(
          "Review Added"
        );

        setComment("");

        setRating(5);

        fetchReviews();

      } catch (error) {

        console.log(error);

        alert(
          "Failed To Add Review"
        );
      }
    };

  // AVERAGE RATING
  const averageRating =
    reviews.length > 0

      ? (
          reviews.reduce(

            (acc, item) =>

              acc +
              item.rating,

            0
          ) / reviews.length
        ).toFixed(1)

      : 0;

  return (

    <section className="mt-20">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">

        <div>

          <p className="uppercase tracking-[0.3em] text-[#C6922B] text-sm mb-4">

            Customer Feedback

          </p>

          <h2 className="text-5xl font-black ">

            Product Reviews

          </h2>

        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-5">

          <p className="text-gray-400 text-sm mb-2">

            Average Rating

          </p>

          <h3 className="text-4xl font-black  text-[#C6922B]">

            ⭐ {averageRating}

          </h3>

        </div>

      </div>

      {/* REVIEW FORM */}
      <div className="rounded-[35px] border border-white/10 bg-white/5 p-8 mb-10">

        <h3 className="text-3xl font-black  mb-8">

          Write A Review

        </h3>

        <form
          onSubmit={handleReview}
          className="space-y-6"
        >

          {/* RATING */}
          <div>

            <label className="block mb-3 text-gray-400 uppercase tracking-widest text-sm">

              Rating

            </label>

            <select

              value={rating}

              onChange={(e) =>
                setRating(
                  Number(
                    e.target.value
                  )
                )
              }

              className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10"
            >

              <option value={5}>
                ⭐⭐⭐⭐⭐
              </option>

              <option value={4}>
                ⭐⭐⭐⭐
              </option>

              <option value={3}>
                ⭐⭐⭐
              </option>

              <option value={2}>
                ⭐⭐
              </option>

              <option value={1}>
                ⭐
              </option>

            </select>

          </div>

          {/* COMMENT */}
          <div>

            <label className="block mb-3 text-gray-400 uppercase tracking-widest text-sm">

              Comment

            </label>

            <textarea

              rows="5"

              required

              value={comment}

              onChange={(e) =>
                setComment(
                  e.target.value
                )
              }

              placeholder="Write your experience..."

              className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10"
            />

          </div>

          <button

            type="submit"

            className="px-8 py-5 rounded-2xl bg-[#C6922B] text-black font-black "
          >

            Submit Review

          </button>

        </form>

      </div>

      {/* REVIEWS */}
      {loading ? (

        <div className="flex justify-center py-20">

          <div className="w-16 h-16 border-4 border-[#C6922B] border-t-transparent rounded-full animate-spin" />

        </div>

      ) : reviews.length === 0 ? (

        <div className="rounded-[35px] border border-white/10 bg-white/5 p-16 text-center">

          <h3 className="text-3xl font-black  mb-4">

            No Reviews Yet

          </h3>

          <p className="text-gray-400">

            Be the first customer to review this product.

          </p>

        </div>

      ) : (

        <div className="space-y-6">

          {reviews.map((review) => (

            <div

              key={review.id}

              className="rounded-[35px] border border-white/10 bg-white/5 p-8"
            >

              <div className="flex justify-between items-start mb-5">

                <div>

                  <h4 className="text-2xl font-black  mb-2">

                    {review.userName}

                  </h4>

                  <p className="text-gray-400">

                    {review.userEmail}

                  </p>

                </div>

                <div className="text-2xl">

                  {"⭐".repeat(
                    review.rating
                  )}

                </div>

              </div>

              <p className="text-gray-300 leading-relaxed">

                {review.comment}

              </p>

            </div>
          ))}

        </div>
      )}
    </section>
  );
}