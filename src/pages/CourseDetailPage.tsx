import { SalonNavbar } from '@/components/SalonNavbar';
import { SalonFooter } from '@/components/SalonFooter';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Clock, BookOpen, Video, Users, CheckCircle, Star, 
  PlayCircle, Award, MessageCircle, Lock as LockIcon, ExternalLink, Calendar,
  GraduationCap, MessageSquare, PhoneCall, Download, FileText
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
    pdf_url?: string;
    pdf_name?: string;
  }[];
  price: string;
  badge?: string | null;
  meetLink?: string | null;
  accessCode?: string | null;
}

import { StudentAuthModal } from '@/components/StudentAuthModal';
import { supabase } from '@/lib/supabase';
import { LocalDB } from '@/services/LocalDatabase';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const { ref: revealRef, isVisible } = useScrollReveal();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputCode, setInputCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeLesson, setActiveLesson] = useState<number | null>(null);

  // Student auth states
  const [student, setStudent] = useState<any>(null);
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
    const fetchCourseAndCheckAccess = async () => {
      setLoading(true);
      const { data } = await LocalDB.getCourseById(courseId || '');
      
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

        // Check if unlocked: either public (no code), guest storage, or database enrollment
        if (!data.access_code) {
          setIsUnlocked(true);
        } else {
          // Check session storage first
          const savedUnlock = sessionStorage.getItem(`unlocked_${courseId}`);
          if (savedUnlock === 'true') {
            setIsUnlocked(true);
            
            // If logged in, automatically sync the guest access to the database
            if (student) {
              await LocalDB.enrollStudentInCourse(student.id, data.id);
            }
          } else if (student) {
            // Check database enrollment
            const hasAccess = await LocalDB.checkEnrollment(student.id, data.id);
            if (hasAccess) {
              setIsUnlocked(true);
            }
          }
        }
      }
      setLoading(false);
    };

    fetchCourseAndCheckAccess();
  }, [courseId, student]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    if (course.accessCode && inputCode.toUpperCase() === course.accessCode.toUpperCase()) {
      setIsUnlocked(true);
      sessionStorage.setItem(`unlocked_${courseId}`, 'true');

      if (student) {
        // Logged-in user: save enrollment to DB
        await LocalDB.enrollStudentInCourse(student.id, course.id);
        toast({ title: "Course unlocked!", description: "Saved persistently to your account." });
      } else {
        // Guest user: unlock in session storage
        toast({ 
          title: "Course unlocked as guest!", 
          description: "Sign in or register to save this course permanently." 
        });
      }
    } else {
      toast({ variant: "destructive", title: "Incorrect code", description: "Please verify the code sent to you." });
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
            <p className="font-body text-sm text-muted-foreground uppercase tracking-widest">Loading Masterclass...</p>
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
    <div className="min-h-screen bg-[#FAFAF8]">
      <SalonNavbar />

      <section className="pt-40 pb-20 overflow-hidden" ref={revealRef}>
        <div className="container mx-auto px-6 max-w-7xl">
          <Link to="/academy" className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-8 group w-fit">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-body text-xs uppercase tracking-widest font-bold">Cursos Academy</span>
          </Link>

          <div className="grid xl:grid-cols-3 gap-12 items-start">
            
            {/* LEFT COLUMN: Info, Image/Player, Unlock Form */}
            <div className={`xl:col-span-2 space-y-10 ${isVisible ? 'animate-reveal-up' : 'opacity-0'}`}>
              
              {/* Info Header */}
              <div className="space-y-6">
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
                
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-foreground leading-[1.1]">
                  {course.title}
                </h1>
                
                <p className="font-body text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  {course.description}
                </p>

                <div className="flex flex-wrap gap-8 pt-2">
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

              {/* Media: Player or Image */}
              {isUnlocked ? (
                <>
                  {/* Course Player */}
                  {activeLesson !== null && course.curriculum[activeLesson] && (
                    <div className="animate-reveal-up" id="player">
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
                      <div className="px-2 space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="text-accent font-display text-sm font-bold uppercase tracking-widest">{course.curriculum[activeLesson].module}</span>
                          <div className="h-px flex-1 bg-border/50" />
                        </div>
                        <h2 className="font-display text-4xl font-light">{course.curriculum[activeLesson].title}</h2>
                        <p className="font-body text-muted-foreground leading-relaxed text-lg max-w-3xl whitespace-pre-wrap">
                          {course.curriculum[activeLesson].content || 'Explora esta fase detalladamente en la masterclass.'}
                        </p>
                        
                        {course.curriculum[activeLesson].pdf_url && (
                          <div className="pt-4">
                            <a 
                              href={course.curriculum[activeLesson].pdf_url} 
                              download={course.curriculum[activeLesson].pdf_name || 'Material.pdf'} 
                              className="inline-flex items-center gap-2 bg-accent/10 text-accent hover:bg-accent/20 px-5 py-3 rounded-xl font-bold text-sm transition-colors border border-accent/20"
                            >
                              <Download className="w-4 h-4" /> 
                              Descargar Material: {course.curriculum[activeLesson].pdf_name || 'PDF'}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Live Session if available */}
                  {course.meetLink && (
                    <div className="bg-accent text-white rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group shadow-2xl shadow-accent/20 mt-12">
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
                </>
              ) : (
                <>
                  {/* Image for non-unlocked */}
                  <div className="aspect-[4/3] md:aspect-[16/9] rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                    <img 
                      src={course.image} 
                      alt={course.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Unlock Form */}
                  <div className="grid md:grid-cols-2 gap-0 overflow-hidden bg-white border border-border rounded-[2.5rem] shadow-xl mt-12">
                    {/* Left Side: Steps */}
                    <div className="p-8 md:p-10 flex flex-col justify-center bg-accent/[0.02]">
                      <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                        <LockIcon className="w-6 h-6 text-accent" />
                      </div>
                      <h3 className="font-display text-3xl font-medium mb-4">Área de Estudiantes</h3>
                      <p className="font-body text-sm text-muted-foreground mb-8 leading-relaxed">
                        Accede a las técnicas avanzadas que transformarán tu carrera profesional. Sigue estos pasos para desbloquear el contenido:
                      </p>
                      
                      <div className="space-y-6">
                        {[
                          { step: '1', text: 'Realiza tu pago vía Zelle o CashApp.' },
                          { step: '2', text: 'Envía tu comprobante vía SMS.' },
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
                    <div className="p-8 md:p-10 bg-accent/5 flex flex-col justify-center border-t md:border-t-0 md:border-l border-border/50">
                      <h4 className="font-display text-xl font-medium mb-6 text-center italic">Desbloquear Masterclass</h4>
                      
                      {!student ? (
                        <div className="mb-6 text-center">
                          <p className="text-xs text-muted-foreground mb-3">¿Ya tienes una cuenta? Inicia sesión para restaurar tu acceso.</p>
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-full h-11 rounded-xl text-xs gap-2 border-accent/20 text-accent hover:bg-accent/5"
                            onClick={() => setIsAuthModalOpen(true)}
                          >
                            Iniciar Sesión
                          </Button>
                          <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                            <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-[#f8f8f6] px-2 text-muted-foreground">O Desbloquear con Código</span></div>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-6 p-4 bg-accent/5 rounded-xl border border-accent/10 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground truncate">Sesión como <strong>{student.email}</strong></span>
                          <button 
                            type="button"
                            onClick={() => supabase.auth.signOut()} 
                            className="text-destructive hover:underline font-semibold ml-2 flex-shrink-0"
                          >
                            Cerrar Sesión
                          </button>
                        </div>
                      )}

                      <form onSubmit={handleUnlock} className="space-y-4">
                        <input 
                          type="text" 
                          value={inputCode}
                          onChange={(e) => setInputCode(e.target.value)}
                          placeholder="CÓDIGO DE ACCESO"
                          className="w-full bg-white border border-border rounded-2xl px-6 py-5 font-body text-sm text-center tracking-[0.3em] outline-none focus:ring-2 focus:ring-accent/40 uppercase font-black shadow-sm"
                        />
                        <Button type="submit" variant="gold" className="w-full h-14 rounded-2xl text-sm font-bold shadow-xl shadow-accent/20">
                          Acceder al Curso
                        </Button>
                      </form>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* RIGHT COLUMN: Price Card & Modules */}
            <div className={`xl:col-span-1 space-y-8 lg:sticky lg:top-32 ${isVisible ? 'animate-reveal-up' : 'opacity-0'}`} style={{ transitionDelay: '100ms' }}>
              
              {!isUnlocked && (
                <div className="bg-white rounded-[2.5rem] border border-border p-8 md:p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full -mr-10 -mt-10" />
                  
                  <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-2 relative z-10">Inversión</p>
                  <p className="font-display text-5xl font-light text-foreground relative z-10">{course.price}</p>
                  
                  <div className="mt-10 pt-8 border-t border-dashed border-border text-center relative z-10">
                    <p className="font-body text-sm text-muted-foreground mb-4">Paga vía Zelle: envía tu comprobante a alanis@zelle.com y menciona el curso.</p>
                    <a href={`sms:17135242610?body=Hola%20Alanis!%20Quiero%20inscribirme%20en%20el%20curso:%20${encodeURIComponent(course.title)}`} >
                      <Button className="w-full h-14 rounded-2xl gap-2 text-sm font-bold bg-[#111] hover:bg-black text-white shadow-xl mt-2 transition-all hover:scale-[1.02]">
                        <MessageSquare className="w-4 h-4" /> Inscribirme vía SMS
                      </Button>
                    </a>
                  </div>
                </div>
              )}

              {/* Status Banner */}
              {isUnlocked ? (
                <div className="bg-emerald-50/40 border border-emerald-200 rounded-3xl p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-800">Acceso Otorgado</p>
                      <p className="text-xs text-emerald-700 leading-tight mt-0.5">
                        {student ? 'Guardado en tu cuenta' : 'Acceso de invitado (se perderá al cerrar)'}
                      </p>
                    </div>
                  </div>
                  {!student && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-emerald-300 text-emerald-800 hover:bg-emerald-100 h-10 rounded-xl text-xs font-bold w-full"
                      onClick={() => setIsAuthModalOpen(true)}
                    >
                      Guardar Curso en Cuenta
                    </Button>
                  )}
                </div>
              ) : null}

              {/* Curriculum List */}
              <div className="bg-white rounded-[2.5rem] border border-border p-8 shadow-xl">
                <div className="mb-8">
                  <h3 className="font-display text-2xl font-medium">Contenido del Curso</h3>
                  <p className="font-body text-sm text-muted-foreground mt-1">
                    {course.curriculum.length} módulos incluidos
                  </p>
                </div>
                
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {course.curriculum.length > 0 ? (
                    course.curriculum.map((lesson, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (!isUnlocked) {
                            toast({ title: "Curso bloqueado", description: "Por favor desbloquea el curso para ver este módulo." });
                            return;
                          }
                          setActiveLesson(i);
                          document.getElementById('player')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`w-full text-left rounded-2xl p-4 border transition-all duration-300 group flex items-start gap-4 ${
                          isUnlocked && activeLesson === i 
                            ? 'border-accent shadow-md ring-1 ring-accent bg-accent/[0.02]' 
                            : 'border-border hover:border-accent/40 bg-card hover:shadow-md'
                        }`}
                      >
                        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-display text-xs font-bold transition-all ${
                          isUnlocked && activeLesson === i ? 'bg-accent text-white shadow-md scale-110' : 'bg-accent/10 text-accent group-hover:bg-accent/20'
                        }`}>
                          {!isUnlocked ? <LockIcon className="w-4 h-4" /> : (activeLesson === i ? <PlayCircle className="w-5 h-5" /> : i + 1)}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className={`font-body text-[9px] uppercase tracking-widest font-bold mb-1 ${isUnlocked && activeLesson === i ? 'text-accent' : 'text-muted-foreground'}`}>
                            {lesson.module}
                          </p>
                          <h4 className="font-display text-sm font-medium leading-tight mb-2 line-clamp-2">{lesson.title}</h4>
                          <div className="flex items-center gap-3 text-muted-foreground font-body text-[10px]">
                            {lesson.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {lesson.duration}</span>}
                            {lesson.pdf_url && <span className="flex items-center gap-1 text-accent"><FileText className="w-3 h-3" /> PDF</span>}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-accent/5 rounded-2xl border border-dashed border-accent/20">
                      <BookOpen className="w-10 h-10 text-accent/20 mx-auto mb-4" />
                      <h3 className="font-display text-sm text-foreground">Contenido en Preparación</h3>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <StudentAuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setStudent(user);
          setIsAuthModalOpen(false);
        }}
      />

      <SalonFooter />
    </div>
  );
};

export default CourseDetailPage;
