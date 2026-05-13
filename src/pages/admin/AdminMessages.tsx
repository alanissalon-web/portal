import { useEffect, useState } from 'react';
import { MessageSquare, Search, Trash2, Mail, Phone, Clock, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LocalDB } from '@/services/LocalDatabase';

const AdminMessages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchMessages = () => {
    const data = LocalDB.getMessages();
    setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleStatusChange = (id: string, status: string) => {
    LocalDB.updateMessageStatus(id, status);
    toast({ title: status === 'read' ? 'Mensaje leído' : 'Estado actualizado' });
    fetchMessages();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este mensaje?')) {
      LocalDB.deleteMessage(id);
      toast({ title: 'Mensaje eliminado' });
      fetchMessages();
    }
  };

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-light text-foreground">Mensajes & Leads</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Gestiona los contactos y consultas directas desde el sitio.</p>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-black/5 rounded-xl pl-10 pr-4 py-2.5 font-body text-sm outline-none focus:ring-1 focus:ring-accent shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border">
          <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="font-body text-sm text-muted-foreground">No hay mensajes nuevos.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((msg) => (
            <div key={msg.id} className={`bg-white rounded-2xl p-6 border transition-all ${msg.status === 'new' ? 'border-accent/30 shadow-md ring-1 ring-accent/5' : 'border-black/5 shadow-sm opacity-80'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${msg.status === 'new' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg font-medium text-foreground">{msg.name}</h3>
                      {msg.status === 'new' && <span className="bg-accent text-white text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold">Nuevo</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
                        <Mail className="w-3 h-3" /> {msg.email}
                      </span>
                      <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" /> {msg.phone}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground font-body text-[10px]">
                  <Clock className="w-3 h-3" />
                  {msg.date || 'Reciente'}
                </div>
              </div>
              <p className="font-body text-sm text-foreground/80 bg-[#FAFAFA] p-4 rounded-xl mb-4 leading-relaxed italic border border-black/5">
                "{msg.message}"
              </p>
              <div className="flex justify-end gap-2">
                {msg.status === 'new' && (
                  <Button 
                    onClick={() => handleStatusChange(msg.id, 'read')}
                    variant="outline" size="sm" className="rounded-lg h-8 text-[11px] border-accent/20 text-accent hover:bg-accent/5"
                  >
                    <Check className="w-3 h-3 mr-1" /> Marcar leído
                  </Button>
                )}
                <Button 
                  onClick={() => handleDelete(msg.id)}
                  variant="ghost" size="sm" className="rounded-lg h-8 text-[11px] text-destructive hover:bg-destructive/5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
