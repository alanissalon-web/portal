import { SalonNavbar } from '@/components/SalonNavbar';
import { SalonFooter } from '@/components/SalonFooter';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Clock, BookOpen, Video, Users, CheckCircle, Star, 
  PlayCircle, Award, MessageCircle, Lock as LockIcon, ExternalLink, Calendar,
  GraduationCap, MessageSquare, PhoneCall
} from 'lucide-react';
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
  curriculum: {
    module: string;
    title: string;
    lessons: number;
    duration: string;
    video_url?: string;
    content?: string;
  }[];
  price: string;
  badge?: string | null;
  meetLink?: string | null;
  accessCode?: string | null;
}

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const { ref: revealRef, isVisible } = useScrollReveal();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputCode, setInputCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeLesson, setActiveLesson] = useState<number | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      const { LocalDB } = await import('@/services/LocalDatabase');
      const data = LocalDB.getCourseById(courseId || '');
      
      if (data) {
        setCourse({
          id: data.id,
          title: data.title,
          type: data.type || 'on-demand',
          duration: data.duration || '2 hours',
          level: data.level || 'All Levels',
          image: data.image_url || '',
          description: data.description || '',
          topics: data.topics || [],
          curriculum: data.curriculum || [],
          price: `$${data.price}`,
          badge: data.badge,
          meetLink: data.meet_link,
          accessCode: data.access_code
        });

        // Check if already unlocked
        const savedUnlock = sessionStorage.getItem(`unlocked_${courseId}`);
        if (savedUnlock === 'true' || !data.access_code) {
          setIsUnlocked(true);
        }
      }
      setLoading(false);
    };

    fetchCourse();
  }, [courseId]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (course?.accessCode && inputCode.toUpperCase() === course.accessCode.toUpperCase()) {
      setIsUnlocked(true);
      sessionStorage.setItem(`unlocked_${courseId}`, 'true');
      toast({ title: "¡Curso desbloqueado!", description: "Bienvenido al contenido exclusivo." });
    } else {
      toast({ variant: "destructive", title: "Código incorrecto", description: "Por favor verifica el código enviado por Alanís Salon." });
    }
  };

  const renderVideo = (url: string) => {
    if (!url) return null;
    
    let embedUrl = "";
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const id = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
      embedUrl = `https://www.youtube.com/embed/${id}`;
    } else if (url.includes('loom.com')) {
      const id = url.split('/').pop();
      embedUrl = `https://www.loom.com/embed/${id}`;
    } else if (url.includes('vimeo.com')) {
      const id = url.split('/').pop();
      embedUrl = `https://player.vimeo.com/video/${id}`;
    }

    if (embedUrl) {
      return (
        <iframe 
          className="w-full aspect-video rounded-3xl"
          src={embedUrl} 
          allowFullScreen
          title="Lesson Video"
        />
      );
    }

    return <video src={url} controls className="w-full aspect-video rounded-3xl bg-black" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SalonNavbar />
        <div className="pt-40 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 bg-accent/20 rounded-full mb-4" />
            <p className="font-body text-sm text-muted-foreground uppercase tracking-widest">Cargando Masterclass...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <SalonNavbar />
        <div className="pt-40 text-center container mx-auto px-6">
          <h1 className="font-display text-4xl text-foreground mb-4">Curso No Encontrado</h1>
          <p className="font-body text-muted-foreground mb-8">El curso que buscas no existe o ha sido movido.</p>
          <Link to="/academy">
            <Button variant="outline" className="rounded-xl"><ArrowLeft className="w-4 h-4 mr-2" /> Volver a Academy</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SalonNavbar />

      {/* Hero Section */}
      <section className="relative pt-44 pb-20 overflow-hidden bg-background" ref={revealRef}>
        <div className="container mx-auto px-6 relative z-10">
          <Link to="/academy" className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-10 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-body text-xs uppercase tracking-widest font-bold">Cursos Academy</span>
          </Link>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className={`space-y-6 ${isVisible ? 'animate-reveal-left' : ''}`}>
              <div className="flex items-center gap-3">
                <span className="bg-accent/10 text-accent px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {course.type === 'live' ? 'Sesión en Vivo' : 'Video Masterclass'}
                </span>
                {course.badge && (
                  <span className="bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    {course.badge}
                  </span>
                )}
              </div>
              
              <h1 className="font-display text-4xl md:text-6xl font-light text-foreground leading-[1.1]">
                {course.title}
              </h1>
              
              <p className="font-body text-lg text-muted-foreground leading-relaxed max-w-xl">
                {course.description}
              </p>

              <div className="flex flex-wrap gap-8 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-medium">{course.duration}</p>
                    <p className="font-body text-[10px] text-muted-foreground uppercase">Duración Total</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-medium">{course.level}</p>
                    <p className="font-body text-[10px] text-muted-foreground uppercase">Nivel</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`relative ${isVisible ? 'animate-reveal-right' : ''}`}>
              <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-10 left-10 right-10 text-white">
                  <p className="font-body text-xs uppercase tracking-widest opacity-70 mb-2">Inversión</p>
                  <p className="font-display text-5xl font-light">{course.price}</p>
                  <div className="mt-6 flex flex-col gap-3">
                    <a href={`sms:17135242610?body=Hola%20Alanis!%20Quiero%20info%20del%20curso:%20${encodeURIComponent(course.title)}`}>
                      <Button variant="gold" className="w-full h-14 rounded-xl gap-2 text-sm font-bold shadow-lg shadow-accent/20">
                        <MessageSquare className="w-4 h-4" /> Reservar vía SMS
                      </Button>
                    </a>
                    <a href="tel:17135242610">
                      <Button variant="heroOutline" className="w-full h-14 rounded-xl gap-2 text-sm font-bold border-white/20">
                        <PhoneCall className="w-4 h-4" /> Llamar ahora
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum / Content Area */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          {!isUnlocked ? (
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-0 overflow-hidden bg-card border border-border rounded-[2.5rem] shadow-2xl animate-reveal-up">
              {/* Left Side: Steps */}
              <div className="p-10 md:p-14 flex flex-col justify-center bg-accent/[0.02]">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                  <LockIcon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display text-3xl font-medium mb-4">Área de Estudiantes</h3>
                <p className="font-body text-sm text-muted-foreground mb-10 leading-relaxed">
                  Accede a las técnicas avanzadas que transformarán tu carrera profesional. Sigue estos pasos para desbloquear el contenido:
                </p>
                
                <div className="space-y-6">
                  {[
                    { step: '1', text: 'Realiza tu pago vía Zelle o CashApp.' },
                    { step: '2', text: 'Envía tu comprobante por WhatsApp.' },
                    { step: '3', text: 'Ingresa tu código de acceso personal.' },
                  ].map(s => (
                    <div key={s.step} className="flex gap-5">
                      <div className="w-7 h-7 rounded-full bg-accent text-white font-display text-xs flex items-center justify-center flex-shrink-0">
                        {s.step}
                      </div>
                      <p className="font-body text-sm text-foreground/80 pt-1">{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: Form */}
              <div className="p-10 md:p-14 bg-accent/5 flex flex-col justify-center border-l border-border/50">
                <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl border border-accent/10">
                  <h4 className="font-display text-xl font-medium mb-6 text-center italic">Desbloquear Masterclass</h4>
                  <form onSubmit={handleUnlock} className="space-y-4">
                    <input 
                      type="text" 
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="INGRESA TU CÓDIGO AQUÍ"
                      className="w-full bg-[#F8F8F8] border border-border rounded-2xl px-6 py-5 font-body text-sm text-center tracking-[0.3em] outline-none focus:ring-2 focus:ring-accent/40 uppercase font-black"
                    />
                    <Button type="submit" variant="gold" className="w-full h-14 rounded-2xl text-sm font-bold shadow-xl shadow-accent/20">
                      Entrar al Curso
                    </Button>
                  </form>
                  <div className="mt-8 pt-8 border-t border-dashed border-border text-center">
                    <p className="font-body text-xs text-muted-foreground mb-4 uppercase tracking-widest">¿Necesitas ayuda o quieres comprarlo?</p>
                    <div className="grid grid-cols-2 gap-3">
                      <a href={`sms:17135242610?body=Hola%20Alanis!%20Quiero%20acceso%20para:%20${encodeURIComponent(course.title)}`}>
                        <Button variant="gold" size="lg" className="rounded-xl gap-2 shadow-lg shadow-accent/20">
                          <MessageSquare className="w-4 h-4" /> SMS
                        </Button>
                      </a>
                      <a href="tel:17135242610">
                        <Button variant="outline" size="lg" className="rounded-xl gap-2 border-accent/20 text-accent hover:bg-accent/5">
                          <PhoneCall className="w-4 h-4" /> Llamar
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="font-display text-3xl font-medium">Contenido de la Masterclass</h2>
                  <p className="font-body text-sm text-muted-foreground mt-1 tracking-wide uppercase">¡Bienvenido(a)! Selecciona una lección para comenzar.</p>
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold border border-emerald-100">
                  <CheckCircle className="w-4 h-4" /> Acceso Concedido
                </div>
              </div>

              {/* Live Session if available */}
              {course.meetLink && (
                <div className="bg-accent text-white rounded-[2.5rem] p-8 md:p-12 mb-12 relative overflow-hidden group shadow-2xl shadow-accent/20">
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left space-y-3">
                      <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        <Video className="w-3.5 h-3.5" /> En Vivo
                      </div>
                      <h3 className="font-display text-3xl font-medium">Únete a la Próxima Sesión</h3>
                      <p className="font-body text-white/70 max-w-md">Interacción directa con Alanis para resolver dudas y perfeccionar tu técnica.</p>
                    </div>
                    <a href={course.meetLink} target="_blank" rel="noopener noreferrer">
                      <Button className="bg-white text-accent hover:bg-white/90 h-16 px-10 rounded-2xl font-bold shadow-xl">
                        Entrar a la Clase <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  </div>
                  <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl" />
                </div>
              )}

              {/* Course Player */}
              {activeLesson !== null && course.curriculum[activeLesson] && (
                <div className="mb-16 animate-reveal-up" id="player">
                  <div className="bg-black rounded-[2.5rem] overflow-hidden shadow-2xl mb-8 ring-1 ring-white/10">
                    {course.curriculum[activeLesson].video_url ? (
                      renderVideo(course.curriculum[activeLesson].video_url!)
                    ) : (
                      <div className="aspect-video flex flex-col items-center justify-center bg-charcoal text-white/20">
                        <Video className="w-20 h-20 mb-4" />
                        <p className="font-display text-lg">Preparando Video...</p>
                      </div>
                    )}
                  </div>
                  <div className="px-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-accent font-display text-sm font-bold uppercase tracking-widest">{course.curriculum[activeLesson].module}</span>
                      <div className="h-px flex-1 bg-border/50" />
                    </div>
                    <h2 className="font-display text-4xl font-light">{course.curriculum[activeLesson].title}</h2>
                    <p className="font-body text-muted-foreground leading-relaxed text-lg max-w-3xl">
                      {course.curriculum[activeLesson].content || 'Explora esta fase detalladamente en la masterclass.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Lessons List */}
              <div className="space-y-4">
                {course.curriculum.length > 0 ? (
                  course.curriculum.map((lesson, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveLesson(i);
                        document.getElementById('player')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`w-full text-left bg-card rounded-2xl p-6 border transition-all duration-300 group flex items-center justify-between ${
                        activeLesson === i 
                          ? 'border-accent shadow-xl ring-1 ring-accent bg-accent/[0.02]' 
                          : 'border-border hover:border-accent/40 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display text-sm font-bold transition-all ${
                          activeLesson === i ? 'bg-accent text-white scale-110 shadow-lg shadow-accent/20' : 'bg-accent/10 text-accent group-hover:bg-accent/20'
                        }`}>
                          {activeLesson === i ? <PlayCircle className="w-6 h-6" /> : i + 1}
                        </div>
                        <div>
                          <p className={`font-body text-[10px] uppercase tracking-widest font-bold mb-1 ${activeLesson === i ? 'text-accent' : 'text-muted-foreground'}`}>
                            {lesson.module}
                          </p>
                          <h4 className="font-display text-lg font-medium">{lesson.title}</h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-2 text-muted-foreground font-body text-xs">
                          <Clock className="w-3.5 h-3.5" /> {lesson.duration}
                        </div>
                        <ArrowLeft className={`w-5 h-5 transition-transform rotate-180 ${activeLesson === i ? 'text-accent translate-x-2' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-2'}`} />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-24 bg-accent/5 rounded-[2.5rem] border border-dashed border-accent/20">
                    <BookOpen className="w-16 h-16 text-accent/20 mx-auto mb-6" />
                    <h3 className="font-display text-xl text-foreground mb-2">Contenido en Preparación</h3>
                    <p className="font-body text-sm text-muted-foreground">Estamos cargando las lecciones. Vuelve pronto.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <SalonFooter />
    </div>
  );
};

export default CourseDetailPage;
