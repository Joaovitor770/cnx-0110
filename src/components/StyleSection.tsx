import { Crown } from "lucide-react";
import { RevealOnScroll } from "./RevealOnScroll";

const StyleSection = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <RevealOnScroll>
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Crown className="w-16 h-16 text-primary" />
            </div>
            <h2 className="font-impact text-4xl md:text-6xl text-foreground mb-6 uppercase">
              Estilo Autêntico
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed tracking-wide mb-8">
              Conexão 011 nasceu em 2024 para elevar o estilo urbano com peças autênticas e acabamento premium.
              Cada item da nossa coleção é pensado para quem busca exclusividade e qualidade sem abrir mão da essência do streetwear.
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px bg-primary flex-1 max-w-xs" />
              <span className="text-primary font-bold tracking-widest uppercase text-sm">EST. 2024</span>
              <div className="h-px bg-primary flex-1 max-w-xs" />
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};

export default StyleSection;
