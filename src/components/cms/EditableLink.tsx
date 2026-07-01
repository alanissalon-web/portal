import React from 'react';
import { useCMS } from '@/contexts/CMSContext';

interface EditableLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  section: string;
  field: string;
  defaultHref: string;
}

export const EditableLink: React.FC<EditableLinkProps> = ({
  section,
  field,
  defaultHref,
  children,
  onClick,
  ...props
}) => {
  const { content, updateContent, isEditing } = useCMS();
  const href = content[section]?.[field] !== undefined ? content[section]?.[field] : defaultHref;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isEditing) {
      e.preventDefault();
      const newHref = window.prompt(`Edit URL for ${section} -> ${field}:`, href);
      if (newHref !== null) {
        updateContent(section, field, newHref.trim());
      }
    } else if (onClick) {
      onClick(e);
    }
  };

  return (
    <a 
      {...props} 
      href={isEditing ? undefined : (href || '#')} 
      onClick={handleClick}
      className={`${props.className || ''} ${isEditing ? 'cursor-pointer hover:ring-2 hover:ring-accent/50 rounded-sm' : ''}`}
      title={isEditing ? `Click to edit link: ${href}` : props.title}
    >
      {children}
    </a>
  );
};
