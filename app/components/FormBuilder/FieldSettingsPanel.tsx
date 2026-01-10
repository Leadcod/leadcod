'use client';

import { useState } from 'react';
import { X, AlignLeft, AlignCenter, AlignRight, Bold, Italic, ChevronDown, ChevronUp } from 'lucide-react';
import * as Icons from 'lucide-react';
import { FormField, GRADIENT_PRESETS } from '@/app/types/form';
import { AVAILABLE_ICONS, BUY_NOW_ICONS } from '@/lib/constants/formBuilder';
import CompactColorSwatch from '@/app/components/ui/compact-color-swatch';

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
          <div>
            <s-text>Text</s-text>
            <s-text-field
              value={field.label}
              onChange={(e: any) => onUpdate(field.id, { label: e.target.value })}
            />
          </div>
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
        {field.type !== 'buyButton' && (
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
            {(field.type === 'buyButton' ? BUY_NOW_ICONS : AVAILABLE_ICONS).map((iconName) => (
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
              if (!IconComp) return null;
              // Apply solid styling for buy button icons
              if (field.type === 'buyButton') {
                return <IconComp size={24} style={{ fill: 'currentColor', strokeWidth: 1.5 }} />;
              }
              return <IconComp size={24} />;
            })()}
            <span style={{ fontSize: '14px', opacity: 0.7 }}>Preview</span>
          </div>
        </div>

        {/* Input Colors - Only for buyButton */}
        {field.type === 'buyButton' ? (
          <>
            <s-stack direction="inline" gap="small" alignItems="end">
              <div style={{ flex: 1 }}>
                <s-text>Text Color</s-text>
                <CompactColorSwatch
                  value={field.inputTextColor}
                  onChange={(color) => onUpdate(field.id, { inputTextColor: color })}
                />
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                <s-text>Button Background</s-text>
                <div
                  onClick={() => setShowBackgroundSettings(!showBackgroundSettings)}
                  style={{
                    width: '32px',
                    height: '32px',
                    background: field.backgroundType === 'gradient' && field.gradientBackground
                      ? field.gradientBackground
                      : field.inputBackgroundColor || '#000000',
                    border: '1px solid #e5e5e5',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                />
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
                      <div style={{ marginBottom: '12px' }}>
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
                        <div>
                          <s-text>Gradient Presets</s-text>
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(4, 1fr)', 
                            gap: '8px',
                            marginTop: '8px'
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
                          <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.7 }}>
                            Selected: {GRADIENT_PRESETS.find(p => p.value === field.gradientBackground)?.name || 'Custom'}
                          </div>
                        </div>
                      ) : (
                        <div>
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
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div style={{ flex: 1 }}>
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
              </div>
              <div style={{ flex: 1 }}>
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
              </div>
            </s-stack>
            <s-divider />
            <div>
              <s-text>Button Text & Icon Sizes</s-text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 120px', minWidth: '100px' }}>
                  <s-text>Text Size (px)</s-text>
                  <input
                    type="number"
                    value={parseInt((field.buttonFontSize || '16px').replace('px', '')) || 16}
                    onChange={(e: any) => {
                      const numValue = parseInt(e.target.value) || 16;
                      onUpdate(field.id, { buttonFontSize: `${numValue}px` });
                    }}
                    placeholder="16"
                    min="8"
                    max="72"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ flex: '1 1 120px', minWidth: '100px' }}>
                  <s-text>Icon Size (px)</s-text>
                  <input
                    type="number"
                    value={field.buttonIconSize || 20}
                    onChange={(e: any) => {
                      const numValue = parseInt(e.target.value) || 20;
                      onUpdate(field.id, { buttonIconSize: numValue });
                    }}
                    placeholder="20"
                    min="8"
                    max="72"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </div>
          </>
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
            {/* Label Alignment - Only for non-buyButton fields */}
            {field.type !== 'buyButton' && (
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

            {/* Input Alignment - Only for non-buyButton fields */}
            {field.type !== 'buyButton' && (
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
        {field.type !== 'buyButton' && (
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

