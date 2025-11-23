import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RevealOnScroll } from "./RevealOnScroll";
import { useProducts } from "@/contexts/ProductContext";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";

import { Product } from "@/contexts/ProductContext";

const FeaturedProducts = () => {
  const { addToCart } = useCart();
  const { products } = useProducts();

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price),
      image: product.images[0],
      size: product.sizes[0]?.size || "M"
    });
  };

  return (
    <section className="py-20 bg-background" id="new">
      <div className="container mx-auto px-4">
        <RevealOnScroll>
          <div className="text-center mb-12">
            <h2 className="font-impact text-4xl md:text-6xl text-foreground mb-4 uppercase">
              Destaques
            </h2>
            <p className="text-muted-foreground tracking-wider uppercase text-sm">
              As peças mais procuradas
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <RevealOnScroll key={product.id} delay={index * 100}>
              <Card
                className="bg-card border-border overflow-hidden group hover:border-primary transition-all duration-300"
              >
                <div className="relative overflow-hidden aspect-square">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors duration-300" />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-foreground text-lg mb-2 uppercase tracking-wide">
                    {product.name}
                  </h3>
                  <p className="text-primary text-2xl font-bold mb-4">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                  </p>
                  <Link to={`/product/${product.id}`}>
                    <Button
                      className="w-full bg-[hsl(45,100%,50%)] text-black hover:bg-[hsl(42,100%,40%)] uppercase font-bold tracking-wider"
                    >
                      Ver Produto
                    </Button>
                  </Link>
                </div>
              </Card>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
