import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GraduationCap, ShoppingBag, Users, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ courses: 0, products: 0, waitlist: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [courses, products, waitlist] = await Promise.all([
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('waitlist').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        courses: courses.count ?? 0,
        products: products.count ?? 0,
        waitlist: waitlist.count ?? 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Courses', value: stats.courses, icon: GraduationCap, path: '/admin/courses', color: 'text-blue-500' },
    { label: 'Products', value: stats.products, icon: ShoppingBag, path: '/admin/products', color: 'text-emerald-500' },
    { label: 'Waitlist Emails', value: stats.waitlist, icon: Users, path: '/admin/waitlist', color: 'text-amber-500' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light text-foreground">Dashboard</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">Overview of your salon platform</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 mb-10">
        {cards.map(card => (
          <Link
            key={card.label}
            to={card.path}
            className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <card.icon className={`w-8 h-8 ${card.color}`} />
              <span className="font-display text-3xl font-medium text-foreground">{card.value}</span>
            </div>
            <p className="font-body text-sm text-muted-foreground">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <Link to="/admin/courses" className="bg-cream rounded-2xl p-6 hover:shadow-md transition-all group">
          <GraduationCap className="w-6 h-6 text-accent mb-3" />
          <h3 className="font-display text-lg font-medium text-foreground mb-1">Manage Courses</h3>
          <p className="font-body text-sm text-muted-foreground">Create courses, add Meet links, set prices</p>
        </Link>
        <Link to="/admin/products" className="bg-cream rounded-2xl p-6 hover:shadow-md transition-all group">
          <ShoppingBag className="w-6 h-6 text-accent mb-3" />
          <h3 className="font-display text-lg font-medium text-foreground mb-1">Manage Products</h3>
          <p className="font-body text-sm text-muted-foreground">Add products, update prices and inventory</p>
        </Link>
        <Link to="/admin/content" className="bg-cream rounded-2xl p-6 hover:shadow-md transition-all group">
          <FileText className="w-6 h-6 text-accent mb-3" />
          <h3 className="font-display text-lg font-medium text-foreground mb-1">Edit Site Content</h3>
          <p className="font-body text-sm text-muted-foreground">Update hero, about, and section text</p>
        </Link>
        <Link to="/admin/waitlist" className="bg-cream rounded-2xl p-6 hover:shadow-md transition-all group">
          <Users className="w-6 h-6 text-accent mb-3" />
          <h3 className="font-display text-lg font-medium text-foreground mb-1">View Waitlist</h3>
          <p className="font-body text-sm text-muted-foreground">See who signed up for the academy</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
