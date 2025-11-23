import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useOrders, Order } from "@/contexts/OrderContext";

const Orders = () => {
    const { orders, updateOrderStatus } = useOrders();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setDetailsOpen(true);
    };

    const handleStatusChange = (orderId: number, newStatus: Order["status"]) => {
        updateOrderStatus(orderId, newStatus);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Pendente":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "Processando":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "Enviado":
                return "bg-purple-100 text-purple-800 border-purple-200";
            case "Entregue":
                return "bg-green-100 text-green-800 border-green-200";
            case "Cancelado":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Pedidos</h2>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Nenhum pedido encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">#{order.id}</TableCell>
                                    <TableCell>{order.clientName}</TableCell>
                                    <TableCell>
                                        {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                                    </TableCell>
                                    <TableCell>{formatCurrency(order.total)}</TableCell>
                                    <TableCell>
                                        <Select
                                            defaultValue={order.status}
                                            onValueChange={(value) =>
                                                handleStatusChange(order.id, value as Order["status"])
                                            }
                                        >
                                            <SelectTrigger className={`w-[140px] h-8 ${getStatusColor(order.status)} border-0`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pendente">Pendente</SelectItem>
                                                <SelectItem value="Processando">Processando</SelectItem>
                                                <SelectItem value="Enviado">Enviado</SelectItem>
                                                <SelectItem value="Entregue">Entregue</SelectItem>
                                                <SelectItem value="Cancelado">Cancelado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleViewDetails(order)}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detalhes do Pedido #{selectedOrder?.id}</DialogTitle>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold mb-2">Cliente</h4>
                                    <p className="text-sm text-muted-foreground">{selectedOrder.clientName}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Data</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(selectedOrder.createdAt).toLocaleString("pt-BR")}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <h4 className="font-semibold mb-2">Endereço de Entrega</h4>
                                    <p className="text-sm text-muted-foreground">{selectedOrder.clientAddress || "Endereço não informado"}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-4">Itens do Pedido</h4>
                                <div className="space-y-4">
                                    {selectedOrder.items.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0"
                                        >
                                            <div>
                                                <p className="font-medium">{item.productName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Tamanho: {item.size} | Qtd: {item.quantity}
                                                </p>
                                            </div>
                                            <p className="font-medium">
                                                {formatCurrency(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t">
                                <span className="font-bold text-lg">Total</span>
                                <span className="font-bold text-lg text-primary">
                                    {formatCurrency(selectedOrder.total)}
                                </span>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Orders;
