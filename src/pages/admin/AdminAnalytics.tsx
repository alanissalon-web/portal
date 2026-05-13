import { TrendingUp, Users, Eye, ShoppingCart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { name: 'Lun', visitas: 400, ventas: 240 },
  { name: 'Mar', visitas: 300, ventas: 139 },
  { name: 'Mie', visitas: 200, ventas: 980 },
  { name: 'Jue', visitas: 278, ventas: 390 },
  { name: 'Vie', visitas: 189, ventas: 480 },
  { name: 'Sab', visitas: 239, ventas: 380 },
  { name: 'Dom', visitas: 349, ventas: 430 },
];

const AdminAnalytics = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-3xl font-light text-foreground">Analíticas</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Monitorea el tráfico y rendimiento de tu plataforma.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Visitas Totales', value: '14,280', icon: Eye, trend: '+12%', up: true },
          { label: 'Nuevos Usuarios', value: '840', icon: Users, trend: '+5%', up: true },
          { label: 'Tasa de Conversión', value: '3.2%', icon: TrendingUp, trend: '-1%', up: false },
          { label: 'Ventas Academy', value: '$8,450', icon: ShoppingCart, trend: '+18%', up: true },
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
          <h3 className="font-display text-lg font-medium mb-8">Tráfico Semanal</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
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
                <Area type="monotone" dataKey="visitas" stroke="#C4A484" fillOpacity={1} fill="url(#colorVisitas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
          <h3 className="font-display text-lg font-medium mb-8">Ventas por Día</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontFamily: 'Inter'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontFamily: 'Inter'}} />
                <Tooltip />
                <Bar dataKey="ventas" fill="#1A1A1A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
