import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Product = {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  description: string | null;
  rating: number | null;
  badge: string | null;
  stock: number | null;
  status: string;
};

const empty = {
  name: '', brand: '', price: 0, image_url: '', category: '',
  description: '', rating: 5, badge: '', stock: 0, status: 'active',
};

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(empty);
  const { toast } = useToast();

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
  };

  useEffect(() => { fetchProducts(); }, []);

  const startCreate = () => { setEditing(null); setForm(empty); setCreating(true); };
  const startEdit = (p: Product) => {
    setCreating(false); setEditing(p);
    setForm({ name: p.name, brand: p.brand ?? '', price: p.price, image_url: p.image_url ?? '',
      category: p.category ?? '', description: p.description ?? '', rating: p.rating ?? 5,
      badge: p.badge ?? '', stock: p.stock ?? 0, status: p.status });
  };
  const cancel = () => { setCreating(false); setEditing(null); };

  const save = async () => {
    const payload = { ...form, badge: form.badge || null, brand: form.brand || null };
    if (editing) {
      const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Product updated' });
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Product created' });
    }
    cancel(); fetchProducts();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    toast({ title: 'Product deleted' }); fetchProducts();
  };

  const toggleStatus = async (p: Product) => {
    const newStatus = p.status === 'active' ? 'inactive' : 'active';
    await supabase.from('products').update({ status: newStatus }).eq('id', p.id);
    fetchProducts();
  };

  const showForm = creating || editing;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-light text-foreground">Products</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Manage your online shop inventory</p>
        </div>
        {!showForm && <Button onClick={startCreate}><Plus className="w-4 h-4" /> New Product</Button>}
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl p-6 border border-border mb-8 space-y-4">
          <h2 className="font-display text-xl font-medium text-foreground">
            {editing ? 'Edit Product' : 'New Product'}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm" />
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Brand</label>
              <input value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm" />
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Price ($)</label>
              <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm" />
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm">
                <option value="">Select category</option>
                <option>Shampoo</option>
                <option>Treatment</option>
                <option>Kit</option>
                <option>Scalp Care</option>
                <option>Styling</option>
              </select>
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Stock</label>
              <input type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: Number(e.target.value) }))}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm" />
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Rating (1-5)</label>
              <input type="number" min={1} max={5} value={form.rating} onChange={e => setForm(p => ({ ...p, rating: Number(e.target.value) }))}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm" />
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Badge</label>
              <input value={form.badge} onChange={e => setForm(p => ({ ...p, badge: e.target.value }))}
                placeholder="e.g. Best Seller, New"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm" />
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-1">Image URL</label>
              <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm" />
            </div>
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground block mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={save}><Save className="w-4 h-4" /> Save</Button>
            <Button variant="outline" onClick={cancel}><X className="w-4 h-4" /> Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {products.length === 0 && !showForm && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="font-body text-sm">No products yet. Add your first product.</p>
          </div>
        )}
        {products.map(p => (
          <div key={p.id} className="bg-card rounded-2xl p-5 border border-border flex items-center gap-4">
            {p.image_url && <img src={p.image_url} alt={p.name} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display text-base font-medium text-foreground truncate">{p.name}</h3>
                {p.badge && <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{p.badge}</span>}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {p.brand && <span>{p.brand}</span>}
                <span>${p.price}</span>
                <span>Stock: {p.stock}</span>
              </div>
            </div>
            <button onClick={() => toggleStatus(p)}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
              {p.status}
            </button>
            <button onClick={() => startEdit(p)} className="text-muted-foreground hover:text-foreground p-2">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive p-2">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;
