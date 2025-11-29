import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RevealOnScroll } from "./RevealOnScroll";
import ProductImageCarousel from "./ProductImageCarousel";
import { useProducts } from "@/contexts/ProductContext";
import { useCategories } from "@/contexts/CategoryContext";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";

import { Product } from "@/contexts/ProductContext";

const FeaturedProducts = () => {
  const { addToCart } = useCart();
  const { products } = useProducts();
  const { categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price),
      image: product.images[0],
      size: product.sizes[0]?.size || "M"
    });
  };

  // Filter products by selected category
  const filteredProducts = selectedCategory
    ? products.filter(product => {
      if (product.categoryId) {
        return product.categoryId === selectedCategory;
      }
      // Fallback: check by name if categoryId is missing
      const category = categories.find(c => c.id === selectedCategory);
      return category && product.category === category.name;
    })
    : products;

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

        {/* Category Filter */}
        {categories.length > 0 && (
          <RevealOnScroll>
            <div className="flex overflow-x-auto gap-3 mb-8 pb-2 px-4 justify-start md:justify-center snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className={`whitespace-nowrap flex-shrink-0 snap-center ${selectedCategory === null
                  ? "bg-[hsl(45,100%,50%)] text-black hover:bg-[hsl(42,100%,40%)] font-bold"
                  : "border-primary/20 hover:border-primary hover:bg-primary/10"}`}
              >
                Todas
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`whitespace-nowrap flex-shrink-0 snap-center ${selectedCategory === category.id
                    ? "bg-[hsl(45,100%,50%)] text-black hover:bg-[hsl(42,100%,40%)] font-bold"
                    : "border-primary/20 hover:border-primary hover:bg-primary/10"}`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </RevealOnScroll>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <RevealOnScroll key={product.id} delay={index * 100}>
                <Card
                  className="bg-card border-border overflow-hidden group hover:border-primary transition-all duration-300"
                >
                  <ProductImageCarousel
                    images={product.images}
                    productName={product.name}
                  />
                  <div className="p-6 text-center">
                    <h3 className="text-foreground text-lg mb-2 uppercase tracking-wide">
                      {product.name}
                    </h3>
                    {product.category && (
                      <p className="text-primary/70 text-xs mb-2 uppercase tracking-wider">
                        {product.category}
                      </p>
                    )}
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
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">
                Nenhum produto encontrado nesta categoria.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
