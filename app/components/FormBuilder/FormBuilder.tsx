'use client';

import { useState, useEffect, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FormField, DEFAULT_FORM_FIELDS, GlobalFormSettings, DEFAULT_GLOBAL_SETTINGS } from '@/app/types/form';
import { saveForm } from '@/app/actions/form';
import { useAppBridge } from '@shopify/app-bridge-react';
import SortableField from './SortableField';
import FieldSettingsPanel from './FieldSettingsPanel';
import GlobalFormSettingsPanel from './GlobalFormSettingsPanel';
import { Settings } from 'lucide-react';

interface FormBuilderProps {
  shopUrl: string;
  initialFields?: FormField[];
  initialGlobalSettings?: GlobalFormSettings;
  onFieldsChange?: (fields: FormField[]) => void;
  onGlobalSettingsChange?: (settings: GlobalFormSettings) => void;
  selectedFieldId?: string | null;
  onFieldSelect?: (fieldId: string | null) => void;
}

export default function FormBuilder({ shopUrl , initialFields, initialGlobalSettings, onFieldsChange, onGlobalSettingsChange, selectedFieldId: externalSelectedFieldId, onFieldSelect }: FormBuilderProps) {
  const initialFieldsValue = initialFields || DEFAULT_FORM_FIELDS;
  const [fields, setFields] = useState<FormField[]>(initialFieldsValue);
  const [globalSettings, setGlobalSettings] = useState<GlobalFormSettings>(initialGlobalSettings || DEFAULT_GLOBAL_SETTINGS);
  const [internalSelectedFieldId, setInternalSelectedFieldId] = useState<string | null>(null);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const selectedFieldId = externalSelectedFieldId !== undefined ? externalSelectedFieldId : internalSelectedFieldId;
  
  const handleFieldSelect = (fieldId: string | null) => {
    if (onFieldSelect) {
      onFieldSelect(fieldId);
    } else {
      setInternalSelectedFieldId(fieldId);
    }
    setShowGlobalSettings(false);
  };
  const shopify = useAppBridge()
  const lastSavedFieldsRef = useRef<FormField[]>(JSON.parse(JSON.stringify(initialFieldsValue)));
  const lastSavedGlobalSettingsRef = useRef<GlobalFormSettings>(JSON.parse(JSON.stringify(initialGlobalSettings || DEFAULT_GLOBAL_SETTINGS)));
  const prevExternalSelectedFieldIdRef = useRef<string | null | undefined>(externalSelectedFieldId);
  
  useEffect(() => {
    lastSavedFieldsRef.current = JSON.parse(JSON.stringify(initialFieldsValue));
    lastSavedGlobalSettingsRef.current = JSON.parse(JSON.stringify(initialGlobalSettings || DEFAULT_GLOBAL_SETTINGS));
  }, []);

  // Sync fields when initialFields prop changes (e.g., when new fields are merged in)
  // Use a ref to track the last synced initialFields to avoid unnecessary updates
  const lastInitialFieldsRef = useRef<FormField[]>(initialFieldsValue);
  
  useEffect(() => {
    if (initialFields && initialFields.length > 0) {
      // Check if initialFields has changed (by comparing field IDs)
      const currentIds = new Set(lastInitialFieldsRef.current.map(f => f.id));
      const newIds = new Set(initialFields.map(f => f.id));
      
      // Check if there are new fields or if the structure changed
      const hasNewFields = initialFields.some(f => !currentIds.has(f.id));
      const hasRemovedFields = lastInitialFieldsRef.current.some(f => !newIds.has(f.id));
      
      if (hasNewFields || hasRemovedFields || initialFields.length !== lastInitialFieldsRef.current.length) {
        setFields(initialFields);
        lastInitialFieldsRef.current = initialFields;
      }
    }
  }, [initialFields]);

  useEffect(() => {
    if (onFieldsChange) {
      onFieldsChange(fields);
    }
  }, [fields, onFieldsChange]);

  useEffect(() => {
    if (onGlobalSettingsChange) {
      onGlobalSettingsChange(globalSettings);
    }
  }, [globalSettings, onGlobalSettingsChange]);

  // Close global settings when a field is selected externally (e.g., from preview)
  useEffect(() => {
    const prevValue = prevExternalSelectedFieldIdRef.current;
    const currentValue = externalSelectedFieldId;
    
    // Only close if transitioning from null/undefined to a field ID
    if (prevValue === null || prevValue === undefined) {
      if (currentValue !== null && currentValue !== undefined) {
        setShowGlobalSettings(false);
      }
    }
    
    prevExternalSelectedFieldIdRef.current = currentValue;
  }, [externalSelectedFieldId]);

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

  const updateGlobalSettings = (updates: Partial<GlobalFormSettings>) => {
    setGlobalSettings((prev) => ({ ...prev, ...updates }));
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
        // Apply alignment settings from source field (colors and fonts are now global)
        return {
          ...item,
          labelAlignment: sourceField.labelAlignment,
          inputAlignment: sourceField.inputAlignment,
        };
      })
    );
    shopify.saveBar.show('form-builder-save-bar');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    shopify.saveBar.hide('form-builder-save-bar')

    try {
      const result = await saveForm(shopUrl, { fields, globalSettings });
      
      if (result.success) {
        lastSavedFieldsRef.current = JSON.parse(JSON.stringify(fields));
        lastSavedGlobalSettingsRef.current = JSON.parse(JSON.stringify(globalSettings));
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
    setGlobalSettings(JSON.parse(JSON.stringify(lastSavedGlobalSettingsRef.current)));
    handleFieldSelect(null);
    setShowGlobalSettings(false);
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
          <s-stack direction="inline" justifyContent="space-between" alignItems="center">
            <div>
              <h2 style={{ marginBottom: '8px', fontWeight: 600 }}>Form Fields</h2>
              <p style={{ fontSize: '14px', opacity: 0.7 }}>
                Drag to reorder, click settings icon to configure fields
              </p>
            </div>
            <s-button
              variant="secondary"
              onClick={() => {
                handleFieldSelect(null);
                setShowGlobalSettings(true);
              }}
            >
              <Settings size={18} style={{ marginRight: '8px' }} />
              Global Settings
            </s-button>
          </s-stack>
        </s-box>

        <div>
          {showGlobalSettings && (
            <div style={{ marginBottom: '16px' }}>
              <GlobalFormSettingsPanel
                settings={globalSettings}
                onUpdate={updateGlobalSettings}
                onClose={() => setShowGlobalSettings(false)}
              />
            </div>
          )}

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
                <div key={field.id}>
                  <SortableField
                    field={field}
                    onToggleVisibility={toggleVisibility}
                    onOpenSettings={(id) => {
                      handleFieldSelect(id);
                    }}
                    isSelected={selectedFieldId === field.id}
                  />
                  {selectedFieldId === field.id && !showGlobalSettings && (
                    <div
                      style={{
                        marginTop: '8px',
                        marginBottom: '16px',
                        animation: 'slideDown 0.3s ease-out',
                      }}
                    >
                      <FieldSettingsPanel
                        field={selectedField!}
                        onUpdate={updateField}
                        onClose={() => {
                          handleFieldSelect(null);
                        }}
                        onApplyToAll={applySettingsToOtherFields}
                      />
                    </div>
                  )}
                </div>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </s-stack>
    </form>
  );
}
