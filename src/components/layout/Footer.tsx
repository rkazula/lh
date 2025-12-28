import { Link } from 'react-router-dom';
import { APP_NAME } from '@/lib/constants';
import { Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="text-xl font-bold tracking-tighter">
              {APP_NAME}
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Minimalistyczny streetwear dla introwertyków. Wysokiej jakości materiały, zero hałasu.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Sklep</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/catalog" className="hover:text-foreground transition-colors">
                  Wszystkie produkty
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-foreground transition-colors">
                  Kolekcje
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=new" className="hover:text-foreground transition-colors">
                  Nowości
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Firma</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-foreground transition-colors">
                  O nas
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-foreground transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-foreground transition-colors">
                  Dostawa i zwroty
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Obserwuj nas</h4>
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}. Wszystkie prawa zastrzeżone.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Polityka prywatności
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Regulamin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
