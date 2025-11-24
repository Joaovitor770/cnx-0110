import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
    id: number;
    name: string;
    slug: string;
}

interface CategoryContextType {
    categories: Category[];
    addCategory: (category: Omit<Category, "id" | "slug">) => Promise<void>;
    updateCategory: (id: number, category: Partial<Category>) => Promise<void>;
    deleteCategory: (id: number) => Promise<void>;
    loading: boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider = ({ children }: { children: React.ReactNode }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error((error as Error).message || "Erro ao carregar categorias");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();

        const channel = supabase
            .channel('public:categories')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'categories' },
                (payload) => {
                    console.log('Realtime update:', payload);
                    fetchCategories();
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

    const addCategory = async (category: Omit<Category, "id" | "slug">) => {
        try {
            const slug = generateSlug(category.name);
            const { error } = await supabase
                .from('categories')
                .insert([{
                    name: category.name,
                    slug: slug
                }]);

            if (error) throw error;
            toast.success("Categoria adicionada com sucesso!");
        } catch (error) {
            console.error('Error adding category:', error);
            toast.error((error as Error).message || "Erro ao adicionar categoria");
        }
    };

    const updateCategory = async (id: number, updatedCategory: Partial<Category>) => {
        try {
            const updates: Partial<Category> = { ...updatedCategory };
            if (updatedCategory.name) {
                updates.slug = generateSlug(updatedCategory.name);
            }

            const { error } = await supabase
                .from('categories')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            toast.success("Categoria atualizada com sucesso!");
        } catch (error) {
            console.error('Error updating category:', error);
            toast.error((error as Error).message || "Erro ao atualizar categoria");
        }
    };

    const deleteCategory = async (id: number) => {
        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success("Categoria removida com sucesso!");
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error((error as Error).message || "Erro ao remover categoria");
        }
    };

    return (
        <CategoryContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory, loading }}>
            {children}
        </CategoryContext.Provider>
    );
};

export const useCategories = () => {
    const context = useContext(CategoryContext);
    if (context === undefined) {
        throw new Error("useCategories must be used within a CategoryProvider");
    }
    return context;
};
