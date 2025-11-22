import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export interface Client {
    id: number;
    name: string;
    email: string;
    status: "Ativo" | "Inativo";
    joinedAt: string;
    ordersCount: number;
    orders?: number[]; // Array of Order IDs
}

interface ClientContextType {
    clients: Client[];
    addClient: (client: Omit<Client, "id" | "joinedAt" | "ordersCount">) => void;
    updateClient: (id: number, client: Partial<Client>) => void;
    deleteClient: (id: number) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

const defaultClients: Client[] = [];

export const ClientProvider = ({ children }: { children: React.ReactNode }) => {
    const [clients, setClients] = useState<Client[]>(() => {
        const saved = localStorage.getItem("clients");
        return saved ? JSON.parse(saved) : defaultClients;
    });

    useEffect(() => {
        localStorage.setItem("clients", JSON.stringify(clients));
        window.dispatchEvent(new Event("storage"));
    }, [clients]);

    // Listen for changes from other tabs
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "clients" && e.newValue) {
                setClients(JSON.parse(e.newValue));
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const addClient = (client: Omit<Client, "id" | "joinedAt" | "ordersCount">) => {
        const newClient: Client = {
            ...client,
            id: Date.now(),
            joinedAt: new Date().toISOString().split("T")[0],
            ordersCount: 0,
        };
        setClients((prev) => [...prev, newClient]);
        toast.success("Cliente adicionado com sucesso!");
    };

    const updateClient = (id: number, updatedClient: Partial<Client>) => {
        setClients((prev) =>
            prev.map((c) => (c.id === id ? { ...c, ...updatedClient } : c))
        );
        toast.success("Cliente atualizado com sucesso!");
    };

    const deleteClient = (id: number) => {
        setClients((prev) => prev.filter((c) => c.id !== id));
        toast.success("Cliente removido com sucesso!");
    };

    return (
        <ClientContext.Provider value={{ clients, addClient, updateClient, deleteClient }}>
            {children}
        </ClientContext.Provider>
    );
};

export const useClients = () => {
    const context = useContext(ClientContext);
    if (context === undefined) {
        throw new Error("useClients must be used within a ClientProvider");
    }
    return context;
};
