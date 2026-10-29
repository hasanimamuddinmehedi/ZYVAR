import { useEffect, useState }
from "react";
import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppSupport() {

  const [show, setShow] =
    useState(false);

  const [publicMenuOpen, setPublicMenuOpen] =
    useState(false);

  useEffect(() => {

    const handleScroll =
      () => {

        if (
          window.scrollY > 200
        ) {

          setShow(true);

        } else {

          setShow(false);
        }
      };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () => {

      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };

  }, []);

  useEffect(() => {
    const handlePublicMenu = (event) => {
      setPublicMenuOpen(Boolean(event.detail?.open));
    };

    window.addEventListener("zyvar:public-menu", handlePublicMenu);
    return () => window.removeEventListener("zyvar:public-menu", handlePublicMenu);
  }, []);

  if (publicMenuOpen) return null;

  return (

    <div
      className={`fixed bottom-6 right-5 z-[9999] transition-all duration-500 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <a
        href="https://wa.me/8801820400999"
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with Zyvar support on WhatsApp"
        title="Chat with Zyvar support on WhatsApp"
        className="whatsapp-support glass-surface grid h-[58px] w-[58px] place-items-center rounded-full border border-[#25D366]/50 bg-[#0B0B0B]/75 text-white shadow-xl backdrop-blur-2xl transition hover:scale-105 hover:border-[#25D366]"
      >
        <span className="whatsapp-support__icon"><FaWhatsapp aria-hidden="true" /></span>
      </a>
    </div>
  );
}