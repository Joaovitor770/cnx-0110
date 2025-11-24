import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DollarSign, Package, ShoppingBag, Users, Trash2 } from "lucide-react";
import { useProducts } from "@/contexts/ProductContext";
import { useClients } from "@/contexts/ClientContext";
import { useOrders } from "@/contexts/OrderContext";
import { useCollections } from "@/contexts/CollectionContext";
import { useCategories } from "@/contexts/CategoryContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Dashboard = () => {
    const { products } = useProducts();
    const { clients } = useClients();
    const { orders } = useOrders();
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const totalSales = orders.reduce((acc, order) => acc + order.total, 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const activeClients = clients.filter(c => c.status === "Ativo").length;
    const lowStockProducts = products.filter(p => p.sizes.some(s => s.stock < 5)).length;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const handleResetDatabase = async () => {
        setIsResetting(true);
        try {
            // Delete in order: products first (has foreign keys), then categories and collections
            const { error: productsError } = await supabase
                .from('products')
                .delete()
                .neq('id', 0); // Delete all

            if (productsError) throw productsError;

            const { error: categoriesError } = await supabase
                .from('categories')
                .delete()
                .neq('id', 0);

            if (categoriesError) throw categoriesError;

            const { error: collectionsError } = await supabase
                .from('collections')
                .delete()
                .neq('id', 0);

            if (collectionsError) throw collectionsError;

            toast.success("Banco de dados resetado com sucesso!");
            setShowResetDialog(false);
        } catch (error) {
            console.error('Error resetting database:', error);
            toast.error("Erro ao resetar banco de dados: " + (error as Error).message);
        } finally {
            setIsResetting(false);
        }
    };

    const stats = [
        {
            title: "Vendas Totais",
            value: formatCurrency(totalSales),
            icon: DollarSign,
            description: "Receita total acumulada",
        },
        {
            title: "Pedidos",
            value: totalOrders.toString(),
            icon: ShoppingBag,
            description: `${orders.filter(o => o.status === "Pendente").length} pendentes`,
        },
        {
            title: "Produtos",
            value: totalProducts.toString(),
            icon: Package,
            description: `${lowStockProducts} com estoque baixo`,
        },
        {
            title: "Clientes Ativos",
            value: activeClients.toString(),
            icon: Users,
            description: `${clients.length} cadastrados no total`,
        },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <Button
                    variant="destructive"
                    onClick={() => setShowResetDialog(true)}
                    className="gap-2"
                >
                    <Trash2 className="w-4 h-4" />
                    Resetar Banco de Dados
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação NÃO PODE ser desfeita. Isso irá permanentemente deletar:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Todos os produtos ({totalProducts})</li>
                                <li>Todas as categorias</li>
                                <li>Todas as coleções</li>
                            </ul>
                            <p className="mt-4 font-bold text-destructive">
                                Use apenas para testes em desenvolvimento!
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isResetting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleResetDatabase}
                            disabled={isResetting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isResetting ? "Resetando..." : "Sim, resetar tudo"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Dashboard;

