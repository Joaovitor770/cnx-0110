import { useParams } from "react-router-dom";
import { useCollections } from "@/contexts/CollectionContext";
import { useProducts } from "@/contexts/ProductContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CollectionDetails = () => {
    const { slug } = useParams();
    const { getCollectionBySlug } = useCollections();
    const { products } = useProducts();

    const collection = slug ? getCollectionBySlug(slug) : undefined;

    if (!collection) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 pt-20 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Coleção não encontrada</h1>
                        <Link to="/">
                            <Button>Voltar para o início</Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const collectionProducts = products.filter(
        (product) => product.collectionId === collection.id
    );

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-20">
                <div className="bg-secondary py-12 mb-8">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="font-impact text-4xl md:text-6xl text-foreground mb-4 uppercase">
                            {collection.name}
                        </h1>
                        {collection.description && (
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                {collection.description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="container mx-auto px-4 mb-20">
                    {collectionProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground text-lg">
                                Nenhum produto encontrado nesta coleção.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {collectionProducts.map((product) => (
                                <Card
                                    key={product.id}
                                    className="bg-card border-border overflow-hidden group hover:border-primary transition-all duration-300"
                                >
                                    <div className="relative overflow-hidden aspect-square">
                                        <img
                                            src={product.images[0]}
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
                                            {new Intl.NumberFormat("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            }).format(product.price)}
                                        </p>
                                        <Link to={`/product/${product.id}`}>
                                            <Button className="w-full bg-[hsl(45,100%,50%)] text-black hover:bg-[hsl(42,100%,40%)] uppercase font-bold tracking-wider">
                                                Ver Produto
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CollectionDetails;
