const reviews = [
  {
    name: "Sarah",
    text: "Amazing premium product quality and fast delivery.",
  },
  {
    name: "Hasib",
    text: "Luxury shopping experience with authentic products.",
  },
  {
    name: "Mehedi",
    text: "Best ecommerce UI and premium collections.",
  },
];

export default function Testimonials() {
  return (
    <section className="px-4 sm:px-6 lg:px-10 py-20 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-14">
          <p className="uppercase tracking-[0.3em] text-[#D4AF37] text-sm mb-4">
            Testimonials
          </p>

          <h2 className="text-4xl md:text-5xl font-black">
            What Customers Say
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="rounded-[32px] border border-white/10 bg-white/5 p-10"
            >
              <h3 className="text-2xl font-black mb-5 text-[#D4AF37]">
                {review.name}
              </h3>

              <p className="text-gray-300 leading-relaxed">
                {review.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}