import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export interface OrderItem {
    productId: number;
    productName: string;
    size: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: number;
    clientId: number;
    clientName: string;
    items: OrderItem[];
    total: number;
    status: "Pendente" | "Processando" | "Enviado" | "Entregue" | "Cancelado";
    createdAt: string;
}

interface OrderContextType {
    orders: Order[];
    addOrder: (order: Omit<Order, "id" | "createdAt">) => void;
    updateOrderStatus: (id: number, status: Order["status"]) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const defaultOrders: Order[] = [];

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
    const [orders, setOrders] = useState<Order[]>(() => {
        const saved = localStorage.getItem("orders");
        return saved ? JSON.parse(saved) : defaultOrders;
    });

    useEffect(() => {
        localStorage.setItem("orders", JSON.stringify(orders));
        window.dispatchEvent(new Event("storage"));
    }, [orders]);

    // Listen for changes from other tabs
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "orders" && e.newValue) {
                setOrders(JSON.parse(e.newValue));
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const addOrder = (order: Omit<Order, "id" | "createdAt">) => {
        const newOrder: Order = {
            ...order,
            id: Date.now(),
            createdAt: new Date().toISOString(),
        };
        setOrders((prev) => [newOrder, ...prev]);
        toast.success("Pedido realizado com sucesso!");
    };

    const updateOrderStatus = (id: number, status: Order["status"]) => {
        setOrders((prev) =>
            prev.map((o) => (o.id === id ? { ...o, status } : o))
        );
        toast.success("Status do pedido atualizado!");
    };

    return (
        <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus }}>
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
