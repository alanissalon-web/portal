import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LocalDB } from '@/services/LocalDatabase';
import { SalonNavbar } from '@/components/SalonNavbar';
import { SalonFooter } from '@/components/SalonFooter';
import { Button } from '@/components/ui/button';
import {
  GraduationCap, Heart, Calendar, MessageSquare, LogOut, BookOpen,
  ExternalLink, Clock, Trash2, ShoppingBag, User, Loader2,
  CheckCircle, Award, Mail, Send, Plus, X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ClientPortalPage() {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'favorites' | 'reservations' | 'messages'>('courses');
  const navigate = useNavigate();
  const { toast } = useToast();

  const [courses, setCourses] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Message compose
  const [showCompose, setShowCompose] = useState(false);
  const [msgName, setMsgName] = useState('');
  const [msgText, setMsgText] = useState('');
  const [msgSending, setMsgSending] = useState(false);

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
    if (!student) return;

    const fetchPortalData = async () => {
      setDataLoading(true);
      try {
        const { data: enrollIds } = await LocalDB.getStudentEnrollments(student.id);
        const { data: allCourses } = await LocalDB.getCourses();
        const enrolled = (allCourses || []).filter((c: any) => (enrollIds || []).includes(c.id));
        setCourses(enrolled);

        const { data: favIds } = await LocalDB.getProductFavorites(student.id);
        const { data: allProducts } = await LocalDB.getProducts();
        setFavorites((allProducts || []).filter((p: any) => (favIds || []).includes(p.id)));

        const { data: resData } = await LocalDB.getProductReservations(student.id);
        setReservations((resData || []).map((res: any) => {
          const prod = (allProducts || []).find((p: any) => p.id === res.product_id);
          return { ...res, productName: prod?.name || 'Producto', productPrice: prod?.price || 0 };
        }));

        const { data: msgData } = await LocalDB.getMessages();
        setMessages((msgData || []).filter((m: any) => m.email?.toLowerCase() === student.email?.toLowerCase()));
      } catch (err) {
        console.error('Error fetching portal data:', err);
      } finally {
        setDataLoading(false);
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
          setCourses(enrolled);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [student]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: 'Sesión cerrada', description: 'Hasta pronto 👋' });
    navigate('/');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    setMsgSending(true);
    try {
      const { data, error } = await supabase.from('messages').insert({
        name: msgName || student?.email?.split('@')[0] || 'Cliente',
        email: student?.email,
        message: msgText.trim(),
      }).select().single();
      if (error) throw error;
      setMessages(prev => [data, ...prev]);
      setMsgText('');
      setMsgName('');
      setShowCompose(false);
      toast({ title: '✅ Mensaje enviado', description: 'Te responderemos pronto.' });
    } catch (err: any) {
      toast({ title: 'Error', description: 'No se pudo enviar el mensaje.', variant: 'destructive' });
    } finally {
      setMsgSending(false);
    }
  };

  const handleRemoveFavorite = async (productId: string) => {
    await LocalDB.toggleFavorite(student.id, productId);
    setFavorites(prev => prev.filter(p => p.id !== productId));
    toast({ title: 'Eliminado de favoritos' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center animate-pulse">
            <User className="w-7 h-7 text-accent" />
          </div>
          <p className="font-body text-sm text-muted-foreground uppercase tracking-widest">Cargando portal...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'courses',      icon: GraduationCap, label: 'Mis Cursos',      count: courses.length },
    { id: 'favorites',    icon: Heart,          label: 'Favoritos',       count: favorites.length },
    { id: 'reservations', icon: Calendar,       label: 'Reservaciones',   count: reservations.length },
    { id: 'messages',     icon: MessageSquare,  label: 'Mensajes',        count: messages.length },
  ] as const;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <SalonNavbar />

      {/* Hero Banner */}
      <div className="bg-charcoal pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal to-accent/20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full -mr-48 -mt-48 blur-3xl pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                <User className="w-8 h-8 text-accent" />
              </div>
              <div>
                <p className="font-body text-xs text-accent/80 uppercase tracking-widest mb-1">Portal de Estudiantes</p>
                <h1 className="font-display text-2xl md:text-3xl font-light text-white">
                  Bienvenida{student?.email ? `, ${student.email.split('@')[0]}` : ''}
                </h1>
                <p className="font-body text-xs text-white/40 mt-1">{student?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 gap-2 rounded-xl"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            {[
              { label: 'Cursos', value: courses.length, icon: GraduationCap },
              { label: 'Favoritos', value: favorites.length, icon: Heart },
              { label: 'Reservaciones', value: reservations.length, icon: ShoppingBag },
              { label: 'Mensajes', value: messages.length, icon: Mail },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="font-display text-xl text-white">{s.value}</p>
                  <p className="font-body text-[10px] text-white/40 uppercase">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-border sticky top-[72px] z-40 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 font-body text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
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

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          {dataLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
              <p className="font-body text-sm text-muted-foreground">Cargando información...</p>
            </div>
          ) : (
            <>
              {/* ── CURSOS ── */}
              {activeTab === 'courses' && (
                <div>
                  <div className="mb-8">
                    <h2 className="font-display text-2xl font-light text-foreground">Mis Cursos Inscritos</h2>
                    <p className="font-body text-sm text-muted-foreground mt-1">Accede a las lecciones de los cursos que desbloqueaste.</p>
                  </div>

                  {courses.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-border p-16 text-center shadow-sm">
                      <div className="w-20 h-20 rounded-full bg-accent/5 flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-10 h-10 text-accent/30" />
                      </div>
                      <h3 className="font-display text-xl text-foreground mb-2">Aún no tienes cursos</h3>
                      <p className="font-body text-sm text-muted-foreground mb-8 max-w-xs mx-auto">
                        Explora la academia y desbloquea tu primer masterclass con un código de acceso.
                      </p>
                      <Button variant="gold" className="rounded-xl gap-2" onClick={() => navigate('/academy')}>
                        <GraduationCap className="w-4 h-4" /> Explorar Academy
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
                              Ver Lecciones <ExternalLink className="w-3.5 h-3.5" />
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
                    <h2 className="font-display text-2xl font-light text-foreground">Productos Favoritos</h2>
                    <p className="font-body text-sm text-muted-foreground mt-1">Los productos que guardaste de nuestra tienda.</p>
                  </div>
                  {favorites.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-border p-16 text-center shadow-sm">
                      <div className="w-20 h-20 rounded-full bg-accent/5 flex items-center justify-center mx-auto mb-6">
                        <Heart className="w-10 h-10 text-accent/30" />
                      </div>
                      <h3 className="font-display text-xl text-foreground mb-2">Sin favoritos aún</h3>
                      <p className="font-body text-sm text-muted-foreground mb-8 max-w-xs mx-auto">
                        Explora la tienda y guarda los productos que te gusten.
                      </p>
                      <Button variant="gold" className="rounded-xl gap-2" onClick={() => navigate('/shop')}>
                        <ShoppingBag className="w-4 h-4" /> Ir a la Tienda
                      </Button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favorites.map(product => (
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
                                Ver en tienda
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
                    <h2 className="font-display text-2xl font-light text-foreground">Mis Reservaciones</h2>
                    <p className="font-body text-sm text-muted-foreground mt-1">Estado de los productos reservados para recoger en el salón.</p>
                  </div>
                  {reservations.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-border p-16 text-center shadow-sm">
                      <div className="w-20 h-20 rounded-full bg-accent/5 flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-10 h-10 text-accent/30" />
                      </div>
                      <h3 className="font-display text-xl text-foreground mb-2">Sin reservaciones activas</h3>
                      <p className="font-body text-sm text-muted-foreground mb-8 max-w-xs mx-auto">
                        Reserva productos de la tienda para recogerlos en el salón.
                      </p>
                      <Button variant="gold" className="rounded-xl gap-2" onClick={() => navigate('/shop')}>
                        <ShoppingBag className="w-4 h-4" /> Reservar Productos
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
                                Reservado el {new Date(res.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
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
                              {res.status === 'pending' ? 'Pendiente' : res.status === 'confirmed' ? 'Confirmado' : res.status === 'completed' ? 'Completado' : res.status}
                            </span>
                            <span className="font-display text-base font-semibold">${res.productPrice}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── MENSAJES ── */}
              {activeTab === 'messages' && (
                <div>
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-2xl font-light text-foreground">Mis Mensajes</h2>
                      <p className="font-body text-sm text-muted-foreground mt-1">Consultas y comunicaciones con el salón.</p>
                    </div>
                    <Button
                      variant="gold"
                      className="rounded-xl gap-2"
                      onClick={() => setShowCompose(v => !v)}
                    >
                      {showCompose ? <><X className="w-4 h-4" /> Cancelar</> : <><Plus className="w-4 h-4" /> Nuevo Mensaje</>}
                    </Button>
                  </div>

                  {/* Compose Box */}
                  {showCompose && (
                    <form onSubmit={handleSendMessage} className="bg-white rounded-3xl border border-accent/20 shadow-lg p-8 mb-8">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                          <Send className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <p className="font-display text-sm font-semibold text-foreground">Nuevo mensaje</p>
                          <p className="font-body text-[10px] text-muted-foreground">Para: Alanís Salon & Spa</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="font-body text-xs font-medium text-foreground block mb-1.5">Tu nombre</label>
                          <input
                            type="text"
                            value={msgName}
                            onChange={e => setMsgName(e.target.value)}
                            placeholder={student?.email?.split('@')[0] || 'Tu nombre'}
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                          />
                        </div>
                        <div>
                          <label className="font-body text-xs font-medium text-foreground block mb-1.5">Tu mensaje <span className="text-destructive">*</span></label>
                          <textarea
                            value={msgText}
                            onChange={e => setMsgText(e.target.value)}
                            required
                            rows={5}
                            placeholder="Escribe tu pregunta o consulta aquí..."
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                          />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <p className="font-body text-xs text-muted-foreground flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" />
                            Respuesta a: <span className="font-medium text-foreground">{student?.email}</span>
                          </p>
                          <Button
                            type="submit"
                            className="bg-accent hover:bg-accent/90 text-white rounded-xl gap-2 px-6"
                            disabled={msgSending || !msgText.trim()}
                          >
                            {msgSending ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <><Send className="w-4 h-4" /> Enviar Mensaje</>}
                          </Button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Message History */}
                  {messages.length === 0 && !showCompose ? (
                    <div className="bg-white rounded-3xl border border-border p-16 text-center shadow-sm">
                      <div className="w-20 h-20 rounded-full bg-accent/5 flex items-center justify-center mx-auto mb-6">
                        <MessageSquare className="w-10 h-10 text-accent/30" />
                      </div>
                      <h3 className="font-display text-xl text-foreground mb-2">Sin mensajes aún</h3>
                      <p className="font-body text-sm text-muted-foreground mb-8 max-w-xs mx-auto">
                        ¿Tienes alguna pregunta? Escríbenos directamente desde aquí.
                      </p>
                      <Button variant="gold" className="rounded-xl gap-2" onClick={() => setShowCompose(true)}>
                        <Plus className="w-4 h-4" /> Escribir Mensaje
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map(msg => (
                        <div key={msg.id} className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-accent" />
                              </div>
                              <span className="font-display text-sm font-semibold">{msg.name || 'Consulta'}</span>
                            </div>
                            <span className="font-body text-[10px] text-muted-foreground">
                              {new Date(msg.created_at || Date.now()).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                          </div>
                          <div className="bg-muted/40 rounded-xl p-4 border border-border/30">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Tu mensaje</p>
                            <p className="font-body text-sm text-foreground leading-relaxed">{msg.message}</p>
                          </div>
                          {msg.response ? (
                            <div className="bg-accent/5 rounded-xl p-4 border border-accent/15">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                                  <CheckCircle className="w-3 h-3 text-accent" />
                                </div>
                                <p className="text-[10px] font-bold text-accent uppercase">Respuesta del Salón</p>
                              </div>
                              <p className="font-body text-sm text-foreground leading-relaxed">{msg.response}</p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                              Esperando respuesta del equipo...
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <SalonFooter />
    </div>
  );
}
