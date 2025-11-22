import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import Collections from "@/components/Collections";
import StyleSection from "@/components/StyleSection";
import Footer from "@/components/Footer";
import Background3D from "@/components/Background3D";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <Background3D />
      <Header />
      <main className="pt-20">
        <Hero />
        <FeaturedProducts />
        <Collections />
        <StyleSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
