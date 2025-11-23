import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";

const OrderConfirmation = () => {
    const location = useLocation();
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 pt-32 pb-12 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>

                <h1 className="text-4xl font-bold mb-4">Pedido Confirmado!</h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-md">
                    Obrigado pela sua compra. Você receberá um email com os detalhes do seu pedido em breve.
                </p>

                {location.state?.paymentMethod === "pix" && (
                    <div className="mb-8 w-full max-w-md bg-muted/30 p-6 rounded-lg border border-border">
                        <h3 className="font-bold text-lg mb-4">Pagamento via Pix</h3>
                        <p className="text-sm text-muted-foreground mb-2">Chave Pix:</p>
                        <div className="flex items-center gap-2 mb-6">
                            <code className="bg-background p-3 rounded border flex-1 text-sm font-mono">conexao011.loja@gmail.com</code>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    navigator.clipboard.writeText("conexao011.loja@gmail.com");
                                    toast.success("Chave Pix copiada!");
                                }}
                            >
                                Copiar
                            </Button>
                        </div>

                        <a
                            href="https://api.whatsapp.com/send/?phone=3398263040&text&type=phone_number&app_absent=0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center h-12 px-6 bg-green-600 hover:bg-green-700 text-white rounded-md font-bold text-lg transition-colors mb-4 gap-2"
                        >
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                            Enviar Comprovante
                        </a>
                        <p className="text-xs text-muted-foreground">
                            Envie o comprovante para agilizar a liberação do seu pedido.
                        </p>
                    </div>
                )}

                <Link to="/">
                    <Button className="bg-[hsl(45,100%,50%)] text-black hover:bg-[hsl(42,100%,40%)] font-bold px-8 py-6 text-lg">
                        Voltar para a Loja
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default OrderConfirmation;
