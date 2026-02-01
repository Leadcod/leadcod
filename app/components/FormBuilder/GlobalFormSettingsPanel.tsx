'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@/app/components/ui/font-awesome-icon';
import { useTranslations } from 'next-intl';
import { GlobalFormSettings } from '@/app/types/form';
import CompactColorSwatch from '@/app/components/ui/compact-color-swatch';

const GLOBAL_SETTINGS_TABS = ['thankYou', 'font', 'headline', 'subtitle', 'inputPadding', 'currency', 'shadow'] as const;
type GlobalSettingsTabId = (typeof GLOBAL_SETTINGS_TABS)[number];

interface GlobalFormSettingsPanelProps {
  settings: GlobalFormSettings;
  onUpdate: (updates: Partial<GlobalFormSettings>) => void;
  onClose: () => void;
}

export default function GlobalFormSettingsPanel({ settings, onUpdate, onClose }: GlobalFormSettingsPanelProps) {
  const t = useTranslations('formBuilder');
  const [activeTab, setActiveTab] = useState<GlobalSettingsTabId>('thankYou');
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

  const thankYouPopup = settings.thankYouPopup ?? {
    title: 'شكراً لك!',
    message: 'تم تقديم طلبك بنجاح. سنتواصل معك قريباً.',
    buttonText: 'موافق'
  };
  const updateThankYouPopup = (updates: Partial<NonNullable<GlobalFormSettings['thankYouPopup']>>) => {
    onUpdate({
      thankYouPopup: { ...thankYouPopup, ...updates }
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
          <h3 style={{ fontWeight: 600, margin: 0 }}>{t('globalFormSettings')}</h3>
          <s-button
            variant="auto"
            onClick={onClose}
          >
            <FontAwesomeIcon icon="XMark" size={20} />
          </s-button>
        </s-stack>

        <div
          role="tablist"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            borderBottom: '1px solid #e5e7eb',
            marginBottom: 12,
            minHeight: 36
          }}
        >
          {GLOBAL_SETTINGS_TABS.map((tabId) => (
            <button
              key={tabId}
              type="button"
              role="tab"
              aria-selected={activeTab === tabId}
              onClick={() => setActiveTab(tabId)}
              style={{
                padding: '8px 12px',
                fontSize: 13,
                fontWeight: activeTab === tabId ? 600 : 500,
                border: 'none',
                borderBottom: activeTab === tabId ? '2px solid #000' : '2px solid transparent',
                background: 'none',
                color: activeTab === tabId ? '#111' : '#6b7280',
                cursor: 'pointer',
                marginBottom: -1
              }}
            >
              {t(`tab_${tabId}`)}
            </button>
          ))}
        </div>

        {activeTab === 'thankYou' && (
        <div>
          <h4 style={{ fontWeight: 600, margin: '0 0 12px 0' }} title={t('thankYouPopupDescription')}>{t('thankYouPopupSection')}</h4>
          <s-stack gap="small" style={{ marginTop: 12 }}>
            <div>
              <s-text>{t('thankYouPopupTitle')}</s-text>
              <s-text-field
                value={thankYouPopup.title}
                onChange={(e: any) => updateThankYouPopup({ title: e.target?.value ?? e.detail?.value ?? thankYouPopup.title })}
                placeholder={t('thankYouPopupTitlePlaceholder')}
              />
            </div>
            <div>
              <s-text>{t('thankYouPopupMessage')}</s-text>
              <textarea
                value={thankYouPopup.message}
                onChange={(e: any) => updateThankYouPopup({ message: e.target?.value ?? thankYouPopup.message })}
                placeholder={t('thankYouPopupMessagePlaceholder')}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>
            <div>
              <s-text>{t('thankYouPopupButtonText')}</s-text>
              <s-text-field
                value={thankYouPopup.buttonText}
                onChange={(e: any) => updateThankYouPopup({ buttonText: e.target?.value ?? e.detail?.value ?? thankYouPopup.buttonText })}
                placeholder={t('thankYouPopupButtonTextPlaceholder')}
              />
            </div>
          </s-stack>
        </div>
        )}

        {activeTab === 'font' && (
        <div title={t('fontSettingsDescription')}>
          <h4 style={{ fontWeight: 600, margin: '0 0 12px 0' }}>{t('fontSettingsColor')}</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
              <s-text >{t('primaryColor')}</s-text>
              <CompactColorSwatch
                value={settings.primaryColor}
                onChange={(color) => onUpdate({ primaryColor: color })}
              />
            </div>
            <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
              <s-select
                label={t('fontFamily')}
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
              <s-text>{t('fontSize')}</s-text>
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
              <s-text>{t('fontStyle')}</s-text>
              <s-stack direction="inline" gap="small">
                <s-button
                  variant={settings.fontWeight === 'bold' ? 'primary' : 'secondary'}
                  
                  onClick={() => {
                    const currentWeight = settings.fontWeight || 'normal';
                    onUpdate({ fontWeight: currentWeight === 'bold' ? 'normal' : 'bold' });
                  }}
                  aria-label="Bold"
                >
                  <span className="font-bold text-[18px]">B</span>
                </s-button>
                <s-button
                  variant={settings.fontStyle === 'italic' ? 'primary' : 'secondary'}
                  
                  onClick={() => {
                    const currentStyle = settings.fontStyle || 'normal';
                    onUpdate({ fontStyle: currentStyle === 'italic' ? 'normal' : 'italic' });
                  }}
                  aria-label="Italic"
                >
                  <span className="italic text-[18px]">I</span>
                </s-button>
              </s-stack>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'headline' && (
        <div>
          <s-stack direction="inline" justifyContent="space-between" alignItems="center">
            <h4 style={{ fontWeight: 600, margin: 0 }}>{t('headline')}</h4>
            <s-switch
              checked={settings.headline.enabled}
              onInput={(e: any) => updateHeadline({ enabled: e.target?.checked ?? e.detail?.checked ?? !settings.headline.enabled })}
            />
          </s-stack>

          {settings.headline.enabled && (
            <s-stack gap="small">
              <div>
                <s-text>{t('text')}</s-text>
                <s-text-field
                  value={settings.headline.text}
                  onChange={(e: any) => updateHeadline({ text: e.target.value })}
                />
              </div>
              <div>
                <s-text>{t('alignment')}</s-text>
                <s-stack direction="inline" gap="small">
                  <s-button
                    variant={settings.headline.alignment === 'left' ? 'primary' : 'secondary'}
                    
                    onClick={() => updateHeadline({ alignment: 'left' })}
                    aria-label="Align left"
                  >
                    <FontAwesomeIcon icon="Bars3BottomLeft" size={18} />
                  </s-button>
                  <s-button
                    variant={settings.headline.alignment === 'center' ? 'primary' : 'secondary'}
                    
                    onClick={() => updateHeadline({ alignment: 'center' })}
                    aria-label="Align center"
                  >
                    <FontAwesomeIcon icon="Bars3" size={18} />
                  </s-button>
                  <s-button
                    variant={settings.headline.alignment === 'right' ? 'primary' : 'secondary'}
                    
                    onClick={() => updateHeadline({ alignment: 'right' })}
                    aria-label="Align right"
                  >
                    <FontAwesomeIcon icon="Bars3BottomRight" size={18} />
                  </s-button>
                </s-stack>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
                  <s-text>{t('textColor')}</s-text>
                  <CompactColorSwatch
                    value={settings.headline.color || settings.primaryColor}
                    onChange={(color) => updateHeadline({ color })}
                  />
                </div>
                <div style={{ flex: '1 1 100px', minWidth: '80px' }}>
                  <s-text>{t('fontSize')}</s-text>
                  <input
                    type="number"
                    value={parseInt((settings.headline.fontSize || '24px').replace('px', '')) || 24}
                    onChange={(e: any) => {
                      const numValue = parseInt(e.target.value) || 24;
                      updateHeadline({ fontSize: `${numValue}px` });
                    }}
                    placeholder="24"
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
                  <s-text>{t('fontStyle')}</s-text>
                  <s-stack direction="inline" gap="small">
                    <s-button
                      variant={settings.headline.fontWeight === 'bold' || settings.headline.fontWeight === '700' ? 'primary' : 'secondary'}
                      onClick={() => {
                        const currentWeight = settings.headline.fontWeight || 'bold';
                        updateHeadline({ fontWeight: currentWeight === 'bold' || currentWeight === '700' ? 'normal' : 'bold' });
                      }}
                      aria-label="Bold"
                    >
                      <span className="font-bold text-[18px]">B</span>
                    </s-button>
                    <s-button
                      variant={settings.headline.fontStyle === 'italic' ? 'primary' : 'secondary'}
                      onClick={() => {
                        const currentStyle = settings.headline.fontStyle || 'normal';
                        updateHeadline({ fontStyle: currentStyle === 'italic' ? 'normal' : 'italic' });
                      }}
                      aria-label="Italic"
                    >
                      <span className="italic text-[18px]">I</span>
                    </s-button>
                  </s-stack>
                </div>
              </div>
            </s-stack>
          )}
        </div>
        )}

        {activeTab === 'subtitle' && (
        <div>
            <s-stack direction="inline" justifyContent="space-between" alignItems="center">
            <h4 style={{ fontWeight: 600, margin: 0 }}>{t('subtitle')}</h4>
            <s-switch
              checked={settings.subtitle.enabled}
              onInput={(e: any) => updateSubtitle({ enabled: e.target?.checked ?? e.detail?.checked ?? !settings.subtitle.enabled })}
            />
          </s-stack>

          {settings.subtitle.enabled && (
            <s-stack gap="small">
              <div>
                <s-text>{t('text')}</s-text>
                <s-text-field
                  value={settings.subtitle.text}
                  onChange={(e: any) => updateSubtitle({ text: e.target.value })}
                />
              </div>
              <div>
                <s-text>{t('alignment')}</s-text>
                <s-stack direction="inline" gap="small">
                  <s-button
                    variant={settings.subtitle.alignment === 'left' ? 'primary' : 'secondary'}
                    onClick={() => updateSubtitle({ alignment: 'left' })}
                    aria-label="Align left"
                  >
                    <FontAwesomeIcon icon="Bars3BottomLeft" size={18} />
                  </s-button>
                  <s-button
                    variant={settings.subtitle.alignment === 'center' ? 'primary' : 'secondary'}
                    onClick={() => updateSubtitle({ alignment: 'center' })}
                    aria-label="Align center"
                  >
                    <FontAwesomeIcon icon="Bars3" size={18} />
                  </s-button>
                  <s-button
                    variant={settings.subtitle.alignment === 'right' ? 'primary' : 'secondary'}
                    onClick={() => updateSubtitle({ alignment: 'right' })}
                    aria-label="Align right"
                  >
                    <FontAwesomeIcon icon="Bars3BottomRight" size={18} />
                  </s-button>
                </s-stack>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
                  <s-text>{t('textColor')}</s-text>
                  <CompactColorSwatch
                    value={settings.subtitle.color || settings.primaryColor}
                    onChange={(color) => updateSubtitle({ color })}
                  />
                </div>
                <div style={{ flex: '1 1 100px', minWidth: '80px' }}>
                  <s-text>{t('fontSize')}</s-text>
                  <input
                    type="number"
                    value={parseInt((settings.subtitle.fontSize || settings.fontSize || '16px').replace('px', '')) || 16}
                    onChange={(e: any) => {
                      const numValue = parseInt(e.target.value) || 16;
                      updateSubtitle({ fontSize: `${numValue}px` });
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
                  <s-text>{t('fontStyle')}</s-text>
                  <s-stack direction="inline" gap="small">
                    <s-button
                      variant={settings.subtitle.fontWeight === 'bold' || settings.subtitle.fontWeight === '700' ? 'primary' : 'secondary'}
                      onClick={() => {
                        const currentWeight = settings.subtitle.fontWeight || 'normal';
                        updateSubtitle({ fontWeight: currentWeight === 'bold' || currentWeight === '700' ? 'normal' : 'bold' });
                      }}
                      aria-label="Bold"
                    >
                      <span className="font-bold text-[18px]">B</span>
                    </s-button>
                    <s-button
                      variant={settings.subtitle.fontStyle === 'italic' ? 'primary' : 'secondary'}
                      onClick={() => {
                        const currentStyle = settings.subtitle.fontStyle || 'normal';
                        updateSubtitle({ fontStyle: currentStyle === 'italic' ? 'normal' : 'italic' });
                      }}
                      aria-label="Italic"
                    >
                      <span className="italic text-[18px]">I</span>
                    </s-button>
                  </s-stack>
                </div>
              </div>
            </s-stack>
          )}
        </div>
        )}

        {activeTab === 'inputPadding' && (
        <div title={t('inputPaddingDescription')}>
          <h4 style={{ fontWeight: 600, margin: '0 0 12px 0' }}>{t('inputPadding')}</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 100px', minWidth: '80px' }}>
              <s-text>{t('verticalPadding')}</s-text>
              <input
                type="number"
                value={settings.inputPadding?.vertical ?? 12}
                onChange={(e: any) => onUpdate({ 
                  inputPadding: { 
                    vertical: parseInt(e.target.value) || 12,
                    horizontal: settings.inputPadding?.horizontal ?? 12
                  } 
                })}
                placeholder="12"
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
              <s-text>{t('horizontalPadding')}</s-text>
              <input
                type="number"
                value={settings.inputPadding?.horizontal ?? 12}
                onChange={(e: any) => onUpdate({ 
                  inputPadding: { 
                    vertical: settings.inputPadding?.vertical ?? 12,
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
        </div>
        )}

        {activeTab === 'currency' && (
        <div>
          <h4 style={{ fontWeight: 600, margin: '0 0 12px 0' }}>{t('currency')}</h4>
          <div title={t('currencyDescription')}>
            <s-text>{t('currencySymbol')}</s-text>
            <s-text-field
              value={settings.currency || 'دج'}
              onChange={(e: any) => onUpdate({ currency: e.target.value ?? e.detail?.value ?? 'دج' })}
              placeholder="دج, $, €…"
            />
          </div>
        </div>
        )}

        {activeTab === 'shadow' && (
        <div>
          <s-stack direction="inline" justifyContent="space-between" alignItems="center">
            <h4 style={{ fontWeight: 600, margin: 0 }}>{t('formShadow')}</h4>
            <s-switch
              checked={settings.border.enabled}
              onInput={(e: any) => updateBorder({ enabled: e.target?.checked ?? e.detail?.checked ?? !settings.border.enabled })}
            />
          </s-stack>

          {settings.border.enabled && (
            <s-stack gap="small">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 100px', minWidth: '80px' }}>
                  <s-text>{t('blurRadius')}</s-text>
                  <input
                    type="number"
                    value={settings.border.width}
                    onChange={(e: any) => updateBorder({ width: parseInt(e.target.value) || 4 })}
                    placeholder="4"
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
                  <s-text>{t('borderRadius')}</s-text>
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
                  <s-text>{t('padding')}</s-text>
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
                  <s-text>{t('shadowColor')}</s-text>
                  <CompactColorSwatch
                    value={settings.border.color || '#9ca3af'}
                    onChange={(color) => updateBorder({ color })}
                  />
                </div>
              </div>
            </s-stack>
          )}
        </div>
        )}
      </s-stack>
    </s-box>
  );
}

