import { useEffect, useState }
from "react";

export default function WhatsAppSupport() {

  const [show, setShow] =
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

  return (

    <div
      className={`fixed bottom-6 z-[9999] transition-all duration-500 ${
        show ? "right-5" : "-right-20"
      }`}
    >
      <a
        href="https://wa.me/8801820400999"
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with Zyvar support on WhatsApp"
        title="Chat with Zyvar support on WhatsApp"
        className="block h-[65px] w-[65px] overflow-hidden rounded-full border-4 border-[#25D366] bg-white shadow-2xl"
      >
        <img
          src="https://img.mailinblue.com/8458568/images/content_library/original/699ff6b8682ba8e2834a1593.jpeg"
          alt=""
          className="h-full w-full object-cover"
        />
      </a>
    </div>
  );
}