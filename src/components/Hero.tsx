import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

const slides = [
  {
    title: "Autenticidade em Cada Detalhe",
    subtitle: "Estilo urbano elevado ao próximo nível",
    cta: "Ver Coleção",
  },
  {
    title: "Nova Coleção 2026",
    subtitle: "Streetwear premium com identidade autêntica",
    cta: "Explorar Agora",
  },
  {
    title: "Lançamento Exclusivo",
    subtitle: "Peças limitadas para quem tem estilo",
    cta: "Comprar Agora",
  },
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative h-[70vh] md:h-[80vh] bg-gradient-to-br from-background via-secondary to-background overflow-hidden">
      <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center opacity-40 blur-sm"></div>

      <div className="container mx-auto px-4 h-full relative z-10">
        <div className="flex items-center justify-center h-full">
          <div key={currentSlide} className="text-center max-w-4xl animate-in fade-in slide-in-from-right-8 duration-700">
            <h1 className="font-impact text-5xl md:text-7xl lg:text-8xl text-foreground mb-4 tracking-tight uppercase">
              {slides[currentSlide].title}
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground mb-8 tracking-[0.3em] uppercase font-light">
              {slides[currentSlide].subtitle}
            </p>
            <Button
              size="lg"
              className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 text-lg px-12 py-6 tracking-wider uppercase font-bold"
            >
              {slides[currentSlide].cta}
            </Button>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-10 h-10" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground hover:text-primary transition-colors"
        >
          <ChevronRight className="w-10 h-10" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${index === currentSlide
                ? "bg-primary w-8"
                : "bg-muted-foreground hover:bg-foreground"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
