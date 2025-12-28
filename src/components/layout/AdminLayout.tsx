import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase-client';
import { Box, Tag, Percent, Settings, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';

export default function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/login');
        return;
      }

      // In a real app, we might also check a public claim or local state, 
      // but the true security is on the API side. 
      // For UX, we fetch the role from DB or rely on the API 403 response later.
      // Here we assume if logged in via /admin/login flow, they are admin-ish.
      
      setLoading(false);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
            navigate('/admin/login');
        }
    });

    return () => authListener.subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Spinner size="lg" />
        </div>
    );
  }

  const navItems = [
      { icon: Box, label: 'Inventory', path: '/admin/inventory' },
      { icon: Percent, label: 'Discounts', path: '/admin/discounts' },
      { icon: Settings, label: 'Settings & VAT', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen flex bg-secondary/30">
      {/* Sidebar - macOS Settings Style */}
      <aside className="w-64 bg-background/80 backdrop-blur-xl border-r border-border fixed inset-y-0 z-20 flex flex-col">
        <div className="p-6 h-16 flex items-center border-b border-border/50">
           <LayoutDashboard className="w-5 h-5 mr-2 text-primary" />
           <span className="font-bold tracking-tight">Admin Console</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive 
                            ? "bg-primary text-primary-foreground shadow-sm" 
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                </NavLink>
            ))}
        </nav>

        <div className="p-4 border-t border-border/50">
            <div className="flex items-center gap-3 px-3 py-3 mb-2">
                 <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                     AD
                 </div>
                 <div className="overflow-hidden">
                     <p className="text-sm font-medium truncate">Administrator</p>
                     <p className="text-xs text-muted-foreground truncate">Super User</p>
                 </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
            </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
            <Outlet />
        </div>
      </main>
    </div>
  );
}