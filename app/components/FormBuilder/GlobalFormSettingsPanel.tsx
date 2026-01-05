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

              <s-stack direction="inline" gap="small" alignItems="flex-end">
                <div>
                  <s-text style={{ marginBottom: '8px', display: 'block' }}>Color</s-text>
                  <CompactColorSwatch
                    value={settings.headline.color}
                    onChange={(color) => updateHeadline({ color })}
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
                <div style={{ flex: 1 }}>
                  <s-select
                    label="Font Family"
                    value={settings.headline.fontFamily}
                    onChange={(e: any) => updateHeadline({ fontFamily: e.target.value || e.detail?.value || settings.headline.fontFamily })}
                  >
                    <s-option value="cairo">Cairo</s-option>
                    <s-option value="nunito">Nunito</s-option>
                    <s-option value="poppins">Poppins</s-option>
                    <s-option value="montserrat">Montserrat</s-option>
                  </s-select>
                </div>
                <div style={{ flex: 1 }}>
                  <s-text>Font Size</s-text>
                  <s-text-field
                    value={settings.headline.fontSize}
                    onChange={(e: any) => updateHeadline({ fontSize: e.target.value })}
                    placeholder="e.g., 24px"
                  />
                </div>
                <div>
                  <s-text style={{ marginBottom: '8px', display: 'block' }}>Font Style</s-text>
                  <s-stack direction="inline" gap="small">
                    <s-button
                      variant={settings.headline.fontWeight === 'bold' ? 'primary' : 'secondary'}
                      size="small"
                      onClick={() => {
                        const currentWeight = settings.headline.fontWeight || 'normal';
                        updateHeadline({ fontWeight: currentWeight === 'bold' ? 'normal' : 'bold' });
                      }}
                      aria-label="Bold"
                    >
                      <Bold size={18} />
                    </s-button>
                    <s-button
                      variant={settings.headline.fontStyle === 'italic' ? 'primary' : 'secondary'}
                      size="small"
                      onClick={() => {
                        const currentStyle = settings.headline.fontStyle || 'normal';
                        updateHeadline({ fontStyle: currentStyle === 'italic' ? 'normal' : 'italic' });
                      }}
                      aria-label="Italic"
                    >
                      <Italic size={18} />
                    </s-button>
                  </s-stack>
                </div>
              </s-stack>

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

              <s-stack direction="inline" gap="small" alignItems="flex-end">
                <div>
                  <s-text style={{ marginBottom: '8px', display: 'block' }}>Color</s-text>
                  <CompactColorSwatch
                    value={settings.subtitle.color}
                    onChange={(color) => updateSubtitle({ color })}
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
                <div style={{ flex: 1 }}>
                  <s-select
                    label="Font Family"
                    value={settings.subtitle.fontFamily}
                    onChange={(e: any) => updateSubtitle({ fontFamily: e.target.value || e.detail?.value || settings.subtitle.fontFamily })}
                  >
                    <s-option value="cairo">Cairo</s-option>
                    <s-option value="nunito">Nunito</s-option>
                    <s-option value="poppins">Poppins</s-option>
                    <s-option value="montserrat">Montserrat</s-option>
                  </s-select>
                </div>
                <div style={{ flex: 1 }}>
                  <s-text>Font Size</s-text>
                  <s-text-field
                    value={settings.subtitle.fontSize}
                    onChange={(e: any) => updateSubtitle({ fontSize: e.target.value })}
                    placeholder="e.g., 16px"
                  />
                </div>
                <div>
                  <s-text style={{ marginBottom: '8px', display: 'block' }}>Font Style</s-text>
                  <s-stack direction="inline" gap="small">
                    <s-button
                      variant={settings.subtitle.fontWeight === 'bold' ? 'primary' : 'secondary'}
                      size="small"
                      onClick={() => {
                        const currentWeight = settings.subtitle.fontWeight || 'normal';
                        updateSubtitle({ fontWeight: currentWeight === 'bold' ? 'normal' : 'bold' });
                      }}
                      aria-label="Bold"
                    >
                      <Bold size={18} />
                    </s-button>
                    <s-button
                      variant={settings.subtitle.fontStyle === 'italic' ? 'primary' : 'secondary'}
                      size="small"
                      onClick={() => {
                        const currentStyle = settings.subtitle.fontStyle || 'normal';
                        updateSubtitle({ fontStyle: currentStyle === 'italic' ? 'normal' : 'italic' });
                      }}
                      aria-label="Italic"
                    >
                      <Italic size={18} />
                    </s-button>
                  </s-stack>
                </div>
              </s-stack>

            </s-stack>
          )}
        </div>
      </s-stack>
    </s-box>
  );
}

