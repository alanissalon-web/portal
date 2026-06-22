import { useEffect, useState } from 'react';
import { LocalDB } from '@/services/LocalDatabase';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Mail, Phone } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const NotificationManager = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const initialize = async () => {
      // Initial load: mark all existing 'new' messages as notified so we don't spam on refresh
      const { data: initialMessages } = await LocalDB.getMessages();
      const initialIds = new Set<string>((initialMessages || []).filter((m: any) => m.status === 'new').map((m: any) => m.id as string));
      setNotifiedIds(initialIds);
    };
    initialize();

    const checkNewMessages = async () => {
      const { data: messages } = await LocalDB.getMessages();
      const newMessages = (messages || []).filter((m: any) => m.status === 'new' && !notifiedIds.has(m.id));

      if (newMessages.length > 0) {
        newMessages.forEach((msg: any) => {
          // Only show toast if we are NOT on the messages page
          if (!location.pathname.includes('/admin/messages')) {
            if (msg.type === 'call') {
              toast({
                title: `☎️ LLAMADA ENTRANTE: ${msg.name}`,
                description: `El cliente está solicitando una llamada directa.`,
                variant: "destructive",
                duration: 15000,
                action: (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        window.location.href = '/admin/messages';
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg animate-pulse"
                    >
                      CONTESTAR
                    </button>
                    <button 
                      className="bg-white/10 text-white px-3 py-1 rounded-lg text-xs font-medium"
                      onClick={async () => {
                        await LocalDB.deleteMessage(msg.id);
                        setNotifiedIds(prev => new Set(prev).add(msg.id));
                      }}
                    >
                      Rechazar
                    </button>
                  </div>
                ),
              });
            } else {
              toast({
                title: `Nuevo mensaje de ${msg.name}`,
                description: msg.message.substring(0, 50) + (msg.message.length > 50 ? '...' : ''),
                action: (
                  <button 
                    onClick={() => window.location.href = '/admin/messages'}
                    className="bg-accent text-white px-3 py-1 rounded-lg text-xs font-medium"
                  >
                    Ver Chat
                  </button>
                ),
              });
            }
          }
          
          setNotifiedIds(prev => new Set(prev).add(msg.id));
        });
      }
    };

    const interval = setInterval(checkNewMessages, 3000);
    return () => clearInterval(interval);
  }, [notifiedIds, location.pathname, toast]);

  return null;
};
