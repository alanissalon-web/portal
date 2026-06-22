import { useEffect, useState, useRef, useCallback } from 'react';
import { MessageSquare, Search, Trash2, Mail, Phone, Clock, Loader2, Check, Send, Reply, X as CloseIcon, Plus, Camera, Image as ImageIcon, Mic, Smile, ThumbsUp, User, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LocalDB } from '@/services/LocalDatabase';
import { motion, AnimatePresence } from 'framer-motion';

const AdminMessages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'form' | 'chat'>('chat');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [incomingCall, setIncomingCall] = useState<any>(null);

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const fetchMessages = useCallback(async () => {
    // 1. Download new messages from server
    await LocalDB.syncMessages?.();
    
    // 2. Load into view
    const { data } = await LocalDB.getMessages();
    setMessages(data || []);
    
    // Detect incoming call
    const call = data.find((m: any) => m.type === 'call' && m.status === 'new');
    if (call && (!incomingCall || incomingCall.id !== call.id)) {
      setIncomingCall(call);
    }

    // Auto-select first conversation
    if (!selectedUser && data.length > 0) {
      const firstChat = data.find((m: any) => (m.type === 'chat' || !m.type) && m.name !== 'Alanís Salon');
      if (firstChat) setSelectedUser(firstChat.name);
    }
    setLoading(false);
  }, [selectedUser, incomingCall]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedUser, messages]);

  const handleReply = async () => {
    if (!replyText.trim() || !selectedUser) return;
    await LocalDB.saveMessage({
      name: 'Alanís Salon',
      email: 'admin@alanissalon.com',
      message: replyText,
      date: new Date().toLocaleTimeString(),
      status: 'read',
      type: 'chat',
      toEmail: selectedUser // Use phone as unique ID
    });
    setReplyText('');
    await fetchMessages();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      await LocalDB.saveMessage({
        name: 'Alanís Salon',
        email: 'admin@alanissalon.com',
        message: '[Imagen]',
        image: base64,
        date: new Date().toLocaleTimeString(),
        status: 'read',
        type: 'chat',
        to: selectedUser || ''
      });
      await fetchMessages();
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          await LocalDB.saveMessage({ name: 'Alanís Salon', email: 'admin@alanissalon.com', message: '[Nota de voz]', voice: base64, to: selectedUser || '', date: new Date().toLocaleTimeString(), status: 'read', type: 'chat' });
          await fetchMessages();
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      toast({ title: 'Error', description: 'Micrófono no disponible.' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleAudioPlayback = (id: string, audioUrl: string) => {
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setPlayingId(id);
      audio.ontimeupdate = () => setAudioProgress((audio.currentTime / audio.duration) * 100);
      audio.onended = () => { setPlayingId(null); setAudioProgress(0); };
      audio.play().catch(() => toast({ title: 'Error', description: 'No se pudo reproducir.' }));
    }
  };

  // Group messages by user for the sidebar (Unified by Phone/Email)
  const conversations = Array.from(new Set(
    messages
      .filter(m => (m.type === filterType || (filterType === 'chat' && !m.type)) && m.name !== 'Alanís Salon' && m.name !== 'Admin')
      .map(m => m.email) // Use email/phone as unique key
  )).map(phone => {
    const userMsgs = messages.filter(m => m.email === phone || m.toEmail === phone);
    const lastMsg = userMsgs[userMsgs.length - 1];
    return {
      phone,
      name: lastMsg?.name || 'Cliente',
      lastMsg,
      unread: userMsgs.some(m => m.status === 'new' && m.email === phone)
    };
  });

  const activeChatMessages = messages.filter(m => 
    selectedUser && (m.email === selectedUser || m.toEmail === selectedUser) && (m.type === filterType || (filterType === 'chat' && !m.type))
  );

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-light text-foreground">Centro de Comunicación</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Chat en tiempo real y gestión de leads.</p>
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
              <input type="text" placeholder="Buscar chat..." className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2 text-sm outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button 
                key={conv.phone}
                onClick={() => setSelectedUser(conv.phone)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-white transition-colors border-b border-black/[0.02] ${selectedUser === conv.phone ? 'bg-white border-r-4 border-accent' : ''}`}
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-lg">{conv.name[0]}</div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="font-display font-medium text-sm truncate">{conv.name}</p>
                    {conv.unread && <div className="w-2.5 h-2.5 bg-accent rounded-full border-2 border-white" />}
                  </div>
                  <p className="font-body text-xs text-muted-foreground truncate italic opacity-70">"{conv.lastMsg?.message || 'Multimedia'}"</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white relative">
          {selectedUser ? (
            <>
              <div className="p-4 border-b border-border flex items-center justify-between bg-white/50 backdrop-blur-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                    {conversations.find(c => c.phone === selectedUser)?.name?.[0] || 'C'}
                  </div>
                  <div>
                    <p className="font-display font-medium text-foreground">
                      {conversations.find(c => c.phone === selectedUser)?.name || 'Cliente'}
                    </p>
                    <p className="text-[10px] text-green-500 font-medium">Chat Activo · {selectedUser}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-red-500 transition-colors" 
                    onClick={async () => { 
                      if(confirm('¿Estás seguro de que deseas eliminar este chat completo? Esta acción no se puede deshacer.')) { 
                        const { data: allMessages } = await LocalDB.getMessages();
                        const toDelete = (allMessages || []).filter((m: any) => m.email === selectedUser || m.toEmail === selectedUser);
                        await Promise.all(toDelete.map((m: any) => LocalDB.deleteMessage(m.id))); 
                        
                        toast({ title: 'Chat eliminado', description: 'La conversación se ha borrado correctamente.' });
                        await fetchMessages(); 
                        setSelectedUser(null); 
                      } 
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8F9FA]/50">
                {activeChatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.email === 'admin@alanissalon.com' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[75%]">
                      <div className={`p-4 rounded-2xl text-sm shadow-sm ${msg.email === 'admin@alanissalon.com' ? 'bg-accent text-white rounded-tr-none' : 'bg-white border border-black/5 text-gray-800 rounded-tl-none'}`}>
                        {msg.image ? (
                          <img src={msg.image} className="max-w-xs rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform" onClick={() => window.open(msg.image)} />
                        ) : msg.voice ? (
                          <div className="flex flex-col gap-2 min-w-[220px]">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (typeof msg.voice !== 'string' || !msg.voice.startsWith('data:audio')) {
                                    toast({ title: 'Audio antiguo', description: 'Sin sonido real.' });
                                    return;
                                  }
                                  handleAudioPlayback(msg.id, msg.voice);
                                }} 
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
                                  msg.email === 'admin@alanissalon.com' ? 'bg-white/20' : 'bg-accent/10 text-accent'
                                }`}
                              >
                                {playingId === msg.id ? (
                                  <div className="flex gap-1">
                                    <div className={`w-1 h-3 rounded-full ${msg.email === 'admin@alanissalon.com' ? 'bg-white' : 'bg-accent'}`} />
                                    <div className={`w-1 h-3 rounded-full ${msg.email === 'admin@alanissalon.com' ? 'bg-white' : 'bg-accent'}`} />
                                  </div>
                                ) : (
                                  <div className={`w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-b-[6px] border-b-transparent ml-1 ${
                                    msg.email === 'admin@alanissalon.com' ? 'border-l-white' : 'border-l-accent'
                                  }`} />
                                )}
                              </button>
                              <div className="flex-1 space-y-1">
                                <div className="h-1 w-full bg-black/10 rounded-full overflow-hidden">
                                  <motion.div 
                                    className={`h-full ${msg.email === 'admin@alanissalon.com' ? 'bg-white' : 'bg-accent'}`}
                                    animate={{ width: playingId === msg.id ? `${audioProgress}%` : '0%' }}
                                    transition={{ duration: 0.1 }}
                                  />
                                </div>
                                <div className="flex justify-between text-[10px] opacity-70">
                                  <span>{playingId === msg.id ? 'Reproduciendo...' : 'Mensaje de voz'}</span>
                                  <span>{msg.date || '0:15'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          msg.message
                        )}
                      </div>
                      <p className={`text-[9px] mt-1 text-muted-foreground px-1 ${msg.email === 'admin@alanissalon.com' ? 'text-right' : 'text-left'}`}>{msg.date || 'Hoy'}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-border bg-white shadow-inner">
                <div className="flex items-center gap-4 text-accent mb-3 px-1">
                  <label className="cursor-pointer hover:scale-110 transition-all"><Camera className="w-5 h-5" /><input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} /></label>
                  <label className="cursor-pointer hover:scale-110 transition-all"><ImageIcon className="w-5 h-5" /><input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} /></label>
                  <Mic className={`w-5 h-5 cursor-pointer ${isRecording ? 'text-red-500 animate-pulse' : ''}`} onClick={() => isRecording ? stopRecording() : startRecording()} />
                  <Gift className="w-5 h-5 cursor-pointer" />
                </div>
                {isRecording && <div className="bg-red-50 p-3 rounded-xl mb-3 flex justify-between items-center animate-in slide-in-from-bottom-2"><span className="text-xs text-red-600 font-bold">GRABANDO AUDIO...</span><Button size="sm" variant="destructive" onClick={stopRecording}>ENVIAR NOTA</Button></div>}
                <div className="flex items-center gap-2">
                  <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleReply()} placeholder="Escribe tu respuesta..." className="flex-1 bg-muted rounded-full px-5 py-3 text-sm outline-none border border-black/5" />
                  <div className="text-accent">
                    {replyText.trim() ? <Button onClick={handleReply} size="icon" className="bg-accent hover:bg-accent/90 rounded-full w-12 h-12 shadow-lg transition-transform active:scale-95"><Send className="w-5 h-5" /></Button> : <ThumbsUp className="w-8 h-8 cursor-pointer hover:scale-110 active:scale-90 transition-all" onClick={() => { setReplyText('👍'); setTimeout(handleReply, 50); }} />}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <div className="w-20 h-20 bg-accent/5 rounded-full flex items-center justify-center mb-4"><MessageSquare className="w-10 h-10 text-accent/20" /></div>
              <h3 className="font-display text-xl text-foreground mb-2">Bandeja de Entrada</h3>
              <p className="font-body text-sm max-w-xs opacity-60">Selecciona una conversación para gestionar la atención al cliente.</p>
            </div>
          )}
        </div>
      </div>

      {/* Incoming Call Overlay */}
      <AnimatePresence>
        {incomingCall && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-charcoal/95 flex flex-col items-center justify-center text-white backdrop-blur-md"
          >
            <div className="relative mb-12">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 bg-accent rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(var(--accent-rgb),0.5)]"
              >
                <Phone className="w-16 h-16 animate-bounce" />
              </motion.div>
              <div className="absolute inset-0 border-4 border-white/20 rounded-full animate-ping" />
            </div>
            
            <h2 className="text-3xl font-display mb-2">Llamada Entrante</h2>
            <p className="text-xl font-body opacity-80 mb-12">{incomingCall.name} · {incomingCall.email}</p>
            
            <div className="flex gap-8">
              <button 
                onClick={async () => {
                  await LocalDB.updateMessageStatus(incomingCall.id, 'read');
                  setIncomingCall(null);
                  setSelectedUser(incomingCall.email);
                  toast({ title: 'Llamada conectada', description: 'Ahora estás en línea con el cliente.' });
                }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-green-500/30"
              >
                <Check className="w-10 h-10" />
              </button>
              <button 
                onClick={async () => {
                  await LocalDB.deleteMessage(incomingCall.id);
                  setIncomingCall(null);
                }}
                className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-red-500/30"
              >
                <CloseIcon className="w-10 h-10" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminMessages;
