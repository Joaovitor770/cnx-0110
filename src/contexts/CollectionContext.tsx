import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/lib/utils";

export interface Collection {
    id: number;
    name: string;
    image: string;
    slug: string;
    description?: string;
}

interface CollectionContextType {
    collections: Collection[];
    addCollection: (collection: Omit<Collection, "id" | "slug">) => Promise<void>;
    updateCollection: (id: number, collection: Partial<Collection>) => Promise<void>;
    deleteCollection: (id: number) => Promise<void>;
    getCollectionBySlug: (slug: string) => Collection | undefined;
    loading: boolean;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export const CollectionProvider = ({ children }: { children: React.ReactNode }) => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCollections = async () => {
        try {
            const { data, error } = await supabase
                .from('collections')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const formattedCollections: Collection[] = data.map(item => ({
                    id: item.id,
                    name: item.name,
                    image: item.image,
                    slug: item.slug,
                    description: item.description
                }));
                setCollections(formattedCollections);
            }
        } catch (error) {
            console.error('Error fetching collections:', error);
            toast.error((error as Error).message || "Erro ao carregar coleções");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();

        const channel = supabase
            .channel('public:collections')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'collections' },
                (payload) => {
                    console.log('Realtime update:', payload);
                    fetchCollections();
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

    const addCollection = async (collection: Omit<Collection, "id" | "slug">) => {
        try {
            const uploadedImage = await uploadImage(collection.image);
            const slug = generateSlug(collection.name);
            const { error } = await supabase
                .from('collections')
                .insert([{
                    name: collection.name,
                    image: uploadedImage,
                    description: collection.description,
                    slug: slug
                }]);

            if (error) throw error;
            toast.success("Coleção adicionada com sucesso!");
        } catch (error) {
            console.error('Error adding collection:', error);
            toast.error((error as Error).message || "Erro ao adicionar coleção");
        }
    };

    const updateCollection = async (id: number, updatedCollection: Partial<Collection>) => {
        try {
            const updates: Partial<Collection> = { ...updatedCollection };
            if (updatedCollection.name) {
                updates.slug = generateSlug(updatedCollection.name);
            }
            if (updatedCollection.image) {
                updates.image = await uploadImage(updatedCollection.image);
            }

            const { error } = await supabase
                .from('collections')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            toast.success("Coleção atualizada com sucesso!");
        } catch (error) {
            console.error('Error updating collection:', error);
            toast.error((error as Error).message || "Erro ao atualizar coleção");
        }
    };

    const deleteCollection = async (id: number) => {
        try {
            const { error } = await supabase
                .from('collections')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success("Coleção removida com sucesso!");
        } catch (error) {
            console.error('Error deleting collection:', error);
            toast.error((error as Error).message || "Erro ao remover coleção");
        }
    };

    const getCollectionBySlug = (slug: string) => {
        return collections.find((c) => c.slug === slug);
    };

    return (
        <CollectionContext.Provider value={{ collections, addCollection, updateCollection, deleteCollection, getCollectionBySlug, loading }}>
            {children}
        </CollectionContext.Provider>
    );
};

export const useCollections = () => {
    const context = useContext(CollectionContext);
    if (context === undefined) {
        throw new Error("useCollections must be used within a CollectionProvider");
    }
    return context;
};
