import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  X, Send, Camera, Image as ImageIcon, Mic, Phone,
  Info, ChevronLeft, Star, ThumbsUp, Smile, CheckCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocalDB } from '@/services/LocalDatabase';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo-alanis.png';

interface ChatMsg {
  id: string;
  text?: string;
  image?: string;
  voice?: string;
  sender: 'me' | 'them';
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

export function MessengerChat() {
  const location = useLocation();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [isIdentified, setIsIdentified] = useState(false);

  // Auth state
  const [loggedUser, setLoggedUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Identity form (for non-logged users)
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  // Chat
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMsg[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  // Check auth on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setLoggedUser(session.user);
        setClientName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '');
        setClientEmail(session.user.email || '');
      }
      setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setLoggedUser(session.user);
        setClientName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '');
        setClientEmail(session.user.email || '');
      } else {
        setLoggedUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Recording timer
  useEffect(() => {
    let interval: any;
    if (isRecording) interval = setInterval(() => setRecordingTime(p => p + 1), 1000);
    else setRecordingTime(0);
    return () => clearInterval(interval);
  }, [isRecording]);

  // Fetch chat history
  useEffect(() => {
    if (!isOpen || !isIdentified) return;
    const fetchChat = async () => {
      const { data: msgs } = await LocalDB.getMessages();
      const id = clientEmail || clientName;
      const filtered = (msgs || []).filter((m: any) =>
        m.type === 'chat' && (m.email === id || m.toEmail === id)
      );
      setChatHistory(filtered.map((m: any) => ({
        id: m.id,
        text: m.message,
        image: m.image,
        voice: m.voice,
        sender: m.email === id ? 'me' : 'them',
        timestamp: m.date || '',
        status: 'delivered',
      })));
    };
    fetchChat();
    const interval = setInterval(fetchChat, 4000);
    return () => clearInterval(interval);
  }, [isOpen, isIdentified, clientEmail, clientName]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatHistory]);

  // Auto-identify if logged in
  const handleOpen = () => {
    setIsOpen(true);
    if (loggedUser) setIsIdentified(true);
  };

  const handleIdentify = () => {
    if (!clientName.trim()) return;
    setIsIdentified(true);
    // Simulate salon greeting
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setChatHistory(prev => [...prev, {
          id: 'welcome',
          text: `Hello${clientName ? `, ${clientName}` : ''}! 👋 Welcome to Alanís Salon & Spa. How can we help you today?`,
          sender: 'them',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
        }]);
      }, 1800);
    }, 500);
  };

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    const newMsg: ChatMsg = {
      id: Date.now().toString(),
      text: message,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };
    setChatHistory(prev => [...prev, newMsg]);
    const txt = message;
    setMessage('');
    await LocalDB.saveMessage({
      name: clientName,
      email: clientEmail || clientName,
      message: txt,
      date: new Date().toLocaleTimeString(),
      status: 'new',
      type: 'chat',
    });
    // Simulate "delivered" status
    setTimeout(() => {
      setChatHistory(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m));
    }, 1000);
    // Simulate salon typing response (auto-reply)
    setTimeout(() => setIsTyping(true), 2000);
    setTimeout(() => {
      setIsTyping(false);
      setChatHistory(prev => [...prev, {
        id: `reply-${Date.now()}`,
        text: "Thank you for reaching out! ✨ A member of our team will get back to you shortly. You can also call us at (713) 524-2610.",
        sender: 'them',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
      }]);
    }, 4000);
    setSending(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const newMsg: ChatMsg = { id: Date.now().toString(), image: base64, sender: 'me', timestamp: 'Now', status: 'sent' };
      setChatHistory(prev => [...prev, newMsg]);
      await LocalDB.saveMessage({ name: clientName, email: clientEmail || clientName, message: '[Image]', image: base64, date: new Date().toLocaleTimeString(), status: 'new', type: 'chat' });
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
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          setChatHistory(prev => [...prev, { id: Date.now().toString(), voice: base64, sender: 'me', timestamp: 'Now', status: 'sent' }]);
          await LocalDB.saveMessage({ name: clientName, email: clientEmail || clientName, message: '[Voice Note]', voice: base64, date: new Date().toLocaleTimeString(), status: 'new', type: 'chat' });
        };
        reader.readAsDataURL(audioBlob);
      };
      recorder.start();
      setIsRecording(true);
    } catch {
      toast({ title: 'Error', description: 'Microphone not available.', variant: 'destructive' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      audioStream?.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    }
  };

  if (location.pathname.startsWith('/admin')) return null;

  const displayName = loggedUser
    ? (loggedUser.user_metadata?.full_name || loggedUser.email?.split('@')[0] || 'there')
    : clientName || 'there';

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpen}
            className="fixed bottom-6 right-6 w-14 h-14 bg-accent rounded-full shadow-2xl shadow-accent/30 flex items-center justify-center z-50 border-2 border-white"
            title="Chat with us"
          >
            <Star className="w-7 h-7 text-white fill-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed bottom-6 right-6 w-[380px] h-[620px] bg-white rounded-3xl shadow-2xl flex flex-col z-[60] overflow-hidden border border-gray-100/80"
          >
            {/* Header */}
            <div className="bg-charcoal px-4 py-3.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setIsOpen(false); setIsIdentified(false); }}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center overflow-hidden">
                    <Star className="w-5 h-5 text-accent fill-accent" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-charcoal" />
                </div>
                <div>
                  <p className="font-bold text-sm leading-none">Alanís Salon & Spa</p>
                  <p className="text-[10px] text-white/50 mt-0.5">Typically replies instantly</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href="tel:17135242610">
                  <button className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
                    <Phone className="w-4 h-4" />
                  </button>
                </a>
                <button className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
                  <Info className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Identity / Welcome Screen */}
            {!isIdentified ? (
              <div className="flex-1 flex flex-col bg-[#F5F5F0]">
                {/* Salon info card */}
                <div className="bg-white mx-4 mt-6 rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-charcoal flex items-center justify-center mx-auto mb-3">
                    <Star className="w-8 h-8 text-accent fill-accent" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground">Alanís Salon & Spa</h3>
                  <p className="font-body text-xs text-muted-foreground mt-1">Houston's Premier Hair Salon</p>
                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="font-body text-[11px] text-green-600 font-medium">Available now</span>
                  </div>
                </div>

                {/* Personalized greeting if logged in */}
                {loggedUser ? (
                  <div className="mx-4 mt-4 bg-accent/5 border border-accent/15 rounded-2xl p-4">
                    <p className="font-display text-sm font-semibold text-foreground mb-0.5">
                      Hello, {displayName}! 👋
                    </p>
                    <p className="font-body text-xs text-muted-foreground leading-relaxed">
                      You're signed in as <span className="font-medium text-foreground">{loggedUser.email}</span>.<br />
                      Would you like to send a message to Alanís Salon?
                    </p>
                    <Button
                      onClick={handleIdentify}
                      className="w-full mt-4 bg-accent hover:bg-accent/90 text-white rounded-xl h-11 font-bold text-sm"
                    >
                      Start Conversation
                    </Button>
                  </div>
                ) : (
                  <div className="mx-4 mt-4 space-y-3">
                    <p className="font-body text-sm text-center text-muted-foreground">
                      Introduce yourself to get started
                    </p>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleIdentify()}
                      className="w-full bg-white border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 shadow-sm"
                    />
                    <input
                      type="email"
                      placeholder="Your email"
                      value={clientEmail}
                      onChange={e => setClientEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleIdentify()}
                      className="w-full bg-white border border-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 shadow-sm"
                    />
                    <Button
                      onClick={handleIdentify}
                      disabled={!clientName.trim()}
                      className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white rounded-xl h-12 font-bold text-sm"
                    >
                      Start Conversation →
                    </Button>
                  </div>
                )}

                <div className="mt-auto pb-4 text-center">
                  <p className="font-body text-[10px] text-muted-foreground/60">
                    🔒 Your messages are private and secure
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Messages area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F5F5F0]">

                  {/* Salon info pill at top */}
                  <div className="flex justify-center mb-2">
                    <span className="bg-black/5 text-muted-foreground font-body text-[10px] px-3 py-1 rounded-full">
                      Chat with Alanís Salon & Spa
                    </span>
                  </div>

                  {chatHistory.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                      {/* Salon avatar */}
                      {msg.sender === 'them' && (
                        <div className="w-7 h-7 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0 mb-0.5">
                          <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                        </div>
                      )}
                      <div className={`max-w-[75%] space-y-0.5`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.sender === 'me'
                            ? 'bg-accent text-white rounded-br-md'
                            : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
                        }`}>
                          {msg.image ? (
                            <img src={msg.image} className="max-w-full rounded-lg" alt="shared" />
                          ) : msg.voice ? (
                            <div className="flex items-center gap-2">
                              <Mic className="w-4 h-4 opacity-70" />
                              <span className="text-xs opacity-80">Voice message</span>
                            </div>
                          ) : (
                            <span>{msg.text}</span>
                          )}
                        </div>
                        <div className={`flex items-center gap-1 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[9px] text-muted-foreground/60">{msg.timestamp}</span>
                          {msg.sender === 'me' && (
                            <CheckCheck className={`w-3 h-3 ${msg.status === 'read' ? 'text-blue-500' : 'text-muted-foreground/40'}`} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex items-end gap-2">
                      <div className="w-7 h-7 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0">
                        <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                      </div>
                      <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                        <div className="flex gap-1 items-center h-4">
                          {[0, 0.2, 0.4].map(delay => (
                            <motion.div
                              key={delay}
                              animate={{ y: [0, -4, 0] }}
                              transition={{ repeat: Infinity, duration: 0.8, delay }}
                              className="w-1.5 h-1.5 rounded-full bg-gray-400"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input area */}
                <div className="bg-white border-t border-gray-100 p-3 space-y-2">
                  {isRecording && (
                    <div className="bg-red-50 rounded-xl px-4 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs text-red-600 font-medium">Recording... {recordingTime}s</span>
                      </div>
                      <button onClick={stopRecording} className="text-xs text-red-600 font-bold bg-red-100 px-3 py-1 rounded-lg">
                        Stop & Send
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {/* Media buttons */}
                    <div className="flex gap-1">
                      <label className="w-9 h-9 rounded-full flex items-center justify-center text-accent hover:bg-accent/5 transition-colors cursor-pointer">
                        <Camera className="w-5 h-5" />
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                      </label>
                      <label className="w-9 h-9 rounded-full flex items-center justify-center text-accent hover:bg-accent/5 transition-colors cursor-pointer">
                        <ImageIcon className="w-5 h-5" />
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                      <button
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isRecording ? 'text-red-500 bg-red-50' : 'text-accent hover:bg-accent/5'}`}
                        onClick={() => isRecording ? stopRecording() : startRecording()}
                      >
                        <Mic className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Text input */}
                    <div className="flex-1 bg-gray-100 rounded-full flex items-center px-4 gap-2">
                      <input
                        type="text"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="Aa"
                        className="flex-1 bg-transparent py-2.5 text-sm outline-none text-foreground placeholder:text-muted-foreground/70 min-w-0"
                      />
                      <Smile className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                    </div>

                    {/* Send / Like */}
                    <button
                      onClick={message.trim() ? handleSend : () => { setMessage('👍'); setTimeout(handleSend, 50); }}
                      disabled={sending}
                      className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white hover:bg-accent/90 transition-colors flex-shrink-0 shadow-sm"
                    >
                      {message.trim() ? <Send className="w-4 h-4" /> : <ThumbsUp className="w-4 h-4" />}
                    </button>
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
