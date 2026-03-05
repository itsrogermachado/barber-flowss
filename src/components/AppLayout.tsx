import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Home, Scissors, Users, Clock, Ban, Settings, CreditCard, UserPlus, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { membership, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isOwnerAdmin = membership?.role === 'OWNER' || membership?.role === 'ADMIN';

  const links = [
    { to: '/app', icon: Home, label: 'Início' },
    { to: '/app/agenda', icon: Calendar, label: 'Agenda' },
    ...(isOwnerAdmin ? [{ to: '/app/servicos', icon: Scissors, label: 'Serviços' }] : []),
    { to: '/app/barbeiros', icon: Users, label: 'Barbeiros' },
    { to: '/app/horarios', icon: Clock, label: 'Horários' },
    { to: '/app/bloqueios', icon: Ban, label: 'Bloqueios' },
    ...(isOwnerAdmin ? [
      { to: '/app/usuarios', icon: UserPlus, label: 'Usuários' },
      { to: '/app/configuracoes', icon: Settings, label: 'Configurações' },
      { to: '/app/assinatura', icon: CreditCard, label: 'Assinatura' },
    ] : []),
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b bg-card px-4 py-3 lg:hidden">
        <Link to="/app" className="text-xl font-bold font-['Space_Grotesk'] text-primary">BarberFlow</Link>
        <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 pt-16 lg:hidden">
          <nav className="flex flex-col gap-1 p-4">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors',
                  location.pathname === l.to ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                )}
              >
                <l.icon className="h-5 w-5" />
                {l.label}
              </Link>
            ))}
            <button onClick={handleSignOut} className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-destructive hover:bg-secondary">
              <LogOut className="h-5 w-5" />
              Sair
            </button>
          </nav>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-card">
          <div className="p-6">
            <Link to="/app" className="text-2xl font-bold font-['Space_Grotesk'] text-primary">BarberFlow</Link>
            <p className="mt-1 text-sm text-muted-foreground">{membership?.shops?.name}</p>
          </div>
          <nav className="flex-1 flex flex-col gap-1 px-3">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                  location.pathname === l.to ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                )}
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="p-3 border-t">
            <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-destructive hover:bg-secondary">
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-64">
          <div className="mx-auto max-w-4xl px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
