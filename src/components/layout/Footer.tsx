import { APP_NAME } from '@/lib/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary/30 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-lg">{APP_NAME}</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Premium apparel for those who appreciate the silence. Crafted with precision, worn with attitude.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-sm">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/catalog" className="hover:text-foreground transition-colors">New Arrivals</a></li>
              <li><a href="/catalog?cat=tees" className="hover:text-foreground transition-colors">Tees</a></li>
              <li><a href="/catalog?cat=accessories" className="hover:text-foreground transition-colors">Accessories</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/about" className="hover:text-foreground transition-colors">About Us</a></li>
              <li><a href="/careers" className="hover:text-foreground transition-colors">Careers</a></li>
              <li><a href="/terms" className="hover:text-foreground transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Stay Connected</h4>
            <div className="flex gap-4">
               {/* Social placeholders */}
               <div className="w-8 h-8 rounded-full bg-foreground/10" />
               <div className="w-8 h-8 rounded-full bg-foreground/10" />
               <div className="w-8 h-8 rounded-full bg-foreground/10" />
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>&copy; {currentYear} {APP_NAME}. All rights reserved.</p>
          <p>Designed with 🖤 in the Void.</p>
        </div>
      </div>
    </footer>
  );
}