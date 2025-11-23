import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProducts } from "@/contexts/ProductContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Header from "@/components/Header";
import { ChevronLeft } from "lucide-react";

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products } = useProducts();
    const { addToCart } = useCart();

    const product = products.find((p) => p.id === Number(id));
    const [selectedSize, setSelectedSize] = useState("");
    const [mainImage, setMainImage] = useState("");

    useEffect(() => {
        if (product && product.images.length > 0) {
            setMainImage(product.images[0]);
        }
    }, [product]);

    if (!product) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p>Produto não encontrado</p>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (!selectedSize) {
            toast.error("Por favor, selecione um tamanho.");
            return;
        }
        addToCart({
            id: product.id,
            name: product.name,
            price: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price),
            image: product.images[0],
            size: selectedSize,
        });
    };

    const handleBuyNow = () => {
        if (!selectedSize) {
            toast.error("Por favor, selecione um tamanho.");
            return;
        }

        // Add to cart directly without showing the success toast from addToCart if possible, 
        // but addToCart shows toast. We can just call it.
        addToCart({
            id: product.id,
            name: product.name,
            price: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price),
            image: product.images[0],
            size: selectedSize,
        });

        navigate("/checkout");
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 pt-24 pb-12">
                <Button
                    variant="ghost"
                    className="mb-8 gap-2 pl-0 hover:bg-transparent hover:text-primary"
                    onClick={() => navigate(-1)}
                >
                    <ChevronLeft className="w-4 h-4" />
                    Voltar
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square overflow-hidden rounded-lg border border-border bg-card">
                            <img
                                src={mainImage}
                                alt={product.name}
                                decoding="async"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {product.images.map((img, index) => (
                                <button
                                    key={index}
                                    className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${mainImage === img ? "border-primary" : "border-transparent"
                                        }`}
                                    onClick={() => setMainImage(img)}
                                >
                                    <img src={img} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl font-bold text-foreground mb-2 uppercase tracking-wide">
                                {product.name}
                            </h1>
                            <p className="text-muted-foreground text-lg">{product.category}</p>
                        </div>

                        <div className="text-3xl font-bold text-primary">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-medium text-foreground">Tamanhos</h3>
                            <div className="flex flex-wrap gap-3">
                                {product.sizes.map((item) => (
                                    <button
                                        key={item.size}
                                        disabled={item.stock === 0}
                                        onClick={() => setSelectedSize(item.size)}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${selectedSize === item.size
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : item.stock === 0
                                                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                                                : "bg-background text-foreground border-input hover:border-primary"
                                            }`}
                                    >
                                        {item.size}
                                    </button>
                                ))}
                            </div>
                            {selectedSize && (
                                <p className="text-sm text-muted-foreground">
                                    Estoque disponível: {product.sizes.find(s => s.size === selectedSize)?.stock}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-4 pt-8">
                            <Button
                                size="lg"
                                className="w-full text-lg font-bold uppercase tracking-wider bg-[hsl(45,100%,50%)] text-black hover:bg-[hsl(42,100%,40%)]"
                                onClick={handleAddToCart}
                            >
                                Adicionar ao Carrinho
                            </Button>
                            <Button
                                size="lg"
                                className="w-full text-lg font-bold uppercase tracking-wider bg-[hsl(45,100%,50%)] text-black hover:bg-[hsl(42,100%,40%)]"
                                onClick={handleBuyNow}
                            >
                                Comprar Agora
                            </Button>
                        </div>

                        <div className="pt-8 border-t border-border">
                            <h3 className="font-bold text-lg mb-4">Descrição</h3>
                            <div
                                className="text-muted-foreground leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: product.description || "Sem descrição disponível." }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
