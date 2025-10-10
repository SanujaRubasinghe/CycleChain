import Hero from "@/components/Hero";
import FeaturedSection from "@/components/FeaturedSection";
import Testimonial from "@/components/Testimonial";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <FeaturedSection />
      <Testimonial />
      <Newsletter />
      <Footer />
    </main>
  );
}