import React, { useState, useEffect } from 'react';
import { useCMS } from '@/contexts/CMSContext';
import { cn } from '@/lib/utils';

interface EditableTextProps {
  section: string;
  field: string;
  defaultText: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const EditableText: React.FC<EditableTextProps> = ({ 
  section, 
  field, 
  defaultText, 
  className, 
  as: Component = 'div' 
}) => {
  const { content, updateContent, isEditing } = useCMS();
  const text = content[section]?.[field] || defaultText;

  const handleChange = (e: React.FocusEvent<any>) => {
    const newValue = e.currentTarget.innerText;
    updateContent(section, field, newValue);
  };

  if (!isEditing) {
    return <Component className={className}>{text}</Component>;
  }

  return (
    <Component
      contentEditable
      suppressContentEditableWarning
      onBlur={handleChange}
      className={cn(
        className,
        'outline-none focus:ring-2 focus:ring-accent/50 rounded-sm transition-all',
        'hover:bg-accent/5 cursor-text'
      )}
    >
      {text}
    </Component>
  );
};
