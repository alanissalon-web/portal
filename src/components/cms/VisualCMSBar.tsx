import React from 'react';
import { useCMS } from '@/contexts/CMSContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Edit3, Save, X, Eye, Layout, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

import { useLocation, useNavigate } from 'react-router-dom';

export const VisualCMSBar: React.FC = () => {
  const { isEditing, setIsEditing, saveChanges } = useCMS();
  const { isAdmin } = useAdminAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAdmin) return null;

  const isPublicPage = !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/portal');
  if (!isPublicPage) return null;

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    await saveChanges();
  };

  return (
    <div className="fixed bottom-10 left-0 right-0 z-[100] pointer-events-none flex justify-center">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-background/90 backdrop-blur-2xl border border-border/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-full px-5 py-2.5 flex items-center gap-2 pointer-events-auto"
      >
        <div className="flex items-center gap-2 pr-4 border-r border-border mr-2">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <Layout className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-sm font-medium">Alanis CMS</span>
        </div>

        {!isEditing ? (
          <>
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full gap-2"
              onClick={handleStartEditing}
            >
              <Edit3 className="w-4 h-4" />
              Edit Site
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full gap-2"
              onClick={() => navigate('/admin')}
            >
              <Settings className="w-4 h-4" />
              Configure
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="default" 
              size="sm" 
              className="rounded-full gap-2 bg-accent hover:bg-accent/90"
              onClick={handleSave}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full gap-2"
              onClick={() => setIsEditing(false)}
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <div className="ml-4 flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
              <Eye className="w-3 h-3" />
              Edit Mode Active
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
