import { useEffect, useRef } from 'react';
import { LocalDB } from '@/services/LocalDatabase';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Mail, Phone } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const NotificationManager = () => {
  const { toast } = useToast();
  const location = useLocation();
  const notifiedIds = useRef<Set<string>>(new Set());
  const hasInitialized = useRef(false);

  useEffect(() => {
    const initialize = async () => {
      if (hasInitialized.current) return;
      hasInitialized.current = true;
      // Initial load: mark all existing 'new' messages as notified so we don't spam on refresh
      const { data: initialMessages } = await LocalDB.getMessages();
      const initialIds = new Set<string>((initialMessages || []).filter((m: any) => m.status === 'new').map((m: any) => m.id as string));
      notifiedIds.current = initialIds;
    };
    initialize();

    const checkNewMessages = async () => {
      const { data: messages } = await LocalDB.getMessages();
      const newMessages = (messages || []).filter((m: any) => m.status === 'new' && !notifiedIds.current.has(m.id));

      if (newMessages.length > 0) {
        newMessages.forEach((msg: any) => {
          // Only show toast if we are NOT on the messages page
          if (!location.pathname.includes('/admin/messages')) {
            if (msg.type === 'call') {
              toast({
                title: `☎️ INCOMING CALL: ${msg.name}`,
                description: `The client is requesting a direct call.`,
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
                      ANSWER
                    </button>
                    <button 
                      className="bg-white/10 text-white px-3 py-1 rounded-lg text-xs font-medium"
                      onClick={async () => {
                        await LocalDB.deleteMessage(msg.id);
                        notifiedIds.current.add(msg.id);
                      }}
                    >
                      Decline
                    </button>
                  </div>
                ),
              });
            } else {
              toast({
                title: `New message from ${msg.name}`,
                description: msg.message.substring(0, 50) + (msg.message.length > 50 ? '...' : ''),
                action: (
                  <button 
                    onClick={() => window.location.href = '/admin/messages'}
                    className="bg-accent text-white px-3 py-1 rounded-lg text-xs font-medium"
                  >
                    View Chat
                  </button>
                ),
              });
            }
          }
          
          notifiedIds.current.add(msg.id);
        });
      }
    };

    const interval = setInterval(checkNewMessages, 3000);
    return () => clearInterval(interval);
  }, [location.pathname, toast]);

  return null;
};
