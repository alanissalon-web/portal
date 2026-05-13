import { useEffect, useState } from 'react';
import { LocalDB } from '@/services/LocalDatabase';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Mail } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const NotificationManager = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Initial load: mark all existing 'new' messages as notified so we don't spam on refresh
    const initialMessages = LocalDB.getMessages();
    const initialIds = new Set(initialMessages.filter((m: any) => m.status === 'new').map((m: any) => m.id));
    setNotifiedIds(initialIds);

    const checkNewMessages = () => {
      const messages = LocalDB.getMessages();
      const newMessages = messages.filter((m: any) => m.status === 'new' && !notifiedIds.has(m.id));

      if (newMessages.length > 0) {
        newMessages.forEach((msg: any) => {
          // Only show toast if we are NOT on the messages page
          if (!location.pathname.includes('/admin/messages')) {
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
          
          setNotifiedIds(prev => new Set(prev).add(msg.id));
        });
      }
    };

    const interval = setInterval(checkNewMessages, 5000);
    return () => clearInterval(interval);
  }, [notifiedIds, location.pathname, toast]);

  return null;
};
