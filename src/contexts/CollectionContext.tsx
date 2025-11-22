import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export interface Collection {
    id: number;
    name: string;
    image: string;
    slug: string;
    description?: string;
}

interface CollectionContextType {
    collections: Collection[];
    addCollection: (collection: Omit<Collection, "id" | "slug">) => void;
    updateCollection: (id: number, collection: Partial<Collection>) => void;
    deleteCollection: (id: number) => void;
    getCollectionBySlug: (slug: string) => Collection | undefined;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

const defaultCollections: Collection[] = [];

export const CollectionProvider = ({ children }: { children: React.ReactNode }) => {
    const [collections, setCollections] = useState<Collection[]>(() => {
        const saved = localStorage.getItem("collections");
        return saved ? JSON.parse(saved) : defaultCollections;
    });

    useEffect(() => {
        localStorage.setItem("collections", JSON.stringify(collections));
        window.dispatchEvent(new Event("storage"));
    }, [collections]);

    // Listen for changes from other tabs
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "collections" && e.newValue) {
                setCollections(JSON.parse(e.newValue));
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

    const addCollection = (collection: Omit<Collection, "id" | "slug">) => {
        const newCollection: Collection = {
            ...collection,
            id: Date.now(),
            slug: generateSlug(collection.name),
        };
        setCollections((prev) => [...prev, newCollection]);
        toast.success("Coleção adicionada com sucesso!");
    };

    const updateCollection = (id: number, updatedCollection: Partial<Collection>) => {
        setCollections((prev) =>
            prev.map((c) => {
                if (c.id === id) {
                    const newCollection = { ...c, ...updatedCollection };
                    if (updatedCollection.name) {
                        newCollection.slug = generateSlug(updatedCollection.name);
                    }
                    return newCollection;
                }
                return c;
            })
        );
        toast.success("Coleção atualizada com sucesso!");
    };

    const deleteCollection = (id: number) => {
        setCollections((prev) => prev.filter((c) => c.id !== id));
        toast.success("Coleção removida com sucesso!");
    };

    const getCollectionBySlug = (slug: string) => {
        return collections.find((c) => c.slug === slug);
    };

    return (
        <CollectionContext.Provider value={{ collections, addCollection, updateCollection, deleteCollection, getCollectionBySlug }}>
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
