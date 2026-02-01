'use client';

import { useState, useEffect } from 'react';
import FormBuilder from './FormBuilder';
import FormDisplay from './FormDisplay';
import { FormField, DEFAULT_FORM_FIELDS, GlobalFormSettings, DEFAULT_GLOBAL_SETTINGS } from '../../types/form';
import { getShippingSettings } from '@/app/actions/shipping';
import { FullPageLoader } from '@/components/ui/loader';

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
  
  // Sync quantity field visibility with buy button's showQuantity on initial load
  // The buy button's showQuantity is the source of truth (used by Liquid template)
  // When buyButton shows quantity, hide the separate quantity field to avoid duplicates
  const syncQuantityWithBuyButton = (fields: FormField[]): FormField[] => {
    const quantityField = fields.find(f => f.type === 'quantity');
    const buyButton = fields.find(f => f.type === 'buyButton');
    
    if (quantityField && buyButton) {
      // If buyButton shows quantity, hide the separate quantity field to avoid duplicates
      const showQuantity = buyButton.showQuantity !== false; // Default to true
      return fields.map(f => 
        f.type === 'quantity'
          ? { ...f, visible: !showQuantity } // Hide quantity field when buyButton shows quantity
          : f
      );
    }
    return fields;
  };
  
  const syncedInitialFields = syncQuantityWithBuyButton(initialFields);
  
  // Merge existing settings with defaults to ensure all properties are present
  const mergeSettings = (existing: any): GlobalFormSettings => {
    if (!existing || typeof existing !== 'object' || Object.keys(existing).length === 0) {
      return DEFAULT_GLOBAL_SETTINGS;
    }
    
    // Deep merge with defaults, ensuring nested objects are also merged
    return {
      ...DEFAULT_GLOBAL_SETTINGS,
      ...existing,
      // Deep merge nested objects
      inputPadding: {
        ...DEFAULT_GLOBAL_SETTINGS.inputPadding,
        ...(existing.inputPadding || {})
      },
      headline: {
        ...DEFAULT_GLOBAL_SETTINGS.headline,
        ...(existing.headline || {})
      },
      subtitle: {
        ...DEFAULT_GLOBAL_SETTINGS.subtitle,
        ...(existing.subtitle || {})
      },
      border: {
        ...DEFAULT_GLOBAL_SETTINGS.border,
        ...(existing.border || {})
      },
      thankYouPopup: {
        ...DEFAULT_GLOBAL_SETTINGS.thankYouPopup,
        ...(existing.thankYouPopup || {})
      }
    };
  };
  
  const initialGlobalSettings = mergeSettings(existingForm?.settings);
    
  const [fields, setFields] = useState<FormField[]>(syncedInitialFields);
  const [globalSettings, setGlobalSettings] = useState<GlobalFormSettings>(initialGlobalSettings);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [shippingMethod, setShippingMethod] = useState<'free' | 'per-province'>('per-province');
  const [stopDeskEnabled, setStopDeskEnabled] = useState(false);
  const [freeShippingLabel, setFreeShippingLabel] = useState<string>('مجاني');
  const [codLabel, setCodLabel] = useState<string>('التوصيل للمنزل');
  const [stopDeskLabel, setStopDeskLabel] = useState<string>('التوصيل للمكتب');
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(true);
      if (shopUrl) {
        const result = await getShippingSettings(shopUrl);
        if (result.success && result.data) {
          const method = result.data.method as 'free' | 'per-province';
          setShippingMethod(method);
          setStopDeskEnabled(result.data.stopDeskEnabled);
          setFreeShippingLabel(result.data.freeShippingLabel || 'مجاني');
          setCodLabel(result.data.codLabel || 'التوصيل للمنزل');
          setStopDeskLabel(result.data.stopDeskLabel || 'التوصيل للمكتب');
        }
      }
      setIsLoading(false);
    }
    fetchShippingSettings();
  }, [shopUrl]);

  if (isLoading) {
    return <FullPageLoader message="Loading form builder..." />;
  }

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
            freeShippingLabel={freeShippingLabel}
            codLabel={codLabel}
            stopDeskLabel={stopDeskLabel}
            shopUrl={shopUrl}
          />
      </s-box>
    </s-stack>
  );
}

