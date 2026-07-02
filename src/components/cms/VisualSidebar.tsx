import React, { useState } from 'react';
import { useCMS } from '@/contexts/CMSContext';
import { motion } from 'framer-motion';
import { GripVertical, Trash2, Plus, ArrowUp, ArrowDown, Layout, Link2 } from 'lucide-react';
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

  if (!isEditing) return null;
  
  // Navigation Default
  const navLinks = content['navigation']?.links || [
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Extensions', href: '/extensions' },
    { label: 'Hair Loss', href: '/hair-loss' },
    { label: 'Academy', href: '/academy' },
    { label: 'Blog', href: '/blog' },
    { label: 'Shop', href: '/shop' },
    { label: 'Contact', href: '/contact' },
  ];

  const updateLinks = (newLinks: any[]) => {
    updateContent('navigation', 'links', newLinks);
  };

  const handleEditLink = (index: number, field: 'label' | 'href', value: string) => {
    const updated = [...navLinks];
    updated[index] = { ...updated[index], [field]: value };
    updateLinks(updated);
  };

  const handleMoveLink = (index: number, direction: 'up' | 'down') => {
    const updated = [...navLinks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    updateLinks(updated);
  };

  const handleDeleteLink = (index: number) => {
    const updated = navLinks.filter((_, i) => i !== index);
    updateLinks(updated);
  };

  const handleAddLink = () => {
    const updated = [...navLinks, { label: 'New Link', href: '#' }];
    updateLinks(updated);
  };

  const handleAddSubmenu = (linkIndex: number) => {
    const updated = [...navLinks];
    const link = updated[linkIndex];
    const submenu = link.submenu ? [...link.submenu] : [];
    submenu.push({ label: 'New Submenu', href: '#' });
    updated[linkIndex] = { ...link, submenu };
    updateLinks(updated);
  };

  const handleEditSubmenu = (linkIndex: number, subIndex: number, field: 'label' | 'href', value: string) => {
    const updated = [...navLinks];
    const link = updated[linkIndex];
    const submenu = [...link.submenu];
    submenu[subIndex] = { ...submenu[subIndex], [field]: value };
    updated[linkIndex] = { ...link, submenu };
    updateLinks(updated);
  };

  const handleDeleteSubmenu = (linkIndex: number, subIndex: number) => {
    const updated = [...navLinks];
    const link = updated[linkIndex];
    const submenu = link.submenu.filter((_: any, i: number) => i !== subIndex);
    updated[linkIndex] = { ...link, submenu };
    updateLinks(updated);
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
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h3 className="font-display text-lg font-medium flex items-center gap-2">
          <Layout className="w-4 h-4 text-accent" />
          Alanis Builder
        </h3>
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
              <Button size="sm" variant="outline" onClick={handleAddLink} className="h-8 rounded-lg text-xs gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Link
              </Button>
            </div>
            
            <div className="space-y-4">
              {navLinks.map((link: any, index: number) => (
                <div key={index} className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-sm hover:border-accent/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-3 py-1">
                        <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
                        <input 
                          type="text" 
                          value={link.label} 
                          onChange={(e) => handleEditLink(index, 'label', e.target.value)}
                          placeholder="Link Name"
                          className="w-full bg-transparent border-0 p-0 text-xs font-semibold outline-none focus:ring-0"
                        />
                      </div>
                      <input 
                        type="text" 
                        value={link.href} 
                        onChange={(e) => handleEditLink(index, 'href', e.target.value)}
                        placeholder="Path (e.g. /about)"
                        className="w-full bg-background border border-border rounded-xl px-3 py-1 text-[10px] outline-none focus:border-accent text-muted-foreground"
                      />
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => handleMoveLink(index, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => handleMoveLink(index, 'down')}
                          disabled={index === navLinks.length - 1}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive hover:bg-destructive/10 self-end"
                        onClick={() => handleDeleteLink(index)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="pl-4 border-l-2 border-accent/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Submenus</span>
                      <button 
                        onClick={() => handleAddSubmenu(index)}
                        className="text-[9px] text-accent hover:underline flex items-center gap-0.5 font-bold"
                      >
                        <Plus className="w-2.5 h-2.5" /> Add Submenu
                      </button>
                    </div>
                    
                    {link.submenu && link.submenu.map((sub: any, subIndex: number) => (
                      <div key={subIndex} className="flex items-center gap-2 bg-background p-2 border border-border rounded-xl">
                        <div className="flex-1 space-y-1 min-w-0">
                          <input 
                            type="text" 
                            value={sub.label} 
                            onChange={(e) => handleEditSubmenu(index, subIndex, 'label', e.target.value)}
                            placeholder="Submenu Label"
                            className="w-full bg-transparent border-0 p-0 text-[10px] font-semibold outline-none focus:ring-0 truncate"
                          />
                          <input 
                            type="text" 
                            value={sub.href} 
                            onChange={(e) => handleEditSubmenu(index, subIndex, 'href', e.target.value)}
                            placeholder="Subpath"
                            className="w-full bg-transparent border-0 p-0 text-[8px] text-muted-foreground outline-none focus:ring-0 truncate"
                          />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 text-destructive hover:bg-destructive/10 flex-shrink-0"
                          onClick={() => handleDeleteSubmenu(index, subIndex)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="p-4 border-t border-border bg-accent/5">
        <p className="text-[10px] text-muted-foreground text-center">
          Click "Save Changes" on the main sidebar to apply.
        </p>
      </div>
    </motion.div>
  );
};
