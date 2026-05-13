import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { 
  LayoutDashboard, 
  GraduationCap, 
  ShoppingBag, 
  LogOut, 
  Users, 
  ArrowLeft,
  Settings,
  Image as ImageIcon,
  MessageSquare,
  BarChart3,
  Globe,
  Calendar
} from 'lucide-react';
import logo from '@/assets/logo-alanis.png';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Cursos Academy', icon: GraduationCap, path: '/admin/courses' },
  { label: 'Productos Shop', icon: ShoppingBag, path: '/admin/products' },
  { label: 'Reservas', icon: Calendar, path: '/admin/bookings' },
  { label: 'Contenido Visual', icon: Globe, path: '/admin/content' },
  { label: 'Lista de Espera', icon: Users, path: '/admin/waitlist' },
  { label: 'Multimedia', icon: ImageIcon, path: '/admin/media' },
  { label: 'Mensajes', icon: MessageSquare, path: '/admin/messages' },
  { label: 'Analíticas', icon: BarChart3, path: '/admin/analytics' },
  { label: 'Configuración', icon: Settings, path: '/admin/settings' },
];

const AdminLayout = () => {
  const location = useLocation();
  const { signOut, user } = useAdminAuth();

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-black/5 flex flex-col flex-shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8 border-b border-black/5">
          <Link to="/">
            <img src={logo} alt="Alanís Salon" className="h-12 mb-4 hover:opacity-80 transition-opacity" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <p className="font-body text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Admin Portal v2.0</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm transition-all duration-300 ${
                  active
                    ? 'bg-accent text-white shadow-lg shadow-accent/20'
                    : 'text-muted-foreground hover:bg-accent/5 hover:text-accent'
                }`}
              >
                <item.icon className={`w-4 h-4 ${active ? 'text-white' : ''}`} />
                <span className="font-medium">{item.label}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-black/5 bg-[#FAFAFA] space-y-4">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-display font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-body text-xs font-bold text-foreground truncate">{user?.email}</p>
              <p className="font-body text-[10px] text-muted-foreground">Super Administrator</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/" className="flex-1">
              <Button variant="outline" size="sm" className="w-full rounded-lg gap-2 text-[11px] h-9">
                <ArrowLeft className="w-3 h-3" /> Ver Sitio
              </Button>
            </Link>
            <Button 
              onClick={signOut}
              variant="ghost" 
              size="sm" 
              className="w-full rounded-lg gap-2 text-[11px] text-destructive hover:bg-destructive/5 hover:text-destructive h-9"
            >
              <LogOut className="w-3 h-3" /> Salir
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
