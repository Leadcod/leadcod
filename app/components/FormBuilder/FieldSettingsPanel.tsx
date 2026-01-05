'use client';

import { X } from 'lucide-react';
import * as Icons from 'lucide-react';
import { FormField } from '@/app/types/form';
import { AVAILABLE_ICONS } from '@/lib/constants/formBuilder';
import ColorPicker from '@/app/components/ui/color-picker';

interface FieldSettingsPanelProps {
  field: FormField;
  onUpdate: (id: string, updates: Partial<FormField>) => void;
  onClose: () => void;
  onApplyToAll: (sourceFieldId: string) => void;
}

export default function FieldSettingsPanel({ field, onUpdate, onClose, onApplyToAll }: FieldSettingsPanelProps) {
  const isAlwaysRequired = (fieldType: string) => {
    return ['name', 'phone', 'province', 'city'].includes(fieldType);
  };

  return (
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
            onClick={onClose}
          >
            <X size={20} />
          </s-button>
        </s-stack>

        <s-divider />

        <div>
          {field.type === 'buyButton' ? (
            <>
              <s-text>
                Text
              </s-text>
              <s-text-field
                value={field.label}
                onChange={(e: any) => onUpdate(field.id, { label: e.target.value })}
              />
            </>
          ) : (
            <>
              <s-stack direction="inline" justifyContent="space-between" alignItems="center" style={{ marginBottom: '8px' }}>
                <s-text>
                  Label
                </s-text>
                <s-switch
                  checked={field.showLabel}
                  onInput={(e: any) => onUpdate(field.id, { showLabel: e.target?.checked ?? e.detail?.checked ?? !field.showLabel })}
                />
              </s-stack>
              <s-text-field
                value={field.label}
                onChange={(e: any) => onUpdate(field.id, { label: e.target.value })}
                disabled={!field.showLabel}
              />
            </>
          )}
        </div>

        {field.type !== 'buyButton' && (
          <div>
            <s-stack direction="inline" justifyContent="space-between" alignItems="center" style={{ marginBottom: '8px' }}>
              <s-text>
                Placeholder
              </s-text>
              <s-switch
                checked={field.showPlaceholder}
                onInput={(e: any) => onUpdate(field.id, { showPlaceholder: e.target?.checked ?? e.detail?.checked ?? !field.showPlaceholder })}
              />
            </s-stack>
            <s-text-field
              value={field.placeholder}
              onInput={(e: any) => onUpdate(field.id, { placeholder: e.target.value })}
              disabled={!field.showPlaceholder}
            />
          </div>
        )}

        <s-divider />

        <div>
          <s-select
            label="Input Prefix Icon"
            value={field.icon}
            onChange={(e: any) => onUpdate(field.id, { icon: e.target.value || e.detail?.value || field.icon })}
          >
            <s-option value="none">None</s-option>
            {AVAILABLE_ICONS.map((iconName) => (
              <s-option key={iconName} value={iconName}>
                {iconName}
              </s-option>
            ))}
          </s-select>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {(() => {
              if (field.icon === 'none') {
                return <span style={{ fontSize: '14px', opacity: 0.5 }}>No icon</span>;
              }
              const IconComp = (Icons as any)[field.icon];
              return IconComp ? <IconComp size={24} /> : null;
            })()}
            <span style={{ fontSize: '14px', opacity: 0.7 }}>Preview</span>
          </div>
        </div>

        {field.type !== 'buyButton' && (
          <>
            <s-divider />

            <div>
              <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                <s-text>
                  Required
                  {isAlwaysRequired(field.type) && (
                    <span style={{ fontSize: '12px', opacity: 0.6, display: 'block' }}>
                      (Always required)
                    </span>
                  )}
                </s-text>
                <s-switch
                  checked={field.required}
                  onInput={(e: any) => onUpdate(field.id, { required: e.target?.checked ?? e.detail?.checked ?? !field.required })}
                  disabled={isAlwaysRequired(field.type)}
                />
              </s-stack>
            </div>
          </>
        )}

        <s-divider />

        <div>
          <s-select
            label="Font Family"
            value={field.fontFamily}
            onChange={(e: any) => onUpdate(field.id, { fontFamily: e.target.value || e.detail?.value || field.fontFamily })}
          >
            <s-option value="cairo">Cairo</s-option>
            <s-option value="nunito">Nunito</s-option>
            <s-option value="poppins">Poppins</s-option>
            <s-option value="montserrat">Montserrat</s-option>
          </s-select>
        </div>

        <ColorPicker
          label={field.type === 'buyButton' ? 'Text Color' : 'Input Text Color'}
          value={field.inputTextColor}
          onChange={(color) => onUpdate(field.id, { inputTextColor: color })}
        />

        <ColorPicker
          label={field.type === 'buyButton' ? 'Button Background' : 'Input Background Color'}
          value={field.inputBackgroundColor}
          onChange={(color) => onUpdate(field.id, { inputBackgroundColor: color })}
        />

        {field.type !== 'buyButton' && (
          <>
            <s-divider />
            <s-button
              variant="secondary"
              size="small"
              onClick={() => onApplyToAll(field.id)}
            >
              Apply to all inputs
            </s-button>
          </>
        )}
      </s-stack>
    </s-box>
  );
}

