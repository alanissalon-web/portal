import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Plus, Minus, X, ArrowRight, Sparkles, Truck, ShieldCheck, ExternalLink, Heart, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LocalDB } from '@/services/LocalDatabase';
import { supabase } from '@/lib/supabase';
import { StudentAuthModal } from '@/components/StudentAuthModal';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
  description: string;
  rating: number;
  badge?: string;
  amazon_url?: string;
}

const products: Product[] = [
  {
    id: 'p1',
    name: 'Luxury Repair Shampoo',
    brand: 'Great Lengths',
    price: 38,
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&q=80',
    category: 'Shampoo',
    description: 'Sulfate-free formula designed for extensions and color-treated hair. Gentle cleansing with keratin repair.',
    rating: 5,
    badge: 'Best Seller',
  },
  {
    id: 'p2',
    name: 'Bond Repair Treatment',
    brand: 'Olaplex',
    price: 52,
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    category: 'Treatment',
    description: 'Intensive bond-building treatment that restores damaged hair from within. Salon-grade formula.',
    rating: 5,
    badge: 'Staff Pick',
  },
  {
    id: 'p3',
    name: 'Hydrating Hair Mask',
    brand: 'Davines',
    price: 44,
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80',
    category: 'Treatment',
    description: 'Deep conditioning mask with argan oil and hyaluronic acid for ultimate hydration and shine.',
    rating: 4,
  },
  {
    id: 'p4',
    name: 'Extension Care Kit',
    brand: 'Alanís Salon',
    price: 89,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
    category: 'Kit',
    description: 'Complete care kit: extension shampoo, conditioner, detangling brush, and silk pillowcase.',
    rating: 5,
    badge: 'Exclusive',
  },
  {
    id: 'p5',
    name: 'Scalp Revival Serum',
    brand: 'Alanís Salon',
    price: 62,
    image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=600&q=80',
    category: 'Scalp Care',
    description: 'Nourishing serum with biotin and caffeine to stimulate follicles and promote healthy growth.',
    rating: 5,
  },
  {
    id: 'p6',
    name: 'Heat Protect Spray',
    brand: 'Great Lengths',
    price: 28,
    image: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=600&q=80',
    category: 'Styling',
    description: 'Lightweight thermal protection up to 450°F. Safe for extensions, adds shine without buildup.',
    rating: 4,
  },
  {
    id: 'p7',
    name: 'Silk Leave-In Conditioner',
    brand: 'Davines',
    price: 34,
    image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=600&q=80',
    category: 'Treatment',
    description: 'Weightless leave-in formula that detangles and adds brilliant shine. Perfect for extensions.',
    rating: 5,
    badge: 'New',
  },
  {
    id: 'p8',
    name: 'Volumizing Dry Shampoo',
    brand: 'Great Lengths',
    price: 32,
    image: 'https://images.unsplash.com/photo-1585232004423-244e0e6904e3?w=600&q=80',
    category: 'Styling',
    description: 'Invisible formula absorbs oil, adds volume and texture. Extension-safe, no residue.',
    rating: 4,
  },
  {
    id: 'p9',
    name: 'Color Lock Conditioner',
    brand: 'Wella',
    price: 36,
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&q=80',
    category: 'Shampoo',
    description: 'Advanced color-lock technology preserves vibrancy. Infused with vitamins and silk proteins.',
    rating: 5,
  },
];

const categories = ['All', 'Shampoo', 'Treatment', 'Kit', 'Scalp Care', 'Styling'];

interface CartItem {
  product: Product;
  quantity: number;
}

export function ShopSection() {
  const { ref, isVisible } = useScrollReveal();
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Student/Client Auth and Favorites
  const [student, setStudent] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    // 1. Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setStudent(session?.user ?? null);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setStudent(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (student) {
        const { data } = await LocalDB.getProductFavorites(student.id);
        setFavorites(data || []);
      } else {
        setFavorites([]);
      }
    };
    fetchFavorites();
  }, [student]);

  useEffect(() => {
    const processProducts = (data: any[]) => {
      const active = data.filter((p: any) => p.status === 'active');
      if (active.length > 0) {
        setDbProducts(active.map((p: any) => ({
          id: p.id,
          name: p.name,
          brand: p.brand || '',
          price: Number(p.price),
          image: p.image_url || 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&q=80',
          category: p.category || 'Treatment',
          description: p.description || '',
          rating: p.rating || 5,
          badge: p.badge || undefined,
          amazon_url: p.amazon_url || undefined,
        })));
      }
    };

    const fetchProducts = async () => {
      const { data: localData } = await LocalDB.getProducts();
      if (localData && localData.length > 0) {
        processProducts(localData);
      }
      
      const { data, error } = await supabase.from('products').select('*');
      if (data && !error) {
        processProducts(data);
      }
      
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleToggleFavorite = async (productId: string) => {
    if (!student) {
      setIsAuthModalOpen(true);
      return;
    }
    const { favorited, error } = await LocalDB.toggleFavorite(student.id, productId);
    if (!error) {
      setFavorites(prev => 
        favorited ? [...prev, productId] : prev.filter(id => id !== productId)
      );
      toast({
        title: favorited ? 'Added to favorites' : 'Removed from favorites',
        description: favorited ? 'Product saved to your favorites.' : 'Product removed from favorites.',
      });
    }
  };

  const handleReserve = async () => {
    if (!student) {
      setCartOpen(false);
      setIsAuthModalOpen(true);
      toast({
        title: 'Sign In Required',
        description: 'Please sign in or register to reserve products.',
      });
      return;
    }

    setReserving(true);
    const { error } = await LocalDB.reserveProducts(student.id, cart);
    setReserving(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Reservation Error',
        description: error.message || 'Could not complete reservation.',
      });
    } else {
      toast({
        title: 'Products Reserved!',
        description: 'Your reservation was submitted. A salon representative will contact you.',
      });
      setCart([]);
      setCartOpen(false);
    }
  };

  const allProducts = dbProducts;
  const allCategories = ['All', ...Array.from(new Set(allProducts.map(p => p.category)))];
  const filtered = activeCategory === 'All' ? allProducts : allProducts.filter(p => p.category === activeCategory);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(item => item.product.id === product.id);
      if (exists) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCartOpen(true);
    toast({ title: 'Added to cart' });
  };

  const handleAmazonClick = async (productId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      await LocalDB.savePurchaseIntent(session.user.id, productId);
    }
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.product.id === id) {
        const newQty = c.quantity + delta;
        return newQty <= 0 ? c : { ...c, quantity: newQty };
      }
      return c;
    }).filter(c => c.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(c => c.product.id !== id));
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.product.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <section className="py-24 md:py-32 bg-background" ref={ref}>
      <div className="container mx-auto px-6">
        {/* Client Session Bar */}
        <div className="max-w-6xl mx-auto mb-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-card border border-border rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display text-base font-medium text-foreground">Shop Portal</p>
              <p className="font-body text-xs text-muted-foreground">
                {student ? `Welcome back, ${student.email}` : 'Sign in to access your orders and favorites.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {student ? (
              <div className="flex gap-2">
                <Link to="/portal">
                  <Button
                    variant="gold"
                    size="sm"
                    className="rounded-xl h-10 px-5 font-bold shadow-md shadow-accent/10"
                  >
                    Go to Portal
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-accent/20 text-accent hover:bg-accent/5 h-10 px-4"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setStudent(null);
                  }}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                variant="gold"
                size="sm"
                className="rounded-xl h-10 px-5 font-bold shadow-md shadow-accent/10"
                onClick={() => setIsAuthModalOpen(true)}
              >
                Sign In / Register
              </Button>
            )}
          </div>
        </div>

        {/* Header */}
        <div className={`text-center max-w-2xl mx-auto mb-8 ${isVisible ? 'animate-reveal-up' : 'opacity-0'}`}>
          <span className="font-body text-xs uppercase tracking-[0.2em] text-accent font-medium">Curated Collection</span>
          <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mt-3 text-balance" style={{ lineHeight: '1.15' }}>
            Professional hair care, delivered
          </h2>
          <div className="luxury-divider mx-auto mt-6" />
          <p className="font-body text-muted-foreground mt-6 leading-relaxed max-w-xl mx-auto">
            The same premium products our stylists use in-salon — now available for home care. Handpicked for extensions, color-treated, and thinning hair.
          </p>
        </div>

        {/* Category filters + Cart button */}
        <div className={`flex flex-wrap items-center justify-between gap-4 mb-10 ${isVisible ? 'animate-reveal-up delay-100' : 'opacity-0'}`}>
          <div className="flex flex-wrap gap-2">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-body text-sm px-4 py-2 rounded-full transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-cream text-foreground/70 hover:bg-accent/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCartOpen(!cartOpen)}
            className="relative flex items-center gap-2 font-body text-sm text-foreground bg-cream px-4 py-2 rounded-full hover:bg-accent/10 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Cart Drawer */}
        {cartOpen && (
          <div className={`mb-10 bg-card rounded-2xl p-6 shadow-lg animate-reveal-up`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-medium text-foreground">Your Cart</h3>
              <button onClick={() => setCartOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            {cart.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground">Your cart is empty.</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center gap-4">
                      <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-xl" />
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-medium text-foreground truncate">{product.name}</p>
                        <p className="font-body text-xs text-muted-foreground">${product.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(product.id, -1)} className="w-7 h-7 rounded-full bg-cream flex items-center justify-center hover:bg-accent/10 transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-body text-sm w-6 text-center">{quantity}</span>
                        <button onClick={() => updateQty(product.id, 1)} className="w-7 h-7 rounded-full bg-cream flex items-center justify-center hover:bg-accent/10 transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(product.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-body text-sm text-muted-foreground">Subtotal</span>
                    <span className="font-display text-lg text-foreground">${cartTotal}</span>
                  </div>
                  {cartTotal >= 75 && (
                    <p className="font-body text-xs text-primary mb-4 flex items-center gap-1">
                      <Truck className="w-3 h-3" /> You qualify for free shipping!
                    </p>
                  )}
                  <Button 
                    variant="default" 
                    size="lg" 
                    className="w-full gap-2" 
                    onClick={handleReserve}
                    disabled={reserving}
                  >
                    {reserving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reserve Products'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <p className="font-body text-xs text-muted-foreground text-center mt-3">
                    Reserve items for in-salon pick up and payment
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl">
            <h3 className="font-display text-xl text-foreground mb-2">No products found</h3>
            <p className="font-body text-muted-foreground">Please check back later or select another category.</p>
          </div>
        ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((product, i) => (
            <div
              key={product.id}
              className={`group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${
                isVisible ? 'animate-reveal-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <div className="relative aspect-square overflow-hidden bg-cream">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                {product.badge && (
                  <span className="absolute top-4 left-4 bg-accent text-accent-foreground text-xs font-medium px-3 py-1 rounded-full">
                    {product.badge}
                  </span>
                )}
                {/* Favorite Heart Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleFavorite(product.id)}
                  className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center shadow-md text-foreground transition-all active:scale-95"
                >
                  <Heart 
                    className={`w-4 h-4 transition-colors ${
                      favorites.includes(product.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'
                    }`} 
                  />
                </button>
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="p-6">
                <p className="font-body text-xs text-accent uppercase tracking-wider mb-1">{product.brand}</p>
                <h3 className="font-display text-lg font-medium text-foreground mb-2">{product.name}</h3>
                <p className="font-body text-sm text-muted-foreground mb-3 leading-relaxed line-clamp-2">{product.description}</p>
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={`w-3.5 h-3.5 ${j < product.rating ? 'fill-accent text-accent' : 'text-border'}`} />
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="font-display text-2xl font-medium text-foreground">${product.price}</span>
                  {product.amazon_url ? (
                    <a href={product.amazon_url} target="_blank" rel="noopener noreferrer" onClick={() => handleAmazonClick(product.id)} className="block">
                      <Button variant="gold" size="sm" className="gap-2 bg-[#FF9900] hover:bg-[#FF9900]/90 text-white border-none shadow-md">
                        <ExternalLink className="w-4 h-4" />
                        Buy on Amazon
                      </Button>
                    </a>
                  ) : (
                    <Button variant="default" size="sm" onClick={() => addToCart(product)}>
                      <ShoppingBag className="w-4 h-4" />
                      Add to Cart
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* CTA */}
        <div className={`text-center mt-16 ${isVisible ? 'animate-reveal-up delay-500' : 'opacity-0'}`}>
          <p className="font-body text-sm text-muted-foreground mb-2">
            Need personalized recommendations?
          </p>
          <a href="/contact">
            <Button variant="outline" size="lg">
              Ask Our Stylists
              <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </div>

      <StudentAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setStudent(user);
          setIsAuthModalOpen(false);
        }}
      />
    </section>
  );
}
