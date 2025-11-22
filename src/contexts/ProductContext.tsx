import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export interface ProductSize {
    size: string;
    stock: number;
}

export interface Product {
    id: number;
    name: string;
    brand: string;
    price: number; // Stored as number for calculations
    images: string[]; // Base64 strings
    category: string;
    sizes: ProductSize[];
    description: string; // Rich text (HTML)
    slug: string;
    createdAt: string;
    collectionId?: number;
}

interface ProductContextType {
    products: Product[];
    addProduct: (product: Omit<Product, "id" | "slug" | "createdAt">) => void;
    updateProduct: (id: number, product: Partial<Product>) => void;
    deleteProduct: (id: number) => void;
    getProductBySlug: (slug: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const defaultProducts: Product[] = [];

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
    const [products, setProducts] = useState<Product[]>(() => {
        const saved = localStorage.getItem("products");
        return saved ? JSON.parse(saved) : defaultProducts;
    });

    useEffect(() => {
        localStorage.setItem("products", JSON.stringify(products));
        window.dispatchEvent(new Event("storage"));
    }, [products]);

    // Listen for changes from other tabs
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "products" && e.newValue) {
                setProducts(JSON.parse(e.newValue));
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
    };

    const addProduct = (product: Omit<Product, "id" | "slug" | "createdAt">) => {
        const newProduct: Product = {
            ...product,
            id: Date.now(),
            slug: generateSlug(product.name),
            createdAt: new Date().toISOString(),
        };
        setProducts((prev) => [...prev, newProduct]);
        toast.success("Produto adicionado com sucesso!");
    };

    const updateProduct = (id: number, updatedProduct: Partial<Product>) => {
        setProducts((prev) =>
            prev.map((p) => {
                if (p.id === id) {
                    const newProduct = { ...p, ...updatedProduct };
                    if (updatedProduct.name) {
                        newProduct.slug = generateSlug(updatedProduct.name);
                    }
                    return newProduct;
                }
                return p;
            })
        );
        toast.success("Produto atualizado com sucesso!");
    };

    const deleteProduct = (id: number) => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        toast.success("Produto removido com sucesso!");
    };

    const getProductBySlug = (slug: string) => {
        return products.find((p) => p.slug === slug);
    };

    return (
        <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, getProductBySlug }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error("useProducts must be used within a ProductProvider");
    }
    return context;
};
