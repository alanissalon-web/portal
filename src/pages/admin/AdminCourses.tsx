import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Video, ExternalLink, Save, X, Upload, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Course = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  type: string;
  duration: string | null;
  level: string | null;
  topics: string[] | null;
  meet_link: string | null;
  status: string;
  badge: string | null;
  access_code: string | null;
  curriculum: { 
    module: string; 
    title: string; 
    lessons: number; 
    duration: string;
    video_url?: string;
    content?: string;
  }[];
  next_date: string | null;
};

const empty: Omit<Course, 'id'> = {
  title: '', description: '', price: 0, image_url: '', type: 'on-demand',
  duration: '', level: 'All Levels', topics: [], meet_link: '', status: 'draft', badge: '',
  access_code: '',
  curriculum: [],
  next_date: '',
};

import { LocalDB } from '@/services/LocalDatabase';

const AdminCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [editing, setEditing] = useState<Course | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(empty);
  const [topicInput, setTopicInput] = useState('');
  
  // Curriculum item state
  const [newModule, setNewModule] = useState({ 
    module: 'Módulo 1', 
    title: '', 
    lessons: 1, 
    duration: '30m',
    video_url: '',
    content: ''
  });
  const { toast } = useToast();

  const fetchCourses = () => {
    const data = LocalDB.getCourses();
    setCourses(data);
  };

  useEffect(() => { fetchCourses(); }, []);

  const startCreate = () => {
    setEditing(null);
    setForm(empty);
    setTopicInput('');
    setCreating(true);
  };

  const startEdit = (c: Course) => {
    setCreating(false);
    setEditing(c);
    setForm({ ...c });
    setTopicInput((c.topics ?? []).join(', '));
  };

  const cancel = () => { setCreating(false); setEditing(null); };

  const save = async () => {
    const topics = topicInput.split(',').map(t => t.trim()).filter(Boolean);
    const payload = { ...form, topics, badge: form.badge || null };

    LocalDB.saveCourse(editing ? { ...payload, id: editing.id } : payload);
    toast({ title: editing ? 'Course updated' : 'Course created' });
    
    cancel();
    fetchCourses();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this course?')) return;
    LocalDB.deleteCourse(id);
    toast({ title: 'Course deleted' });
    fetchCourses();
  };

  const toggleStatus = async (c: Course) => {
    const newStatus = c.status === 'published' ? 'draft' : 'published';
    LocalDB.saveCourse({ ...c, status: newStatus });
    fetchCourses();
  };

  const showForm = creating || editing;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-light text-foreground">Courses</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Manage academy courses and live classes</p>
        </div>
        {!showForm && (
          <Button onClick={startCreate}>
            <Plus className="w-4 h-4" /> New Course
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl p-6 border border-border mb-8 space-y-4">
          <h2 className="font-display text-xl font-medium text-foreground">
            {editing ? 'Edit Course' : 'New Course'}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm" />
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm">
                <option value="on-demand">On-Demand</option>
                <option value="live">Live</option>
              </select>
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Price ($)</label>
              <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm" />
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Duration</label>
              <input value={form.duration ?? ''} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                placeholder="e.g. 6 hours"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm" />
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Level</label>
              <select value={form.level ?? 'All Levels'} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm">
                <option>All Levels</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Badge</label>
              <input value={form.badge ?? ''} onChange={e => setForm(p => ({ ...p, badge: e.target.value }))}
                placeholder="e.g. Best Seller, New"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm" />
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1 font-bold text-accent">Código de Acceso (Zelle/Pago)</label>
              <div className="flex gap-2">
                <input value={form.access_code ?? ''} onChange={e => setForm(p => ({ ...p, access_code: e.target.value.toUpperCase() }))}
                  placeholder="Ej: ALANIS-2024"
                  className="flex-1 bg-background border border-accent/20 rounded-xl px-4 py-2.5 font-body text-sm font-bold uppercase" />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  className="rounded-xl border-accent/20 text-accent"
                  onClick={() => {
                    const code = 'ALANIS-' + Math.random().toString(36).substring(2, 8).toUpperCase();
                    setForm(p => ({ ...p, access_code: code }));
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1">Description</label>
            <textarea value={form.description ?? ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm resize-none" />
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1">Image (Upload)</label>
            <div className="flex gap-2">
              <input 
                type="file" 
                id="course-image" 
                className="hidden" 
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64 = reader.result as string;
                      setForm(p => ({ ...p, image_url: base64 }));
                      // Register in Media Library
                      LocalDB.saveMedia({
                        id: `course-${Date.now()}`,
                        url: base64,
                        name: file.name,
                        type: 'image',
                        size: `${(file.size / 1024).toFixed(1)} KB`,
                        date: new Date().toISOString()
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <Button 
                type="button"
                variant="outline" 
                className="w-full justify-start gap-2 h-10 border-dashed"
                onClick={() => document.getElementById('course-image')?.click()}
              >
                <Upload className="w-4 h-4" />
                <span className="truncate">{form.image_url ? 'Imagen Seleccionada' : 'Subir Imagen'}</span>
              </Button>
              {form.image_url && (
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-border flex-shrink-0">
                  <img src={form.image_url} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1">Topics (comma separated)</label>
            <input value={topicInput} onChange={e => setTopicInput(e.target.value)}
              placeholder="Keratin Fusion, Tape-In Application"
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm" />
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1">
              <Video className="w-3.5 h-3.5 inline mr-1" />
              Meet / Zoom Link (for live classes)
            </label>
            <input value={form.meet_link ?? ''} onChange={e => setForm(p => ({ ...p, meet_link: e.target.value }))}
              placeholder="https://meet.google.com/..."
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm" />
          </div>
          <div className="pt-4 border-t border-border">
            <h3 className="font-display text-lg font-medium text-foreground mb-4">Contenido del Curso (Temario)</h3>
            <div className="space-y-3 mb-6">
              {form.curriculum.map((curr, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-background border border-border p-3 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium truncate">{curr.title}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{curr.module} · {curr.lessons} lecciones · {curr.duration}</p>
                  </div>
                  <Button 
                    variant="ghost" size="icon" className="text-destructive h-8 w-8"
                    onClick={() => setForm(p => ({ ...p, curriculum: p.curriculum.filter((_, i) => i !== idx) }))}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
              {form.curriculum.length === 0 && (
                <p className="text-center py-4 text-xs text-muted-foreground bg-background border border-dashed border-border rounded-xl">
                  No hay módulos todavía. Añade el primero abajo.
                </p>
              )}
            </div>

            <div className="bg-accent/5 p-5 rounded-2xl border border-accent/10 space-y-4">
              <div className="grid sm:grid-cols-4 gap-3 items-end">
                <div className="sm:col-span-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Módulo / Fase</label>
                  <input 
                    value={newModule.module} onChange={e => setNewModule(p => ({ ...p, module: e.target.value }))}
                    placeholder="Módulo 1" className="w-full bg-white border border-border rounded-lg px-3 py-2 text-xs" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Título de la Lección</label>
                  <input 
                    value={newModule.title} onChange={e => setNewModule(p => ({ ...p, title: e.target.value }))}
                    placeholder="Introducción a la técnica..." className="w-full bg-white border border-border rounded-lg px-3 py-2 text-xs" />
                </div>
                <div className="sm:col-span-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Duración</label>
                  <input 
                    value={newModule.duration} onChange={e => setNewModule(p => ({ ...p, duration: e.target.value }))}
                    placeholder="15 min" className="w-full bg-white border border-border rounded-lg px-3 py-2 text-xs" />
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block flex items-center gap-1">
                    <Video className="w-3 h-3" /> Link del Video (YouTube/Loom/Vimeo)
                  </label>
                  <input 
                    value={newModule.video_url} onChange={e => setNewModule(p => ({ ...p, video_url: e.target.value }))}
                    placeholder="https://..." className="w-full bg-white border border-border rounded-lg px-3 py-2 text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Descripción Corta</label>
                  <input 
                    value={newModule.content} onChange={e => setNewModule(p => ({ ...p, content: e.target.value }))}
                    placeholder="En esta lección aprenderás..." className="w-full bg-white border border-border rounded-lg px-3 py-2 text-xs" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  type="button" 
                  className="rounded-lg h-9 gap-2 text-xs bg-accent hover:bg-accent/90"
                  onClick={() => {
                    if (!newModule.title) return;
                    setForm(p => ({ ...p, curriculum: [...p.curriculum, newModule] }));
                    setNewModule({ 
                      module: `Módulo ${form.curriculum.length + 2}`, 
                      title: '', 
                      lessons: 1, 
                      duration: '30m',
                      video_url: '',
                      content: ''
                    });
                  }}
                >
                  <Plus className="w-3.5 h-3.5" /> Añadir Lección al Temario
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-border">
            <Button onClick={save} className="bg-black hover:bg-black/80 rounded-xl px-8 h-12 gap-2">
              <Save className="w-4 h-4" /> Guardar Curso
            </Button>
            <Button variant="outline" onClick={cancel} className="rounded-xl px-8 h-12">Cancelar</Button>
          </div>
        </div>
      )}

      {/* Course List */}
      <div className="space-y-4">
        {courses.length === 0 && !showForm && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="font-body text-sm">No courses yet. Create your first course to get started.</p>
          </div>
        )}
        {courses.map(c => (
          <div key={c.id} className="bg-card rounded-2xl p-5 border border-border flex items-center gap-4">
            {c.image_url && (
              <img src={c.image_url} alt={c.title} className="w-20 h-14 object-cover rounded-xl flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display text-base font-medium text-foreground truncate">{c.title}</h3>
                {c.badge && <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{c.badge}</span>}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{c.type}</span>
                <span>${c.price}</span>
                {c.duration && <span>{c.duration}</span>}
                {c.meet_link && (
                  <a href={c.meet_link} target="_blank" rel="noopener noreferrer" className="text-accent flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Meet Link
                  </a>
                )}
              </div>
            </div>
            <button
              onClick={() => toggleStatus(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                c.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {c.status}
            </button>
            <button onClick={() => startEdit(c)} className="text-muted-foreground hover:text-foreground p-2">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => remove(c.id)} className="text-muted-foreground hover:text-destructive p-2">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCourses;
