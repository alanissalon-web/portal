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

  const handleStartEditing = () => {
    setIsEditing(true);
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleSave = async () => {
    await saveChanges();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none flex justify-center pt-4">
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-background/80 backdrop-blur-xl border border-border shadow-2xl rounded-full px-4 py-2 flex items-center gap-2 pointer-events-auto"
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
              Editar Sitio
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full gap-2"
              onClick={() => navigate('/admin')}
            >
              <Settings className="w-4 h-4" />
              Configurar
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
              Guardar Cambios
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full gap-2"
              onClick={() => setIsEditing(false)}
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <div className="ml-4 flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
              <Eye className="w-3 h-3" />
              Modo Edición Activo
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
