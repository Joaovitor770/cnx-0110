import { ShoppingCart, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { useState } from "react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
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
          <div className="flex-1 md:flex-none flex justify-center md:justify-start">
            <img src={logo} alt="Conexão 011" className="h-12 md:h-14" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <a href="#" className="text-foreground hover:text-primary transition-colors text-sm tracking-widest uppercase">
              Home
            </a>
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
            <Button variant="ghost" size="icon" className="hover:text-primary">
              <User className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:text-primary relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                0
              </span>
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
    </header>
  );
};

export default Header;
