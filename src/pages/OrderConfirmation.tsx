import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

const OrderConfirmation = () => {
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
