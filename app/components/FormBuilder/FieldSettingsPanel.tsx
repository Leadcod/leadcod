'use client';

import { useState } from 'react';
import { X, AlignLeft, AlignCenter, AlignRight, Bold, Italic, ChevronDown, ChevronUp } from 'lucide-react';
import * as Icons from 'lucide-react';
import { FormField, GRADIENT_PRESETS } from '@/app/types/form';
import { AVAILABLE_ICONS, BUY_NOW_ICONS, WHATSAPP_BUTTON_ICONS } from '@/lib/constants/formBuilder';
import CompactColorSwatch from '@/app/components/ui/compact-color-swatch';

// WhatsApp Icon Component
const WhatsAppIcon = ({ size = 24, fill = 'currentColor', strokeWidth = 1.5, ...props }: any) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

// Helper function to get icon component (handles WhatsApp and Lucide icons)
const getIconComponent = (iconName: string) => {
  if (iconName === 'WhatsApp') {
    return WhatsAppIcon;
  }
  return (Icons as any)[iconName] || null;
};

interface FieldSettingsPanelProps {
  field: FormField;
  onUpdate: (id: string, updates: Partial<FormField>) => void;
  onClose: () => void;
  onApplyToAll: (sourceFieldId: string) => void;
}

export default function FieldSettingsPanel({ field, onUpdate, onClose, onApplyToAll }: FieldSettingsPanelProps) {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showBackgroundSettings, setShowBackgroundSettings] = useState(false);
  
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

        {/* Label Section - Grouped together */}
        {field.type === 'buyButton' ? (
          <s-stack gap="small">
            <div>
              <s-text>Text</s-text>
              <s-text-field
                value={field.label}
                onChange={(e: any) => onUpdate(field.id, { label: e.target.value })}
              />
            </div>
            <s-stack direction="inline" justifyContent="space-between" alignItems="center">
              <s-text>Show Quantity Selector</s-text>
              <s-switch
                checked={field.showQuantity !== false}
                onInput={(e: any) => onUpdate(field.id, { showQuantity: e.target?.checked ?? e.detail?.checked ?? field.showQuantity !== false })}
              />
            </s-stack>
          </s-stack>
        ) : field.type === 'whatsappButton' ? (
          <s-stack gap="small">
            <div>
              <s-text>Text</s-text>
              <s-text-field
                value={field.label}
                onChange={(e: any) => onUpdate(field.id, { label: e.target.value })}
              />
            </div>
            <div>
              <s-text>WhatsApp Number</s-text>
              <s-text-field
                value={field.whatsappNumber || ''}
                onChange={(e: any) => onUpdate(field.id, { whatsappNumber: e.target.value })}
                placeholder="213000000000"
              />
              <s-text variant="subdued" tone="subdued">
                Enter number without + or spaces (e.g., 213000000000)
              </s-text>
            </div>
          </s-stack>
        ) : (
          <div>
            <s-stack direction="inline" justifyContent="space-between" alignItems="center">
              <s-text>Label</s-text>
              <s-stack direction="inline" gap="small" alignItems="center">
                <s-text>Show</s-text>
                <s-switch
                  checked={field.showLabel}
                  onInput={(e: any) => onUpdate(field.id, { showLabel: e.target?.checked ?? e.detail?.checked ?? !field.showLabel })}
                />
                <s-text>
                  Required
                  {isAlwaysRequired(field.type) && (
                    <span style={{ fontSize: '11px', opacity: 0.6, marginLeft: '4px' }}>
                      (Always)
                    </span>
                  )}
                </s-text>
                <s-switch
                  checked={field.required}
                  onInput={(e: any) => onUpdate(field.id, { required: e.target?.checked ?? e.detail?.checked ?? !field.required })}
                  disabled={isAlwaysRequired(field.type)}
                />
              </s-stack>
            </s-stack>
            <s-text-field
              value={field.label}
              onChange={(e: any) => onUpdate(field.id, { label: e.target.value })}
              disabled={!field.showLabel}
            />
          </div>
        )}

        {/* Placeholder Section - Grouped together */}
        {field.type !== 'buyButton' && field.type !== 'whatsappButton' && field.type !== 'shippingOption' && (
          <div>
            <s-stack direction="inline" justifyContent="space-between" alignItems="center">
              <s-text>Placeholder</s-text>
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

        {/* Icon Section */}
        <div>
          <s-select
            label="Input Prefix Icon"
            value={field.icon}
            onChange={(e: any) => onUpdate(field.id, { icon: e.target.value || e.detail?.value || field.icon })}
          >
            <s-option value="none">None</s-option>
            {(field.type === 'whatsappButton' ? WHATSAPP_BUTTON_ICONS : (field.type === 'buyButton' ? BUY_NOW_ICONS : AVAILABLE_ICONS)).map((iconName) => (
              <s-option key={iconName} value={iconName}>
                {iconName}
              </s-option>
            ))}
          </s-select>
          <s-stack direction="inline" gap="small" alignItems="center">
            {(() => {
              if (field.icon === 'none') {
                return <s-text variant="subdued" tone="subdued">No icon</s-text>;
              }
              const IconComp = getIconComponent(field.icon);
              if (!IconComp) return null;
              // Apply solid styling for buy button and whatsapp button icons
              if (field.type === 'buyButton' || field.type === 'whatsappButton') {
                return <IconComp size={24} fill="currentColor" strokeWidth={1.5} />;
              }
              return <IconComp size={24} />;
            })()}
            <s-text variant="subdued" tone="subdued">Preview</s-text>
          </s-stack>
        </div>

        {/* Input Colors - Only for buyButton and whatsappButton */}
        {field.type === 'buyButton' || field.type === 'whatsappButton' ? (
          <s-stack gap="small">
            <s-stack direction="inline" gap="small" alignItems="end">
              <s-box inlineSize="50%">
                <s-text>Text Color</s-text>
                <CompactColorSwatch
                  value={field.inputTextColor}
                  onChange={(color) => onUpdate(field.id, { inputTextColor: color })}
                />
              </s-box>
              <s-box inlineSize="50%" position="relative">
                <s-text>Button Background</s-text>
                <s-button
                  variant="tertiary"
                  onClick={() => setShowBackgroundSettings(!showBackgroundSettings)}
                >
                  <s-box
                    inlineSize="32px"
                    blockSize="32px"
                    background={field.backgroundType === 'gradient' && field.gradientBackground
                      ? field.gradientBackground
                      : field.inputBackgroundColor || '#000000'}
                    border="base"
                    borderRadius="base"
                  />
                </s-button>
                {showBackgroundSettings && (
                  <>
                    <div 
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 99
                      }}
                      onClick={() => setShowBackgroundSettings(false)}
                    />
                    <div style={{ 
                      position: 'absolute', 
                      zIndex: 100,
                      top: '100%',
                      left: 0,
                      marginTop: '8px',
                      background: '#ffffff',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      padding: '16px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      minWidth: '280px'
                    }}>
                      <s-stack gap="small">
                        <div>
                          <s-text>Background Type</s-text>
                        <s-select
                          value={field.backgroundType || 'solid'}
                          onChange={(e: any) => {
                            const bgType = e.target.value || e.detail?.value || 'solid';
                            onUpdate(field.id, { 
                              backgroundType: bgType,
                              ...(bgType === 'gradient' && !field.gradientBackground ? {
                                gradientBackground: GRADIENT_PRESETS[0].value,
                                inputTextColor: GRADIENT_PRESETS[0].textColor || '#ffffff'
                              } : {})
                            });
                          }}
                        >
                          <s-option value="solid">Solid</s-option>
                          <s-option value="gradient">Gradient</s-option>
                        </s-select>
                        </div>

                      {field.backgroundType === 'gradient' ? (
                        <s-stack gap="small">
                          <s-text>Gradient Presets</s-text>
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(4, 1fr)', 
                            gap: '8px'
                          }}>
                            {GRADIENT_PRESETS.map((preset) => (
                              <div
                                key={preset.name}
                                onClick={() => onUpdate(field.id, { 
                                  gradientBackground: preset.value,
                                  inputTextColor: preset.textColor || '#ffffff'
                                })}
                                style={{
                                  width: '100%',
                                  height: '40px',
                                  background: preset.preview,
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  border: field.gradientBackground === preset.value 
                                    ? '2px solid #000' 
                                    : '1px solid #e5e5e5',
                                  position: 'relative'
                                }}
                                title={preset.name}
                              />
                            ))}
                          </div>
                          <s-text variant="subdued" tone="subdued">
                            Selected: {GRADIENT_PRESETS.find(p => p.value === field.gradientBackground)?.name || 'Custom'}
                          </s-text>
                        </s-stack>
                      ) : (
                        <s-stack gap="small">
                          <s-text>Solid Color</s-text>
                          <s-color-picker 
                            value={field.inputBackgroundColor || '#000000'} 
                            alpha 
                            onChange={(e: any) => {
                              onUpdate(field.id, { 
                                inputBackgroundColor: e.target.value || e.detail?.value || field.inputBackgroundColor 
                              });
                            }}
                          />
                        </s-stack>
                      )}
                      </s-stack>
                    </div>
                  </>
                )}
              </s-box>
            </s-stack>
            <s-stack direction="inline" gap="small" alignItems="end">
              <s-box inlineSize="50%">
                <s-text>Animation</s-text>
                <s-select
                  value={field.animation || 'none'}
                  onChange={(e: any) => {
                    const animation = e.target.value || e.detail?.value || 'none';
                    onUpdate(field.id, { animation });
                  }}
                >
                  <s-option value="none">None</s-option>
                  <s-option value="background-shift">Background Shift</s-option>
                  <s-option value="shake">Shake</s-option>
                  <s-option value="bounce">Bounce</s-option>
                  <s-option value="pulse">Pulse</s-option>
                  <s-option value="glow">Glow</s-option>
                </s-select>
              </s-box>
              <s-box inlineSize="50%">
                <s-text>Button Size</s-text>
                <s-select
                  value={field.buttonSize || 'base'}
                  onChange={(e: any) => {
                    const buttonSize = e.target.value || e.detail?.value || 'base';
                    onUpdate(field.id, { buttonSize });
                  }}
                >
                  <s-option value="small">Small</s-option>
                  <s-option value="base">Base</s-option>
                  <s-option value="large">Large</s-option>
                  <s-option value="extra-large">Extra Large</s-option>
                </s-select>
              </s-box>
            </s-stack>
            <s-divider />
            <s-stack gap="small">
              <s-text>Button Text & Icon Sizes</s-text>
              <s-stack direction="inline" gap="small" alignItems="end">
                <s-box inlineSize="50%">
                  <s-text>Text Size (px)</s-text>
                  <s-text-field
                    type="number"
                    value={String(parseInt((field.buttonFontSize || '16px').replace('px', '')) || 16)}
                    onChange={(e: any) => {
                      const numValue = parseInt(e.target.value) || 16;
                      onUpdate(field.id, { buttonFontSize: `${numValue}px` });
                    }}
                    placeholder="16"
                  />
                </s-box>
                <s-box inlineSize="50%">
                  <s-text>Icon Size (px)</s-text>
                  <s-text-field
                    type="number"
                    value={String(field.buttonIconSize || 20)}
                    onChange={(e: any) => {
                      const numValue = parseInt(e.target.value) || 20;
                      onUpdate(field.id, { buttonIconSize: numValue });
                    }}
                    placeholder="20"
                  />
                </s-box>
              </s-stack>
            </s-stack>
          </s-stack>
        ) : (
          <s-stack direction="inline" gap="small" alignItems="end">
            <div style={{ flex: 1 }}>
              <s-text>Input Text Color</s-text>
              <CompactColorSwatch
                value={field.inputTextColor}
                onChange={(color) => onUpdate(field.id, { inputTextColor: color })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <s-text>Input Background Color</s-text>
              <CompactColorSwatch
                value={field.inputBackgroundColor}
                onChange={(color) => onUpdate(field.id, { inputBackgroundColor: color })}
              />
            </div>
          </s-stack>
        )}

        <s-divider />

        {/* Advanced Settings Toggle */}
        <div>
          <s-button
            variant="secondary"
            
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          >
            <span>Advanced Settings</span>
            {showAdvancedSettings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </s-button>
        </div>

        {/* Advanced Settings Content */}
        {showAdvancedSettings && (
          <s-stack gap="small">
            {/* Label Alignment - Only for non-buyButton and non-whatsappButton fields */}
            {field.type !== 'buyButton' && field.type !== 'whatsappButton' && (
              <>
                <s-divider />
                <h4>Label Alignment</h4>
                <div>
                  <s-stack direction="inline" gap="small">
                    <s-button
                      variant={(field.labelAlignment || 'left') === 'left' ? 'primary' : 'secondary'}
                      
                      onClick={() => onUpdate(field.id, { labelAlignment: 'left' })}
                      aria-label="Align left"
                    >
                      <AlignLeft size={18} />
                    </s-button>
                    <s-button
                      variant={(field.labelAlignment || 'left') === 'center' ? 'primary' : 'secondary'}
                      
                      onClick={() => onUpdate(field.id, { labelAlignment: 'center' })}
                      aria-label="Align center"
                    >
                      <AlignCenter size={18} />
                    </s-button>
                    <s-button
                      variant={(field.labelAlignment || 'left') === 'right' ? 'primary' : 'secondary'}
                      
                      onClick={() => onUpdate(field.id, { labelAlignment: 'right' })}
                      aria-label="Align right"
                    >
                      <AlignRight size={18} />
                    </s-button>
                  </s-stack>
                </div>
              </>
            )}

            {/* Input Alignment - Only for non-buyButton, non-whatsappButton and non-shippingOption fields */}
            {field.type !== 'buyButton' && field.type !== 'whatsappButton' && field.type !== 'shippingOption' && (
              <>
                <s-divider />
                <h4>Input Alignment</h4>
                <div>
                  <s-stack direction="inline" gap="small">
                    <s-button
                      variant={(field.inputAlignment || 'left') === 'left' ? 'primary' : 'secondary'}
                      
                      onClick={() => onUpdate(field.id, { inputAlignment: 'left' })}
                      aria-label="Align left"
                    >
                      <AlignLeft size={18} />
                    </s-button>
                    <s-button
                      variant={(field.inputAlignment || 'left') === 'center' ? 'primary' : 'secondary'}
                      
                      onClick={() => onUpdate(field.id, { inputAlignment: 'center' })}
                      aria-label="Align center"
                    >
                      <AlignCenter size={18} />
                    </s-button>
                    <s-button
                      variant={(field.inputAlignment || 'left') === 'right' ? 'primary' : 'secondary'}
                      
                      onClick={() => onUpdate(field.id, { inputAlignment: 'right' })}
                      aria-label="Align right"
                    >
                      <AlignRight size={18} />
                    </s-button>
                  </s-stack>
                </div>
              </>
            )}

          </s-stack>
        )}

        {/* Apply to all inputs button - Under Advanced Settings */}
        {field.type !== 'buyButton' && field.type !== 'whatsappButton' && (
          <>
            <s-divider />
            <s-button
              variant="secondary"
              
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

