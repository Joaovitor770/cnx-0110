import { Instagram, Facebook, Twitter } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-12" id="contact">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <img src={logo} alt="Conexão 011" className="h-16 mb-4" />
            <p className="text-muted-foreground text-sm max-w-md">
              Streetwear premium com identidade autêntica. Estilo urbano elevado ao próximo nível desde 2024.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-foreground font-bold uppercase tracking-wider mb-4 text-sm">
              Links Rápidos
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="#collections" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Coleções
                </a>
              </li>
              <li>
                <a href="#new" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Lançamentos
                </a>
              </li>
              <li>
                <a href="#sale" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Promoções
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-foreground font-bold uppercase tracking-wider mb-4 text-sm">
              Suporte
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Política de Troca
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Rastreamento
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 Conexão 011. Todos os direitos reservados.
          </p>
          <div className="flex gap-4">
            <a
              href="https://www.instagram.com/connexao.011"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
