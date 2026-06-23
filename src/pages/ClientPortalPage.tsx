import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LocalDB } from '@/services/LocalDatabase';
import { SalonNavbar } from '@/components/SalonNavbar';
import { SalonFooter } from '@/components/SalonFooter';
import { Button } from '@/components/ui/button';
import {
  GraduationCap, Heart, Calendar, MessageSquare, LogOut, BookOpen,
  ExternalLink, Clock, Trash2, ShoppingBag, User, Loader2,
  CheckCircle, Award, Mail, Send, Plus, X, Settings, Camera
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Send as SendIcon, CheckCheck } from 'lucide-react';

interface ChatMsg {
  id: string;
  text?: string;
  image?: string;
  voice?: string;
  sender: 'me' | 'them';
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

export default function ClientPortalPage() {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'favorites' | 'reservations' | 'purchases' | 'messages' | 'settings'>('courses');
  const navigate = useNavigate();
  const { toast } = useToast();

  const [courses, setCourses] = useState<any[]>([]);
  const [courseFavorites, setCourseFavorites] = useState<any[]>([]);
  const [productFavorites, setProductFavorites] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Message compose
  const [showCompose, setShowCompose] = useState(false);
  const [msgName, setMsgName] = useState('');
  const [msgText, setMsgText] = useState('');
  const [msgSending, setMsgSending] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Settings
  const [settingsName, setSettingsName] = useState('');
  const [settingsEmail, setSettingsEmail] = useState('');
  const [settingsPassword, setSettingsPassword] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Initialize settings when student loads
  useEffect(() => {
    if (student) {
      setSettingsName(student.user_metadata?.full_name || '');
      setSettingsEmail(student.email || '');
    }
  }, [student]);

  // Auto scroll
  useEffect(() => {
    if (activeTab === 'messages' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/admin/login#client');
      } else {
        setStudent(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/admin/login#client');
      else setStudent(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!student?.id) return;

    let isMounted = true;

    const fetchPortalData = async () => {
      if (!isMounted) return;
      setDataLoading(true);
      try {
        const [
          { data: enrollIds },
          { data: allCourses },
          { data: cFavIds },
          { data: pFavIds },
          { data: allProducts },
          { data: resData },
          { data: msgData }
        ] = await Promise.all([
          LocalDB.getStudentEnrollments(student.id),
          LocalDB.getCourses(),
          LocalDB.getCourseFavorites(student.id),
          LocalDB.getProductFavorites(student.id),
          LocalDB.getProducts(),
          LocalDB.getProductReservations(student.id),
          LocalDB.getMessages()
        ]);

        const enrolled = (allCourses || []).filter((c: any) => (enrollIds || []).includes(c.id));
        const courseFavs = (allCourses || []).filter((c: any) => (cFavIds || []).includes(c.id));
        const prodFavs = (allProducts || []).filter((p: any) => (pFavIds || []).includes(p.id));

        const mappedRes = (resData || []).map((res: any) => {
          const prod = (allProducts || []).find((p: any) => p.id === res.product_id);
          return { ...res, productName: prod?.name || 'Producto', productPrice: prod?.price || 0 };
        });

        const idStr = student.email;
        const filteredMsgs = (msgData || []).filter((m: any) =>
          (m.type === 'chat' || !m.type) && (m.email === idStr || m.toEmail === idStr)
        );
        const mappedMsgs = filteredMsgs.map((m: any) => ({
          id: m.id,
          text: m.message,
          image: m.image,
          voice: m.voice,
          sender: m.email === idStr ? 'me' : 'them',
          timestamp: m.date || m.created_at || new Date().toISOString(),
          status: 'delivered',
        })).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        if (isMounted) {
          setCourses(enrolled);
          setCourseFavorites(courseFavs);
          setProductFavorites(prodFavs);
          setReservations(mappedRes);
          setMessages(mappedMsgs);
        }
      } catch (err) {
        console.error('Error fetching portal data:', err);
      } finally {
        if (isMounted) setDataLoading(false);
      }
    };

    fetchPortalData();

    // 🔴 Realtime: listen for new enrollments so My Courses updates instantly
    const channel = supabase
      .channel(`enrollments:${student.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'enrollments',
          filter: `user_id=eq.${student.id}`,
        },
        async () => {
          // Re-fetch courses when a new enrollment is added
          const { data: enrollIds } = await LocalDB.getStudentEnrollments(student.id);
          const { data: allCourses } = await LocalDB.getCourses();
          const enrolled = (allCourses || []).filter((c: any) => (enrollIds || []).includes(c.id));
          if (isMounted) setCourses(enrolled);
        }
      )
      .subscribe();

    // 🔴 Realtime: listen for new messages
    const msgChannel = supabase
      .channel(`messages:${student.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          // Re-fetch messages on change
          LocalDB.getMessages().then(({ data }) => {
            if (!isMounted) return;
            const idStr = student.email;
            const filteredMsgs = (data || []).filter((m: any) =>
              (m.type === 'chat' || !m.type) && (m.email === idStr || m.toEmail === idStr)
            );
            setMessages(filteredMsgs.map((m: any) => ({
              id: m.id,
              text: m.message,
              image: m.image,
              voice: m.voice,
              sender: m.email === idStr ? 'me' : 'them',
              timestamp: m.date || m.created_at || new Date().toISOString(),
              status: 'delivered',
            })).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
      supabase.removeChannel(msgChannel);
    };
  }, [student?.id, student?.email]);

  const handleSignOut = async () => {
    await LocalDB.logout();
    // supabase.auth.signOut() already called inside LocalDB.logout()
    toast({ title: 'Sesión cerrada', description: 'Hasta pronto 👋' });
    navigate('/');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    setMsgSending(true);
    try {
      const { data, error } = await supabase.from('messages').insert({
        name: student?.user_metadata?.full_name || student?.email?.split('@')?.[0] || 'Cliente',
        email: student?.email,
        message: msgText.trim(),
        type: 'chat',
        date: new Date().toISOString(),
      }).select().single();
      if (error) throw error;
      setMsgText('');
      const formatted = {
        id: data.id,
        text: data.message,
        sender: 'me' as const,
        timestamp: data.date || data.created_at || new Date().toISOString(),
        status: 'delivered' as const,
      };
      setMessages(prev => {
        if (prev.find(m => m.id === formatted.id)) return prev;
        return [...prev, formatted];
      });
    } catch (err: any) {
      toast({ title: 'Error', description: 'No se pudo enviar el mensaje.', variant: 'destructive' });
    } finally {
      setMsgSending(false);
    }
  };

  const handleRemoveFavorite = async (productId: string) => {
    await LocalDB.toggleFavorite(student.id, productId);
    setProductFavorites(prev => prev.filter(p => p.id !== productId));
    toast({ title: 'Eliminado de favoritos' });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const updates: any = {};
      if (settingsPassword) updates.password = settingsPassword;
      if (settingsEmail && settingsEmail !== student.email) updates.email = settingsEmail;
      if (settingsName && settingsName !== student.user_metadata?.full_name) {
        updates.data = { full_name: settingsName };
      }

      if (Object.keys(updates).length > 0) {
        const { data, error } = await supabase.auth.updateUser(updates);
        if (error) throw error;
        toast({ title: 'Perfil actualizado' });
        
        // Optimistic update so it reflects immediately
        if (data?.user) {
          setStudent({ ...data.user });
        } else {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) setStudent({ ...session.user });
        }
        
        if (settingsPassword) setSettingsPassword('');
      } else {
        toast({ title: 'Sin cambios', description: 'No modificaste ningún dato.' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !student) return;

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${student.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('site-images').getPublicUrl(filePath);
      
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: data.publicUrl }
      });

      if (updateError) throw updateError;

      toast({ title: 'Foto actualizada' });
      
      if (updateData?.user) {
        setStudent({ ...updateData.user });
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) setStudent({ ...session.user });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: 'No se pudo subir la imagen.', variant: 'destructive' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center animate-pulse">
            <User className="w-7 h-7 text-accent" />
          </div>
          <p className="font-body text-sm text-muted-foreground uppercase tracking-widest">Loading portal...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'courses',      icon: GraduationCap, label: 'My Courses',      count: courses.length },
    { id: 'favorites',    icon: Heart,          label: 'Favorites',       count: courseFavorites.length + productFavorites.length },
    { id: 'reservations', icon: Calendar,       label: 'Reservations',   count: reservations.length },
    { id: 'purchases',    icon: ShoppingBag,    label: 'My Purchases',     count: purchases.length },
    { id: 'messages',     icon: MessageSquare,  label: 'Messages',        count: messages.length },
    { id: 'settings',     icon: Settings,       label: 'Settings',   count: undefined },
  ] as const;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <SalonNavbar />

      {/* Hero Banner */}
      <div className="bg-charcoal pt-48 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal to-accent/20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full -mr-48 -mt-48 blur-3xl pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center overflow-hidden">
                {student?.user_metadata?.avatar_url ? (
                  <img src={student.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-accent" />
                )}
              </div>
              <div>
                <span className="font-body text-xs uppercase tracking-widest text-accent/80 mb-1 block">
                  Client Portal
                </span>
                <h1 className="font-display text-2xl md:text-3xl font-light text-white">
                  Welcome{student ? `, ${student.user_metadata?.full_name || student?.email?.split('@')?.[0] || 'Client'}` : ''}
                </h1>
                <p className="font-body text-xs text-white/40 mt-1">{student?.email}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0">
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 gap-2 rounded-xl"
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="w-4 h-4" />
                Configure Profile
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 gap-2 rounded-xl"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-10">
            {[
              { label: 'Courses', value: courses.length, icon: GraduationCap },
              { label: 'Favorites', value: courseFavorites.length + productFavorites.length, icon: Heart },
              { label: 'Reservations', value: reservations.length, icon: Calendar },
              { label: 'Purchases', value: purchases.length, icon: ShoppingBag },
              { label: 'Messages', value: messages.length, icon: Mail },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                  <s.icon className="w-3.5 h-3.5 text-accent" />
                </div>
                <div>
                  <p className="font-display text-lg text-white leading-none mb-1">{s.value}</p>
                  <p className="font-body text-[9px] text-white/50 uppercase tracking-wider">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-border overflow-hidden sticky top-32 shadow-sm">
              <div className="flex flex-col">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-5 py-4 font-body text-sm font-medium border-l-2 transition-all text-left ${
                      activeTab === tab.id
                        ? 'border-accent bg-accent/5 text-accent'
                        : 'border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="flex-1">{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        activeTab === tab.id ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
          {dataLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
              <p className="font-body text-sm text-muted-foreground">Loading information...</p>
            </div>
          ) : (
            <>
              {/* ── CURSOS ── */}
              {activeTab === 'courses' && (
                <div>
                  <div className="mb-8">
                    <h2 className="font-display text-2xl font-light text-foreground">My Enrolled Courses</h2>
                    <p className="font-body text-sm text-muted-foreground mt-1">Access the lessons of the courses you unlocked.</p>
                  </div>

                  {courses.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-border p-16 text-center shadow-sm">
                      <div className="w-20 h-20 rounded-full bg-accent/5 flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-10 h-10 text-accent/30" />
                      </div>
                      <h3 className="font-display text-xl text-foreground mb-2">You don't have any courses yet</h3>
                      <p className="font-body text-sm text-muted-foreground mb-8 max-w-xs mx-auto">
                        Explore the academy and unlock your first masterclass with an access code.
                      </p>
                      <Button variant="gold" className="rounded-xl gap-2" onClick={() => navigate('/academy')}>
                        <GraduationCap className="w-4 h-4" /> Explore Academy
                      </Button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {courses.map(course => (
                        <div key={course.id} className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                          <div className="relative h-44 overflow-hidden">
                            <img
                              src={course.image_url || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80'}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-3 left-4">
                              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Acceso Activo
                              </span>
                            </div>
                          </div>
                          <div className="p-5">
                            <h4 className="font-display text-base font-medium text-foreground mb-2 line-clamp-2">{course.title}</h4>
                            <div className="flex gap-3 text-xs text-muted-foreground mb-4">
                              {course.duration && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.duration}</span>}
                              {course.level && <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" />{course.level}</span>}
                            </div>
                            <Button
                              variant="gold"
                              size="sm"
                              className="w-full rounded-xl gap-2"
                              onClick={() => navigate(`/academy/${course.id}`)}
                            >
                              View Lessons <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── FAVORITOS ── */}
              {activeTab === 'favorites' && (
                <div>
                  <div className="mb-8">
                    <h2 className="font-display text-2xl font-light text-foreground">Favorite Products</h2>
                    <p className="font-body text-sm text-muted-foreground mt-1">Products you saved from our shop.</p>
                  </div>
                  {productFavorites.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-border p-16 text-center shadow-sm">
                      <div className="w-20 h-20 rounded-full bg-accent/5 flex items-center justify-center mx-auto mb-6">
                        <Heart className="w-10 h-10 text-accent/30" />
                      </div>
                      <h3 className="font-display text-xl text-foreground mb-2">No favorites yet</h3>
                      <p className="font-body text-sm text-muted-foreground mb-8 max-w-xs mx-auto">
                        Explore the shop and save products you like.
                      </p>
                      <Button variant="gold" className="rounded-xl gap-2" onClick={() => navigate('/shop')}>
                        <ShoppingBag className="w-4 h-4" /> Go to Shop
                      </Button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {productFavorites.map(product => (
                        <div key={product.id} className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                          <div className="relative h-44 overflow-hidden bg-muted">
                            <img src={product.image || product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                          <div className="p-5">
                            <p className="font-body text-[10px] text-accent uppercase tracking-wider mb-1">{product.brand}</p>
                            <h4 className="font-display text-base font-medium mb-1 line-clamp-1">{product.name}</h4>
                            <p className="font-display text-lg font-semibold text-foreground mb-4">${product.price}</p>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs" onClick={() => navigate('/shop')}>
                                View in Shop
                              </Button>
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/5 rounded-xl" onClick={() => handleRemoveFavorite(product.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── RESERVACIONES ── */}
              {activeTab === 'reservations' && (
                <div>
                  <div className="mb-8">
                    <h2 className="font-display text-2xl font-light text-foreground">My Reservations</h2>
                    <p className="font-body text-sm text-muted-foreground mt-1">Status of reserved products for pickup at the salon.</p>
                  </div>
                  {reservations.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-border p-16 text-center shadow-sm">
                      <div className="w-20 h-20 rounded-full bg-accent/5 flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-10 h-10 text-accent/30" />
                      </div>
                      <h3 className="font-display text-xl text-foreground mb-2">No active reservations</h3>
                      <p className="font-body text-sm text-muted-foreground mb-8 max-w-xs mx-auto">
                        Reserve shop products to pick them up at the salon.
                      </p>
                      <Button variant="gold" className="rounded-xl gap-2" onClick={() => navigate('/shop')}>
                        <ShoppingBag className="w-4 h-4" /> Reserve Products
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reservations.map(res => (
                        <div key={res.id} className="bg-white rounded-2xl border border-border p-6 shadow-sm flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-accent/5 flex items-center justify-center text-accent">
                              <ShoppingBag className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-display text-base font-medium">{res.productName}</h4>
                              <p className="font-body text-xs text-muted-foreground mt-0.5">
                                Reserved on {new Date(res.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full ${
                              res.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                              res.status === 'confirmed' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                              res.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {res.status === 'pending' ? 'Pending' : res.status === 'confirmed' ? 'Confirmed' : res.status === 'completed' ? 'Completed' : res.status}
                            </span>
                            <span className="font-display text-base font-semibold">${res.productPrice}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── COMPRAS ── */}
              {activeTab === 'purchases' && (
                <div>
                  <div className="mb-8">
                    <h2 className="font-display text-2xl font-light text-foreground">Purchase History</h2>
                    <p className="font-body text-sm text-muted-foreground mt-1">
                      Here you will see your purchases (Note: Purchases of products on Amazon or external links are managed from their respective platforms).
                    </p>
                  </div>

                  {purchases.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-border p-16 text-center shadow-sm">
                      <div className="w-20 h-20 rounded-full bg-accent/5 flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-10 h-10 text-accent/30" />
                      </div>
                      <h3 className="font-display text-xl text-foreground mb-2">You have no recorded purchases yet</h3>
                      <p className="font-body text-sm text-muted-foreground mb-8 max-w-xs mx-auto">
                        Affiliate products you acquire via our Amazon links do not appear in this local history.
                      </p>
                      <Button variant="gold" className="rounded-xl gap-2" onClick={() => navigate('/shop')}>
                        <ShoppingBag className="w-4 h-4" /> Go to Shop
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Aquí se mapearían las compras locales si existieran */}
                    </div>
                  )}
                </div>
              )}

              {/* ── MENSAJES (LIVE CHAT) ── */}
              {activeTab === 'messages' && (
                <div className="flex flex-col h-[600px] bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-border bg-accent/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center shadow-md">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-medium text-foreground">Alanís Salon & Spa</h2>
                      <p className="font-body text-xs text-muted-foreground">Normally we respond in minutes</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAFAF8]" ref={scrollRef}>
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground my-10 font-body text-sm">
                        Send us a message and we will reply as soon as possible.
                      </div>
                    ) : (
                      messages.map((msg: any) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                          {msg.sender === 'them' && (
                            <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                          )}
                          <div className={`max-w-[80%] rounded-2xl p-4 ${msg.sender === 'me' ? 'bg-accent text-white rounded-tr-sm' : 'bg-white border border-border text-foreground shadow-sm rounded-tl-sm'}`}>
                            <p className="font-body text-sm whitespace-pre-wrap">{msg.text}</p>
                            <div className={`text-[10px] mt-2 flex items-center gap-1 ${msg.sender === 'me' ? 'text-white/70' : 'text-muted-foreground'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {msg.sender === 'me' && <CheckCheck className="w-3 h-3 ml-1" />}
                            </div>
                          </div>
                          {msg.sender === 'me' && (
                            <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0 overflow-hidden">
                              {student?.user_metadata?.avatar_url ? (
                                <img src={student.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-4 h-4 text-accent" />
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-border">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={msgText}
                        onChange={e => setMsgText(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full bg-muted/50 border border-border rounded-full pl-6 pr-14 py-4 font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                        disabled={msgSending}
                      />
                      <button
                        type="submit"
                        disabled={!msgText.trim() || msgSending}
                        className="absolute right-2 w-10 h-10 bg-accent hover:bg-accent/90 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                      >
                        {msgSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ── SETTINGS ── */}
              {activeTab === 'settings' && (
                <div className="bg-white rounded-3xl border border-border shadow-sm p-8">
                  <div className="mb-8 border-b border-border pb-6">
                    <h2 className="font-display text-2xl font-light text-foreground flex items-center gap-3">
                      <Settings className="w-6 h-6 text-accent" />
                      Account Settings
                    </h2>
                    <p className="font-body text-sm text-muted-foreground mt-1">Update your personal information and security options.</p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
                    {/* Avatar Upload (Alternative) */}
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-20 h-20 rounded-2xl bg-muted overflow-hidden relative border border-border">
                        {student.user_metadata?.avatar_url ? (
                          <img src={student.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-accent/5 text-accent">
                            <User className="w-8 h-8" />
                          </div>
                        )}
                        {uploadingAvatar && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-body text-sm font-medium text-foreground mb-2">Profile Photo</p>
                        <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                        <label 
                          htmlFor="avatar-upload"
                          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl border border-accent text-accent hover:bg-accent hover:text-white transition-all shadow-sm cursor-pointer ${uploadingAvatar ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <Camera className="w-4 h-4" />
                          Change Photo
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="font-body text-xs font-medium text-foreground block mb-2">Full Name</label>
                      <input
                        type="text"
                        value={settingsName}
                        onChange={e => setSettingsName(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label className="font-body text-xs font-medium text-foreground block mb-2">Email Address</label>
                      <input
                        type="email"
                        value={settingsEmail}
                        onChange={e => setSettingsEmail(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                        placeholder="tu@correo.com"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1 px-1">Se enviará un correo de confirmación a ambas direcciones al cambiarlo.</p>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <label className="font-body text-xs font-medium text-foreground block mb-2">Nueva Contraseña</label>
                      <input
                        type="password"
                        value={settingsPassword}
                        onChange={e => setSettingsPassword(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                        placeholder="Déjalo en blanco para mantener la actual"
                      />
                    </div>

                    <div className="pt-6">
                      <Button
                        type="submit"
                        className="bg-accent hover:bg-accent/90 text-white rounded-xl gap-2 w-full md:w-auto px-8"
                        disabled={savingSettings}
                      >
                        {savingSettings ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : 'Guardar Cambios'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
      <SalonFooter />
    </div>
  );
}
