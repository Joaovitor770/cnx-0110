import React, { createContext, useContext, useState, useEffect } from "react";
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
                    sizes: item.sizes as ProductSize[],
                    description: item.description,
                    slug: item.slug,
                    createdAt: item.created_at,
                    collectionId: item.collection_id
                }));
                setProducts(formattedProducts);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error("Erro ao carregar produtos");
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
                    collection_id: product.collectionId
                }]);

            if (error) throw error;
            toast.success("Produto adicionado com sucesso!");
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error("Erro ao adicionar produto");
        }
    };

    const updateProduct = async (id: number, updatedProduct: Partial<Product>) => {
        try {
            const updates: any = { ...updatedProduct };
            if (updatedProduct.name) {
                updates.slug = generateSlug(updatedProduct.name);
            }
            if (updatedProduct.images) {
                updates.images = await Promise.all(updatedProduct.images.map(img => uploadImage(img)));
            }
            // Map camelCase to snake_case for DB
            if (updatedProduct.collectionId !== undefined) {
                updates.collection_id = updatedProduct.collectionId;
                delete updates.collectionId;
            }
            if (updatedProduct.createdAt) {
                delete updates.createdAt;
            }

            const { error } = await supabase
                .from('products')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            toast.success("Produto atualizado com sucesso!");
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error("Erro ao atualizar produto");
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
            toast.error("Erro ao remover produto");
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
