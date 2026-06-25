import { SalonNavbar } from '@/components/SalonNavbar';
import { SalonFooter } from '@/components/SalonFooter';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Clock, BookOpen, Video, Users, CheckCircle, Star, 
  PlayCircle, Award, MessageCircle, Lock as LockIcon, ExternalLink, Calendar,
  GraduationCap, MessageSquare, PhoneCall, Download, FileText, Maximize
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
  const [activeLesson, setActiveLesson] = useState<number>(0);

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

  const ProtectedVideoPlayer = ({ url }: { url: string }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    if (!url) return null;

    let embedUrl = "";
    let isYoutube = false;
    let isVimeo = false;

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const id = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
      // enablejsapi=1 is required for postMessage controls
      embedUrl = `https://www.youtube.com/embed/${id}?controls=0&modestbranding=1&rel=0&disablekb=1&playsinline=1&fs=0&enablejsapi=1&iv_load_policy=3`;
      isYoutube = true;
    } else if (url.includes('loom.com')) {
      const id = url.split('/').pop();
      embedUrl = `https://www.loom.com/embed/${id}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true`;
    } else if (url.includes('vimeo.com')) {
      const id = url.split('/').pop();
      embedUrl = `https://player.vimeo.com/video/${id}?controls=0&title=0&byline=0&portrait=0&dnt=1&api=1`;
      isVimeo = true;
    } else {
      return <video src={url} controls={false} className="w-full aspect-video rounded-3xl bg-black" onContextMenu={e => e.preventDefault()} onClick={(e) => { e.currentTarget.paused ? e.currentTarget.play() : e.currentTarget.pause() }} />;
    }

    const togglePlay = () => {
      if (!iframeRef.current || !iframeRef.current.contentWindow) return;
      
      if (isYoutube) {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: isPlaying ? 'pauseVideo' : 'playVideo',
          args: []
        }), '*');
      } else if (isVimeo) {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({
          method: isPlaying ? 'pause' : 'play'
        }), '*');
      }
      setIsPlaying(!isPlaying);
    };

    const toggleFullscreen = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent click from pausing/playing the video
      if (!document.fullscreenElement) {
        containerRef.current?.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    };

    return (
      <div 
        ref={containerRef}
        className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black group mx-auto"
        onContextMenu={(e) => e.preventDefault()} // Block right click
      >
        <iframe 
          ref={iframeRef}
          className="w-full h-full absolute inset-0 pointer-events-none" // Disables direct clicks to the iframe
          src={embedUrl} 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={false}
          title="Lesson Video"
        />
        
        {/* Invisible layer that covers the entire video, intercepts clicks and prevents double click or menu */}
        <div 
          className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer bg-transparent transition-colors"
          onClick={togglePlay}
          onDoubleClick={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Layer to hide YouTube title when paused */}
          {!isPlaying && isYoutube && (
            <>
              {/* Solid black bar to cover the text */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-black z-[5] pointer-events-none" />
              {/* Smooth gradient to blend with the video */}
              <div className="absolute top-16 left-0 right-0 h-12 bg-gradient-to-b from-black to-transparent z-[5] pointer-events-none" />
            </>
          )}

          {/* Custom Play button (only shown when paused) */}
          {!isPlaying && (
            <div className="w-20 h-20 bg-accent/90 backdrop-blur-md text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-10">
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          )}
          
          {/* Bottom bar controls (always visible or on hover) */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button 
              onClick={toggleFullscreen}
              className="bg-black/50 hover:bg-accent backdrop-blur-sm text-white p-2.5 rounded-full transition-colors"
              title="Full Screen"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
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
          <h1 className="font-display text-4xl text-foreground mb-4">Course Not Found</h1>
          <p className="font-body text-muted-foreground mb-8">The course you are looking for does not exist or has been moved.</p>
          <Link to="/academy">
            <Button variant="outline" className="rounded-xl"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Academy</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] w-full overflow-x-hidden">
      <SalonNavbar />

      <section className="pt-40 pb-20 overflow-hidden" ref={revealRef}>
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <Link to="/academy" className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-8 group w-fit">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-body text-xs uppercase tracking-widest font-bold">Academy Courses</span>
          </Link>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: Image/Player, Info */}
            <div className={`${isUnlocked ? (course.meetLink ? 'lg:col-span-8' : 'lg:col-span-12') : 'lg:col-span-7'} transition-all duration-500 animate-fade-in`}>
              <div className="bg-white rounded-[2.5rem] border border-border shadow-xl overflow-hidden flex flex-col">
              
                {isUnlocked && (
                  <div className="bg-emerald-50 border-b border-emerald-100 p-4 md:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-emerald-800 leading-tight">Access Granted</p>
                        <p className="text-xs text-emerald-600 font-medium mt-0.5">
                          {student ? 'Saved to your account' : 'Guest access (will be lost on sign out)'}
                        </p>
                      </div>
                    </div>
                    {!student && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-sm h-9"
                        onClick={() => setIsAuthModalOpen(true)}
                      >
                        Save to Account
                      </Button>
                    )}
                  </div>
                )}
                {/* Course Info */}
                <div className={`p-5 md:p-8 lg:p-12 pb-4 ${isUnlocked ? 'flex flex-col xl:flex-row gap-8 items-center' : 'space-y-6'}`}>
                  {/* Left Side: Text Info */}
                  <div className={`space-y-6 ${isUnlocked ? 'flex-1' : ''}`}>
                    <div className="flex items-center gap-3">
                      <span className="bg-accent/10 text-accent px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        {course.type === 'live' ? 'Live Session' : 'Video Masterclass'}
                      </span>
                      {course.badge && (
                        <span className="bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                          {course.badge}
                        </span>
                      )}
                    </div>
                    
                    <h1 className="font-display text-4xl md:text-5xl font-light text-foreground leading-[1.1]">
                      {course.title}
                    </h1>
                    
                    <p className="font-body text-lg text-muted-foreground leading-relaxed">
                      {course.description}
                    </p>

                    <div className="flex flex-wrap gap-8 py-6 border-y border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-display text-sm font-medium">{course.duration}</p>
                          <p className="font-body text-[10px] text-muted-foreground uppercase">Total Duration</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-display text-sm font-medium">{course.level}</p>
                          <p className="font-body text-[10px] text-muted-foreground uppercase">Level</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Image (Only when unlocked, placed next to text) */}
                  {isUnlocked && (
                    <div className="w-full xl:w-[40%] shrink-0">
                      <div className="aspect-[4/3] rounded-[2rem] overflow-hidden shadow-sm relative">
                        <img 
                          src={course.image} 
                          alt={course.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* If NOT unlocked, show image full width below info */}
                {!isUnlocked && (
                  <div className="px-4 md:px-6 pb-0">
                    <div className="aspect-[16/10] rounded-[2rem] overflow-hidden shadow-sm relative">
                      <img 
                        src={course.image} 
                        alt={course.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Curriculum Section */}
                <div className="p-5 md:p-8 lg:p-12 pt-8 mt-2">
                  <div className="mb-8">
                    <h3 className="font-display text-2xl font-medium">Course Content</h3>
                    <p className="font-body text-sm text-muted-foreground mt-1">
                      {course.curriculum.length} modules included
                    </p>
                  </div>
                  
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {course.curriculum.length > 0 ? (
                      course.curriculum.map((lesson, i) => (
                        <div 
                          key={i}
                          className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                            isUnlocked && activeLesson === i 
                              ? 'border-accent shadow-md ring-1 ring-accent bg-accent/[0.02]' 
                              : 'border-border hover:border-accent/40 bg-card hover:shadow-md'
                          }`}
                        >
                          <button
                            onClick={() => {
                              if (!isUnlocked) {
                                toast({ title: "Course locked", description: "Please unlock the course to view this module." });
                                return;
                              }
                              setActiveLesson(i);
                              setTimeout(() => {
                                document.getElementById(`player-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }, 100);
                            }}
                            className="w-full text-left p-4 group flex items-start gap-4"
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
                          
                          {/* Accordion Content with Smooth Collapse Animation */}
                          <div 
                            className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-in-out ${
                              isUnlocked && activeLesson === i 
                                ? 'grid-rows-[1fr] opacity-100 mt-2' 
                                : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
                            }`}
                          >
                            <div className="overflow-hidden">
                              <div className="px-2 md:pl-[4.5rem] pb-4 space-y-6 pt-2">
                                <div className="flex flex-col md:flex-row gap-6 items-stretch">
                                  {/* Left: Video Player */}
                                  <div className="bg-black rounded-2xl overflow-hidden shadow-md ring-1 ring-border/50 w-full md:w-3/4 lg:w-[350px] mx-auto md:mx-0 shrink-0" id={`player-${i}`}>
                                    {lesson.video_url ? (
                                      /* Render video only when open, fallback to fixed aspect ratio to prevent snap */
                                      (isUnlocked && activeLesson === i) ? <ProtectedVideoPlayer url={lesson.video_url} /> : <div className="aspect-video bg-black"></div>
                                    ) : (
                                      <div className="aspect-video flex flex-col items-center justify-center bg-charcoal text-white/20">
                                        <Video className="w-12 h-12 mb-2" />
                                        <p className="font-display text-sm">Video in Preparation...</p>
                                      </div>
                                    )}
                                  </div>

                                  <div className="w-full md:flex-1 bg-accent/5 border border-accent/10 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                                    <h4 className="font-display text-lg font-medium mb-2 text-foreground">Attached Material</h4>
                                    {lesson.pdf_url ? (
                                      <>
                                        <p className="font-body text-xs text-muted-foreground mb-4">Download the supporting document for this module.</p>
                                        <a 
                                          href={lesson.pdf_url} 
                                          download={lesson.pdf_name || 'Material.pdf'} 
                                          className="inline-flex items-center justify-center gap-2 bg-accent text-white hover:bg-accent/90 px-6 py-3 rounded-full font-bold text-sm transition-colors shadow-sm w-full max-w-[200px]"
                                        >
                                          <Download className="w-4 h-4" /> 
                                          Download PDF
                                        </a>
                                      </>
                                    ) : (
                                      <p className="font-body text-sm text-muted-foreground">
                                        There is no additional material for this module.
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Bottom: General Content Text */}
                                <div className="pt-2">
                                  <p className="font-body text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap">
                                    {lesson.content || 'Explore this phase in detail in the masterclass.'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-accent/5 rounded-2xl border border-dashed border-accent/20">
                        <BookOpen className="w-10 h-10 text-accent/20 mx-auto mb-4" />
                        <h3 className="font-display text-sm text-foreground">Content in Preparation</h3>
                      </div>
                    )}
                  </div>
                </div>
            </div>

            </div>

            {/* RIGHT COLUMN: Unlock Form & Modules */}
            {(!isUnlocked || course.meetLink) && (
              <div className={`${isUnlocked ? 'lg:col-span-4' : 'lg:col-span-5'} space-y-8 animate-fade-in`} style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              
                {!isUnlocked && (
                /* Unlock Form Vertical Card */
                <div className="bg-white border border-border rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col">
                  {/* Top Area: Instructions */}
                  <div className="bg-accent/[0.03] p-6 md:p-10 border-b border-border/50">
                    <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                      <LockIcon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="font-display text-3xl font-medium mb-4">Student Area</h3>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8">
                      Access advanced techniques that will transform your professional career. Follow these steps to unlock the content:
                    </p>
                    <div className="space-y-4">
                      {[
                        { step: '1', text: 'Make your payment via Zelle or CashApp.' },
                        { step: '2', text: 'Send your receipt via SMS.' },
                        { step: '3', text: 'Enter your personal access code.' },
                      ].map(s => (
                        <div key={s.step} className="flex gap-4 items-center">
                          <div className="w-8 h-8 rounded-full bg-accent text-white font-display text-xs flex items-center justify-center flex-shrink-0 shadow-md shadow-accent/20">
                            {s.step}
                          </div>
                          <p className="font-body text-sm text-foreground/80">{s.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Area: Form and Purchase */}
                  <div className="p-6 md:p-10 flex flex-col relative bg-white">
                    <h4 className="font-display text-xl font-medium mb-6 text-center italic">Unlock Masterclass</h4>
                    
                    {!student ? (
                      <div className="mb-6 text-center">
                        <p className="font-body text-sm text-muted-foreground mb-6">Please log in to enter your access code.</p>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full h-14 rounded-2xl text-sm gap-2 border-accent/20 text-accent hover:bg-accent/5 font-bold shadow-sm"
                          onClick={() => setIsAuthModalOpen(true)}
                        >
                          Log In
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="mb-6 p-4 bg-accent/5 rounded-xl border border-accent/10 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground truncate">Logged in as <strong>{student.email}</strong></span>
                          <button 
                            type="button"
                            onClick={() => supabase.auth.signOut()} 
                            className="text-destructive hover:underline font-semibold ml-2 flex-shrink-0"
                          >
                            Sign Out
                          </button>
                        </div>

                        <form onSubmit={handleUnlock} className="space-y-4">
                          <input 
                            type="text" 
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value)}
                            placeholder="ACCESS CODE"
                            className="w-full bg-accent/[0.02] border border-border rounded-2xl px-6 py-4 font-body text-sm text-center tracking-[0.2em] outline-none focus:ring-2 focus:ring-accent/40 uppercase font-bold shadow-inner"
                          />
                          <Button type="submit" variant="gold" className="w-full h-14 rounded-2xl text-sm font-bold shadow-xl shadow-accent/20 hover:scale-[1.02] transition-transform">
                            Access Course
                          </Button>
                        </form>
                      </>
                    )}

                    {/* Purchase Section */}
                    <div className="mt-8 pt-8 border-t border-dashed border-border text-center">
                      <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-4 font-bold">Don't have the code yet?</p>
                      <div className="flex justify-center items-end gap-2 mb-6">
                        <span className="font-body text-sm uppercase tracking-widest text-muted-foreground mb-1">Investment</span>
                        <span className="font-display text-4xl font-light">{course.price}</span>
                      </div>
                      <a href={`sms:17135242610?body=Hi%20Alanis!%20I%20want%20to%20enroll%20in%20the%20course:%20${encodeURIComponent(course.title)}`} className="block">
                        <Button className="w-full h-14 rounded-2xl gap-2 text-sm font-bold bg-[#111] hover:bg-black text-white shadow-xl transition-all hover:scale-[1.02]">
                          <MessageSquare className="w-4 h-4" /> Enroll via SMS
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Live Session if available */}
              {isUnlocked && course.meetLink && (
                <div className="bg-accent text-white rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden group shadow-2xl shadow-accent/20">
                  <div className="relative z-10 flex flex-col items-center text-center gap-6">
                    <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      <Video className="w-3.5 h-3.5" /> Live
                    </div>
                    <div>
                      <h3 className="font-display text-3xl font-medium mb-3">Join Session</h3>
                      <p className="font-body text-white/80 text-sm">Direct interaction with Alanis to resolve doubts.</p>
                    </div>
                    <a href={course.meetLink} target="_blank" rel="noopener noreferrer" className="w-full">
                      <Button className="bg-white text-accent hover:bg-white/90 w-full h-14 rounded-2xl font-bold shadow-xl">
                        Enter Class <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  </div>
                  <div className="absolute top-0 right-0 w-60 h-60 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                </div>
              )}

            </div>
            )}
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
