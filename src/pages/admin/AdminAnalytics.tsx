import { useEffect, useState } from 'react';
import { TrendingUp, Users, Eye, ShoppingCart, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { LocalDB } from '@/services/LocalDatabase';

const defaultBaselineData = [
  { name: 'Mon', visits: 400, sales: 240 },
  { name: 'Tue', visits: 300, sales: 139 },
  { name: 'Wed', visits: 200, sales: 980 },
  { name: 'Thu', visits: 278, sales: 390 },
  { name: 'Fri', visits: 189, sales: 480 },
  { name: 'Sat', visits: 239, sales: 380 },
  { name: 'Sun', visits: 349, sales: 430 },
];

const AdminAnalytics = () => {
  const [stats, setStats] = useState({
    visits: 14280,
    newUsers: 840,
    conversionRate: 3.2,
    sales: 8450
  });
  const [chartData, setChartData] = useState<any[]>(defaultBaselineData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      // 1. Fetch datasets
      const { data: waitlist } = await LocalDB.getWaitlist();
      const { data: bookings } = await LocalDB.getBookings();
      const { data: messages } = await LocalDB.getMessages();
      const { data: courses } = await LocalDB.getCourses();
      const { data: products } = await LocalDB.getProducts();
      
      const { data: enrollments } = await supabase.from('enrollments').select('*');
      const { data: reservations } = await supabase.from('product_reservations').select('*');

      // 2. Count metrics
      const totalWaitlist = waitlist?.length || 0;
      const totalBookings = bookings?.length || 0;
      const totalMessages = messages?.length || 0;
      const totalReservations = reservations?.length || 0;

      const calculatedVisits = totalWaitlist + totalBookings + totalMessages;

      // Count unique emails
      const uniqueEmails = new Set<string>();
      (waitlist || []).forEach((w: any) => w.email && uniqueEmails.add(w.email));
      (bookings || []).forEach((b: any) => b.email && uniqueEmails.add(b.email));
      (messages || []).forEach((m: any) => m.email && uniqueEmails.add(m.email));
      
      const calculatedUsers = uniqueEmails.size;

      // Calculate Revenue
      let academyRevenue = 0;
      if (enrollments && courses) {
        enrollments.forEach((e: any) => {
          const course = courses.find((c: any) => c.id === e.course_id);
          if (course) academyRevenue += Number(course.price || 0);
        });
      }
      
      let shopRevenue = 0;
      if (reservations && products) {
        reservations.forEach((r: any) => {
          const prod = products.find((p: any) => p.id === r.product_id);
          if (prod) shopRevenue += Number(prod.price || 0);
        });
      }
      
      const calculatedSales = academyRevenue + shopRevenue;
      const displaySales = calculatedSales;

      // Conversion Rate
      const totalConversions = totalBookings + totalReservations;
      const calculatedConvRate = calculatedVisits > 0 
        ? Number(((totalConversions / calculatedVisits) * 100).toFixed(1)) 
        : 0;
      const displayConvRate = calculatedConvRate;

      setStats({
        visits: calculatedVisits,
        newUsers: calculatedUsers,
        conversionRate: displayConvRate,
        sales: displaySales
      });

      // 3. Build Chart Data
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const aggregated = days.map(day => ({ name: day, visits: 0, sales: 0 }));

      const addVisit = (dateString: string) => {
        if (!dateString) return;
        const d = new Date(dateString);
        const dayName = days[d.getDay()];
        const match = aggregated.find(a => a.name === dayName);
        if (match) match.visits += 1;
      };

      const addSale = (dateString: string, price: number) => {
        if (!dateString) return;
        const d = new Date(dateString);
        const dayName = days[d.getDay()];
        const match = aggregated.find(a => a.name === dayName);
        if (match) match.sales += price;
      };

      (waitlist || []).forEach((w: any) => addVisit(w.created_at));
      (bookings || []).forEach((b: any) => addVisit(b.created_at || b.date));
      (messages || []).forEach((m: any) => addVisit(m.created_at || m.date));

      if (enrollments && courses) {
        enrollments.forEach((e: any) => {
          const course = courses.find((c: any) => c.id === e.course_id);
          if (course) addSale(e.enrolled_at, Number(course.price || 0));
        });
      }
      if (reservations && products) {
        reservations.forEach((r: any) => {
          const prod = products.find((p: any) => p.id === r.product_id);
          if (prod) addSale(r.created_at, Number(prod.price || 0));
        });
      }

      const finalChartData = aggregated.map((item) => {
        return {
          name: item.name,
          visits: item.visits,
          sales: item.sales
        };
      });

      const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const sortedChartData = [...finalChartData].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
      setChartData(sortedChartData);

      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-120px)]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-3xl font-light text-foreground">Analytics</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Monitor your platform traffic and performance in real-time.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Visits', value: stats.visits.toLocaleString(), icon: Eye, trend: '+12%', up: true },
          { label: 'New Users', value: stats.newUsers.toLocaleString(), icon: Users, trend: '+5%', up: true },
          { label: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: TrendingUp, trend: '-1%', up: false },
          { label: 'Academy Sales', value: `$${stats.sales.toLocaleString()}`, icon: ShoppingCart, trend: '+18%', up: true },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent">
                <item.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold ${item.up ? 'text-emerald-600' : 'text-rose-600'}`}>
                {item.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {item.trend}
              </div>
            </div>
            <p className="font-body text-xs text-muted-foreground uppercase tracking-widest font-bold">{item.label}</p>
            <h3 className="font-display text-2xl font-bold text-foreground mt-1">{item.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
          <h3 className="font-display text-lg font-medium mb-8">Weekly Traffic</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C4A484" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C4A484" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontFamily: 'Inter'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontFamily: 'Inter'}} />
                <Tooltip />
                <Area type="monotone" dataKey="visits" stroke="#C4A484" fillOpacity={1} fill="url(#colorVisitas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
          <h3 className="font-display text-lg font-medium mb-8">Sales per Day</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontFamily: 'Inter'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontFamily: 'Inter'}} />
                <Tooltip />
                <Bar dataKey="sales" fill="#1A1A1A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
