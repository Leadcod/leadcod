'use client';

import { X, AlignLeft, AlignCenter, AlignRight, Bold, Italic } from 'lucide-react';
import { GlobalFormSettings } from '@/app/types/form';
import CompactColorSwatch from '@/app/components/ui/compact-color-swatch';

interface GlobalFormSettingsPanelProps {
  settings: GlobalFormSettings;
  onUpdate: (updates: Partial<GlobalFormSettings>) => void;
  onClose: () => void;
}

export default function GlobalFormSettingsPanel({ settings, onUpdate, onClose }: GlobalFormSettingsPanelProps) {
  const updateHeadline = (updates: Partial<GlobalFormSettings['headline']>) => {
    onUpdate({
      headline: { ...settings.headline, ...updates }
    });
  };

  const updateSubtitle = (updates: Partial<GlobalFormSettings['subtitle']>) => {
    onUpdate({
      subtitle: { ...settings.subtitle, ...updates }
    });
  };

  const updateBorder = (updates: Partial<GlobalFormSettings['border']>) => {
    onUpdate({
      border: { ...settings.border, ...updates }
    });
  };

  return (
    <s-box
      padding="small"
      background="base"
      border="base"
      borderRadius="base"
    >
      <s-stack gap="small">
        <s-stack direction="inline" justifyContent="space-between" alignItems="center">
          <h3 style={{ fontWeight: 600, margin: 0 }}>Global Form Settings</h3>
          <s-button
            variant="auto"
            onClick={onClose}
          >
            <X size={20} />
          </s-button>
        </s-stack>

        <s-divider />

        {/* Font Settings & Color Section */}
        <div>
          <h4 style={{ fontWeight: 600, margin: '0 0 12px 0' }}>Font Settings & Color</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
              <s-text style={{ marginBottom: '8px', display: 'block' }}>Primary Color</s-text>
              <CompactColorSwatch
                value={settings.primaryColor}
                onChange={(color) => onUpdate({ primaryColor: color })}
              />
            </div>
            <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
              <s-select
                label="Font Family"
                value={settings.fontFamily}
                onChange={(e: any) => onUpdate({ fontFamily: e.target.value || e.detail?.value || settings.fontFamily })}
              >
                <s-option value="cairo">Cairo</s-option>
                <s-option value="nunito">Nunito</s-option>
                <s-option value="poppins">Poppins</s-option>
                <s-option value="montserrat">Montserrat</s-option>
              </s-select>
            </div>
            <div style={{ flex: '1 1 100px', minWidth: '80px' }}>
              <s-text>Font Size</s-text>
              <input
                type="number"
                value={parseInt((settings.fontSize || '16px').replace('px', '')) || 16}
                onChange={(e: any) => {
                  const numValue = parseInt(e.target.value) || 16;
                  onUpdate({ fontSize: `${numValue}px` });
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
            <div style={{ flex: '0 0 auto' }}>
              <s-text style={{ marginBottom: '8px', display: 'block' }}>Font Style</s-text>
              <s-stack direction="inline" gap="small">
                <s-button
                  variant={settings.fontWeight === 'bold' ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => {
                    const currentWeight = settings.fontWeight || 'normal';
                    onUpdate({ fontWeight: currentWeight === 'bold' ? 'normal' : 'bold' });
                  }}
                  aria-label="Bold"
                >
                  <Bold size={18} />
                </s-button>
                <s-button
                  variant={settings.fontStyle === 'italic' ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => {
                    const currentStyle = settings.fontStyle || 'normal';
                    onUpdate({ fontStyle: currentStyle === 'italic' ? 'normal' : 'italic' });
                  }}
                  aria-label="Italic"
                >
                  <Italic size={18} />
                </s-button>
              </s-stack>
            </div>
          </div>
          <s-text style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            These settings will be applied to all form fields. Primary color is used for borders, icons, labels, and other form elements.
          </s-text>
        </div>

        <s-divider />

        {/* Headline Section */}
        <div>
          <s-stack direction="inline" justifyContent="space-between" alignItems="center" style={{ marginBottom: '8px' }}>
            <h4 style={{ fontWeight: 600, margin: 0 }}>Headline</h4>
            <s-switch
              checked={settings.headline.enabled}
              onInput={(e: any) => updateHeadline({ enabled: e.target?.checked ?? e.detail?.checked ?? !settings.headline.enabled })}
            />
          </s-stack>

          {settings.headline.enabled && (
            <s-stack gap="small" style={{ marginTop: '12px' }}>
              <div>
                <s-text>Text</s-text>
                <s-text-field
                  value={settings.headline.text}
                  onChange={(e: any) => updateHeadline({ text: e.target.value })}
                />
              </div>
              <div>
                <s-text style={{ marginBottom: '8px', display: 'block' }}>Alignment</s-text>
                <s-stack direction="inline" gap="small">
                  <s-button
                    variant={settings.headline.alignment === 'left' ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => updateHeadline({ alignment: 'left' })}
                    aria-label="Align left"
                  >
                    <AlignLeft size={18} />
                  </s-button>
                  <s-button
                    variant={settings.headline.alignment === 'center' ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => updateHeadline({ alignment: 'center' })}
                    aria-label="Align center"
                  >
                    <AlignCenter size={18} />
                  </s-button>
                  <s-button
                    variant={settings.headline.alignment === 'right' ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => updateHeadline({ alignment: 'right' })}
                    aria-label="Align right"
                  >
                    <AlignRight size={18} />
                  </s-button>
                </s-stack>
              </div>
            </s-stack>
          )}
        </div>

        <s-divider />

        {/* Subtitle Section */}
        <div>
          <s-stack direction="inline" justifyContent="space-between" alignItems="center" style={{ marginBottom: '8px' }}>
            <h4 style={{ fontWeight: 600, margin: 0 }}>Subtitle</h4>
            <s-switch
              checked={settings.subtitle.enabled}
              onInput={(e: any) => updateSubtitle({ enabled: e.target?.checked ?? e.detail?.checked ?? !settings.subtitle.enabled })}
            />
          </s-stack>

          {settings.subtitle.enabled && (
            <s-stack gap="small" style={{ marginTop: '12px' }}>
              <div>
                <s-text>Text</s-text>
                <s-text-field
                  value={settings.subtitle.text}
                  onChange={(e: any) => updateSubtitle({ text: e.target.value })}
                />
              </div>
              <div>
                <s-text style={{ marginBottom: '8px', display: 'block' }}>Alignment</s-text>
                <s-stack direction="inline" gap="small">
                  <s-button
                    variant={settings.subtitle.alignment === 'left' ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => updateSubtitle({ alignment: 'left' })}
                    aria-label="Align left"
                  >
                    <AlignLeft size={18} />
                  </s-button>
                  <s-button
                    variant={settings.subtitle.alignment === 'center' ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => updateSubtitle({ alignment: 'center' })}
                    aria-label="Align center"
                  >
                    <AlignCenter size={18} />
                  </s-button>
                  <s-button
                    variant={settings.subtitle.alignment === 'right' ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => updateSubtitle({ alignment: 'right' })}
                    aria-label="Align right"
                  >
                    <AlignRight size={18} />
                  </s-button>
                </s-stack>
              </div>
            </s-stack>
          )}
        </div>

        <s-divider />

        {/* Input Padding Section */}
        <div>
          <h4 style={{ fontWeight: 600, margin: '0 0 12px 0' }}>Input Padding</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 100px', minWidth: '80px' }}>
              <s-text>Vertical Padding</s-text>
              <input
                type="number"
                value={settings.inputPadding?.vertical ?? 8}
                onChange={(e: any) => onUpdate({ 
                  inputPadding: { 
                    vertical: parseInt(e.target.value) || 8,
                    horizontal: settings.inputPadding?.horizontal ?? 12
                  } 
                })}
                placeholder="8"
                min="0"
                max="50"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ flex: '1 1 100px', minWidth: '80px' }}>
              <s-text>Horizontal Padding</s-text>
              <input
                type="number"
                value={settings.inputPadding?.horizontal ?? 12}
                onChange={(e: any) => onUpdate({ 
                  inputPadding: { 
                    vertical: settings.inputPadding?.vertical ?? 8,
                    horizontal: parseInt(e.target.value) || 12
                  } 
                })}
                placeholder="12"
                min="0"
                max="100"
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
          <s-text style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            Adjust the padding inside all form input fields. Vertical padding controls top/bottom spacing, horizontal padding controls left/right spacing.
          </s-text>
        </div>

        <s-divider />

        {/* Border Section */}
        <div>
          <s-stack direction="inline" justifyContent="space-between" alignItems="center" style={{ marginBottom: '8px' }}>
            <h4 style={{ fontWeight: 600, margin: 0 }}>Form Border</h4>
            <s-switch
              checked={settings.border.enabled}
              onInput={(e: any) => updateBorder({ enabled: e.target?.checked ?? e.detail?.checked ?? !settings.border.enabled })}
            />
          </s-stack>

          {settings.border.enabled && (
            <s-stack gap="small" style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 100px', minWidth: '80px' }}>
                  <s-text>Border Width</s-text>
                  <input
                    type="number"
                    value={settings.border.width}
                    onChange={(e: any) => updateBorder({ width: parseInt(e.target.value) || 1 })}
                    placeholder="1"
                    min="0"
                    max="20"
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
                  <s-select
                    label="Border Style"
                    value={settings.border.style}
                    onChange={(e: any) => updateBorder({ style: e.target.value || e.detail?.value || settings.border.style })}
                  >
                    <s-option value="solid">Solid</s-option>
                    <s-option value="dashed">Dashed</s-option>
                    <s-option value="dotted">Dotted</s-option>
                    <s-option value="double">Double</s-option>
                    <s-option value="none">None</s-option>
                  </s-select>
                </div>
                <div style={{ flex: '1 1 100px', minWidth: '80px' }}>
                  <s-text>Border Radius</s-text>
                  <input
                    type="number"
                    value={settings.border.radius}
                    onChange={(e: any) => updateBorder({ radius: parseInt(e.target.value) || 0 })}
                    placeholder="6"
                    min="0"
                    max="50"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ flex: '1 1 100px', minWidth: '80px' }}>
                  <s-text>Border Padding</s-text>
                  <input
                    type="number"
                    value={settings.border.padding}
                    onChange={(e: any) => updateBorder({ padding: parseInt(e.target.value) || 16 })}
                    placeholder="16"
                    min="0"
                    max="100"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ flex: '0 0 auto' }}>
                  <s-text style={{ marginBottom: '8px', display: 'block' }}>Border Color</s-text>
                  <CompactColorSwatch
                    value={settings.border.color || '#9ca3af'}
                    onChange={(color) => updateBorder({ color })}
                  />
                </div>
              </div>
            </s-stack>
          )}
        </div>
      </s-stack>
    </s-box>
  );
}

