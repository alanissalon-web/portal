import { SalonNavbar } from '@/components/SalonNavbar';
import { SalonFooter } from '@/components/SalonFooter';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, BookOpen, Video, Users, CheckCircle, Star, PlayCircle, Award, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CourseData {
  id: string;
  title: string;
  type: string;
  duration: string;
  level: string;
  image: string;
  description: string;
  topics: string[];
  price: string;
  badge?: string | null;
  meetLink?: string | null;
}

const fallbackCourses: CourseData[] = [
  {
    id: 'extensions-masterclass',
    title: 'Extensions Masterclass',
    type: 'On-Demand',
    duration: '6 hours',
    level: 'Intermediate',
    image: 'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1603381349501-NID1QSSHZLWD7A894B3U/Micro+Points++.jpg',
    description: 'Learn keratin bonding, tape-ins, microlinks, and Mago techniques from a certified Great Lengths educator. This comprehensive course covers everything from client consultation to advanced placement techniques that create the most natural-looking results.',
    topics: ['Keratin Fusion', 'Tape-In Application', 'Color Matching', 'Client Consultation', 'Removal Techniques', 'Maintenance Protocols'],
    price: '$299',
    badge: 'Best Seller',
  },
  {
    id: 'color-science-balayage',
    title: 'Color Science & Balayage',
    type: 'On-Demand',
    duration: '4 hours',
    level: 'Advanced',
    image: 'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1712180693376-7W0S5SXPIT7GDU3S4Q3G/IMG_5139.jpeg',
    description: 'Master the art of dimensional color, balayage, and corrective color techniques. Learn formulation secrets, advanced painting methods, and how to achieve the most sought-after color trends.',
    topics: ['Color Theory', 'Balayage Techniques', 'Toner Formulation', 'Color Correction', 'Foilayage', 'Lived-In Color'],
    price: '$249',
    badge: 'New',
  },
  {
    id: 'hair-loss-solutions',
    title: 'Hair Loss Solutions',
    type: 'On-Demand',
    duration: '3 hours',
    level: 'All Levels',
    image: 'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1712181291533-HY1UX4BEZ8J9BVSK20V3/IMG_6453.jpeg',
    description: 'Understanding thinning hair, scalp analysis, and non-surgical volumizing solutions. Learn to confidently address hair loss concerns and offer innovative solutions that transform lives.',
    topics: ['Scalp Analysis', 'Micro Point', 'Toppers & Wigs', 'Client Care', 'CombLine Technology', 'Business Integration'],
    price: '$199',
    badge: null,
  },
];

const curriculum = [
  { module: 'Module 1', title: 'Foundations & Theory', lessons: 4, duration: '45 min' },
  { module: 'Module 2', title: 'Hands-On Techniques', lessons: 6, duration: '1.5 hrs' },
  { module: 'Module 3', title: 'Advanced Applications', lessons: 5, duration: '1 hr' },
  { module: 'Module 4', title: 'Client Management', lessons: 3, duration: '30 min' },
  { module: 'Module 5', title: 'Business & Marketing', lessons: 3, duration: '30 min' },
];

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const { ref, isVisible } = useScrollReveal();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // Try DB first
        const { data, error } = await supabase.from('courses').select('*').eq('id', courseId).single();
        if (data && !error) {
          setCourse({
            id: data.id,
            title: data.title,
            type: data.type === 'on-demand' ? 'On-Demand' : 'Live',
            duration: data.duration || '2 hours',
            level: data.level || 'All Levels',
            image: data.image_url || '',
            description: data.description || '',
            topics: data.topics || [],
            price: `$${data.price}`,
            badge: data.badge,
            meetLink: data.meet_link,
          });
        } else {
          // Fallback to static
          const slug = courseId || '';
          const found = fallbackCourses.find(c => c.id === slug);
          setCourse(found || null);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        // Fallback to static on error
        const slug = courseId || '';
        const found = fallbackCourses.find(c => c.id === slug);
        setCourse(found || null);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await supabase.from('waitlist').insert([{ email, source: `course-${courseId}` }]);
    setSubmitted(true);
    toast({ title: "You're on the list!", description: "We'll notify you when this course launches." });
    setEmail('');
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <SalonNavbar />
        <div className="pt-32 pb-20 flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full mx-auto mb-4" />
            <p className="font-body text-muted-foreground">Loading course...</p>
          </div>
        </div>
        <SalonFooter />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen">
        <SalonNavbar />
        <div className="pt-32 pb-20 text-center container mx-auto px-6">
          <h1 className="font-display text-4xl text-foreground mb-4">Course Not Found</h1>
          <p className="font-body text-muted-foreground mb-8">This course doesn't exist or has been removed.</p>
          <Link to="/academy">
            <Button variant="default"><ArrowLeft className="w-4 h-4" /> Back to Academy</Button>
          </Link>
        </div>
        <SalonFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SalonNavbar />

      {/* Hero */}
      <section className="relative pt-40 pb-16 md:pt-56 md:pb-24 bg-charcoal overflow-hidden min-h-[50vh] flex items-center">
        <div className="absolute inset-0">
          <img src={course.image} alt={course.title} className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/50 to-charcoal" />
        </div>
        <div className="relative z-10 container mx-auto px-6">
          <Link to="/academy" className="inline-flex items-center gap-2 text-primary-foreground/50 hover:text-accent transition-colors font-body text-sm mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Academy
          </Link>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 bg-accent/15 border border-accent/25 text-accent rounded-full px-4 py-1.5 font-body text-xs uppercase tracking-wider">
                  <Video className="w-3.5 h-3.5" /> {course.type}
                </span>
                {course.badge && (
                  <span className="inline-flex items-center gap-1.5 bg-primary/15 border border-primary/25 text-primary rounded-full px-4 py-1.5 font-body text-xs uppercase tracking-wider">
                    <Award className="w-3.5 h-3.5" /> {course.badge}
                  </span>
                )}
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-light text-primary-foreground mb-5 tracking-tight">
                {course.title}
              </h1>
              <p className="font-body text-primary-foreground/60 text-lg leading-relaxed mb-8 max-w-xl">
                {course.description}
              </p>
              <div className="flex flex-wrap gap-6 text-primary-foreground/50 font-body text-sm">
                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-accent" />{course.duration}</span>
                <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-accent" />{course.level}</span>
                <span className="flex items-center gap-2"><Users className="w-4 h-4 text-accent" />500+ Enrolled</span>
              </div>
            </div>
            {/* Price Card */}
            <div className="bg-card/10 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center">
              <div className="mb-6">
                <span className="font-display text-5xl font-medium text-primary-foreground">{course.price}</span>
                <p className="font-body text-sm text-primary-foreground/40 mt-1">One-time payment · Lifetime access</p>
              </div>
              <div className="space-y-3 mb-8">
                {['Lifetime access', 'Certificate of completion', 'Private community', 'Monthly live Q&A'].map(f => (
                  <div key={f} className="flex items-center gap-2.5 text-primary-foreground/60 font-body text-sm">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              {submitted ? (
                <div className="flex items-center justify-center gap-2 text-accent py-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-body text-sm font-medium">You're on the waitlist!</span>
                </div>
              ) : (
                <form onSubmit={handleWaitlist} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 font-body text-sm text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                  <Button type="submit" variant="gold" size="lg" className="w-full">
                    <GraduationCap className="w-4 h-4" /> Join Waitlist — Get Early Access
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="py-20 bg-background" ref={ref}>
        <div className="container mx-auto px-6">
          <div className={`text-center mb-14 ${isVisible ? 'animate-reveal-up' : 'opacity-0'}`}>
            <span className="font-body text-xs uppercase tracking-[0.2em] text-accent font-medium">Course Content</span>
            <h2 className="font-display text-3xl md:text-4xl font-light text-foreground mt-3">What you'll learn</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {curriculum.map((mod, i) => (
              <div
                key={mod.module}
                className={`bg-card rounded-2xl p-6 border border-border hover:border-accent/30 hover:shadow-md transition-all duration-300 ${isVisible ? 'animate-reveal-up' : 'opacity-0'}`}
                style={{ animationDelay: `${(i + 1) * 80}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-body text-sm font-semibold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-body text-xs text-accent uppercase tracking-wider">{mod.module}</p>
                      <h3 className="font-display text-lg font-medium text-foreground">{mod.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground font-body text-xs">
                    <span className="flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5" />{mod.lessons} lessons</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{mod.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Topics covered */}
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-light text-foreground text-center mb-10">Skills You'll Master</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {course.topics.map(topic => (
                <div key={topic} className="flex items-center gap-3 bg-background rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="font-body text-sm text-foreground">{topic}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Instructor */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto bg-card rounded-2xl p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 shadow-lg">
              <img
                src="https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/10bd6834-c996-4676-b5bc-02a2a8487bb3/IMG_9440.png"
                alt="Rosie Alanis"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-display text-xl font-medium text-foreground">Rosie Alanis</h3>
              <p className="font-body text-sm text-accent mb-2">Lead Instructor · CombLine National Educator</p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                With 25+ years of experience and certifications from Great Lengths, CombLine, and Mago, Rosie brings world-class expertise to every lesson.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="font-display text-3xl font-light text-foreground text-center mb-10">What Students Say</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { text: "The techniques I learned completely transformed how I approach extensions. Worth every penny.", name: 'Sarah M.', role: 'Licensed Stylist, Dallas' },
              { text: "The on-demand format is perfect. I can rewatch techniques before applying them on clients.", name: 'Maria G.', role: 'Independent Stylist, Houston' },
            ].map((t, i) => (
              <div key={i} className="bg-background rounded-2xl p-6 shadow-sm">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-accent text-accent" />)}
                </div>
                <p className="font-body text-sm text-foreground/80 leading-relaxed mb-4 italic">"{t.text}"</p>
                <p className="font-body text-sm font-medium text-foreground">{t.name}</p>
                <p className="font-body text-xs text-muted-foreground">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SalonFooter />
      <WhatsAppFloat />
    </div>
  );
};

export default CourseDetailPage;
