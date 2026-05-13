import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  GraduationCap, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Globe,
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { LocalDB } from '@/services/LocalDatabase';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ courses: 0, products: 0, waitlist: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = () => {
      const courses = LocalDB.getCourses();
      const products = LocalDB.getProducts();
      const waitlist = LocalDB.getWaitlist();
      
      setStats({
        courses: courses.length,
        products: products.length,
        waitlist: waitlist.length,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const metrics = [
    { label: 'Cursos Activos', value: stats.courses, icon: GraduationCap, color: 'bg-blue-500', trend: '+2 este mes' },
    { label: 'Productos Shop', value: stats.products, icon: ShoppingBag, color: 'bg-emerald-500', trend: 'Stock ok' },
    { label: 'Interesados Academy', value: stats.waitlist, icon: Users, color: 'bg-amber-500', trend: '+12 nuevos' },
    { label: 'Ingresos Est. (Mes)', value: '$12,450', icon: TrendingUp, color: 'bg-violet-500', trend: '+15.2%' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-4xl font-light text-foreground tracking-tight">Bienvenida, Rosie</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Aquí tienes el resumen de tu plataforma hoy.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-black/5 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
            <Calendar className="w-4 h-4 text-accent" />
            <span className="font-body text-xs font-medium text-foreground">12 Mayo, 2026</span>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {metrics.map(metric => (
          <div key={metric.label} className="bg-white rounded-2xl p-6 border border-black/5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 ${metric.color} rounded-2xl flex items-center justify-center shadow-lg shadow-black/5`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{metric.label}</p>
                <h3 className="font-display text-2xl font-bold text-foreground">{metric.value}</h3>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full w-fit">
              <ArrowUpRight className="w-3 h-3" />
              {metric.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display text-xl font-medium">Actividad Reciente</h3>
              <Link to="/admin/waitlist" className="text-accent font-body text-xs font-bold hover:underline">Ver todo</Link>
            </div>
            <div className="space-y-6">
              {[
                { type: 'waitlist', user: 'Laura G.', action: 'se unió a la lista de espera', time: 'hace 2 horas', course: 'Masterclass Extensiones' },
                { type: 'product', user: 'Shop', action: 'Nuevo producto añadido', time: 'hace 5 horas', course: 'Wella Brilliance Mask' },
                { type: 'waitlist', user: 'Maria S.', action: 'se unió a la lista de espera', time: 'Ayer', course: 'Color Science' },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-4 pb-6 border-b border-black/5 last:border-0 last:pb-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.type === 'waitlist' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                    {activity.type === 'waitlist' ? <Users className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-body text-sm text-foreground">
                      <span className="font-bold">{activity.user}</span> {activity.action}
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">{activity.course}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground font-body text-[10px]">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-accent rounded-3xl p-8 text-white shadow-xl shadow-accent/20 relative overflow-hidden">
            <div className="relative z-10">
              <CheckCircle2 className="w-12 h-12 text-white/40 mb-4" />
              <h3 className="font-display text-2xl font-medium mb-2">Alanis Academy</h3>
              <p className="font-body text-sm text-white/70 mb-6 leading-relaxed">
                Tienes 12 nuevas solicitudes de inscripción pendientes de revisión.
              </p>
              <Link to="/admin/waitlist">
                <button className="bg-white text-accent font-body text-xs font-bold px-6 py-3 rounded-xl hover:bg-white/90 transition-all">
                  Revisar Solicitudes
                </button>
              </Link>
            </div>
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
            <h3 className="font-display text-lg font-medium mb-6">Atajos Rápidos</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Nuevo Curso', icon: GraduationCap, path: '/admin/courses' },
                { label: 'Añadir Stock', icon: ShoppingBag, path: '/admin/products' },
                { label: 'Editar Visual', icon: Globe, path: '/' },
                { label: 'Ajustes', icon: Settings, path: '/admin/settings' },
              ].map(item => (
                <Link 
                  key={item.label} 
                  to={item.path}
                  className="p-4 bg-[#FAFAFA] rounded-2xl flex flex-col items-center gap-2 hover:bg-accent hover:text-white transition-all group"
                >
                  <item.icon className="w-5 h-5 text-accent group-hover:text-white" />
                  <span className="font-body text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
