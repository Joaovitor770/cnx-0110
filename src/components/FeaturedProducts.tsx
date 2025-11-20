import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const products = [
  {
    id: 1,
    name: "Camiseta Premium Street",
    price: "R$ 189,90",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80",
  },
  {
    id: 2,
    name: "Moletom Oversized Gold",
    price: "R$ 349,90",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80",
  },
  {
    id: 3,
    name: "Calça Cargo Urban",
    price: "R$ 279,90",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&q=80",
  },
  {
    id: 4,
    name: "Jaqueta Bomber 011",
    price: "R$ 449,90",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80",
  },
];

const FeaturedProducts = () => {
  return (
    <section className="py-20 bg-background" id="new">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-impact text-4xl md:text-6xl text-foreground mb-4 uppercase">
            Destaques
          </h2>
          <p className="text-muted-foreground tracking-wider uppercase text-sm">
            As peças mais procuradas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Card
              key={product.id}
              className="bg-card border-border overflow-hidden group hover:border-primary transition-all duration-300"
            >
              <div className="relative overflow-hidden aspect-square">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors duration-300" />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-foreground text-lg mb-2 uppercase tracking-wide">
                  {product.name}
                </h3>
                <p className="text-primary text-2xl font-bold mb-4">
                  {product.price}
                </p>
                <Button 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 uppercase font-bold tracking-wider"
                >
                  Comprar Agora
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
