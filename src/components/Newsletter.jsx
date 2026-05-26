import {
  useState,
} from "react";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  db,
} from "../firebase/firebase";

export default function Newsletter() {

  const [
    newsletterEmail,
    setNewsletterEmail,
  ] = useState("");

  const handleNewsletterSubscribe =
    async () => {

      if (!newsletterEmail) {

        return alert(
          "Please enter your email."
        );
      }

      try {

        await addDoc(

          collection(
            db,
            "newsletterSubscribers"
          ),

          {

            email:
              newsletterEmail,

            createdAt:
              serverTimestamp(),
          }
        );

        await fetch(
          "https://zyvar-email-server.onrender.com/send-newsletter-welcome",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email:
                newsletterEmail,
            }),
          }
        );

        alert(
          "Subscribed Successfully!"
        );

        setNewsletterEmail("");

      } catch (error) {

        console.log(error);

        alert(
          error.message
        );
      }
    };

  return (

    <section className="px-4 sm:px-6 lg:px-10 py-24">

      <div className="max-w-4xl mx-auto text-center">

        <p className="uppercase tracking-[0.3em] text-[#C6922B] text-sm mb-5">
          Newsletter
        </p>

        <h2 className="text-4xl md:text-6xl font-black mb-8">
          Stay Updated
        </h2>

        <p className="text-gray-400 text-lg mb-10">
          Get updates about premium arrivals, offers and exclusive collections.
        </p>

        <div className="flex flex-col md:flex-row gap-5">

          <input
            type="email"
            value={newsletterEmail}

            onChange={(e) =>
              setNewsletterEmail(
                e.target.value
              )
            }

            placeholder="Enter your email"

            className="flex-1 px-6 py-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-[#C6922B]"
          />

          <button
            onClick={
              handleNewsletterSubscribe
            }

            className="px-8 py-5 rounded-2xl bg-[#C6922B] text-black font-black "
          >
            Subscribe
          </button>

        </div>

      </div>

    </section>
  );
}