import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import Collections from "@/components/Collections";
import StyleSection from "@/components/StyleSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
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
