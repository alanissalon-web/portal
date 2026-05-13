import { useState, useEffect } from 'react';
import { Settings, Save, Lock, Bell, Palette, Globe, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LocalDB } from '@/services/LocalDatabase';

const AdminSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [settings, setSettings] = useState({
    siteName: '',
    contactEmail: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const data = LocalDB.getSettings();
    setSettings(data);
    setFetching(false);
  }, []);

  const handleSave = () => {
    setLoading(true);
    LocalDB.saveSettings(settings);
    setTimeout(() => {
      toast({ title: 'Ajustes guardados', description: 'La configuración de la plataforma ha sido actualizada.' });
      setLoading(false);
    }, 500);
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-3xl font-light text-foreground">Configuración</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Ajustes generales de la plataforma y seguridad.</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="gap-2 bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 rounded-xl px-6">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
          Guardar Todo
        </Button>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-medium">General</h3>
          </div>
          <div className="grid gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Nombre del Sitio</label>
              <input 
                type="text" 
                value={settings.siteName} 
                onChange={e => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-accent transition-all" 
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Email de Contacto</label>
                <input 
                  type="email" 
                  value={settings.contactEmail} 
                  onChange={e => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-accent transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Teléfono</label>
                <input 
                  type="text" 
                  value={settings.phone} 
                  onChange={e => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-accent transition-all" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Dirección Física</label>
              <input 
                type="text" 
                value={settings.address} 
                onChange={e => setSettings(prev => ({ ...prev, address: e.target.value }))}
                className="w-full bg-[#FAFAFA] border border-black/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-accent transition-all" 
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-medium">Seguridad</h3>
          </div>
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-between rounded-xl border-black/5 h-14 px-6 hover:bg-muted/50 transition-all">
              <span className="flex items-center gap-3 font-body text-sm"><Lock className="w-4 h-4 text-muted-foreground" /> Cambiar Contraseña</span>
              <span className="text-[10px] text-muted-foreground font-medium bg-muted px-2 py-1 rounded-md">Último cambio: hace 3 meses</span>
            </Button>
            <Button variant="outline" className="w-full justify-between rounded-xl border-black/5 h-14 px-6 hover:bg-muted/50 transition-all">
              <span className="flex items-center gap-3 font-body text-sm"><Shield className="w-4 h-4 text-muted-foreground" /> Autenticación en dos pasos</span>
              <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded-md">Desactivado</span>
            </Button>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-medium">Apariencia</h3>
          </div>
          <div className="flex items-center justify-between p-6 bg-[#FAFAFA] rounded-2xl border border-black/5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#C4A484] shadow-inner shadow-black/10" />
              <div>
                <p className="text-sm font-bold text-foreground">Tema Alanís (Premium Gold)</p>
                <p className="text-[10px] text-muted-foreground">Paleta oficial Houston 2026</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-accent font-bold text-xs hover:bg-accent/5 px-4 h-9 rounded-lg">Cambiar</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
