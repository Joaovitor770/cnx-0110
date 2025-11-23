import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
    addClient: (client: Omit<Client, "id" | "joinedAt" | "ordersCount">) => Promise<void>;
    updateClient: (id: number, client: Partial<Client>) => Promise<void>;
    deleteClient: (id: number) => Promise<void>;
    loading: boolean;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider = ({ children }: { children: React.ReactNode }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchClients = async () => {
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const formattedClients: Client[] = data.map(item => ({
                    id: item.id,
                    name: item.name,
                    email: item.email,
                    status: item.status,
                    joinedAt: item.joined_at,
                    ordersCount: item.orders_count
                }));
                setClients(formattedClients);
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
            toast.error("Erro ao carregar clientes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();

        const channel = supabase
            .channel('public:clients')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'clients' },
                (payload) => {
                    console.log('Realtime update:', payload);
                    fetchClients();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const addClient = async (client: Omit<Client, "id" | "joinedAt" | "ordersCount">) => {
        try {
            const { error } = await supabase
                .from('clients')
                .insert([{
                    name: client.name,
                    email: client.email,
                    status: client.status,
                    joined_at: new Date().toISOString().split("T")[0],
                    orders_count: 0
                }]);

            if (error) throw error;
            toast.success("Cliente adicionado com sucesso!");
        } catch (error) {
            console.error('Error adding client:', error);
            toast.error("Erro ao adicionar cliente");
        }
    };

    const updateClient = async (id: number, updatedClient: Partial<Client>) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updates: Record<string, any> = { ...updatedClient };
            if (updatedClient.joinedAt) updates.joined_at = updatedClient.joinedAt;
            if (updatedClient.ordersCount) updates.orders_count = updatedClient.ordersCount;

            // Remove fields not in DB
            delete updates.joinedAt;
            delete updates.ordersCount;
            delete updates.orders;

            const { error } = await supabase
                .from('clients')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            toast.success("Cliente atualizado com sucesso!");
        } catch (error) {
            console.error('Error updating client:', error);
            toast.error("Erro ao atualizar cliente");
        }
    };

    const deleteClient = async (id: number) => {
        try {
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success("Cliente removido com sucesso!");
        } catch (error) {
            console.error('Error deleting client:', error);
            toast.error("Erro ao remover cliente");
        }
    };

    return (
        <ClientContext.Provider value={{ clients, addClient, updateClient, deleteClient, loading }}>
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
