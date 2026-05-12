import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { LayoutDashboard, GraduationCap, ShoppingBag, FileText, LogOut, Users, ArrowLeft } from 'lucide-react';
import logo from '@/assets/logo-alanis.png';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Courses', icon: GraduationCap, path: '/admin/courses' },
  { label: 'Products', icon: ShoppingBag, path: '/admin/products' },
  { label: 'Content', icon: FileText, path: '/admin/content' },
  { label: 'Waitlist', icon: Users, path: '/admin/waitlist' },
];

const AdminLayout = () => {
  const location = useLocation();
  const { signOut, user } = useAdminAuth();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-border">
          <img src={logo} alt="Alanís Salon" className="h-10 mb-2" />
          <p className="font-body text-xs text-muted-foreground">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-body text-sm transition-all duration-200 ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/70 hover:bg-cream hover:text-foreground'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-body text-sm text-foreground/70 hover:bg-cream hover:text-foreground transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            View Site
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-body text-sm text-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
          <p className="px-4 font-body text-xs text-muted-foreground truncate">{user?.email}</p>
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
