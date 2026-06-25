import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SalonNavbar } from '@/components/SalonNavbar';
import { SalonFooter } from '@/components/SalonFooter';
import salonLoungeImage from '@/assets/salon-lounge-real.jpg';
import { LocalDB } from '@/services/LocalDatabase';
import { ArrowRight, BookOpen } from 'lucide-react';

const BlogPage = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      const { data } = await LocalDB.getBlogs(true);
      setBlogs(data || []);
      setLoading(false);
    };
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen">
      <SalonNavbar />
      {/* Hero banner */}
      <section className="relative pt-40 pb-16 md:pt-56 bg-charcoal overflow-hidden min-h-[40vh] flex items-center">
        <div className="absolute inset-0">
          <img src={salonLoungeImage} alt="Alanís Salon Blog" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="relative z-10 container mx-auto px-6 py-16 text-center">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-4 block">Discover more</span>
          <h1 className="font-display text-5xl md:text-6xl font-light text-primary-foreground mb-4">
            Blog & Tips
          </h1>
          <p className="font-body text-lg text-primary-foreground/70 max-w-lg mx-auto">
            Trends, hair care, and expert secrets.
          </p>
        </div>
      </section>
      
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-7xl">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <Link to={`/blog/${blog.slug}`} key={blog.id} className="group flex flex-col bg-white rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[4/3] overflow-hidden relative bg-accent/5">
                    {blog.image ? (
                      <img 
                        src={blog.image} 
                        alt={blog.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-accent/20">
                        <BookOpen className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="font-display text-2xl font-medium mb-3 group-hover:text-accent transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="font-body text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                      {blog.description}
                    </p>
                    <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest mt-auto">
                      Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-accent/5 rounded-[2.5rem] border border-dashed border-accent/20">
              <BookOpen className="w-12 h-12 text-accent/30 mx-auto mb-4" />
              <h2 className="font-display text-3xl font-medium mb-4">Coming Soon</h2>
              <p className="font-body text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
                We are preparing amazing articles to help you care for your hair at home. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      <SalonFooter />
    </div>
  );
};

export default BlogPage;
