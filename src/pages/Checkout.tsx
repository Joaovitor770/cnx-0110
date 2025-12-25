import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useOrders } from "@/contexts/OrderContext";
import { useProducts } from "@/contexts/ProductContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";

const Checkout = () => {
    const { items, clearCart, updateQuantity, removeFromCart } = useCart();
    const { settings } = useSettings();
    const { addOrder } = useOrders();
    const { decrementStock } = useProducts();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        street: "",
        number: "",
        neighborhood: "",
        city: "",
        reference: "",
    });
    const [paymentMethod, setPaymentMethod] = useState("credit_card");

    const subtotal = items.reduce((sum, item) => {
        const price = parseFloat(item.price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
        return sum + price * item.quantity;
    }, 0);

    const total = subtotal + settings.shippingPrice;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (items.length === 0) {
            toast.error("Seu carrinho está vazio!");
            return;
        }

        const fullAddress = `${formData.street}, ${formData.number}, ${formData.neighborhood}, ${formData.city} - Ref: ${formData.reference}`;

        try {
            await addOrder({
                clientId: null, // Guest checkout
                clientName: formData.name,
                clientPhone: formData.phone,
                clientAddress: fullAddress,
                items: items.map(item => ({
                    productId: item.id,
                    productName: item.name,
                    size: item.size,
                    quantity: item.quantity,
                    price: parseFloat(item.price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim())
                })),
                total: total,
                status: "Pendente"
            });

            // Decrement stock for each item
            await Promise.all(items.map(item => decrementStock(item.id, item.size, item.quantity)));

            clearCart();

            if (paymentMethod === "credit_card") {
                const itemsList = items.map(item =>
                    `• ${item.name} (${item.size}) - Qtd: ${item.quantity}`
                ).join("\n");

                const message = `*Novo Pedido - Cartão de Crédito*\n\n` +
                    `*Cliente:* ${formData.name}\n` +
                    `*Telefone:* ${formData.phone}\n` +
                    `*Endereço:* ${fullAddress}\n\n` +
                    `*Itens:*\n${itemsList}\n\n` +
                    `*Total:* ${formatCurrency(total)}\n\n` +
                    `Segue os dados da minha compra, aguardo o link de pagamento.`;

                const encodedMessage = encodeURIComponent(message);
                window.location.href = `https://api.whatsapp.com/send/?phone=3398263040&text=${encodedMessage}&type=phone_number&app_absent=0`;
            } else {
                navigate("/order-confirmation", { state: { paymentMethod } });
            }
        } catch (error) {
            console.error("Erro ao finalizar compra:", error);
            toast.error("Erro ao processar pedido. Tente novamente.");
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 pt-24 pb-12">
                <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Customer Info & Payment */}
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informações do Cliente</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nome Completo</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Digite seu nome"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Telefone</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2 space-y-2">
                                            <Label htmlFor="street">Rua</Label>
                                            <Input
                                                id="street"
                                                name="street"
                                                value={formData.street}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Nome da rua"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="number">Número</Label>
                                            <Input
                                                id="number"
                                                name="number"
                                                value={formData.number}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Nº"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="neighborhood">Bairro</Label>
                                            <Input
                                                id="neighborhood"
                                                name="neighborhood"
                                                value={formData.neighborhood}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Bairro"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="city">Cidade</Label>
                                            <Input
                                                id="city"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Cidade"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reference">Ponto de Referência</Label>
                                        <Input
                                            id="reference"
                                            name="reference"
                                            value={formData.reference}
                                            onChange={handleInputChange}
                                            placeholder="Próximo a..."
                                        />
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Forma de Pagamento</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup
                                    value={paymentMethod}
                                    onValueChange={setPaymentMethod}
                                    className="space-y-4"
                                >
                                    <div className="flex items-center space-x-2 border p-4 rounded-md">
                                        <RadioGroupItem value="credit_card" id="credit_card" />
                                        <Label htmlFor="credit_card" className="flex-1 cursor-pointer">
                                            Cartão de Crédito
                                        </Label>
                                    </div>
                                    <div className="border p-4 rounded-md">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="pix" id="pix" />
                                            <Label htmlFor="pix" className="flex-1 cursor-pointer">
                                                Pix
                                            </Label>
                                        </div>
                                        {paymentMethod === "pix" && (
                                            <div className="mt-4 pt-4 border-t">
                                                <p className="text-sm font-medium mb-2">Chave Pix para pagamento:</p>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <code className="bg-muted p-2 rounded border flex-1 text-sm font-mono">conexao011.loja@gmail.com</code>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText("conexao011.loja@gmail.com");
                                                            toast.success("Chave Pix copiada!");
                                                        }}
                                                    >
                                                        Copiar
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    O pagamento será confirmado via WhatsApp após a finalização do pedido.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2 border p-4 rounded-md">
                                        <RadioGroupItem value="delivery" id="delivery" />
                                        <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                                            Pagamento na Entrega
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div>
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Resumo do Pedido</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={`${item.id}-${item.size}`} className="flex gap-4">
                                            <div className="w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-medium text-sm">{item.name}</h4>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                        onClick={() => removeFromCart(item.id, item.size)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-muted-foreground mb-2">
                                                    Tamanho: {item.size}
                                                </p>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-sm font-bold text-primary">
                                                        {item.price}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </Button>
                                                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Frete</span>
                                        <span className={settings.shippingPrice === 0 ? "text-green-500" : ""}>
                                            {settings.shippingPrice === 0 ? "Grátis" : formatCurrency(settings.shippingPrice)}
                                        </span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-primary">{formatCurrency(total)}</span>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    form="checkout-form"
                                    className="w-full bg-[hsl(45,100%,50%)] text-black hover:bg-[hsl(42,100%,40%)] font-bold text-lg h-12"
                                >
                                    Finalizar Pedido
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
