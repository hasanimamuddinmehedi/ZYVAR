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
      className={`
        fixed
        bottom-6
        z-[9999]
        text-center
        transition-all
        duration-500
        ${
          show
            ? "right-5"
            : "-right-32"
        }
      `}
    >

      <a
        href="https://wa.me/8801820400999"
        target="_blank"
        rel="noreferrer"
        className="relative inline-block"
      >

        {/* Profile */}
        <div
          className="
            w-[65px]
            h-[65px]
            rounded-full
            overflow-hidden
            border-4
            border-[#25D366]
            shadow-2xl
            bg-white
            animate-bounce
          "
        >

          <img
            src="https://img.mailinblue.com/8458568/images/content_library/original/699ff6b8682ba8e2834a1593.jpeg"
            alt="Support"
            className="
              w-full
              h-full
              object-cover
            "
          />
        </div>

        {/* Badge */}
        <div
          className="
            absolute
            -top-1
            -right-1
            bg-red-500
            text-white
            w-6
            h-6
            text-xs
            font-bold
            rounded-full
            flex
            items-center
            justify-center
          "
        >
          1
        </div>

        {/* Tooltip */}
        <div
          className="
            absolute
            right-20
            bottom-5
            bg-[#222]
            text-white
            px-3
            py-2
            rounded-lg
            text-xs
            whitespace-nowrap
            opacity-0
            hover:opacity-100
            transition
          "
        >
          Chat with us
        </div>

        {/* Text */}
        <p
          className="
            mt-2
            text-sm
            font-semibold
            text-[#25D366]
          "
        >
          Chat with us
        </p>

      </a>
    </div>
  );
}