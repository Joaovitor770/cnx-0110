import React, { createContext, useContext, useState, useEffect } from "react";
// ProductContext handles product data and operations
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/lib/utils";

export interface ProductSize {
    size: string;
    stock: number;
}

export interface Product {
    id: number;
    name: string;
    brand: string;
    price: number;
    images: string[];
    category: string;
    sizes: ProductSize[];
    description: string;
    slug: string;
    createdAt: string;
    collectionId?: number;
    categoryId?: number;
}

interface ProductContextType {
    products: Product[];
    addProduct: (product: Omit<Product, "id" | "slug" | "createdAt">) => Promise<void>;
    updateProduct: (id: number, product: Partial<Product>) => Promise<void>;
    deleteProduct: (id: number) => Promise<void>;
    getProductBySlug: (slug: string) => Product | undefined;
    loading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const formattedProducts: Product[] = data.map(item => ({
                    id: item.id,
                    name: item.name,
                    brand: item.brand,
                    price: Number(item.price),
                    images: item.images || [],
                    category: item.category,
                    sizes: (item.sizes as unknown) as ProductSize[],
                    description: item.description,
                    slug: item.slug,
                    createdAt: item.created_at,
                    collectionId: item.collection_id
                }));
                setProducts(formattedProducts);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error((error as Error).message || "Erro ao carregar produtos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();

        const channel = supabase
            .channel('public:products')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'products' },
                (payload) => {
                    console.log('Realtime update:', payload);
                    fetchProducts();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
    };

    const addProduct = async (product: Omit<Product, "id" | "slug" | "createdAt">) => {
        try {
            const uploadedImages = await Promise.all(product.images.map(img => uploadImage(img)));
            const slug = generateSlug(product.name);

            console.log("📦 Adding product with sizes:", product.sizes);

            const { error } = await supabase
                .from('products')
                .insert([{
                    name: product.name,
                    brand: product.brand,
                    price: product.price,
                    images: uploadedImages,
                    category: product.category,
                    sizes: product.sizes,
                    description: product.description,
                    slug: slug,
                    collection_id: product.collectionId,
                    category_id: product.categoryId
                }]);

            if (error) {
                console.error("❌ Error inserting product:", error);
                throw error;
            }

            console.log("✅ Product added successfully!");
            toast.success("Produto adicionado com sucesso!");
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error((error as Error).message || "Erro ao adicionar produto");
        }
    };

    const updateProduct = async (id: number, updatedProduct: Partial<Product>) => {
        try {
            // Get current product to check if name changed
            const currentProduct = products.find(p => p.id === id);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updates: Record<string, any> = {};

            // Whitelist fields to ensure no invalid columns (like createdAt) are sent
            if (updatedProduct.name !== undefined) updates.name = updatedProduct.name;
            if (updatedProduct.brand !== undefined) updates.brand = updatedProduct.brand;
            if (updatedProduct.price !== undefined) updates.price = updatedProduct.price;
            if (updatedProduct.category !== undefined) updates.category = updatedProduct.category;
            if (updatedProduct.description !== undefined) updates.description = updatedProduct.description;

            if (updatedProduct.images !== undefined) {
                updates.images = await Promise.all(updatedProduct.images.map(img => uploadImage(img)));
            }

            if (updatedProduct.sizes !== undefined) {
                updates.sizes = updatedProduct.sizes as any;
            }

            // Only regenerate slug if name actually changed
            if (updatedProduct.name !== undefined && currentProduct && updatedProduct.name !== currentProduct.name) {
                updates.slug = generateSlug(updatedProduct.name);
            }

            if (updatedProduct.collectionId !== undefined) {
                updates.collection_id = updatedProduct.collectionId;
            }

            if (updatedProduct.categoryId !== undefined) {
                updates.category_id = updatedProduct.categoryId;
            }

            const { error } = await supabase
                .from('products')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            toast.success("Produto atualizado com sucesso!");
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error((error as Error).message || "Erro ao atualizar produto");
        }
    };

    const deleteProduct = async (id: number) => {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success("Produto removido com sucesso!");
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error((error as Error).message || "Erro ao remover produto");
        }
    };

    const getProductBySlug = (slug: string) => {
        return products.find((p) => p.slug === slug);
    };

    return (
        <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, getProductBySlug, loading }}>
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
