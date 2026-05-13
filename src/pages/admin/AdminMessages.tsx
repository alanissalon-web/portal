import { useEffect, useState, useRef } from 'react';
import { MessageSquare, Search, Trash2, Mail, Phone, Clock, Loader2, Check, Send, Reply, X as CloseIcon, Plus, Camera, Image as ImageIcon, Mic, Smile, ThumbsUp, User, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LocalDB } from '@/services/LocalDatabase';

const AdminMessages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'form' | 'chat'>('chat');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = () => {
    const data = LocalDB.getMessages();
    setMessages(data);
    if (!selectedUser && data.length > 0) {
      const firstChat = data.find((m: any) => (m.type === 'chat' || !m.type) && m.name !== 'Alanís Salon');
      if (firstChat) setSelectedUser(firstChat.name);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll for new messages
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedUser, messages]);

  const handleReply = () => {
    if (!replyText.trim() || !selectedUser) return;
    LocalDB.saveMessage({
      name: 'Alanís Salon',
      email: 'admin@alanissalon.com',
      message: replyText,
      date: 'Justo ahora',
      status: 'read',
      type: 'chat',
      to: selectedUser // Tag who we are replying to
    });
    setReplyText('');
    fetchMessages();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      LocalDB.saveMessage({
        name: 'Alanís Salon',
        email: 'admin@alanissalon.com',
        message: '[Imagen]',
        image: base64String,
        date: 'Justo ahora',
        status: 'read',
        type: 'chat',
        to: selectedUser || ''
      });
      fetchMessages();
    };
    reader.readAsDataURL(file);
  };

  // Group messages by user for the sidebar (exclude admin's own entries)
  const conversations = Array.from(new Set(
    messages
      .filter(m => m.type === filterType && m.name !== 'Alanís Salon' && m.name !== 'Admin')
      .map(m => m.name)
  )).map(name => {
    const userMsgs = messages.filter(m => m.name === name || m.to === name);
    return {
      name,
      lastMsg: userMsgs[userMsgs.length - 1],
      unread: userMsgs.some(m => m.status === 'new' && m.name === name)
    };
  });

  const activeChatMessages = messages.filter(m => 
    (m.name === selectedUser || m.to === selectedUser) && m.type === filterType
  );

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-light text-foreground">Centro de Comunicación</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Chat en tiempo real con tus clientes.</p>
        </div>
        <div className="flex bg-white rounded-xl p-1 border border-black/5 shadow-sm">
          <button onClick={() => setFilterType('chat')} className={`px-4 py-1.5 rounded-lg font-body text-xs transition-all ${filterType === 'chat' ? 'bg-accent text-white shadow-md' : 'text-muted-foreground'}`}>Messenger Live</button>
          <button onClick={() => setFilterType('form')} className={`px-4 py-1.5 rounded-lg font-body text-xs transition-all ${filterType === 'form' ? 'bg-accent text-white shadow-md' : 'text-muted-foreground'}`}>Formularios</button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-black/5 shadow-xl overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-border flex flex-col bg-[#FAFAFA]">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Buscar chat..." className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2 font-body text-sm outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button 
                key={conv.name}
                onClick={() => setSelectedUser(conv.name)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-white transition-colors border-b border-black/[0.02] ${selectedUser === conv.name ? 'bg-white border-r-4 border-accent' : ''}`}
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                  {conv.name[0]}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="font-display font-medium text-sm truncate">{conv.name}</p>
                    {conv.unread && <div className="w-2 h-2 bg-accent rounded-full" />}
                  </div>
                  <p className="font-body text-xs text-muted-foreground truncate italic">"{conv.lastMsg.message}"</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedUser ? (
            <>
              <div className="p-4 border-b border-border flex items-center justify-between bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-display font-medium text-foreground">{selectedUser}</p>
                    <p className="text-[10px] text-green-500 font-medium">Cliente en línea</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-muted-foreground"><Phone className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => {
                    if(confirm('¿Eliminar conversación?')) {
                      activeChatMessages.forEach(m => LocalDB.deleteMessage(m.id));
                      fetchMessages();
                      setSelectedUser(null);
                    }
                  }}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8F9FA]/30 scroll-smooth">
                {activeChatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.email === 'admin@alanissalon.com' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[70%] group">
                      <div className={`p-4 rounded-2xl text-sm shadow-sm ${
                        msg.email === 'admin@alanissalon.com' 
                          ? 'bg-accent text-white rounded-tr-none' 
                          : 'bg-white border border-black/5 text-gray-800 rounded-tl-none'
                      }`}>
                        {msg.image ? (
                          <img src={msg.image} className="max-w-xs rounded-lg shadow-sm" alt="Imagen enviada" />
                        ) : msg.voice ? (
                          <div className="flex items-center gap-3 py-1 text-inherit">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                              <div className="w-3 h-3 bg-white rounded-sm" />
                            </div>
                            <div className="flex gap-0.5 items-center">
                              {[...Array(15)].map((_, i) => (
                                <div key={i} className="w-1 bg-white/40 rounded-full" style={{ height: `${Math.random() * 20 + 5}px` }} />
                              ))}
                            </div>
                            <span className="text-[10px] opacity-80">0:15</span>
                          </div>
                        ) : (
                          msg.message
                        )}
                      </div>
                      <p className={`text-[9px] mt-1 text-muted-foreground px-1 ${msg.email === 'admin@alanissalon.com' ? 'text-right' : 'text-left'}`}>
                        {msg.date || 'Hoy'} {msg.status === 'read' && msg.email === 'admin@alanissalon.com' && '· Leído'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-border bg-white">
                <div className="flex items-center gap-4 text-accent mb-3 px-1">
                  <Plus className="w-5 h-5 cursor-pointer hover:scale-110 transition-all" />
                  
                  <label className="cursor-pointer hover:scale-110 transition-all">
                    <Camera className="w-5 h-5" />
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                  </label>

                  <label className="cursor-pointer hover:scale-110 transition-all">
                    <ImageIcon className="w-5 h-5" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>

                  <Mic className="w-5 h-5 cursor-pointer hover:scale-110 transition-all" />
                  <Gift className="w-5 h-5 cursor-pointer hover:scale-110 transition-all" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full px-4 py-2.5 flex items-center gap-2 border border-black/5">
                    <input 
                      type="text" 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                      placeholder="Escribe un mensaje..."
                      className="bg-transparent flex-1 text-sm outline-none"
                    />
                    <Smile className="w-5 h-5 text-accent cursor-pointer hover:scale-110 transition-all" />
                  </div>
                  <div className="text-accent">
                    {replyText.trim() ? (
                      <Button onClick={handleReply} size="icon" className="bg-accent hover:bg-accent/90 rounded-full w-10 h-10">
                        <Send className="w-4 h-4" />
                      </Button>
                    ) : (
                      <ThumbsUp className="w-7 h-7 cursor-pointer hover:scale-110 active:scale-95 transition-all" onClick={() => { setReplyText('👍'); setTimeout(handleReply, 50); }} />
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <div className="w-20 h-20 bg-accent/5 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-accent/20" />
              </div>
              <h3 className="font-display text-xl text-foreground mb-2">Selecciona una conversación</h3>
              <p className="font-body text-sm max-w-xs">Elige un cliente de la lista de la izquierda para comenzar a chatear en tiempo real.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
