import {  FaFacebookF,  FaInstagram,  FaWhatsapp, } from "react-icons/fa";
export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 sm:px-6 lg:px-10 py-10">
      <div className="flex items-center gap-4 mt-6">

  <a
    href="https://facebook.com/zyvar.shop"
    target="_blank"

    className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center hover:border-[#C6922B] hover:text-[#C6922B] transition"
  >

    <FaFacebookF />

  </a>

  <a
    href="https://instagram.com/zyvar.shop"
    target="_blank"

    className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center hover:border-[#C6922B] hover:text-[#C6922B] transition"
  >

    <FaInstagram />

  </a>

  <a
    href="https://wa.me/8801820400999"
    target="_blank"

    className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center hover:border-[#C6922B] hover:text-[#C6922B] transition"
  >

    <FaWhatsapp />

  </a>

</div>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-black  tracking-[0.3em] text-[#C6922B] mb-3">
            ZYVAR
          </h1>

          <p className="text-gray-500">
            Original Cosmetics • Family Essentials • Imported Treats
          </p>
        </div>

        {/* Social Links Temporarily Disabled */}

{/*
<div className="flex gap-6 text-gray-400">
  <button
    type="button"
    className="hover:text-[#C6922B] transition"
  >
    Facebook
  </button>

  <button
    type="button"
    className="hover:text-[#C6922B] transition"
  >
    Instagram
  </button>

  <button
    type="button"
    className="hover:text-[#C6922B] transition"
  >
    TikTok
  </button>
</div>
*/}
      </div>
    </footer>
  );
}