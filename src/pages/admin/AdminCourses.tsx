import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Video, ExternalLink, Save, X } from 'lucide-react';
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
};

const empty: Omit<Course, 'id'> = {
  title: '', description: '', price: 0, image_url: '', type: 'on-demand',
  duration: '', level: 'All Levels', topics: [], meet_link: '', status: 'draft', badge: '',
};

const AdminCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [editing, setEditing] = useState<Course | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(empty);
  const [topicInput, setTopicInput] = useState('');
  const { toast } = useToast();

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    if (data) setCourses(data);
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

    if (editing) {
      const { error } = await supabase.from('courses').update(payload).eq('id', editing.id);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Course updated' });
    } else {
      const { error } = await supabase.from('courses').insert(payload);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Course created' });
    }
    cancel();
    fetchCourses();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this course?')) return;
    await supabase.from('courses').delete().eq('id', id);
    toast({ title: 'Course deleted' });
    fetchCourses();
  };

  const toggleStatus = async (c: Course) => {
    const newStatus = c.status === 'published' ? 'draft' : 'published';
    await supabase.from('courses').update({ status: newStatus }).eq('id', c.id);
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
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1">Description</label>
            <textarea value={form.description ?? ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm resize-none" />
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1">Image URL</label>
            <input value={form.image_url ?? ''} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm" />
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
          <div className="flex gap-3 pt-2">
            <Button onClick={save}><Save className="w-4 h-4" /> Save</Button>
            <Button variant="outline" onClick={cancel}><X className="w-4 h-4" /> Cancel</Button>
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
