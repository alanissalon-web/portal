import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LocalDB } from '@/services/LocalDatabase';
import { SalonNavbar } from '@/components/SalonNavbar';
import { SalonFooter } from '@/components/SalonFooter';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, Heart, Calendar, MessageSquare, LogOut, BookOpen, 
  ExternalLink, Clock, Trash2, ShoppingBag, Eye, User, Loader2 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ClientPortalPage() {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'favorites' | 'reservations' | 'messages'>('courses');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Tab Data States
  const [courses, setCourses] = useState<any[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  
  // Data loading states
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/academy'); // Send them back to academy if not logged in
      } else {
        setStudent(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/academy');
      } else {
        setStudent(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!student) return;

    const fetchPortalData = async () => {
      setDataLoading(true);
      try {
        // 1. Fetch Enrolled Courses
        const { data: enrollIds } = await LocalDB.getStudentEnrollments(student.id);
        const { data: allCourses } = await LocalDB.getCourses();
        const enrolled = (allCourses || []).filter((c: any) => (enrollIds || []).includes(c.id));
        setCourses(enrolled);
        setEnrolledIds(enrollIds || []);

        // 2. Fetch Favorite Products
        const { data: favIds } = await LocalDB.getProductFavorites(student.id);
        const { data: allProducts } = await LocalDB.getProducts();
        const favProducts = (allProducts || []).filter((p: any) => (favIds || []).includes(p.id));
        setFavorites(favProducts);

        // 3. Fetch Reservations
        const { data: resData } = await LocalDB.getProductReservations(student.id);
        // Map product details into reservations
        const enrichedReservations = (resData || []).map((res: any) => {
          const prod = (allProducts || []).find((p: any) => p.id === res.product_id);
          return {
            ...res,
            productName: prod ? prod.name : 'Unknown Product',
            productImage: prod ? prod.image_url : '',
            productPrice: prod ? prod.price : 0
          };
        });
        setReservations(enrichedReservations);

        // 4. Fetch Messages matching student's email
        const { data: msgData } = await LocalDB.getMessages();
        const userMsgs = (msgData || []).filter((m: any) => m.email?.toLowerCase() === student.email?.toLowerCase());
        setMessages(userMsgs);
      } catch (err) {
        console.error('Error fetching portal data:', err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchPortalData();
  }, [student]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: 'Signed Out', description: 'You have signed out successfully.' });
    navigate('/academy');
  };

  const handleRemoveFavorite = async (productId: string) => {
    const { error } = await LocalDB.toggleFavorite(student.id, productId);
    if (!error) {
      setFavorites(prev => prev.filter(p => p.id !== productId));
      toast({ title: 'Removed', description: 'Product removed from favorites.' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SalonNavbar />
        <div className="pt-40 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 bg-accent/20 rounded-full mb-4" />
            <p className="font-body text-sm text-muted-foreground uppercase tracking-widest">Loading Portal...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <SalonNavbar />

      <div className="pt-36 pb-20 container mx-auto px-6 flex-1">
        <div className="grid lg:grid-cols-4 gap-10 items-start">
          
          {/* Sidebar Menu */}
          <div className="lg:col-span-1 bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-6 border-b border-border">
              <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center text-accent">
                <User className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-sm font-medium text-foreground truncate">My Account</p>
                <p className="font-body text-xs text-muted-foreground truncate">{student?.email}</p>
              </div>
            </div>

            <nav className="space-y-1.5">
              <button
                onClick={() => setActiveTab('courses')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm transition-all ${
                  activeTab === 'courses' ? 'bg-accent text-accent-foreground font-bold shadow-md shadow-accent/10' : 'text-muted-foreground hover:bg-accent/5 hover:text-foreground'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                My Courses
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm transition-all ${
                  activeTab === 'favorites' ? 'bg-accent text-accent-foreground font-bold shadow-md shadow-accent/10' : 'text-muted-foreground hover:bg-accent/5 hover:text-foreground'
                }`}
              >
                <Heart className="w-4 h-4" />
                Favorite Products
              </button>
              <button
                onClick={() => setActiveTab('reservations')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm transition-all ${
                  activeTab === 'reservations' ? 'bg-accent text-accent-foreground font-bold shadow-md shadow-accent/10' : 'text-muted-foreground hover:bg-accent/5 hover:text-foreground'
                }`}
              >
                <Calendar className="w-4 h-4" />
                My Reservations
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm transition-all ${
                  activeTab === 'messages' ? 'bg-accent text-accent-foreground font-bold shadow-md shadow-accent/10' : 'text-muted-foreground hover:bg-accent/5 hover:text-foreground'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                My Messages
              </button>
            </nav>

            <div className="pt-6 border-t border-border">
              <Button
                variant="outline"
                className="w-full justify-center gap-2 border-destructive/20 text-destructive hover:bg-destructive/5"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3 bg-card border border-border rounded-3xl p-8 shadow-sm min-h-[50vh]">
            {dataLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-accent mb-3" />
                <p className="font-body text-sm">Loading details...</p>
              </div>
            ) : (
              <>
                {/* 1. Courses Tab */}
                {activeTab === 'courses' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-display text-2xl font-light text-foreground">My Enrolled Courses</h3>
                      <p className="font-body text-xs text-muted-foreground mt-1">Access and watch lessons from courses you unlocked.</p>
                    </div>

                    {courses.length === 0 ? (
                      <div className="text-center py-16 bg-accent/5 border border-dashed border-accent/20 rounded-2xl">
                        <BookOpen className="w-12 h-12 text-accent/20 mx-auto mb-4" />
                        <p className="font-body text-sm text-muted-foreground">You are not enrolled in any courses yet.</p>
                        <Button 
                          variant="gold" 
                          className="mt-4 rounded-xl text-xs" 
                          onClick={() => navigate('/academy')}
                        >
                          Browse Academy
                        </Button>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-6">
                        {courses.map((course) => (
                          <div key={course.id} className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                            <div className="relative aspect-[16/10] overflow-hidden">
                              <img src={course.image_url || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80'} alt={course.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-5 flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="font-display text-lg font-medium text-foreground mb-2">{course.title}</h4>
                                <div className="flex gap-4 text-xs text-muted-foreground mb-4">
                                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.duration}</span>
                                  <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{course.level}</span>
                                </div>
                              </div>
                              <Button 
                                variant="gold" 
                                className="w-full rounded-xl text-xs gap-2"
                                onClick={() => navigate(`/academy/${course.id}`)}
                              >
                                View Lessons
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Favorites Tab */}
                {activeTab === 'favorites' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-display text-2xl font-light text-foreground">My Favorite Products</h3>
                      <p className="font-body text-xs text-muted-foreground mt-1">Review items you added to your wishlist from our shop.</p>
                    </div>

                    {favorites.length === 0 ? (
                      <div className="text-center py-16 bg-accent/5 border border-dashed border-accent/20 rounded-2xl">
                        <Heart className="w-12 h-12 text-accent/20 mx-auto mb-4" />
                        <p className="font-body text-sm text-muted-foreground">No favorite products added yet.</p>
                        <Button 
                          variant="gold" 
                          className="mt-4 rounded-xl text-xs" 
                          onClick={() => navigate('/shop')}
                        >
                          Browse Shop
                        </Button>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-6">
                        {favorites.map((product) => (
                          <div key={product.id} className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm flex items-center p-4 gap-4">
                            <img src={product.image || product.image_url} alt={product.name} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-body text-[10px] text-accent uppercase tracking-wider mb-0.5">{product.brand}</p>
                              <h4 className="font-display text-base font-medium text-foreground truncate">{product.name}</h4>
                              <p className="font-display text-sm font-semibold text-foreground mt-1">${product.price}</p>
                              <div className="flex gap-2 mt-3">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 rounded-lg text-xs"
                                  onClick={() => navigate('/shop')}
                                >
                                  View in Shop
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive rounded-lg hover:bg-destructive/5"
                                  onClick={() => handleRemoveFavorite(product.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Reservations Tab */}
                {activeTab === 'reservations' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-display text-2xl font-light text-foreground">My Recent Reservations</h3>
                      <p className="font-body text-xs text-muted-foreground mt-1">Check the status of salon products reserved for in-store pickup.</p>
                    </div>

                    {reservations.length === 0 ? (
                      <div className="text-center py-16 bg-accent/5 border border-dashed border-accent/20 rounded-2xl">
                        <ShoppingBag className="w-12 h-12 text-accent/20 mx-auto mb-4" />
                        <p className="font-body text-sm text-muted-foreground">You do not have any active product reservations.</p>
                        <Button 
                          variant="gold" 
                          className="mt-4 rounded-xl text-xs" 
                          onClick={() => navigate('/shop')}
                        >
                          Reserve Products
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reservations.map((res) => (
                          <div key={res.id} className="bg-background border border-border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-accent/5 rounded-xl flex items-center justify-center text-accent">
                                <ShoppingBag className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-display text-base font-medium text-foreground">{res.productName}</h4>
                                <p className="font-body text-xs text-muted-foreground mt-0.5">
                                  Reserved on {new Date(res.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-start">
                              <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
                                res.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                res.status === 'confirmed' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                res.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                'bg-muted text-muted-foreground border border-border'
                              }`}>
                                {res.status}
                              </span>
                              <span className="font-display text-base font-semibold">${res.productPrice || 0}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Messages Tab */}
                {activeTab === 'messages' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-display text-2xl font-light text-foreground">My Conversation History</h3>
                      <p className="font-body text-xs text-muted-foreground mt-1">Review contact requests and messages you exchanged with us.</p>
                    </div>

                    {messages.length === 0 ? (
                      <div className="text-center py-16 bg-accent/5 border border-dashed border-accent/20 rounded-2xl">
                        <MessageSquare className="w-12 h-12 text-accent/20 mx-auto mb-4" />
                        <p className="font-body text-sm text-muted-foreground">No message history found for your account email.</p>
                        <Button 
                          variant="gold" 
                          className="mt-4 rounded-xl text-xs" 
                          onClick={() => navigate('/contact')}
                        >
                          Send a Message
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div key={msg.id} className="bg-background border border-border rounded-2xl p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-border/50 pb-3">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                                <span className="font-display text-sm font-semibold">{msg.name || 'Inquiry'}</span>
                              </div>
                              <span className="font-body text-[10px] text-muted-foreground">
                                {new Date(msg.created_at || Date.now()).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="bg-muted/40 p-3.5 rounded-xl border border-border/20">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Your Message</p>
                                <p className="font-body text-xs text-foreground leading-relaxed">{msg.message}</p>
                              </div>
                              {msg.response ? (
                                <div className="bg-accent/5 p-3.5 rounded-xl border border-accent/10">
                                  <p className="text-[10px] font-bold text-accent uppercase mb-1">Salon Response</p>
                                  <p className="font-body text-xs text-foreground leading-relaxed">{msg.response}</p>
                                </div>
                              ) : (
                                <div className="p-3.5 text-xs text-muted-foreground italic">
                                  Waiting for representative response...
                                </div>
                              )}
                            </div>
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
      </div>

      <SalonFooter />
    </div>
  );
}
