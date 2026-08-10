import React, { useState, useEffect } from 'react';
import { useCMS } from '@/contexts/CMSContext';
import { motion } from 'framer-motion';
import { 
  GripVertical, 
  Trash2, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Layout, 
  Link2,
  ChevronLeft,
  ChevronRight,
  CornerDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';

interface Section {
  id: string;
  name: string;
}

export const VisualSidebar: React.FC = () => {
  const { isEditing, content, updateContent } = useCMS();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'layout' | 'navigation'>('layout');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Flat menu items representation for Drag & Drop
  const [flatLinks, setFlatLinks] = useState<any[]>([]);
  const [hasInitializedMenu, setHasInitializedMenu] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragCurrentX, setDragCurrentX] = useState<number>(0);

  // Sync flatLinks from CMS context initially on tab switch
  useEffect(() => {
    if (activeTab === 'navigation' && !hasInitializedMenu) {
      const rawLinks = content['navigation']?.links || [
        { label: 'About', href: '/about' },
        { label: 'Services', href: '/services' },
        { label: 'Extensions', href: '/extensions' },
        { label: 'Hair Loss', href: '/hair-loss' },
        { label: 'Academy', href: '/academy' },
        { label: 'Blog', href: '/blog' },
        { label: 'Shop', href: '/shop' },
        { label: 'Contact', href: '/contact' },
      ];
      
      const flat: any[] = [];
      rawLinks.forEach((link: any, pIdx: number) => {
        flat.push({
          id: `item-${pIdx}-${Date.now()}`,
          label: link.label,
          href: link.href,
          isSubmenu: false
        });
        if (link.submenu) {
          link.submenu.forEach((sub: any, sIdx: number) => {
            flat.push({
              id: `item-${pIdx}-${sIdx}-${Date.now()}`,
              label: sub.label,
              href: sub.href,
              isSubmenu: true
            });
          });
        }
      });
      setFlatLinks(flat);
      setHasInitializedMenu(true);
    } else if (activeTab !== 'navigation') {
      setHasInitializedMenu(false);
    }
  }, [activeTab, content['navigation']?.links, hasInitializedMenu]);

  if (!isEditing) return null;

  if (isCollapsed) {
    return (
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={() => setIsCollapsed(false)}
        className="fixed left-0 top-24 z-50 bg-background/95 backdrop-blur-xl border border-l-0 border-border px-3.5 py-2.5 rounded-r-2xl shadow-xl flex items-center gap-2.5 text-accent hover:bg-accent/10 transition-all font-display text-xs font-bold group"
        title="Expand Alanis Builder"
      >
        <div className="w-7 h-7 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
          <Layout className="w-3.5 h-3.5" />
        </div>
        <span className="font-display font-medium text-foreground">Alanis Builder</span>
        <ChevronRight className="w-4 h-4 text-accent" />
      </motion.button>
    );
  }

  // Convert flat representation back to nested structure and save to CMS Context
  const saveFlatLinks = (flat: any[]) => {
    setFlatLinks(flat);
    const nested: any[] = [];
    flat.forEach((item) => {
      if (!item.isSubmenu) {
        nested.push({
          label: item.label,
          href: item.href,
          submenu: []
        });
      } else {
        if (nested.length === 0) {
          // If first item is set to submenu, force it to be parent
          nested.push({
            label: item.label,
            href: item.href,
            submenu: []
          });
        } else {
          nested[nested.length - 1].submenu = nested[nested.length - 1].submenu || [];
          nested[nested.length - 1].submenu.push({
            label: item.label,
            href: item.href
          });
        }
      }
    });

    // Clean up empty submenus
    const cleaned = nested.map(n => {
      const copy = { ...n };
      if (!copy.submenu || copy.submenu.length === 0) {
        delete copy.submenu;
      }
      return copy;
    });

    updateContent('navigation', 'links', cleaned);
  };

  const handleEditFlatLink = (index: number, field: 'label' | 'href', value: string) => {
    const updated = [...flatLinks];
    updated[index] = { ...updated[index], [field]: value };
    saveFlatLinks(updated);
  };

  const handleDeleteFlatLink = (index: number) => {
    const updated = flatLinks.filter((_, i) => i !== index);
    saveFlatLinks(updated);
  };

  const handleAddFlatLink = () => {
    const updated = [
      ...flatLinks,
      {
        id: `item-new-${Date.now()}`,
        label: 'New Link',
        href: '#',
        isSubmenu: false
      }
    ];
    saveFlatLinks(updated);
  };

  const handleToggleLevel = (index: number, forceSubmenu?: boolean) => {
    if (index === 0) return; // First item must always be a parent link
    const updated = [...flatLinks];
    const item = updated[index];
    item.isSubmenu = forceSubmenu !== undefined ? forceSubmenu : !item.isSubmenu;
    saveFlatLinks(updated);
  };

  const handleMoveFlatLink = (index: number, direction: 'up' | 'down') => {
    const updated = [...flatLinks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    
    // Swap items
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    
    // First item must always be parent
    if (updated[0].isSubmenu) {
      updated[0].isSubmenu = false;
    }
    
    saveFlatLinks(updated);
  };

  // Drag & Drop Handlers for flat links list
  const handleLinkDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    setDragStartX(e.clientX);
    setDragCurrentX(e.clientX);
    
    // Create an empty transparent drag image to prevent native ghost card behavior which is ugly in sidebars
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleLinkDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    setDragCurrentX(e.clientX);

    if (draggedIndex !== targetIndex) {
      const updated = [...flatLinks];
      const [moved] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, moved);
      
      // Prevent first item from being submenu
      if (updated[0].isSubmenu) {
        updated[0].isSubmenu = false;
      }

      setFlatLinks(updated);
      setDraggedIndex(targetIndex);
    }
  };

  const handleLinkDragEnd = () => {
    if (draggedIndex === null) return;
    
    const deltaX = dragCurrentX - dragStartX;
    const updated = [...flatLinks];
    
    if (deltaX > 25 && draggedIndex > 0) {
      updated[draggedIndex].isSubmenu = true;
    } else if (deltaX < -25) {
      updated[draggedIndex].isSubmenu = false;
    }
    
    saveFlatLinks(updated);
    setDraggedIndex(null);
  };

  // Layout Section logic
  const defaultSections: Section[] = [
    { id: 'hero', name: 'Hero Section' },
    { id: 'booking', name: 'Booking Wizard' },
    { id: 'about', name: 'About Section' },
    { id: 'services', name: 'Services Section' },
    { id: 'transformations', name: 'Transformations' },
    { id: 'experience', name: 'Experience' },
    { id: 'cta', name: 'Final CTA' },
  ];

  const currentSections = content['page_layout']?.sections || defaultSections;

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...currentSections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newSections.length) return;
    
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    updateContent('page_layout', 'sections', newSections);
  };

  const availableBlocks = [
    { id: 'hero', name: 'Hero Section' },
    { id: 'booking', name: 'Booking Wizard' },
    { id: 'about', name: 'About Section' },
    { id: 'services', name: 'Services Section' },
    { id: 'transformations', name: 'Transformations' },
    { id: 'experience', name: 'Experience' },
    { id: 'cta', name: 'Final CTA' },
    { id: 'pricing', name: 'Pricing Section' },
    { id: 'extensions', name: 'Extensions' },
    { id: 'hairloss', name: 'Hair Loss' },
  ];

  const addSection = (block: any) => {
    const newSections = [...currentSections, { ...block, id: `${block.id}-${Date.now()}` }];
    updateContent('page_layout', 'sections', newSections);
  };

  const removeSection = (index: number) => {
    const newSections = currentSections.filter((_: any, i: number) => i !== index);
    updateContent('page_layout', 'sections', newSections);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('index', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('index'));
    if (sourceIndex === targetIndex) return;

    const newSections = [...currentSections];
    const [moved] = newSections.splice(sourceIndex, 1);
    newSections.splice(targetIndex, 0, moved);
    updateContent('page_layout', 'sections', newSections);
  };

  return (
    <motion.div 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      className="fixed left-0 top-20 bottom-0 w-80 bg-background/95 backdrop-blur-xl border-r border-border z-50 shadow-2xl overflow-hidden flex flex-col"
    >
      <div className="p-5 border-b border-border flex items-center justify-between">
        <h3 className="font-display text-lg font-medium flex items-center gap-2">
          <Layout className="w-4 h-4 text-accent" />
          Alanis Builder
        </h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(true)} 
          className="h-8 w-8 rounded-xl hover:bg-accent/10 text-muted-foreground hover:text-accent transition-colors"
          title="Collapse Panel"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex border-b border-border bg-[#FAFAFA]">
        <button 
          onClick={() => setActiveTab('layout')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'layout' ? 'border-b-2 border-accent text-accent' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Layout
        </button>
        <button 
          onClick={() => setActiveTab('navigation')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'navigation' ? 'border-b-2 border-accent text-accent' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Menu
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {activeTab === 'layout' ? (
          <>
            {location.pathname === '/' ? (
              <section>
                <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-4 px-2">Page Structure</h4>
                <div className="space-y-2">
                  {currentSections.map((section: Section, index: number) => (
                    <div 
                      key={section.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className="group bg-card border border-border p-3 rounded-xl flex items-center justify-between hover:border-accent/50 transition-all shadow-sm cursor-move active:scale-95"
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-medium truncate max-w-[120px]">{section.name}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={() => moveSection(index, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={() => moveSection(index, 'down')}
                          disabled={index === currentSections.length - 1}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          onClick={() => removeSection(index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <p className="text-sm text-muted-foreground text-center p-4">Go to home page to customize sections.</p>
            )}

            {location.pathname === '/' && (
              <section>
                <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-4 px-2">Block Library</h4>
                <div className="grid grid-cols-2 gap-2">
                  {availableBlocks.map(block => (
                    <button
                      key={block.id}
                      onClick={() => addSection(block)}
                      className="flex flex-col items-center justify-center p-4 bg-background border border-border rounded-xl hover:border-accent hover:bg-accent/5 transition-all gap-2 text-center"
                    >
                      <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Plus className="w-4 h-4 text-accent" />
                      </div>
                      <span className="text-[10px] font-medium leading-tight">{block.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <section className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-2">Navigation Links</h4>
              <Button size="sm" variant="outline" onClick={handleAddFlatLink} className="h-8 rounded-lg text-xs gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Link
              </Button>
            </div>
            
            <div className="space-y-2">
              {flatLinks.map((link: any, index: number) => {
                const isFirst = index === 0;
                
                return (
                  <div 
                    key={link.id} 
                    draggable
                    onDragStart={(e) => handleLinkDragStart(e, index)}
                    onDragOver={(e) => handleLinkDragOver(e, index)}
                    onDragEnd={handleLinkDragEnd}
                    className={`bg-card border rounded-2xl p-3 shadow-sm hover:border-accent/40 transition-all select-none ${
                      link.isSubmenu ? 'ml-6 border-l-4 border-l-accent' : 'border-border'
                    } ${draggedIndex === index ? 'opacity-40 scale-95 border-dashed border-accent' : ''}`}
                    style={{
                      transform: draggedIndex === index ? `translateX(${dragCurrentX - dragStartX}px)` : undefined,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="cursor-grab active:cursor-grabbing text-muted-foreground p-1 hover:text-foreground">
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {link.isSubmenu && (
                        <CornerDownRight className="w-3.5 h-3.5 text-accent/60 flex-shrink-0" />
                      )}

                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-2.5 py-1">
                          <Link2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          <input 
                            type="text" 
                            value={link.label} 
                            onChange={(e) => handleEditFlatLink(index, 'label', e.target.value)}
                            placeholder="Label"
                            className="w-full bg-transparent border-0 p-0 text-[11px] font-semibold outline-none focus:ring-0"
                          />
                        </div>
                        <input 
                          type="text" 
                          value={link.href} 
                          onChange={(e) => handleEditFlatLink(index, 'href', e.target.value)}
                          placeholder="Path (/services)"
                          className="w-full bg-background border border-border rounded-xl px-2.5 py-0.5 text-[9px] outline-none focus:border-accent text-muted-foreground"
                        />
                      </div>

                      <div className="flex flex-col gap-1 items-end flex-shrink-0">
                        <div className="flex gap-0.5">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5" 
                            onClick={() => handleToggleLevel(index, false)}
                            disabled={isFirst || !link.isSubmenu}
                            title="Outdent to Parent"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5" 
                            onClick={() => handleToggleLevel(index, true)}
                            disabled={isFirst || link.isSubmenu}
                            title="Indent to Submenu"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        <div className="flex gap-0.5">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5" 
                            onClick={() => handleMoveFlatLink(index, 'up')}
                            disabled={isFirst}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5" 
                            onClick={() => handleMoveFlatLink(index, 'down')}
                            disabled={index === flatLinks.length - 1}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteFlatLink(index)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <div className="p-4 border-t border-border bg-accent/5">
        <p className="text-[10px] text-muted-foreground text-center font-medium">
          Drag up/down to reorder, drag left/right to indent/outdent. Or use ◀ and ▶.
        </p>
      </div>
    </motion.div>
  );
};
