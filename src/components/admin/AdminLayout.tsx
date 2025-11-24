import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut, Layers, Menu } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const AdminLayout = () => {
    const { isAuthenticated, logout, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate("/admin/login");
        }
    }, [isAuthenticated, loading, navigate]);

    if (loading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;
    if (!isAuthenticated) return null;

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
        { icon: Package, label: "Produtos", path: "/admin/products" },
        { icon: Layers, label: "Coleções", path: "/admin/collections" },
        { icon: Layers, label: "Categorias", path: "/admin/categories" },
        { icon: ShoppingBag, label: "Pedidos", path: "/admin/orders" },
        { icon: Users, label: "Clientes", path: "/admin/clients" },
        { icon: Settings, label: "Configurações", path: "/admin/settings" },
        { icon: Layers, label: "Diagnóstico", path: "/admin/diagnostics" },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-primary/20">
                <h1 className="font-impact text-2xl text-primary uppercase tracking-wide">
                    Admin Panel
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${isActive
                                ? "bg-primary/10 text-primary font-medium border border-primary/20"
                                : "text-muted-foreground hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={logout}
                >
                    <LogOut className="w-5 h-5" />
                    Sair
                </Button>
            </div>
        </div>
    );

    return (
        <div id="admin-root" className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden p-4 border-b bg-black flex items-center justify-between sticky top-0 z-50">
                <h1 className="font-impact text-xl text-primary uppercase tracking-wide">
                    Admin Panel
                </h1>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white">
                            <Menu className="w-6 h-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64 bg-black border-r border-primary/20 text-white">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className="w-64 bg-black border-r border-primary/20 fixed h-full hidden md:flex flex-col">
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
