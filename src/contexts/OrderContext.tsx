import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface OrderItem {
    productId: number;
    productName: string;
    size: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: number;
    clientId: number | null;
    clientName: string;
    clientPhone?: string;
    clientAddress: string;
    items: OrderItem[];
    total: number;
    status: "Pendente" | "Processando" | "Enviado" | "Entregue" | "Cancelado";
    createdAt: string;
}

interface OrderContextType {
    orders: Order[];
    addOrder: (order: Omit<Order, "id" | "createdAt">) => Promise<void>;
    updateOrderStatus: (id: number, status: Order["status"]) => Promise<void>;
    loading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const formattedOrders: Order[] = data.map(item => ({
                    id: item.id,
                    clientId: item.client_id || 0,
                    clientName: item.client_name,
                    clientPhone: item.client_phone,
                    clientAddress: item.client_address,
                    items: item.items as OrderItem[],
                    total: Number(item.total),
                    status: item.status,
                    createdAt: item.created_at
                }));
                setOrders(formattedOrders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error("Erro ao carregar pedidos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        const channel = supabase
            .channel('public:orders')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    console.log('Realtime update:', payload);
                    fetchOrders();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const addOrder = async (order: Omit<Order, "id" | "createdAt">) => {
        try {
            const { error } = await supabase
                .from('orders')
                .insert([{
                    client_id: order.clientId,
                    client_name: order.clientName,
                    client_phone: order.clientPhone,
                    client_address: order.clientAddress,
                    items: order.items,
                    total: order.total,
                    status: order.status
                }]);

            if (error) throw error;
            toast.success("Pedido realizado com sucesso!");
        } catch (error) {
            console.error('Error adding order:', error);
            toast.error("Erro ao realizar pedido");
        }
    };

    const updateOrderStatus = async (id: number, status: Order["status"]) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
            toast.success("Status do pedido atualizado!");
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error("Erro ao atualizar status do pedido");
        }
    };

    return (
        <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, loading }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error("useOrders must be used within a OrderProvider");
    }
    return context;
};
