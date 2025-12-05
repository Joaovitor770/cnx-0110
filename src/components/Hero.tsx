import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

type HeroSlide = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  button_text: string | null;
  button_link: string | null;
  background_type: string | null;
  background_color: string | null;
  order_index: number;
  active: boolean;
};

const defaultSlides = [
  {
    id: "1",
    title: "Autenticidade em Cada Detalhe",
    subtitle: "Estilo urbano elevado ao próximo nível",
    button_text: "Ver Coleção",
    button_link: "/collections/all",
    background_type: "Imagem + Texto",
    image_url: "/hero-bg.png",
    active: true,
  },
  {
    id: "2",
    title: "Nova Coleção 2026",
    subtitle: "Streetwear premium com identidade autêntica",
    button_text: "Explorar Agora",
    button_link: "/collections/new",
    background_type: "Imagem + Texto",
    image_url: "/hero-bg.png",
    active: true,
  },
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: slides, isLoading } = useQuery({
    queryKey: ["hero-slides-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("active", true)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as HeroSlide[];
    },
  });

  const activeSlides = slides && slides.length > 0 ? slides : defaultSlides;

  useEffect(() => {
    if (!activeSlides || activeSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSlides]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);

  if (isLoading) {
    return (
      <section className="h-[70vh] md:h-[80vh] flex items-center justify-center bg-muted">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </section>
    );
  }

  const slide = activeSlides[currentSlide];

  return (
    <section className="relative h-[70vh] md:h-[80vh] bg-gradient-to-br from-background via-secondary to-background overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 transition-all duration-700 ease-in-out">
        {(slide.background_type === "Imagem + Texto" || slide.background_type === "Somente Imagem") && slide.image_url ? (
          <div
            className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${slide.background_type === "Imagem + Texto" ? "opacity-40 blur-sm" : ""}`}
            style={{ backgroundImage: `url('${slide.image_url}')` }}
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 blur-sm transition-all duration-700"
            style={{ backgroundImage: "url('/hero-bg.png')" }}
          />
        )}
      </div>

      {slide.background_type !== "Somente Imagem" && (
        <div className="container mx-auto px-4 h-full relative z-10">
          <div className="flex items-center justify-center h-full">
            <div key={currentSlide} className="text-center max-w-4xl animate-in fade-in slide-in-from-right-8 duration-700">
              <h1 className="font-impact text-5xl md:text-7xl lg:text-8xl text-foreground mb-4 tracking-tight uppercase">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className="text-lg md:text-2xl text-muted-foreground mb-8 tracking-[0.3em] uppercase font-light">
                  {slide.subtitle}
                </p>
              )}
              {slide.button_text && (
                <Button
                  asChild
                  size="lg"
                  className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]/90 text-lg px-12 py-6 tracking-wider uppercase font-bold"
                >
                  <Link to={slide.button_link || "/"}>
                    {slide.button_text}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Arrows */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground hover:text-primary transition-colors z-20"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground hover:text-primary transition-colors z-20"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {activeSlides.map((_, index) => (
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
      )}
    </section>
  );
};

export default Hero;
