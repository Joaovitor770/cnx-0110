import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProductDetails from "./pages/ProductDetails";
import CollectionDetails from "./pages/CollectionDetails";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Clients from "./pages/admin/Clients";
import Orders from "./pages/admin/Orders";
import Settings from "./pages/admin/Settings";
import Collections from "./pages/admin/Collections";
import Categories from "./pages/admin/Categories";
import Diagnostics from "./pages/admin/Diagnostics";
import HeroManager from "./pages/admin/HeroManager";
import AdminLayout from "./components/admin/AdminLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ProductProvider } from "./contexts/ProductContext";
import { ClientProvider } from "./contexts/ClientContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { OrderProvider } from "./contexts/OrderContext";
import { CollectionProvider } from "./contexts/CollectionContext";
import { CategoryProvider } from "./contexts/CategoryContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <AuthProvider>
        <ProductProvider>
          <ClientProvider>
            <OrderProvider>
              <CollectionProvider>
                <CategoryProvider>
                  <CartProvider>
                    <TooltipProvider>
                      <Toaster />
                      <BrowserRouter>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/product/:id" element={<ProductDetails />} />
                          <Route path="/collections/:slug" element={<CollectionDetails />} />
                          <Route path="/checkout" element={<Checkout />} />
                          <Route path="/order-confirmation" element={<OrderConfirmation />} />

                          {/* Admin Routes */}
                          <Route path="/admin/login" element={<Login />} />
                          <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="products" element={<Products />} />
                            <Route path="clients" element={<Clients />} />
                            <Route path="orders" element={<Orders />} />
                            <Route path="collections" element={<Collections />} />
                            <Route path="categories" element={<Categories />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="diagnostics" element={<Diagnostics />} />
                            <Route path="hero" element={<HeroManager />} />
                          </Route>

                          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        </Routes>
                      </BrowserRouter>
                    </TooltipProvider>
                  </CartProvider>
                </CategoryProvider>
              </CollectionProvider>
            </OrderProvider>
          </ClientProvider>
        </ProductProvider>
      </AuthProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;
