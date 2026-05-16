import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  FaFacebookF,
  FaInstagram,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

export default function Contact() {

  return (

    <div className="bg-[#0B0B0B] text-white min-h-screen">

      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 lg:px-10">

        <div className="max-w-5xl mx-auto text-center">

          <p className="uppercase tracking-[0.3em] text-[#C6922B] text-sm mb-5">
            Contact Us
          </p>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight mb-8">

            Let’s Connect
            <span className="block text-[#C6922B]">
              With ZYVAR
            </span>

          </h1>

          <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto">

            Need help finding products or placing orders?
            Contact us anytime through social media, email or phone.

          </p>

        </div>

      </section>

      {/* CONTACT CARDS */}
      <section className="px-6 lg:px-10 pb-24">

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 xl:grid-cols-4 gap-8">

          {/* FACEBOOK */}
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 hover:border-[#C6922B] transition duration-300">

            <div className="w-16 h-16 rounded-2xl bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2] text-3xl mb-8">

              <FaFacebookF />

            </div>

            <h2 className="text-2xl font-bold mb-4 text-[#C6922B]">
              Facebook
            </h2>

            <p className="text-gray-300 mb-6">
              Follow our official Facebook page.
            </p>

            <a
              href="https://www.facebook.com/zyvar.shop"
              target="_blank"
              rel="noreferrer"

              className="inline-block px-6 py-4 rounded-2xl bg-[#C6922B] text-black font-bold hover:scale-105 transition duration-300"
            >

              Visit Facebook

            </a>

          </div>

          {/* INSTAGRAM */}
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 hover:border-[#C6922B] transition duration-300">

            <div className="w-16 h-16 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 text-3xl mb-8">

              <FaInstagram />

            </div>

            <h2 className="text-2xl font-bold mb-4 text-[#C6922B]">
              Instagram
            </h2>

            <p className="text-gray-300 mb-6">
              Explore our premium collections.
            </p>

            <a
              href="https://www.instagram.com/zyvar.shop"
              target="_blank"
              rel="noreferrer"

              className="inline-block px-6 py-4 rounded-2xl bg-[#C6922B] text-black font-bold hover:scale-105 transition duration-300"
            >

              Visit Instagram

            </a>

          </div>

          {/* EMAIL */}
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 hover:border-[#C6922B] transition duration-300">

            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 text-3xl mb-8">

              <FaEnvelope />

            </div>

            <h2 className="text-2xl font-bold mb-4 text-[#C6922B]">
              Email
            </h2>

            <p className="text-gray-300 mb-6 break-all">
              hello.zyvar@gmail.com
            </p>

            <a
              href="mailto:hello.zyvar@gmail.com"

              className="inline-block px-6 py-4 rounded-2xl bg-[#C6922B] text-black font-bold hover:scale-105 transition duration-300"
            >

              Send Email

            </a>

          </div>

          {/* PHONE */}
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 hover:border-[#C6922B] transition duration-300">

            <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 text-3xl mb-8">

              <FaPhoneAlt />

            </div>

            <h2 className="text-2xl font-bold mb-4 text-[#C6922B]">
              Phone
            </h2>

            <p className="text-gray-300 mb-6">
              01820400999
            </p>

            <a
              href="tel:01820400999"

              className="inline-block px-6 py-4 rounded-2xl bg-[#C6922B] text-black font-bold hover:scale-105 transition duration-300"
            >

              Call Now

            </a>

          </div>

        </div>

        {/* LOCATION */}
        {/* LOCATION */}
<div className="max-w-7xl mx-auto mt-10">

  <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 flex items-start gap-6 hover:border-[#C6922B] transition duration-300">

    <div className="w-16 h-16 rounded-2xl bg-[#C6922B]/10 flex items-center justify-center text-[#C6922B] text-3xl">

      <FaMapMarkerAlt />

    </div>

    <div className="flex-1">

      <h2 className="text-2xl font-bold mb-4 text-[#C6922B]">
        Store Location
      </h2>

      <p className="text-gray-300 leading-relaxed mb-6">

        Chowdhury Market,
        Bandarban Sadar,
        Bandarban,
        Bangladesh

      </p>

      <a
        href="https://maps.app.goo.gl/9nDvnjre4iKH2kYy5"

        target="_blank"
        rel="noreferrer"

        className="inline-block px-6 py-4 rounded-2xl bg-[#C6922B] text-black font-bold hover:scale-105 transition duration-300"
      >

        Open In Google Maps

      </a>

    </div>

  </div>

</div>

      </section>

      <Footer />

    </div>
  );
}