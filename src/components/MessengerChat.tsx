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
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  if (location.pathname.startsWith('/admin')) return null;

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    const fetchChat = () => {
      const msgs = LocalDB.getMessages();
      const filtered = msgs.filter((m: any) => 
        m.type === 'chat' && (m.email === clientPhone || m.toEmail === clientPhone)
      );
      
      setChatHistory(filtered.map((m: any) => ({
        id: m.id,
        text: m.message,
        image: m.image,
        voice: m.voice,
        sender: m.email === clientPhone ? 'me' : 'them',
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
    const newMsg = { id: Date.now().toString(), text: message, sender: 'me', timestamp: 'Now' };
    setChatHistory([...chatHistory, newMsg]);
    LocalDB.saveMessage({ name: clientName, email: clientPhone, message: message, date: new Date().toLocaleTimeString(), status: 'new', type: 'chat' });
    setMessage('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setChatHistory([...chatHistory, { id: Date.now().toString(), image: base64, sender: 'me', timestamp: 'Ahora' }]);
      LocalDB.saveMessage({ name: clientName, email: clientPhone, message: '[Imagen]', image: base64, date: new Date().toLocaleTimeString(), status: 'new', type: 'chat' });
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          LocalDB.saveMessage({ name: clientName, email: clientPhone, message: '[Nota de voz]', voice: base64, date: new Date().toLocaleTimeString(), status: 'new', type: 'chat' });
        };
        reader.readAsDataURL(audioBlob);
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      toast({ title: 'Error', description: 'Micrófono no disponible.', variant: 'destructive' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      audioStream?.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    }
  };

  const startCall = () => {
    LocalDB.saveMessage({ name: clientName, email: clientPhone, message: '☎️ Llamada entrante...', type: 'call', status: 'new', date: new Date().toLocaleTimeString() });
    toast({ title: 'Llamando...', description: 'Conectando con el salón...' });
  };

  return (
    <>
      <motion.button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 w-16 h-16 bg-accent rounded-full shadow-lg flex items-center justify-center z-50">
        <Star className="w-8 h-8 text-white fill-white" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="fixed bottom-6 right-6 w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-[60] overflow-hidden border border-gray-100">
            <div className="bg-charcoal p-3 flex items-center justify-between text-white shadow-md">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsOpen(false)}><ChevronLeft className="w-6 h-6" /></button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><Star className="w-6 h-6 text-accent fill-accent" /></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-charcoal" />
                </div>
                <div><p className="font-bold text-sm">Alanís Salon</p><p className="text-[10px] opacity-80">Activo ahora</p></div>
              </div>
              <div className="flex items-center gap-3 pr-2">
                <Phone className="w-4 h-4 cursor-pointer" onClick={startCall} />
                <Info className="w-4 h-4 cursor-pointer" />
              </div>
            </div>

            {!isIdentified ? (
              <div className="flex-1 flex flex-col p-8 items-center justify-center bg-white">
                <h3 className="font-display text-2xl mb-2">¡Hola!</h3>
                <p className="text-sm text-muted-foreground mb-8 text-center">Identifícate para comenzar.</p>
                <div className="w-full space-y-4">
                  <input type="text" placeholder="Nombre" value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none" />
                  <input type="tel" placeholder="Teléfono" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none" />
                  <Button onClick={() => { if (clientName && clientPhone) setIsIdentified(true); }} className="w-full bg-accent text-white py-6 rounded-xl shadow-lg">Entrar</Button>
                </div>
              </div>
            ) : (
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-2xl text-sm ${msg.sender === 'me' ? 'bg-accent text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                        {msg.image ? (
                          <img src={msg.image} className="max-w-full rounded-lg" />
                        ) : msg.voice ? (
                          <div className="flex items-center gap-3 py-1 min-w-[180px]">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (typeof msg.voice !== 'string' || !msg.voice.startsWith('data:audio')) {
                                  toast({ title: 'Audio antiguo', description: 'Este mensaje no tiene sonido real. Graba uno nuevo para probar.' });
                                  return;
                                }
                                const audio = new Audio(msg.voice);
                                audio.play().catch(() => toast({ title: 'Error', description: 'Error al reproducir.' }));
                              }} 
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                msg.sender === 'me' ? 'bg-white/20 hover:bg-white/30' : 'bg-accent/10 hover:bg-accent/20 text-accent'
                              }`}
                            >
                              <div className={`w-0 h-0 border-t-[5px] border-t-transparent border-l-[9px] border-b-[5px] border-b-transparent ml-1 ${
                                msg.sender === 'me' ? 'border-l-white' : 'border-l-accent'
                              }`} />
                            </button>
                            <div className="flex-1">
                              <div className="flex gap-0.5 items-center mb-1">
                                {[...Array(12)].map((_, i) => (
                                  <div key={i} className={`w-1 h-3 rounded-full ${msg.sender === 'me' ? 'bg-white/40' : 'bg-accent/20'}`} />
                                ))}
                              </div>
                              <span className={`text-[10px] font-medium ${msg.sender === 'me' ? 'text-white/70' : 'text-accent'}`}>Nota de voz</span>
                            </div>
                          </div>
                        ) : (
                          msg.text
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t flex flex-col gap-3">
                  <div className="flex items-center gap-4 text-accent px-1">
                    <label className="cursor-pointer"><Camera className="w-5 h-5" /><input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} /></label>
                    <label className="cursor-pointer"><ImageIcon className="w-5 h-5" /><input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} /></label>
                    <Mic className={`w-5 h-5 cursor-pointer ${isRecording ? 'text-red-500 animate-pulse' : ''}`} onClick={() => isRecording ? stopRecording() : startRecording()} />
                    <Gift className="w-5 h-5 cursor-pointer" onClick={() => setShowGifPicker(!showGifPicker)} />
                  </div>
                  {isRecording && <div className="bg-red-50 p-3 rounded-xl flex justify-between items-center"><span className="text-xs text-red-600 font-medium">Grabando {recordingTime}s...</span><Button size="sm" variant="ghost" className="text-red-600" onClick={stopRecording}>Enviar</Button></div>}
                  {showGifPicker && <div className="grid grid-cols-3 gap-2 h-32 overflow-y-auto bg-gray-50 p-2 rounded-xl">{['https://media.giphy.com/media/l0HlIDZ4k6vG4C98c/giphy.gif','https://media.giphy.com/media/3o7TKVUn7iM8FMEU24/giphy.gif'].map((url, i) => <img key={i} src={url} className="h-20 w-full object-cover rounded-lg cursor-pointer" onClick={() => { LocalDB.saveMessage({ name: clientName, email: clientPhone, message: '[GIF]', image: url, date: new Date().toLocaleTimeString(), status: 'new', type: 'chat' }); setShowGifPicker(false); }} />)}</div>}
                  <div className="flex items-center gap-2">
                    <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Aa" className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none" />
                    {message.trim() ? <Send onClick={handleSend} className="w-6 h-6 text-accent cursor-pointer" /> : <ThumbsUp onClick={() => { setMessage('👍'); setTimeout(handleSend, 50); }} className="w-6 h-6 text-accent cursor-pointer" />}
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
