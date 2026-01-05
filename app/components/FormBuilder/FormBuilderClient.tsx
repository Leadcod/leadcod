'use client';

import { useState } from 'react';
import FormBuilder from './FormBuilder';
import FormPreview from './FormPreview';
import { FormField, DEFAULT_FORM_FIELDS, GlobalFormSettings, DEFAULT_GLOBAL_SETTINGS } from '../../types/form';

interface FormBuilderClientProps {
  shopUrl: string;
  existingForm: {
    id: string;
    fields: any;
    settings: any;
  } | null;
}

export default function FormBuilderClient({ shopUrl, existingForm }: FormBuilderClientProps) {
  const initialFields = existingForm?.fields 
    ? (existingForm.fields as FormField[])
    : DEFAULT_FORM_FIELDS;
  
  const initialGlobalSettings = existingForm?.settings 
    ? (existingForm.settings as GlobalFormSettings)
    : DEFAULT_GLOBAL_SETTINGS;
    
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [globalSettings, setGlobalSettings] = useState<GlobalFormSettings>(initialGlobalSettings);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

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
          <FormPreview 
            fields={fields}
            globalSettings={globalSettings}
            onFieldClick={setSelectedFieldId}
          />
      </s-box>
    </s-stack>
  );
}

