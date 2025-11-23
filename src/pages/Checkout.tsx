import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useOrders } from "@/contexts/OrderContext";
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
    const { items, clearCart } = useCart();
    const { settings } = useSettings();
    const { addOrder } = useOrders();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
    });
    const [paymentMethod, setPaymentMethod] = useState("credit_card");

    const subtotal = items.reduce((sum, item) => {
        const price = parseFloat(item.price.replace("R$", "").replace(".", "").replace(",", ".").trim());
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (items.length === 0) {
            toast.error("Seu carrinho está vazio!");
            return;
        }

        addOrder({
            clientId: Date.now(), // Temporary ID generation
            clientName: formData.name,
            clientAddress: formData.address,
            items: items.map(item => ({
                productId: item.id,
                productName: item.name,
                size: item.size,
                quantity: item.quantity,
                price: parseFloat(item.price.replace("R$", "").replace(".", "").replace(",", ".").trim())
            })),
            total: total,
            status: "Pendente"
        });

        clearCart();
        navigate("/order-confirmation", { state: { paymentMethod } });
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
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="seu@email.com"
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
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Endereço de Entrega</Label>
                                        <Input
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Rua, Número, Bairro, Cidade - Estado"
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
                                                <h4 className="font-medium text-sm">{item.name}</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    Tamanho: {item.size} | Qtd: {item.quantity}
                                                </p>
                                                <p className="text-sm font-bold text-primary mt-1">
                                                    {item.price}
                                                </p>
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
