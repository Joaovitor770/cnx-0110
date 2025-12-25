import { useCart } from "@/contexts/CartContext";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CartProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const Cart = ({ open, onOpenChange }: CartProps) => {
    const { items, updateQuantity, removeFromCart, clearCart, getTotal } = useCart();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg flex flex-col">
                <SheetHeader>
                    <SheetTitle className="text-2xl font-bold">Carrinho de Compras</SheetTitle>
                    <SheetDescription>
                        {items.length === 0
                            ? "Seu carrinho está vazio"
                            : `${items.length} ${items.length === 1 ? "item" : "itens"} no carrinho`}
                    </SheetDescription>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <ShoppingBag className="w-24 h-24 text-muted-foreground mb-4" />
                        <p className="text-lg text-muted-foreground mb-2">Seu carrinho está vazio</p>
                        <p className="text-sm text-muted-foreground">
                            Adicione produtos para começar suas compras
                        </p>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 -mx-6 px-6">
                            <div className="space-y-4 py-4">
                                {items.map((item) => (
                                    <div
                                        key={`${item.id}-${item.size}-${item.color || 'default'}`}
                                        className="flex gap-4 border-b border-border pb-4"
                                    >
                                        <div className="w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm truncate">{item.name}</h4>
                                            <p className="text-xs text-muted-foreground">Tamanho: {item.size}</p>
                                            {item.color && (
                                                <p className="text-xs text-muted-foreground">Cor: {item.color}</p>
                                            )}
                                            <p className="text-sm font-bold text-primary mt-1">{item.price}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() =>
                                                        updateQuantity(item.id, item.size, item.quantity - 1, item.color)
                                                    }
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </Button>
                                                <span className="text-sm font-medium w-8 text-center">
                                                    {item.quantity}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() =>
                                                        updateQuantity(item.id, item.size, item.quantity + 1, item.color)
                                                    }
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive flex-shrink-0"
                                            onClick={() => removeFromCart(item.id, item.size, item.color)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="border-t border-border pt-4 space-y-4">
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total:</span>
                                <span className="text-primary">{getTotal()}</span>
                            </div>
                            <div className="space-y-2">
                                <Button
                                    className="w-full bg-[hsl(45,100%,50%)] text-black hover:bg-[hsl(42,100%,40%)] font-bold"
                                    size="lg"
                                    onClick={() => {
                                        onOpenChange(false);
                                        window.location.href = "/checkout";
                                    }}
                                >
                                    Finalizar Compra
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={clearCart}
                                >
                                    Limpar Carrinho
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default Cart;
