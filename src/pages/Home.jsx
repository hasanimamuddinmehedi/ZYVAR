import Hero from "../components/Hero";
import SEO from "../components/SEO";
import InstallAppBanner from "../components/InstallAppBanner";
import BecomePartnerCTA from "../components/BecomePartnerCTA";
import ProductCollage from "../components/ProductCollage";
import ShopByCategory from "../components/ShopByCategory";
import Categories from "../components/Categories";
import FeaturedProducts from "../components/FeaturedProducts";
import BrandBanner from "../components/BrandBanner";
import Testimonials from "../components/Testimonials";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import WhatsAppSupport from "../components/WhatsAppSupport";
import BeautyGuidance from "../components/BeautyGuidance";
import useProductCatalog from "../hooks/useProductCatalog";

export default function Home() {
  const { products, loading: productsLoading } = useProductCatalog();

  return (
    <main className="home-page">
      <SEO
        title="ZYVAR"
        description="Shop premium skincare, watches, perfumes, fashion, imported foods and lifestyle products from ZYVAR."
        image="https://res.cloudinary.com/dhppdatrl/image/upload/v1779428106/gn6qmcgvjwbgnfhmsbrf.png"
      />
      <Hero />
      <InstallAppBanner />
      <BecomePartnerCTA />
      <BeautyGuidance />
      <ProductCollage />
      <ShopByCategory products={products} loading={productsLoading} />
      <Categories products={products} loading={productsLoading} />
      <FeaturedProducts products={products} loading={productsLoading} />
      <BrandBanner />
      <Testimonials />
      <Newsletter />
      <Footer />
      <WhatsAppSupport />
    </main>
  );
}