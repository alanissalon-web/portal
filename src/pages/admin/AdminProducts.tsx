import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Save, X, Upload, Wand2 } from 'lucide-react';
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
  amazon_url: '',
};

import { LocalDB } from '@/services/LocalDatabase';

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(empty);
  const { toast } = useToast();

  const fetchProducts = () => {
    const data = LocalDB.getProducts();
    setProducts(data);
  };

  useEffect(() => { fetchProducts(); }, []);

  const startCreate = () => { setEditing(null); setForm(empty); setCreating(true); };
  const startEdit = (p: Product) => {
    setCreating(false); setEditing(p);
    setForm({ name: p.name, brand: p.brand ?? '', price: p.price, image_url: p.image_url ?? '',
      category: p.category ?? '', description: p.description ?? '', rating: p.rating ?? 5,
      badge: p.badge ?? '', stock: p.stock ?? 0, status: p.status, 
      amazon_url: (p as any).amazon_url ?? '' });
  };
  const cancel = () => { setCreating(false); setEditing(null); };

  const save = async () => {
    const payload = { ...form, badge: form.badge || null, brand: form.brand || null };
    LocalDB.saveProduct(editing ? { ...payload, id: editing.id } : payload);
    toast({ title: editing ? 'Product updated' : 'Product created' });
    cancel(); fetchProducts();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    LocalDB.deleteProduct(id);
    toast({ title: 'Product deleted' }); fetchProducts();
  };

  const toggleStatus = async (p: Product) => {
    const newStatus = p.status === 'active' ? 'inactive' : 'active';
    LocalDB.saveProduct({ ...p, status: newStatus });
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
                <option>Productos en Amazon</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="font-body text-xs text-muted-foreground block mb-1">Amazon Link (Marketplace)</label>
              <div className="flex gap-2">
                <input value={form.amazon_url} onChange={e => setForm(p => ({ ...p, amazon_url: e.target.value }))}
                  placeholder="https://www.amazon.com/dp/B0..."
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 font-body text-sm" />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="gap-2 bg-accent/5 border-accent/20 text-accent hover:bg-accent/10"
                  onClick={() => {
                    if (!form.amazon_url) return;
                    // Mock Scraping / URL Parsing Logic
                    try {
                      const url = new URL(form.amazon_url);
                      const parts = url.pathname.split('/');
                      const namePart = parts.find(p => p.length > 10 && !p.includes('dp'));
                      if (namePart) {
                        const cleanName = namePart.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        setForm(prev => ({ 
                          ...prev, 
                          name: cleanName.substring(0, 50), 
                          category: 'Productos en Amazon',
                          badge: 'Amazon Prime'
                        }));
                        toast({ title: '¡Datos detectados!', description: 'Hemos completado el título y categoría automáticamente.' });
                      }
                    } catch (e) {
                      toast({ variant: 'destructive', title: 'URL Inválida', description: 'Asegúrate de copiar el link completo de Amazon.' });
                    }
                  }}
                >
                  <Wand2 className="w-4 h-4" />
                  Magic Fill
                </Button>
              </div>
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
              <label className="font-body text-xs text-muted-foreground block mb-1">Image (Upload)</label>
              <div className="flex gap-2">
                <input 
                  type="file" 
                  id="product-image" 
                  className="hidden" 
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64 = reader.result as string;
                        setForm(p => ({ ...p, image_url: base64 }));
                        // Register in Media Library too
                        LocalDB.saveMedia({
                          id: `prod-${Date.now()}`,
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
                  onClick={() => document.getElementById('product-image')?.click()}
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
