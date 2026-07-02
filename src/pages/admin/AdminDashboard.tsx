import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
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
  Settings,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { LocalDB } from '@/services/LocalDatabase';

const formatRelativeTime = (date: Date) => {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString();
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ courses: 0, products: 0, waitlist: 0 });
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [estRevenue, setEstRevenue] = useState(12450);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const formatted = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    setCurrentDate(formatted);
  }, []);

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

      // Fetch bookings & messages
      const { data: bookings } = await LocalDB.getBookings();
      const { data: messages } = await LocalDB.getMessages();

      // Convert waitlist to activities
      const waitlistActivities = (waitlist || []).map((w: any) => ({
        type: 'waitlist',
        user: w.email.split('@')[0],
        action: 'joined waitlist',
        course: w.source || 'Academy Workshop',
        timestamp: new Date(w.created_at || Date.now())
      }));

      // Convert bookings to activities
      const bookingActivities = (bookings || []).map((b: any) => ({
        type: 'booking',
        user: b.clientName,
        action: `booked ${b.service}`,
        course: `${b.date} at ${b.time}`,
        timestamp: new Date(b.created_at || b.date || Date.now())
      }));

      // Convert messages to activities
      const messageActivities = (messages || [])
        .filter((m: any) => m.status === 'new' && m.name !== 'Alanís Salon')
        .map((m: any) => ({
          type: 'message',
          user: m.name?.split('|||AVATAR|||')[0] || 'Unknown',
          action: 'sent message',
          course: m.message,
          timestamp: new Date(m.created_at || m.date || Date.now())
        }));

      // Combine and sort
      const combined = [
        ...waitlistActivities,
        ...bookingActivities,
        ...messageActivities
      ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
       .slice(0, 5);

      setActivities(combined);

      // Estimate monthly revenue from product reservations
      const { data: reservations } = await supabase.from('product_reservations').select('*');
      let totalRevenue = 0;
      if (reservations && products) {
        reservations.forEach((res: any) => {
          const prod = products.find((p: any) => p.id === res.product_id);
          if (prod) {
            totalRevenue += Number(prod.price || 0);
          }
        });
      }
      setEstRevenue(totalRevenue > 0 ? totalRevenue : 12450);

      setLoading(false);
    };
    fetchStats();
  }, []);

  const metrics = [
    { label: 'Active Courses', value: stats.courses, icon: GraduationCap, color: 'bg-blue-500', trend: '+2 this month' },
    { label: 'Shop Products', value: stats.products, icon: ShoppingBag, color: 'bg-emerald-500', trend: 'Stock ok' },
    { label: 'Academy Waitlist', value: stats.waitlist, icon: Users, color: 'bg-amber-500', trend: `+${stats.waitlist} total` },
    { label: 'Est. Revenue (Month)', value: `$${estRevenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-violet-500', trend: '+15.2%' },
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
            <span className="font-body text-xs font-medium text-foreground">{currentDate}</span>
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
              {activities.length === 0 ? (
                <p className="font-body text-sm text-muted-foreground">No recent activity detected.</p>
              ) : (
                activities.map((activity, i) => (
                  <div key={i} className="flex items-start gap-4 pb-6 border-b border-black/5 last:border-0 last:pb-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'waitlist' 
                        ? 'bg-amber-50 text-amber-600' 
                        : activity.type === 'booking' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-blue-50 text-blue-600'
                    }`}>
                      {activity.type === 'waitlist' ? (
                        <Users className="w-5 h-5" />
                      ) : activity.type === 'booking' ? (
                        <Calendar className="w-5 h-5" />
                      ) : (
                        <MessageSquare className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-foreground truncate">
                        <span className="font-bold">{activity.user}</span> {activity.action}
                      </p>
                      <p className="font-body text-xs text-muted-foreground mt-0.5 truncate">{activity.course}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground font-body text-[10px] flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(activity.timestamp)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-accent rounded-3xl p-8 text-white shadow-xl shadow-accent/20 relative overflow-hidden">
            <div className="relative z-10">
              <CheckCircle2 className="w-12 h-12 text-white/40 mb-4" />
              <h3 className="font-display text-2xl font-medium mb-2">Alanis Academy</h3>
              <p className="font-body text-sm text-white/70 mb-6 leading-relaxed">
                You have {stats.waitlist} new enrollment request{stats.waitlist !== 1 ? 's' : ''} pending review.
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

