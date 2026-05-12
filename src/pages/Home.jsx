import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import FeaturedProducts from "../components/FeaturedProducts";
import BrandBanner from "../components/BrandBanner";
import Testimonials from "../components/Testimonials";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import WhatsAppSupport from "../components/WhatsAppSupport";

export default function Home() {
  return (
    <div className="bg-[#0B0B0B] text-white overflow-hidden">
      <SEO
        title="ZYVAR — Luxury Ecommerce Store"
        description="Shop premium skincare, watches, perfumes, fashion, imported foods and lifestyle products from ZYVAR."
        image="https://yourdomain.com/banner.jpg"
        />
      <Navbar />
      <Hero />
      <Categories />
      <FeaturedProducts />
      <BrandBanner />
      <Testimonials />
      <Newsletter />
      <Footer />
      <WhatsAppSupport />
    </div>
  );
}