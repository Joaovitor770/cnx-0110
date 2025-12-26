import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/lib/utils";

export interface ProductSize {
    size: string;
    stock: number;
}

export interface ProductColor {
    id: string;
    productId: number;
    name: string;
    colorValue: string;
    images: string[];
}

export interface Product {
    id: number;
    name: string;
    brand: string;
    price: number;
    images: string[];
    category: string;
    sizes: ProductSize[];
    colors?: ProductColor[];
    description: string;
    slug: string;
    createdAt: string;
    collectionId?: number;
    categoryId?: number;
}

interface ProductContextType {
    products: Product[];
    addProduct: (product: Omit<Product, "id" | "slug" | "createdAt" | "colors"> & { colors?: Omit<ProductColor, "id" | "productId">[] }) => Promise<void>;
    updateProduct: (id: number, product: Partial<Product> & { colors?: Omit<ProductColor, "id" | "productId">[] }) => Promise<void>;
    deleteProduct: (id: number) => Promise<void>;
    decrementStock: (id: number, size: string, quantity: number) => Promise<void>;
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
                .select('*, product_colors(*)')
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
                    sizes: (Array.isArray(item.sizes) ? item.sizes : []) as unknown as ProductSize[],
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    colors: (item.product_colors as any[] || []).map(c => ({
                        id: c.id,
                        productId: c.product_id,
                        name: c.name,
                        colorValue: c.color_value,
                        images: c.images || []
                    })),
                    description: item.description,
                    slug: item.slug,
                    createdAt: item.created_at,
                    collectionId: item.collection_id,
                    categoryId: item.category_id
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
                () => fetchProducts()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'product_colors' },
                () => fetchProducts()
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

    const addProduct = async (product: Omit<Product, "id" | "slug" | "createdAt" | "colors"> & { colors?: Omit<ProductColor, "id" | "productId">[] }) => {
        try {
            const uploadedImages = await Promise.all(product.images.map(img => uploadImage(img)));
            const slug = generateSlug(product.name);

            // Upload images for colors
            const colorsWithUploadedImages = product.colors ? await Promise.all(product.colors.map(async (color) => ({
                ...color,
                images: await Promise.all(color.images.map(img => uploadImage(img)))
            }))) : [];

            const { data: insertedProduct, error } = await supabase
                .from('products')
                .insert([{
                    name: product.name,
                    brand: product.brand,
                    price: product.price,
                    images: uploadedImages,
                    category: product.category,
                    sizes: product.sizes as any,
                    description: product.description,
                    slug: slug,
                    collection_id: product.collectionId,
                    category_id: product.categoryId
                }])
                .select()
                .single();

            if (error) {
                console.error("❌ Error inserting product:", error);
                throw error;
            }

            if (colorsWithUploadedImages.length > 0 && insertedProduct) {
                const { error: colorsError } = await supabase
                    .from('product_colors')
                    .insert(colorsWithUploadedImages.map(c => ({
                        product_id: insertedProduct.id,
                        name: c.name,
                        color_value: c.colorValue,
                        images: c.images
                    })));

                if (colorsError) {
                    console.error("❌ Error inserting colors:", colorsError);
                    toast.error("Produto criado, mas erro ao salvar cores.");
                }
            }

            console.log("✅ Product added successfully!");
            toast.success("Produto adicionado com sucesso!");
            fetchProducts();
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error((error as Error).message || "Erro ao adicionar produto");
        }
    };

    const updateProduct = async (id: number, updatedProduct: Partial<Product> & { colors?: Omit<ProductColor, "id" | "productId">[] }) => {
        try {
            const currentProduct = products.find(p => p.id === id);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updates: Record<string, any> = {};

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

            // Handle Colors
            if (updatedProduct.colors !== undefined) {
                // Delete existing colors
                const { error: deleteError } = await supabase
                    .from('product_colors')
                    .delete()
                    .eq('product_id', id);

                if (deleteError) throw deleteError;

                // Insert new colors
                if (updatedProduct.colors.length > 0) {
                    const colorsWithUploadedImages = await Promise.all(updatedProduct.colors.map(async (color) => ({
                        ...color,
                        images: await Promise.all(color.images.map(img => uploadImage(img)))
                    })));

                    const { error: insertError } = await supabase
                        .from('product_colors')
                        .insert(colorsWithUploadedImages.map(c => ({
                            product_id: id,
                            name: c.name,
                            color_value: c.colorValue,
                            images: c.images
                        })));

                    if (insertError) throw insertError;
                }
            }

            toast.success("Produto atualizado com sucesso!");
            fetchProducts();
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error((error as Error).message || "Erro ao atualizar produto");
        }
    };

    const decrementStock = async (id: number, size: string, quantity: number) => {
        try {
            const { data: currentProductData, error: fetchError } = await supabase
                .from('products')
                .select('sizes')
                .eq('id', id)
                .single();

            if (fetchError || !currentProductData) throw new Error("Erro ao buscar produto para atualizar estoque");

            const currentSizes = (Array.isArray(currentProductData.sizes) ? currentProductData.sizes : []) as ProductSize[];

            const newSizes = currentSizes.map(s => {
                if (s.size === size) {
                    return { ...s, stock: Math.max(0, s.stock - quantity) };
                }
                return s;
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: updateError } = await supabase
                .from('products')
                .update({ sizes: newSizes as any })
                .eq('id', id);

            if (updateError) throw updateError;

            fetchProducts();
        } catch (error) {
            console.error('Error decrementing stock:', error);
            throw error;
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
        <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, decrementStock, getProductBySlug, loading }}>
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
