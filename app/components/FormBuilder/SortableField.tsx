'use client';

import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, EyeOff, GripVertical, Settings } from 'lucide-react';
import * as Icons from 'lucide-react';
import { FormField } from '@/app/types/form';

interface SortableFieldProps {
  field: FormField;
  onToggleVisibility: (id: string) => void;
  onOpenSettings: (id: string) => void;
  isSelected: boolean;
}

export default function SortableField({ field, onToggleVisibility, onOpenSettings, isSelected }: SortableFieldProps) {
  const [mounted, setMounted] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  useEffect(() => {
    setMounted(true);
  }, []);

  const style = mounted ? {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : (transition || 'transform 200ms cubic-bezier(0.2, 0, 0.2, 1)'),
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 50 : 1,
    marginBottom: '5px',
  } : {
    position: 'relative' as const,
  };

  const IconComponent = (Icons as any)[field.icon] || Icons.Circle;

  return (
    <div
      ref={mounted ? setNodeRef : undefined}
      style={style}
      data-sortable-item
      data-dragging={mounted ? isDragging : false}
    >
      <s-box
        padding="small"
        background="base"
        border="base"
        borderRadius="base"
      >
        <s-stack direction="inline" justifyContent='space-between' gap="base" alignItems="center">
          <s-stack direction="inline" gap="base" alignItems="center"
            {...(mounted ? attributes : {})}
            {...(mounted ? listeners : {})}
          >
            <GripVertical size={20} />
            {IconComponent && field.icon !== 'none' && (
              <IconComponent size={18} style={{ opacity: 0.7, fontWeight: 'bold' }} strokeWidth={2.5} />
            )}
            <span style={{ fontWeight: 'bold' }}>{field.label}</span>
          </s-stack>

          <s-stack direction="inline" gap="none" alignItems="center">
            <s-button
              variant="tertiary"
              onClick={() => onOpenSettings(field.id)}
              aria-label="Field settings"
            >
              <Settings size={18} />
            </s-button>
            <s-button
              variant="tertiary"
              onClick={() => onToggleVisibility(field.id)}
              aria-label={field.visible ? 'Hide field' : 'Show field'}
            >
              {field.visible ? (
                <Eye size={20} />
              ) : (
                <EyeOff size={20} />
              )}
            </s-button>
          </s-stack>
        </s-stack>
      </s-box>
    </div>
  );
}

