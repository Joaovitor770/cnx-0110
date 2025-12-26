import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export interface CartItem {
    id: number;
    name: string;
    price: string;
    image: string;
    size: string;
    color?: string;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, "quantity">) => void;
    removeFromCart: (id: number, size: string, color?: string) => void;
    updateQuantity: (id: number, size: string, quantity: number, color?: string) => void;
    clearCart: () => void;
    getTotal: () => string;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem("cart");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(items));
    }, [items]);

    const addToCart = (item: Omit<CartItem, "quantity">) => {
        setItems((prev) => {
            const existingItem = prev.find((i) => i.id === item.id && i.size === item.size && i.color === item.color);
            if (existingItem) {
                toast.success("Quantidade atualizada no carrinho!");
                return prev.map((i) =>
                    i.id === item.id && i.size === item.size && i.color === item.color
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }
            toast.success("Produto adicionado ao carrinho!");
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (id: number, size: string, color?: string) => {
        setItems((prev) => prev.filter((item) => !(item.id === id && item.size === size && item.color === color)));
        toast.success("Produto removido do carrinho!");
    };

    const updateQuantity = (id: number, size: string, quantity: number, color?: string) => {
        if (quantity <= 0) {
            removeFromCart(id, size, color);
            return;
        }
        setItems((prev) =>
            prev.map((item) =>
                item.id === id && item.size === size && item.color === color ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
        toast.success("Carrinho limpo!");
    };

    const getTotal = () => {
        const total = items.reduce((sum, item) => {
            const price = parseFloat(item.price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
            return sum + price * item.quantity;
        }, 0);
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total);
    };

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getTotal,
                cartCount: items.reduce((sum, item) => sum + item.quantity, 0),
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
