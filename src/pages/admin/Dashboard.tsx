import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingBag, Users } from "lucide-react";
import { useProducts } from "@/contexts/ProductContext";
import { useClients } from "@/contexts/ClientContext";
import { useOrders } from "@/contexts/OrderContext";

const Dashboard = () => {
    const { products } = useProducts();
    const { clients } = useClients();
    const { orders } = useOrders();

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
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

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
        </div>
    );
};

export default Dashboard;
