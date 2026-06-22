import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from '@/components/ui/button';
import { PlayCircle, Clock, Star, Users, BookOpen, Video, ArrowRight, CheckCircle, Award, GraduationCap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { LocalDB } from '@/services/LocalDatabase';
import { supabase } from '@/lib/supabase';

interface CourseDisplay {
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
}

const courses: CourseDisplay[] = [
  {
    id: 'extensions-masterclass',
    title: 'Extensions Masterclass',
    type: 'On-Demand',
    duration: '6 hours',
    level: 'Intermediate',
    image: 'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1603381349501-NID1QSSHZLWD7A894B3U/Micro+Points++.jpg',
    description: 'Learn keratin bonding, tape-ins, microlinks, and Mago techniques from a certified Great Lengths educator.',
    topics: ['Keratin Fusion', 'Tape-In Application', 'Color Matching', 'Client Consultation'],
    price: '$299',
    badge: 'Best Seller',
  },
  {
    id: 'color-balayage',
    title: 'Color Science & Balayage',
    type: 'On-Demand',
    duration: '4 hours',
    level: 'Advanced',
    image: 'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1712180693376-7W0S5SXPIT7GDU3S4Q3G/IMG_5139.jpeg',
    description: 'Master the art of dimensional color, balayage, and corrective color techniques.',
    topics: ['Color Theory', 'Balayage Techniques', 'Toner Formulation', 'Color Correction'],
    price: '$249',
    badge: 'New',
  },
  {
    id: 'hair-loss',
    title: 'Hair Loss Solutions',
    type: 'On-Demand',
    duration: '3 hours',
    level: 'All Levels',
    image: 'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/1712181291533-HY1UX4BEZ8J9BVSK20V3/IMG_6453.jpeg',
    description: 'Understanding thinning hair, scalp analysis, and non-surgical volumizing solutions.',
    topics: ['Scalp Analysis', 'Micro Point', 'Toppers & Wigs', 'Client Care'],
    price: '$199',
    badge: null,
  },
];

const liveClasses = [
  { title: 'Live Q&A: Extension Troubleshooting', date: 'Every 2nd Thursday', time: '7:00 PM CST', price: 'Free with any course' },
  { title: 'Live Demo: Seamless Blending', date: 'Monthly Workshop', time: '2:00 PM CST', price: '$49 / session' },
  { title: 'Live Demo: CombLine Application', date: 'Quarterly', time: '1:00 PM CST', price: '$79 / session' },
];

const benefits = [
  'Lifetime access to course materials',
  'Certificate of completion',
  'Private community access',
  'Monthly live Q&A sessions',
  'Downloadable resources & guides',
  'Priority booking for in-person workshops',
];

const instructors = [
  {
    name: 'Rosie Alanis',
    title: 'Lead Instructor & CombLine National Educator',
    image: 'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/10bd6834-c996-4676-b5bc-02a2a8487bb3/IMG_9440.png',
    specialties: ['Extensions', 'CombLine', 'Hair Loss Solutions'],
  },
  {
    name: 'Vanessa R Williams',
    title: 'Color Science Instructor',
    image: 'https://images.squarespace-cdn.com/content/v1/5b03616f9772ae0c5a7c199b/8e3ce211-a0d5-4362-a90b-abf85a042ff5/IMG_7863.png',
    specialties: ['Wella Color', 'Balayage', 'Color Correction'],
  },
];

const testimonials = [
  { text: "Rosie's extension class completely changed how I approach hair. The techniques are next level.", name: 'Sarah M.', role: 'Licensed Stylist, Dallas' },
  { text: "The CombLine workshop was worth every penny. I now offer hair loss solutions and it's transformed my business.", name: 'Jessica T.', role: 'Salon Owner, Austin' },
  { text: "The on-demand format is perfect. I can rewatch techniques before applying them on clients.", name: 'Maria G.', role: 'Independent Stylist, Houston' },
];

import { StudentAuthModal } from '@/components/StudentAuthModal';

export function AcademySection() {
  const { ref, isVisible } = useScrollReveal();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [dbCourses, setDbCourses] = useState<CourseDisplay[]>([]);
  const { toast } = useToast();

  // Student auth states
  const [student, setStudent] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'enrolled'>('all');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
    const fetchEnrollments = async () => {
      if (student) {
        const { data } = await LocalDB.getStudentEnrollments(student.id);
        setEnrollments(data || []);
      } else {
        setEnrollments([]);
      }
    };
    fetchEnrollments();
  }, [student]);

  useEffect(() => {
    const processCourses = (data: any[]) => {
      const published = data.filter((c: any) => c.status === 'published');
      if (published.length > 0) {
        setDbCourses(published.map((c: any) => ({
          id: c.id,
          title: c.title,
          type: c.type === 'on-demand' ? 'On-Demand' : 'Live',
          duration: c.duration || '2 hours',
          level: c.level || 'All Levels',
          image: c.image_url || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
          description: c.description || '',
          topics: Array.isArray(c.topics) ? c.topics : (typeof c.topics === 'string' ? c.topics.split(',') : []),
          price: `$${c.price}`,
          badge: c.badge,
        })));
      }
    };

    const fetchCourses = async () => {
      const { data: localData } = await LocalDB.getCourses();
      if (localData && localData.length > 0) {
        processCourses(localData);
      }
      
      const { data, error } = await supabase.from('courses').select('*');
      if (data && !error) {
        processCourses(data);
      }
    };
    fetchCourses();
  }, []);

  const baseCourses = dbCourses.length > 0 ? dbCourses : courses;
  const displayCourses = activeTab === 'enrolled'
    ? baseCourses.filter(c => enrollments.includes(c.id))
    : baseCourses;

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await LocalDB.addToWaitlist(email, 'academy');
    setSubmitted(true);
    toast({ title: "You're on the list!", description: "We'll notify you when courses launch." });
    setEmail('');
  };

  return (
    <section className="py-24 md:py-32 bg-background" ref={ref}>
      <div className="container mx-auto px-6">
        {/* Student Session Bar */}
        <div className="max-w-6xl mx-auto mb-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-card border border-border rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display text-base font-medium text-foreground">Academy Portal</p>
              <p className="font-body text-xs text-muted-foreground">
                {student ? `Welcome back, ${student.email}` : 'Sign in to access your course panel and progress.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {student ? (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-accent/20 text-accent hover:bg-accent/5"
                onClick={async () => {
                  await supabase.auth.signOut();
                  setStudent(null);
                  setEnrollments([]);
                  setActiveTab('all');
                }}
              >
                Sign Out
              </Button>
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

        {/* Tab Controls (Only shown if student is logged in) */}
        {student && (
          <div className="max-w-6xl mx-auto mb-8 flex justify-center sm:justify-start gap-4 border-b border-border pb-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`font-display text-sm pb-2 border-b-2 transition-all ${
                activeTab === 'all' ? 'border-accent text-accent font-semibold' : 'border-transparent text-muted-foreground'
              }`}
            >
              All Courses
            </button>
            <button
              onClick={() => setActiveTab('enrolled')}
              className={`font-display text-sm pb-2 border-b-2 transition-all ${
                activeTab === 'enrolled' ? 'border-accent text-accent font-semibold' : 'border-transparent text-muted-foreground'
              }`}
            >
              My Enrolled Courses ({enrollments.length})
            </button>
          </div>
        )}

        {/* Coming Soon Banner */}
        <div className={`text-center max-w-3xl mx-auto mb-20 ${isVisible ? 'animate-reveal-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-5 py-2 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span className="font-body text-sm font-medium">Launching Soon</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-light text-foreground text-balance" style={{ lineHeight: '1.15' }}>
            Elevate your craft with expert-led education
          </h2>
          <div className="luxury-divider mx-auto mt-6" />
          <p className="font-body text-muted-foreground mt-6 leading-relaxed max-w-xl mx-auto">
            Over 20 years of premium salon expertise, now available as on-demand courses and live workshops.
          </p>
        </div>

        {/* Course Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {displayCourses.map((course, i) => (
            <Link
              to={`/academy/${course.id}`}
              key={course.id}
              className={`group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 block ${
                isVisible ? 'animate-reveal-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${(i + 1) * 120}ms` }}
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-charcoal/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <PlayCircle className="w-14 h-14 text-white/90" />
                </div>
                {course.badge && (
                  <span className="absolute top-4 left-4 bg-accent text-accent-foreground text-xs font-medium px-3 py-1 rounded-full">{course.badge}</span>
                )}
                <span className="absolute top-4 right-4 bg-card/90 text-foreground text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                  <Video className="w-3 h-3" />{course.type}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-medium text-foreground mb-2">{course.title}</h3>
                <p className="font-body text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">{course.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.duration}</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{course.level}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-5">
                  {course.topics.slice(0, 3).map(t => (
                    <span key={t} className="bg-cream text-foreground/70 text-xs px-2.5 py-1 rounded-full">{t}</span>
                  ))}
                  {course.topics.length > 3 && (
                    <span className="text-accent text-xs px-2.5 py-1">+{course.topics.length - 3} more</span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="font-display text-2xl font-medium text-foreground">{course.price}</span>
                  <span className="font-body text-sm text-accent font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Course <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Instructors */}
        <div className={`max-w-3xl mx-auto mb-20 ${isVisible ? 'animate-reveal-up delay-200' : 'opacity-0'}`}>
          <div className="text-center mb-10">
            <span className="font-body text-xs uppercase tracking-[0.2em] text-accent font-medium">Your Instructors</span>
            <h3 className="font-display text-3xl font-light text-foreground mt-2">Learn from the best</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-8">
            {instructors.map(inst => (
              <div key={inst.name} className="flex items-start gap-4 bg-cream rounded-2xl p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 shadow-md">
                  <img src={inst.image} alt={inst.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div>
                  <h4 className="font-display text-lg font-medium text-foreground">{inst.name}</h4>
                  <p className="font-body text-xs text-accent mb-2">{inst.title}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {inst.specialties.map(s => (
                      <span key={s} className="bg-background text-foreground/60 text-xs px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Classes */}
        <div className={`max-w-3xl mx-auto mb-20 ${isVisible ? 'animate-reveal-up delay-300' : 'opacity-0'}`}>
          <div className="text-center mb-10">
            <span className="font-body text-xs uppercase tracking-[0.2em] text-accent font-medium">Interactive</span>
            <h3 className="font-display text-3xl font-light text-foreground mt-2">Live Classes & Workshops</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {liveClasses.map(lc => (
              <div key={lc.title} className="bg-cream rounded-2xl p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-3">
                  <Video className="w-5 h-5 text-accent" />
                </div>
                <h4 className="font-display text-base font-medium text-foreground mb-1">{lc.title}</h4>
                <p className="font-body text-xs text-muted-foreground mb-3">{lc.date} · {lc.time}</p>
                <span className="font-body text-sm font-medium text-accent">{lc.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className={`max-w-4xl mx-auto mb-20 ${isVisible ? 'animate-reveal-up delay-300' : 'opacity-0'}`}>
          <div className="text-center mb-10">
            <span className="font-body text-xs uppercase tracking-[0.2em] text-accent font-medium">What Students Say</span>
            <h3 className="font-display text-3xl font-light text-foreground mt-2">Real results from real stylists</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
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

        {/* Benefits */}
        <div className={`max-w-3xl mx-auto mb-20 ${isVisible ? 'animate-reveal-up delay-400' : 'opacity-0'}`}>
          <div className="bg-card rounded-2xl p-8 md:p-10 shadow-sm">
            <h3 className="font-display text-2xl font-light text-foreground text-center mb-8">What's Included</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map(b => (
                <div key={b} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="font-body text-sm text-foreground">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Waitlist CTA */}
        <div id="waitlist" className={`max-w-xl mx-auto text-center ${isVisible ? 'animate-reveal-up delay-500' : 'opacity-0'}`}>
          <div className="bg-cream rounded-2xl p-8 md:p-10">
            <Users className="w-10 h-10 text-accent mx-auto mb-4" />
            <h3 className="font-display text-2xl font-light text-foreground mb-2">Be the First to Know</h3>
            <p className="font-body text-sm text-muted-foreground mb-6">
              Join the waitlist and get early access pricing when we launch.
            </p>
            {submitted ? (
              <div className="flex items-center justify-center gap-2 text-primary">
                <CheckCircle className="w-5 h-5" />
                <span className="font-body text-sm font-medium">You're on the list!</span>
              </div>
            ) : (
              <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <Button type="submit" variant="default">
                  Join Waitlist <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            )}
          </div>
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
