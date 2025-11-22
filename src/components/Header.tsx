import { ShoppingCart, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import Cart from "@/components/Cart";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="relative flex items-center justify-between h-20">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>

          {/* Logo */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 md:static md:transform-none md:flex-none">
            <Link to="/">
              <img src={logo} alt="Conexão 011" className="h-16 md:h-20" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <Link to="/" className="text-foreground hover:text-primary transition-colors text-sm tracking-widest uppercase">
              Home
            </Link>
            <a href="#collections" className="text-foreground hover:text-primary transition-colors text-sm tracking-widest uppercase">
              Coleções
            </a>
            <a href="#new" className="text-foreground hover:text-primary transition-colors text-sm tracking-widest uppercase">
              Lançamentos
            </a>
            <a href="#sale" className="text-foreground hover:text-primary transition-colors text-sm tracking-widest uppercase">
              Promoções
            </a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors text-sm tracking-widest uppercase">
              Contato
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <User className="w-5 h-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-primary relative"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-border py-4 space-y-4">
            <a href="#" className="block text-foreground hover:text-primary transition-colors text-sm tracking-widest uppercase">
              Home
            </a>
            <a href="#collections" className="block text-foreground hover:text-primary transition-colors text-sm tracking-widest uppercase">
              Coleções
            </a>
            <a href="#new" className="block text-foreground hover:text-primary transition-colors text-sm tracking-widest uppercase">
              Lançamentos
            </a>
            <a href="#sale" className="block text-foreground hover:text-primary transition-colors text-sm tracking-widest uppercase">
              Promoções
            </a>
            <a href="#contact" className="block text-foreground hover:text-primary transition-colors text-sm tracking-widest uppercase">
              Contato
            </a>
          </nav>
        )}
      </div>

      <Cart open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
};

export default Header;
