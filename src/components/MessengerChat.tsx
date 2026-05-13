import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  X, Send, Plus, Camera, Image as ImageIcon, Mic, 
  Smile, ThumbsUp, Phone, Video, Info, ChevronLeft,
  Circle, Star, Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocalDB } from '@/services/LocalDatabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export function MessengerChat() {
  const location = useLocation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isIdentified, setIsIdentified] = useState(false);
  
  if (location.pathname.startsWith('/admin')) return null;

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChat = () => {
      const msgs = LocalDB.getMessages();
      // Filter for messages belonging to this client or sent to this client
      const filtered = msgs.filter((m: any) => 
        m.type === 'chat' && (m.name === clientName || m.to === clientName)
      );
      
      setChatHistory(filtered.map((m: any) => ({
        id: m.id,
        text: m.message,
        sender: m.name === clientName ? 'me' : 'them',
        timestamp: m.date || 'Just now'
      })));
    };

    if (isOpen && isIdentified) {
      fetchChat();
      const interval = setInterval(fetchChat, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, isIdentified, clientName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    const newMsg = {
      id: Date.now().toString(),
      text: message,
      sender: 'me',
      timestamp: 'Now'
    };

    setChatHistory([...chatHistory, newMsg]);
    
    LocalDB.saveMessage({
      name: clientName || 'Invitado',
      email: clientPhone || 'Sin teléfono',
      message: message,
      date: new Date().toLocaleTimeString(),
      status: 'new',
      type: 'chat'
    });

    setMessage('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const newMsg = {
        id: Date.now().toString(),
        image: base64String,
        sender: 'me',
        timestamp: 'Ahora'
      };
      setChatHistory([...chatHistory, newMsg]);
      LocalDB.saveMessage({
        name: clientName || 'Invitado',
        email: clientPhone || 'Sin teléfono',
        message: '[Imagen]',
        image: base64String,
        date: new Date().toLocaleTimeString(),
        status: 'new',
        type: 'chat'
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {/* Floating Bubble */}
      <motion.button
        onClick={() => setIsOpen(true)}
        initial={{ scale: 0 }}
        animate={{ 
          scale: 1,
          y: [0, -4, 0] 
        }}
        transition={{
          scale: { type: "spring", stiffness: 260, damping: 20 },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-16 h-16 bg-accent rounded-full shadow-[0_8px_32px_rgba(var(--accent-rgb),0.3)] flex items-center justify-center z-50 group"
      >
        <Star className="w-8 h-8 text-white fill-white" />
        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">1</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-[60] overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-charcoal p-3 flex items-center justify-between text-white shadow-md">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 overflow-hidden border border-white/30">
                    <Star className="w-6 h-6 text-accent fill-accent m-auto mt-2" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-charcoal rounded-full" />
                </div>
                <div>
                  <p className="font-bold text-sm leading-none">Alanís Salon</p>
                  <p className="text-[10px] opacity-80">Activo ahora</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pr-2">
                <Phone className="w-5 h-5 hover:bg-white/10 p-1 rounded-full cursor-pointer" />
                <Video className="w-5 h-5 hover:bg-white/10 p-1 rounded-full cursor-pointer" />
                <Info className="w-5 h-5 hover:bg-white/10 p-1 rounded-full cursor-pointer" />
              </div>
            </div>

            {!isIdentified ? (
              <div className="flex-1 flex flex-col p-8 items-center justify-center text-center bg-white">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-6">
                  <Star className="w-10 h-10 text-accent fill-accent" />
                </div>
                <h3 className="font-display text-2xl text-foreground mb-2">¡Hola!</h3>
                <p className="font-body text-sm text-muted-foreground mb-8">Déjanos tus datos para brindarte una atención personalizada.</p>
                
                <div className="w-full space-y-4">
                  <input 
                    type="text" 
                    placeholder="Tu nombre completo"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-accent"
                  />
                  <input 
                    type="tel" 
                    placeholder="Tu teléfono"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-accent"
                  />
                  <Button 
                    onClick={() => {
                      if (clientName && clientPhone) setIsIdentified(true);
                    }}
                    className="w-full bg-accent hover:bg-accent/90 text-white rounded-xl py-6 text-sm font-medium shadow-lg"
                  >
                    Empezar a chatear
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Messages Area */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-white scrollbar-hide"
                >
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-6">Chat en vivo con Alanís Salon</p>
                  </div>

                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className="flex items-end gap-2 max-w-[80%]">
                        {msg.sender === 'them' && (
                          <div className="w-7 h-7 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            <Star className="w-4 h-4 text-accent fill-accent" />
                          </div>
                        )}
                        <div className={`p-3 rounded-2xl text-sm ${
                          msg.sender === 'me' 
                            ? 'bg-accent text-white rounded-tr-none' 
                            : 'bg-gray-100 text-gray-800 rounded-tl-none'
                        }`}>
                          {msg.image ? (
                            <img src={msg.image} className="max-w-full rounded-lg shadow-sm" alt="Enviado" />
                          ) : (
                            msg.text
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input Area */}
                <div className="p-3 border-t border-gray-100 flex flex-col gap-3">
                  <div className="flex items-center gap-4 text-accent px-1">
                    <Plus className="w-5 h-5 cursor-pointer hover:opacity-70" onClick={() => toast({ title: 'Menú expandido', description: 'Opciones de ubicación y servicios.' })} />
                    
                    <label className="cursor-pointer hover:opacity-70">
                      <Camera className="w-5 h-5" />
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                    </label>

                    <label className="cursor-pointer hover:opacity-70">
                      <ImageIcon className="w-5 h-5" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>

                    <Mic className="w-5 h-5 cursor-pointer hover:opacity-70" onClick={() => toast({ title: 'Nota de voz', description: 'Sistema de audio activado.' })} />
                    <Gift className="w-5 h-5 cursor-pointer hover:opacity-70" onClick={() => toast({ title: 'GIFs', description: 'Selector de GIFs próximamente.' })} />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2">
                      <input 
                        type="text" 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Aa"
                        className="bg-transparent flex-1 text-sm outline-none"
                      />
                      <Smile className="w-5 h-5 text-accent cursor-pointer" />
                    </div>

                    <div className="text-accent">
                      {message.trim() ? (
                        <Send onClick={handleSend} className="w-6 h-6 cursor-pointer" />
                      ) : (
                        <ThumbsUp className="w-6 h-6 cursor-pointer" onClick={() => { setMessage('👍'); setTimeout(handleSend, 50); }} />
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
