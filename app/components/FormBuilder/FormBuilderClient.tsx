'use client';

import { useState, useEffect } from 'react';
import FormBuilder from './FormBuilder';
import FormDisplay from './FormDisplay';
import { FormField, DEFAULT_FORM_FIELDS, GlobalFormSettings, DEFAULT_GLOBAL_SETTINGS } from '../../types/form';
import { getShippingSettings } from '@/app/actions/shipping';

interface FormBuilderClientProps {
  shopUrl: string;
  existingForm: {
    id: string;
    fields: any;
    settings: any;
  } | null;
}

export default function FormBuilderClient({ shopUrl, existingForm }: FormBuilderClientProps) {
  // Merge existing fields with default fields to ensure all default fields are present
  const mergeFields = (existing: FormField[] | undefined): FormField[] => {
    if (!existing) return DEFAULT_FORM_FIELDS;
    
    // Create a map of existing fields by id
    const existingFieldsMap = new Map(existing.map(f => [f.id, f]));
    
    // Start with default fields and merge in existing field data where it exists
    const mergedFields = DEFAULT_FORM_FIELDS.map(defaultField => {
      const existingField = existingFieldsMap.get(defaultField.id);
      if (existingField) {
        // Merge: use existing field data but ensure all default properties are present
        return {
          ...defaultField,
          ...existingField,
          // Preserve the type from default (in case it changed)
          type: defaultField.type,
          // Preserve the id from default (in case it changed)
          id: defaultField.id,
        };
      }
      return defaultField;
    });
    
    return mergedFields;
  };
  
  const initialFields = mergeFields(existingForm?.fields as FormField[] | undefined);
  
  const initialGlobalSettings = existingForm?.settings 
    ? (existingForm.settings as GlobalFormSettings)
    : DEFAULT_GLOBAL_SETTINGS;
    
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [globalSettings, setGlobalSettings] = useState<GlobalFormSettings>(initialGlobalSettings);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [shippingMethod, setShippingMethod] = useState<'free' | 'per-province'>('free');
  const [stopDeskEnabled, setStopDeskEnabled] = useState(false);

  // Ensure shippingOption field is always present
  useEffect(() => {
    const hasShippingOption = fields.some(f => f.id === 'shippingOption');
    if (!hasShippingOption) {
      const shippingOptionField = DEFAULT_FORM_FIELDS.find(f => f.id === 'shippingOption');
      if (shippingOptionField) {
        setFields(prev => {
          const newFields = [...prev, shippingOptionField];
          return newFields.sort((a, b) => a.order - b.order);
        });
      }
    }
  }, [fields]);

  useEffect(() => {
    async function fetchShippingSettings() {
      if (shopUrl) {
        const result = await getShippingSettings(shopUrl);
        if (result.success && result.data) {
          const method = result.data.method as 'free' | 'per-province';
          setShippingMethod(method);
          setStopDeskEnabled(result.data.stopDeskEnabled);
        }
      }
    }
    fetchShippingSettings();
  }, [shopUrl]);

  return (
    <s-stack background='strong' direction="inline" paddingBlock="large" paddingInline="large" justifyContent="space-between" gap="small">
      <s-box inlineSize="65%">
          <FormBuilder 
            shopUrl={shopUrl}
            initialFields={fields}
            initialGlobalSettings={globalSettings}
            onFieldsChange={setFields}
            onGlobalSettingsChange={setGlobalSettings}
            selectedFieldId={selectedFieldId}
            onFieldSelect={setSelectedFieldId}
          />
      </s-box>

      <s-box inlineSize="34%">
          <FormDisplay 
            fields={fields}
            globalSettings={globalSettings}
            onFieldClick={setSelectedFieldId}
            mode="preview"
            shippingMethod={shippingMethod}
            stopDeskEnabled={stopDeskEnabled}
            shopUrl={shopUrl}
          />
      </s-box>
    </s-stack>
  );
}

