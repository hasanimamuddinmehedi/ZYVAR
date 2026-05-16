import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Categories() {

  const navigate = useNavigate();

  const categories = [

    {
      name: "Skincare",
      image:
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=1200&auto=format&fit=crop",
    },

    {
      name: "Perfume",
      image:
        "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1200&auto=format&fit=crop",
    },

    {
      name: "Watches",
      image:
        "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1200&auto=format&fit=crop",
    },

    {
      name: "Fashion",
      image:
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop",
    },

  ];

  return (

    <section className="py-24 px-6 lg:px-10 bg-[#0B0B0B] text-white relative overflow-hidden">

      {/* Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[#C6922B]/10 blur-[120px]" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <motion.div

          initial={{
            opacity: 0,
            y: 40,
          }}

          whileInView={{
            opacity: 1,
            y: 0,
          }}

          transition={{
            duration: 0.8,
          }}

          viewport={{
            once: true,
          }}

          className="text-center mb-20"
        >

          <p className="uppercase tracking-[0.3em] text-[#C6922B] text-sm mb-5">

            Shop By Category

          </p>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black  leading-tight">

            Explore Our
            <span className="block text-[#C6922B]">

              Luxury Collections

            </span>

          </h2>

        </motion.div>

        {/* Categories Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {categories.map((category, index) => (

            <motion.div

              key={index}

              initial={{
                opacity: 0,
                y: 50,
              }}

              whileInView={{
                opacity: 1,
                y: 0,
              }}

              transition={{
                duration: 0.8,
                delay: index * 0.2,
              }}

              viewport={{
                once: true,
              }}

              onClick={() =>
                navigate("/products")
              }

              className="
                group
                cursor-pointer
                relative
                overflow-hidden
                rounded-[32px]
                border border-white/10
                bg-white/5
                backdrop-blur-xl
                hover:border-[#C6922B]
                transition
                duration-500
              "
            >

              {/* Image */}
              <div className="overflow-hidden">

                <img
                  src={category.image}
                  alt={category.name}

                  className="
                    h-80
                    w-full
                    object-cover
                    group-hover:scale-110
                    transition
                    duration-700
                  "
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 p-8">

                <h3 className="text-3xl font-black  mb-3">

                  {category.name}

                </h3>

                <button className="px-6 py-3 rounded-2xl bg-[#C6922B] text-black font-bold hover:scale-105 transition">

                  Explore Now

                </button>

              </div>

            </motion.div>

          ))}

        </div>

      </div>

    </section>
  );
}