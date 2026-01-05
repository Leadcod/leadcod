'use client';

import { useState, useEffect, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FormField, DEFAULT_FORM_FIELDS } from '@/app/types/form';
import { saveForm } from '@/app/actions/form';
import { useAppBridge } from '@shopify/app-bridge-react';
import SortableField from './SortableField';
import FieldSettingsPanel from './FieldSettingsPanel';

interface FormBuilderProps {
  shopUrl: string;
  initialFields?: FormField[];
  onFieldsChange?: (fields: FormField[]) => void;
  selectedFieldId?: string | null;
  onFieldSelect?: (fieldId: string | null) => void;
}

export default function FormBuilder({ shopUrl , initialFields, onFieldsChange, selectedFieldId: externalSelectedFieldId, onFieldSelect }: FormBuilderProps) {
  const initialFieldsValue = initialFields || DEFAULT_FORM_FIELDS;
  const [fields, setFields] = useState<FormField[]>(initialFieldsValue);
  const [internalSelectedFieldId, setInternalSelectedFieldId] = useState<string | null>(null);
  const selectedFieldId = externalSelectedFieldId !== undefined ? externalSelectedFieldId : internalSelectedFieldId;
  const setSelectedFieldId = onFieldSelect || setInternalSelectedFieldId;
  const shopify = useAppBridge()
  const lastSavedFieldsRef = useRef<FormField[]>(JSON.parse(JSON.stringify(initialFieldsValue)));
  
  useEffect(() => {
    lastSavedFieldsRef.current = JSON.parse(JSON.stringify(initialFieldsValue));
  }, []);

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
    shopify.saveBar.show('form-builder-save-bar');
  };

  const applySettingsToOtherFields = (sourceFieldId: string) => {
    const sourceField = fields.find(f => f.id === sourceFieldId);
    if (!sourceField) return;

    setFields((items) =>
      items.map((item) => {
        // Skip the source field itself and the buyButton
        if (item.id === sourceFieldId || item.type === 'buyButton') {
          return item;
        }
        // Apply color and font family settings from source field
        return {
          ...item,
          inputTextColor: sourceField.inputTextColor,
          inputBackgroundColor: sourceField.inputBackgroundColor,
          fontFamily: sourceField.fontFamily,
        };
      })
    );
    shopify.saveBar.show('form-builder-save-bar');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    shopify.saveBar.hide('form-builder-save-bar')

    try {
      const result = await saveForm(shopUrl, { fields });
      
      if (result.success) {
        lastSavedFieldsRef.current = JSON.parse(JSON.stringify(fields));
        shopify.toast.show('Form saved successfully!');
      } else {
        shopify.toast.show(result.error || 'Failed to save form',{isError:true});
      }
    } catch (error) {
      shopify.toast.show('An error occurred while saving',{isError:true});
    } 
  };

  const handleDiscard = () => {
    const restoredFields = JSON.parse(JSON.stringify(lastSavedFieldsRef.current));
    const sortedRestoredFields = [...restoredFields].sort((a, b) => a.order - b.order);
    setFields(sortedRestoredFields);
    setSelectedFieldId(null);
    shopify.saveBar.hide('form-builder-save-bar');
  };

  const sortedFields = [...fields].sort((a, b) => a.order - b.order);
  const selectedField = selectedFieldId ? fields.find(f => f.id === selectedFieldId) : null;

  return (
    <form>
    <ui-save-bar id="form-builder-save-bar">
        <button variant="primary" id="save-button" onClick={handleSubmit}>Save</button>
        <button type='button' onClick={handleDiscard} id="discard-button">Discard</button>
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
            <FieldSettingsPanel
              field={selectedField}
              onUpdate={updateField}
              onClose={() => {
                if (onFieldSelect) {
                  onFieldSelect(null);
                } else {
                  setInternalSelectedFieldId(null);
                }
              }}
              onApplyToAll={applySettingsToOtherFields}
            />
          )}
        </div>
      </s-stack>
    </form>
  );
}
