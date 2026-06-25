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
    const fetchStats = async () => {
      const { data: courses } = await LocalDB.getCourses();
      const { data: products } = await LocalDB.getProducts();
      const { data: waitlist } = await LocalDB.getWaitlist();
      
      setStats({
        courses: courses?.length || 0,
        products: products?.length || 0,
        waitlist: waitlist?.length || 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const metrics = [
    { label: 'Active Courses', value: stats.courses, icon: GraduationCap, color: 'bg-blue-500', trend: '+2 this month' },
    { label: 'Shop Products', value: stats.products, icon: ShoppingBag, color: 'bg-emerald-500', trend: 'Stock ok' },
    { label: 'Academy Waitlist', value: stats.waitlist, icon: Users, color: 'bg-amber-500', trend: '+12 new' },
    { label: 'Est. Revenue (Month)', value: '$12,450', icon: TrendingUp, color: 'bg-violet-500', trend: '+15.2%' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-4xl font-light text-foreground tracking-tight">Welcome, Rosie</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Here is your platform summary for today.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-black/5 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
            <Calendar className="w-4 h-4 text-accent" />
            <span className="font-body text-xs font-medium text-foreground">May 12, 2026</span>
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
              <h3 className="font-display text-xl font-medium">Recent Activity</h3>
              <Link to="/admin/waitlist" className="text-accent font-body text-xs font-bold hover:underline">View all</Link>
            </div>
            <div className="space-y-6">
              {[
                { type: 'waitlist', user: 'Laura G.', action: 'joined the waitlist', time: '2 hours ago', course: 'Extensiones Masterclass' },
                { type: 'product', user: 'Shop', action: 'New product added', time: '5 hours ago', course: 'Wella Brilliance Mask' },
                { type: 'waitlist', user: 'Maria S.', action: 'joined the waitlist', time: 'Yesterday', course: 'Color Science' },
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
                You have 12 new enrollment requests pending review.
              </p>
              <Link to="/admin/waitlist">
                <button className="bg-white text-accent font-body text-xs font-bold px-6 py-3 rounded-xl hover:bg-white/90 transition-all">
                  Review Requests
                </button>
              </Link>
            </div>
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
            <h3 className="font-display text-lg font-medium mb-6">Quick Shortcuts</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'New Course', icon: GraduationCap, path: '/admin/courses' },
                { label: 'Add Stock', icon: ShoppingBag, path: '/admin/products' },
                { label: 'Edit Visual', icon: Globe, path: '/' },
                { label: 'Settings', icon: Settings, path: '/admin/settings' },
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
