import { useState, useEffect } from "react";

interface ProductImageCarouselProps {
    images: string[];
    productName: string;
}

const ProductImageCarousel = ({ images, productName }: ProductImageCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (!isHovered || images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 800); // Troca rápida a cada 0.8 segundos

        return () => clearInterval(interval);
    }, [isHovered, images.length]);

    // Reset ao sair do hover
    useEffect(() => {
        if (!isHovered) {
            setCurrentIndex(0);
        }
    }, [isHovered]);

    return (
        <div
            className="relative overflow-hidden aspect-square"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {images.map((image, index) => (
                <img
                    key={index}
                    src={image}
                    alt={`${productName} - Imagem ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${index === currentIndex
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                />
            ))}
            <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors duration-300" />

            {/* Indicadores de imagem */}
            {images.length > 1 && isHovered && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
                    {images.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1.5 rounded-full transition-all duration-200 ${index === currentIndex
                                    ? "w-6 bg-primary"
                                    : "w-1.5 bg-white/50"
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductImageCarousel;
