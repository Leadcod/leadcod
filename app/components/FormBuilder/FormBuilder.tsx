'use client';

import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, EyeOff, GripVertical, Settings, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import { FormField, DEFAULT_FORM_FIELDS } from '@/app/types/form';
import { saveForm } from '@/app/actions/form';
import { useAppBridge } from '@shopify/app-bridge-react';

// Popular Lucide icons for selection
const AVAILABLE_ICONS = [
  'User', 'Phone', 'Mail', 'MapPin', 'Building', 'Home', 'Map',
  'Package', 'ShoppingCart', 'ShoppingBag', 'Tag', 'Ticket',
  'Hash', 'FileText', 'Calendar', 'Clock', 'CreditCard',
  'DollarSign', 'Heart', 'Star', 'Bookmark', 'MessageSquare',
  'Send', 'Globe', 'Link', 'Image', 'File', 'Folder',
  'Search', 'Filter', 'Check', 'X', 'Plus', 'Minus'
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
}

function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const shopify = useAppBridge()

  return (
    <div>
      <s-text >
        {label}
      </s-text>
      <div style={{ marginTop: '4px', position: 'relative' }}>
        <div
          onClick={() => setShowPicker(!showPicker)}
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: value,
            border: '1px solid #e5e5e5',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        />
        {showPicker && (
          <div style={{ 
            position: 'absolute', 
            zIndex: 100,
            marginTop: '8px'
          }}>
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
              }}
              onClick={() => setShowPicker(false)}
            />
            <div style={{ position: 'relative' }}>
              <s-color-picker 
                value={value} 
                alpha 
                onChange={(e: any) => {
                  onChange(e.target.value || e.detail?.value || value);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface SortableFieldProps {
  field: FormField;
  onToggleVisibility: (id: string) => void;
  onOpenSettings: (id: string) => void;
  isSelected: boolean;
}

function SortableField({ field, onToggleVisibility, onOpenSettings, isSelected }: SortableFieldProps) {
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

  // Get the icon component dynamically
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
            <span>{field.label}</span>
          </s-stack>

          <s-stack direction="inline" gap="small" alignItems="center">
            <s-button
              variant="auto"
              onClick={() => onOpenSettings(field.id)}
              aria-label="Field settings"
            >
              <Settings size={18} />
            </s-button>
            <s-button
              variant="auto"
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

interface FormBuilderProps {
  shopUrl?: string;
  initialFields?: FormField[];
  onFieldsChange?: (fields: FormField[]) => void;
}

export default function FormBuilder({ shopUrl , initialFields, onFieldsChange }: FormBuilderProps) {
  const [fields, setFields] = useState<FormField[]>(initialFields || DEFAULT_FORM_FIELDS);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const shopify = useAppBridge()
  // Notify parent of field changes
  useEffect(() => {
    if (onFieldsChange) {
      onFieldsChange(fields);
    }
  }, [fields, onFieldsChange]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        shopify.saveBar.show('form-builder-save-bar')
        
        // Update order property
        return newItems.map((item, index) => ({
          ...item,
          order: index,
        }));
      });
    }
  };

  const toggleVisibility = (id: string) => {
    setFields((items) =>
      items.map((item) =>
        item.id === id ? { ...item, visible: !item.visible } : item
      )
    );
    shopify.saveBar.show('form-builder-save-bar')
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields((items) =>
      items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    shopify.saveBar.hide('form-builder-save-bar')
    setIsSaving(true);

    try {
      const result = await saveForm(shopUrl || '', { fields });
      
      if (result.success) {
        shopify.toast.show('Form saved successfully!');
      } else {
        shopify.toast.show(result.error || 'Failed to save form',{isError:true});
      }
    } catch (error) {
      shopify.toast.show('An error occurred while saving',{isError:true});
    } finally {
      setIsSaving(false);
    }
  };

  // Sort fields by order to maintain proper sequence
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);
  const selectedField = selectedFieldId ? fields.find(f => f.id === selectedFieldId) : null;

  // Check if field is always required
  const isAlwaysRequired = (fieldType: string) => {
    return ['name', 'phone', 'province', 'city'].includes(fieldType);
  };

  return (
    <form data-save-bar>
    <ui-save-bar id="form-builder-save-bar">
        <button variant="primary" id="save-button" onClick={handleSubmit}>Save</button>
        <button type='button' onClick={()=>shopify.saveBar.hide('form-builder-save-bar')} id="discard-button">Discard</button>
    </ui-save-bar>

      <s-stack gap="small">
        <s-box>
          <h2 style={{ marginBottom: '8px', fontWeight: 600 }}>Form Fields</h2>
          <p style={{ fontSize: '14px', opacity: 0.7 }}>
            Drag to reorder, click settings icon to configure fields
          </p>
        </s-box>

        <div style={{ display: 'grid', gridTemplateColumns: selectedField ? '1fr 350px' : '1fr', gap: '16px' }}>
          <div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedFields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                {sortedFields.map((field) => (
                  <SortableField
                    key={field.id}
                    field={field}
                    onToggleVisibility={toggleVisibility}
                    onOpenSettings={setSelectedFieldId}
                    isSelected={selectedFieldId === field.id}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>

          {selectedField && (
            <s-box
              padding="small"
              background="base"
              border="base"
              borderRadius="base"
             
            >
              <s-stack gap="base">
                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                  <h3 style={{ fontWeight: 600, margin: 0 }}>Field Settings</h3>
                  <s-button
                    variant="auto"
                    onClick={() => setSelectedFieldId(null)}
                  >
                    <X size={20} />
                  </s-button>
                </s-stack>

                <s-divider />

                {/* Label Settings */}
                <div>
                  <s-stack direction="inline" justifyContent="space-between" alignItems="center" style={{ marginBottom: '8px' }}>
                    <s-text >
                      Label
                    </s-text>
                    <s-switch
                      checked={selectedField.showLabel}
                      onInput={(e: any) => updateField(selectedField.id, { showLabel: e.target?.checked ?? e.detail?.checked ?? !selectedField.showLabel })}
                    />
                  </s-stack>
                  <s-text-field
                    value={selectedField.label}
                    onChange={(e: any) => updateField(selectedField.id, { label: e.target.value })}
                    disabled={!selectedField.showLabel}
                  />
                </div>

                {/* Placeholder Settings */}
                <div>
                  <s-stack direction="inline" justifyContent="space-between" alignItems="center" style={{ marginBottom: '8px' }}>
                    <s-text>
                      Placeholder
                    </s-text>
                    <s-switch
                      checked={selectedField.showPlaceholder}
                      onInput={(e: any) => updateField(selectedField.id, { showPlaceholder: e.target?.checked ?? e.detail?.checked ?? !selectedField.showPlaceholder })}
                    />
                  </s-stack>
                  <s-text-field
                    value={selectedField.placeholder}
                    onInput={(e: any) => updateField(selectedField.id, { placeholder: e.target.value })}
                    disabled={!selectedField.showPlaceholder}
                  />
                </div>

                <s-divider />

                {/* Input Prefix Icon */}
                <div>
                  <s-select
                    label="Input Prefix Icon"
                    value={selectedField.icon}
                    onChange={(e: any) => updateField(selectedField.id, { icon: e.target.value || e.detail?.value || selectedField.icon })}
                  >
                    {AVAILABLE_ICONS.map((iconName) => (
                      <s-option key={iconName} value={iconName}>
                        {iconName}
                      </s-option>
                    ))}
                  </s-select>
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {(() => {
                      const IconComp = (Icons as any)[selectedField.icon];
                      return IconComp ? <IconComp size={24} /> : null;
                    })()}
                    <span style={{ fontSize: '14px', opacity: 0.7 }}>Preview</span>
                  </div>
                </div>

                <s-divider />

                {/* Required Toggle */}
                <div>
                  <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                    <s-text>
                      Required
                      {isAlwaysRequired(selectedField.type) && (
                        <span style={{ fontSize: '12px', opacity: 0.6, display: 'block' }}>
                          (Always required)
                        </span>
                      )}
                    </s-text>
                    <s-switch
                      checked={selectedField.required}
                      onInput={(e: any) => updateField(selectedField.id, { required: e.target?.checked ?? e.detail?.checked ?? !selectedField.required })}
                      disabled={isAlwaysRequired(selectedField.type)}
                    />
                  </s-stack>
                </div>

                <s-divider />

                {/* Color Settings */}
                <ColorPicker
                  label="Input Text Color"
                  value={selectedField.inputTextColor}
                  onChange={(color) => updateField(selectedField.id, { inputTextColor: color })}
                />

                <ColorPicker
                  label="Input Background Color"
                  value={selectedField.inputBackgroundColor}
                  onChange={(color) => updateField(selectedField.id, { inputBackgroundColor: color })}
                />
              </s-stack>
            </s-box>
          )}
        </div>
      </s-stack>
    </form>
  );
}
