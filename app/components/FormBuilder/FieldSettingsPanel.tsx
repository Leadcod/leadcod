'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@/app/components/ui/font-awesome-icon';
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

// Helper function to get icon component (handles WhatsApp and Font Awesome)
const getIconComponent = (iconName: string) => {
  if (iconName === 'WhatsApp') {
    return WhatsAppIcon;
  }
  // Return FontAwesomeIcon component for all other icons
  return (props: any) => <FontAwesomeIcon icon={iconName} {...props} />;
};

interface FieldSettingsPanelProps {
  field: FormField;
  onUpdate: (id: string, updates: Partial<FormField>) => void;
  onClose: () => void;
  onApplyToAll: (sourceFieldId: string) => void;
}

export default function FieldSettingsPanel({ field, onUpdate, onClose, onApplyToAll }: FieldSettingsPanelProps) {
  const t = useTranslations('formBuilder');
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
          <h3 style={{ fontWeight: 600, margin: 0 }}>{t('fieldSettings')}</h3>
          <s-button
            variant="auto"
            onClick={onClose}
          >
            <FontAwesomeIcon icon="XMark" size={20} />
          </s-button>
        </s-stack>

        <s-divider />

        {/* ========== BASIC SETTINGS ========== */}
        <s-stack gap="small">
          <h4 style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{t('basicSettings')}</h4>
          
          {/* Button Text Settings */}
          {field.type === 'buyButton' ? (
            <s-stack gap="small">
              <div>
                <s-text>{t('buttonText')}</s-text>
                <s-text-field
                  value={field.label}
                  onChange={(e: any) => onUpdate(field.id, { label: e.target.value })}
                />
              </div>
              <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                <s-text>{t('showQuantitySelector')}</s-text>
                <s-switch
                  checked={field.showQuantity !== false}
                  onInput={(e: any) => onUpdate(field.id, { showQuantity: e.target?.checked ?? e.detail?.checked ?? field.showQuantity !== false })}
                />
              </s-stack>
            </s-stack>
          ) : field.type === 'whatsappButton' ? (
            <s-stack gap="small">
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 60%', minWidth: 0 }}>
                  <s-text>{t('buttonText')}</s-text>
                  <s-text-field
                    value={field.label}
                    onChange={(e: any) => onUpdate(field.id, { label: e.target.value })}
                  />
                </div>
                <div style={{ flex: '1 1 40%', minWidth: 0 }} title={t('whatsappNumberHint')}>
                  <s-text>{t('whatsappNumber')}</s-text>
                  <s-text-field
                    value={field.whatsappNumber || ''}
                    onChange={(e: any) => onUpdate(field.id, { whatsappNumber: e.target.value })}
                    placeholder="213000000000"
                  />
                </div>
              </div>
            </s-stack>
          ) : field.type === 'summary' ? (
            /* Summary Field Settings */
            <s-stack gap="small">
              <div title={t('summaryPlaceholderHint')}>
                <s-text>{t('placeholder')}</s-text>
                <s-text-field
                  value={field.summaryPlaceholder || '-'}
                  onChange={(e: any) => onUpdate(field.id, { summaryPlaceholder: e.target.value })}
                  placeholder="-"
                />
              </div>
              <div>
                <s-text>{t('totalLabel')}</s-text>
                <s-text-field
                  value={field.totalLabel || t('total')}
                  onChange={(e: any) => onUpdate(field.id, { totalLabel: e.target.value })}
                  placeholder={t('total')}
                />
              </div>
              <div title={t('shippingLabelHint')}>
                <s-text>{t('shippingLabel')}</s-text>
                <s-text-field
                  value={field.shippingLabel || t('shippingPrice')}
                  onChange={(e: any) => onUpdate(field.id, { shippingLabel: e.target.value })}
                  placeholder={t('shippingPrice')}
                />
              </div>
              <div title={t('chooseProvinceHintDescription')}>
                <s-text>{t('chooseProvinceHint')}</s-text>
                <s-text-field
                  value={field.chooseProvinceHint || t('chooseProvince')}
                  onChange={(e: any) => onUpdate(field.id, { chooseProvinceHint: e.target.value })}
                  placeholder={t('chooseProvince')}
                />
              </div>
              <div title={t('selectShippingOptionHintDescription')}>
                <s-text>{t('selectShippingOptionHint')}</s-text>
                <s-text-field
                  value={field.selectShippingOptionHint || t('selectShippingOption')}
                  onChange={(e: any) => onUpdate(field.id, { selectShippingOptionHint: e.target.value })}
                  placeholder={t('selectShippingOption')}
                />
              </div>
              <div>
                <div style={{ marginBottom: '6px' }}>
                  <s-text>{t('textAlignment')}</s-text>
                </div>
                <s-stack direction="inline" gap="small">
                  <s-button
                    variant={(field.summaryAlignment || 'right') === 'left' ? 'primary' : 'secondary'}
                    onClick={() => onUpdate(field.id, { summaryAlignment: 'left' })}
                    aria-label="Align left"
                  >
                    <FontAwesomeIcon icon="Bars3BottomLeft" size={18} />
                  </s-button>
                  <s-button
                    variant={(field.summaryAlignment || 'right') === 'center' ? 'primary' : 'secondary'}
                    onClick={() => onUpdate(field.id, { summaryAlignment: 'center' })}
                    aria-label="Align center"
                  >
                    <FontAwesomeIcon icon="Bars3" size={18} />
                  </s-button>
                  <s-button
                    variant={(field.summaryAlignment || 'right') === 'right' ? 'primary' : 'secondary'}
                    onClick={() => onUpdate(field.id, { summaryAlignment: 'right' })}
                    aria-label="Align right"
                  >
                    <FontAwesomeIcon icon="Bars3BottomRight" size={18} />
                  </s-button>
                </s-stack>
              </div>
            </s-stack>
          ) : field.type === 'shippingOption' ? (
            /* Shipping Option Field Settings */
            <s-stack gap="small">
              <div>
                <div style={{ marginBottom: '6px' }}>
                  <s-text>{t('textAlignment')}</s-text>
                </div>
                <s-stack direction="inline" gap="small">
                  <s-button
                    variant={(field.shippingAlignment || 'right') === 'left' ? 'primary' : 'secondary'}
                    onClick={() => onUpdate(field.id, { shippingAlignment: 'left' })}
                    aria-label="Align left"
                  >
                    <FontAwesomeIcon icon="Bars3BottomLeft" size={18} />
                  </s-button>
                  <s-button
                    variant={(field.shippingAlignment || 'right') === 'center' ? 'primary' : 'secondary'}
                    onClick={() => onUpdate(field.id, { shippingAlignment: 'center' })}
                    aria-label="Align center"
                  >
                    <FontAwesomeIcon icon="Bars3" size={18} />
                  </s-button>
                  <s-button
                    variant={(field.shippingAlignment || 'right') === 'right' ? 'primary' : 'secondary'}
                    onClick={() => onUpdate(field.id, { shippingAlignment: 'right' })}
                    aria-label="Align right"
                  >
                    <FontAwesomeIcon icon="Bars3BottomRight" size={18} />
                  </s-button>
                </s-stack>
              </div>
            </s-stack>
          ) : field.type === 'quantity' ? (
            /* Quantity Field - Minimal Settings Only */
            <s-stack gap="small">
              <div title={t('quantityFieldDescription')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FontAwesomeIcon icon="InfoCircle" size={16} style={{ color: '#6b7280', flexShrink: 0 }} />
                <s-text>{t('quantityFieldShort')}</s-text>
              </div>
            </s-stack>
          ) : (
            /* Input Label Settings */
            <s-stack gap="small">
              <div>
                <div style={{ marginBottom: '6px' }}>
                  <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                    <s-text>{t('label')}</s-text>
                    <s-stack direction="inline" gap="small" alignItems="center">
                      <s-text>{t('show')}</s-text>
                      <s-switch
                        checked={field.showLabel}
                        onInput={(e: any) => onUpdate(field.id, { showLabel: e.target?.checked ?? e.detail?.checked ?? !field.showLabel })}
                      />
                      <s-text>
                        {t('required')}
                        {isAlwaysRequired(field.type) && (
                          <span style={{ fontSize: '11px', opacity: 0.6, marginLeft: '4px' }}>
                            {t('always')}
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
                </div>
                <s-text-field
                  value={field.label}
                  onChange={(e: any) => onUpdate(field.id, { label: e.target.value })}
                  disabled={!field.showLabel}
                />
              </div>
              
              {/* Placeholder - Only for input fields (not summary, shippingOption, or buttons) */}
              <div>
                <div style={{ marginBottom: '6px' }}>
                  <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                    <s-text>{t('placeholder')}</s-text>
                    <s-switch
                      checked={field.showPlaceholder}
                      onInput={(e: any) => onUpdate(field.id, { showPlaceholder: e.target?.checked ?? e.detail?.checked ?? !field.showPlaceholder })}
                    />
                  </s-stack>
                </div>
                <s-text-field
                  value={field.placeholder}
                  onInput={(e: any) => onUpdate(field.id, { placeholder: e.target.value })}
                  disabled={!field.showPlaceholder}
                />
              </div>
              {field.type === 'city' && (
                <div title={t('selectProvinceFirstHintDescription')}>
                  <s-text>{t('selectProvinceFirstHint')}</s-text>
                  <s-text-field
                    value={field.selectProvinceFirstHint || t('selectProvinceFirst')}
                    onInput={(e: any) => onUpdate(field.id, { selectProvinceFirstHint: e.target.value })}
                    placeholder={t('selectProvinceFirst')}
                  />
                </div>
              )}
              {field.type === 'phone' && (
                <s-stack gap="small">
                  <div title="Shown when user enters non-numeric characters">
                    <s-text>خطأ: أرقام فقط</s-text>
                    <s-text-field
                      value={field.phoneErrorNumbersOnly || 'يجب أن يحتوي رقم الهاتف على أرقام فقط'}
                      onInput={(e: any) => onUpdate(field.id, { phoneErrorNumbersOnly: e.target.value })}
                      placeholder="يجب أن يحتوي رقم الهاتف على أرقام فقط"
                    />
                  </div>
                  <div title="Shown when number doesn't start with valid prefix">
                    <s-text>خطأ: بادئة غير صحيحة</s-text>
                    <s-text-field
                      value={field.phoneErrorInvalidPrefix || 'يجب أن يبدأ رقم الهاتف بـ 05، 06، 07، 5، 6، أو 7'}
                      onInput={(e: any) => onUpdate(field.id, { phoneErrorInvalidPrefix: e.target.value })}
                      placeholder="يجب أن يبدأ رقم الهاتف بـ 05، 06، 07، 5، 6، أو 7"
                    />
                  </div>
                  <div title="Shown when number starts with 0 but not 10 digits">
                    <s-text>خطأ: طول خاطئ (10 أرقام)</s-text>
                    <s-text-field
                      value={field.phoneErrorWrongLength10 || 'يجب أن يكون رقم الهاتف 10 أرقام بالضبط عند البدء بـ 0'}
                      onInput={(e: any) => onUpdate(field.id, { phoneErrorWrongLength10: e.target.value })}
                      placeholder="يجب أن يكون رقم الهاتف 10 أرقام بالضبط عند البدء بـ 0"
                    />
                  </div>
                  <div title="Shown when number starts with 5, 6, or 7 but not 9 digits">
                    <s-text>خطأ: طول خاطئ (9 أرقام)</s-text>
                    <s-text-field
                      value={field.phoneErrorWrongLength9 || 'يجب أن يكون رقم الهاتف 9 أرقام بالضبط عند البدء بـ 5، 6، أو 7'}
                      onInput={(e: any) => onUpdate(field.id, { phoneErrorWrongLength9: e.target.value })}
                      placeholder="يجب أن يكون رقم الهاتف 9 أرقام بالضبط عند البدء بـ 5، 6، أو 7"
                    />
                  </div>
                </s-stack>
              )}
            </s-stack>
          )}
        </s-stack>

        <s-divider />

        {/* ========== VISUAL SETTINGS ========== */}
        <s-stack gap="small">
          <h4 style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{t('visualSettings')}</h4>
          
          {/* Icon Section - Not for summary, shippingOption, or quantity */}
          {field.type !== 'summary' && field.type !== 'shippingOption' && field.type !== 'quantity' && (
            <div>
              <s-select
                label={field.type === 'buyButton' || field.type === 'whatsappButton' ? t('buttonIcon') : t('inputIcon')}
                value={field.icon}
                onChange={(e: any) => onUpdate(field.id, { icon: e.target.value || e.detail?.value || field.icon })}
              >
                <s-option value="none">{t('none')}</s-option>
                {(field.type === 'whatsappButton' ? WHATSAPP_BUTTON_ICONS : (field.type === 'buyButton' ? BUY_NOW_ICONS : AVAILABLE_ICONS)).map((iconName) => (
                  <s-option key={iconName} value={iconName}>
                    {iconName}
                  </s-option>
                ))}
              </s-select>
              <div style={{ marginTop: '8px' }}>
                <s-stack direction="inline" gap="base" alignItems="center">
                  {(() => {
                    if (field.icon === 'none') {
                      return <s-text>{t('none')}</s-text>;
                    }
                    const IconComp = getIconComponent(field.icon);
                    if (!IconComp) return null;
                    // Font Awesome icons, just need to set size
                    return <IconComp size={24} />;
                  })()}
                  <s-text>{t('preview')}</s-text>
                </s-stack>
              </div>
            </div>
          )}

          {/* Colors Section */}
          {field.type === 'buyButton' || field.type === 'whatsappButton' ? (
            /* Button Colors */
            <s-stack gap="small">
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 50%', minWidth: 0 }}>
                  <s-text>{t('textColor')}</s-text>
                  <CompactColorSwatch
                    value={field.inputTextColor}
                    onChange={(color) => onUpdate(field.id, { inputTextColor: color })}
                  />
                </div>
                <div style={{ flex: '1 1 50%', minWidth: 0, position: 'relative' }}>
                  <s-text>{t('background')}</s-text>
                  <div
                    onClick={() => setShowBackgroundSettings(!showBackgroundSettings)}
                    style={{
                      width: '32px',
                      height: '32px',
                      position: 'relative',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: '1px solid #d1d5db',
                      boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.1)',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}
                  >
                    {/* Checkered pattern background - always visible */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `
                          linear-gradient(45deg, #e5e5e5 25%, transparent 25%),
                          linear-gradient(-45deg, #e5e5e5 25%, transparent 25%),
                          linear-gradient(45deg, transparent 75%, #e5e5e5 75%),
                          linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)
                        `,
                        backgroundSize: '8px 8px',
                        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                        zIndex: 0
                      }}
                    />
                    {/* Color/Gradient overlay - on top of pattern */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: field.backgroundType === 'gradient' && field.gradientBackground
                          ? field.gradientBackground
                          : (field.inputBackgroundColor || '#000000'),
                        zIndex: 1
                      }}
                    />
                  </div>
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
                            <s-text>{t('backgroundType')}</s-text>
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
                              <s-option value="solid">{t('solid')}</s-option>
                              <s-option value="gradient">{t('gradient')}</s-option>
                            </s-select>
                          </div>

                          {field.backgroundType === 'gradient' ? (
                            <s-stack gap="small">
                              <s-text>{t('gradientPresets')}</s-text>
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
                            </s-stack>
                          ) : (
                            <s-stack gap="small">
                              <s-text>{t('solidColor')}</s-text>
                              <s-color-picker 
                                value={field.inputBackgroundColor || '#000000'} 
                                alpha 
                                onChange={(e: any) => {
                                  const newColor = e?.target?.value || e?.detail?.value || field.inputBackgroundColor || '#000000';
                                  onUpdate(field.id, { inputBackgroundColor: newColor });
                                }}
                              />
                            </s-stack>
                          )}
                        </s-stack>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </s-stack>
          ) : field.type !== 'summary' && field.type !== 'shippingOption' && field.type !== 'quantity' ? (
            /* Input Colors - Only for actual input fields */
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 50%', minWidth: 0 }}>
                <s-text>{t('textColor')}</s-text>
                <CompactColorSwatch
                  value={field.inputTextColor}
                  onChange={(color) => onUpdate(field.id, { inputTextColor: color })}
                />
              </div>
              <div style={{ flex: '1 1 50%', minWidth: 0 }}>
                <s-text>{t('inputColors')}</s-text>
                <CompactColorSwatch
                  value={field.inputBackgroundColor}
                  onChange={(color) => onUpdate(field.id, { inputBackgroundColor: color })}
                />
              </div>
            </div>
          ) : null}
        </s-stack>

        {/* ========== BUTTON SETTINGS ========== */}
        {(field.type === 'buyButton' || field.type === 'whatsappButton') && (
          <>
            <s-divider />
            <s-stack gap="small">
              <h4 style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{t('buttonSettings')}</h4>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 50%', minWidth: 0 }}>
                  <s-text>{t('animation')}</s-text>
                  <s-select
                    value={field.animation || 'none'}
                    onChange={(e: any) => {
                      const animation = e.target.value || e.detail?.value || 'none';
                      onUpdate(field.id, { animation });
                    }}
                  >
                    <s-option value="none">{t('none')}</s-option>
                    <s-option value="background-shift">{t('backgroundShift')}</s-option>
                    <s-option value="shake">{t('shake')}</s-option>
                    <s-option value="bounce">{t('bounce')}</s-option>
                    <s-option value="pulse">{t('pulse')}</s-option>
                    <s-option value="glow">{t('glow')}</s-option>
                  </s-select>
                </div>
                <div style={{ flex: '1 1 50%', minWidth: 0 }}>
                  <s-text>{t('buttonSize')}</s-text>
                  <s-select
                    value={field.buttonSize || 'base'}
                    onChange={(e: any) => {
                      const buttonSize = e.target.value || e.detail?.value || 'base';
                      onUpdate(field.id, { buttonSize });
                    }}
                  >
                    <s-option value="small">{t('small')}</s-option>
                    <s-option value="base">{t('base')}</s-option>
                    <s-option value="large">{t('large')}</s-option>
                    <s-option value="extra-large">{t('extraLarge')}</s-option>
                  </s-select>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 50%', minWidth: 0 }}>
                  <s-text>{t('textSize')}</s-text>
                  <s-text-field
                    value={String(parseInt((field.buttonFontSize || '16px').replace('px', '')) || 16)}
                    onChange={(e: any) => {
                      const numValue = parseInt(e.target.value) || 16;
                      onUpdate(field.id, { buttonFontSize: `${numValue}px` });
                    }}
                    placeholder="16"
                  />
                </div>
                <div style={{ flex: '1 1 50%', minWidth: 0 }}>
                  <s-text>{t('iconSize')}</s-text>
                  <s-text-field
                    value={String(field.buttonIconSize || 20)}
                    onChange={(e: any) => {
                      const numValue = parseInt(e.target.value) || 20;
                      onUpdate(field.id, { buttonIconSize: numValue });
                    }}
                    placeholder="20"
                  />
                </div>
              </div>
            </s-stack>
          </>
        )}

        <s-divider />

        {/* ========== ADVANCED SETTINGS ========== */}
        {/* Only show Advanced Settings for input fields (not buttons, summary, shippingOption, or quantity) */}
        {field.type !== 'buyButton' && field.type !== 'whatsappButton' && field.type !== 'summary' && field.type !== 'shippingOption' && field.type !== 'quantity' && (
          <>
            <div>
              <s-button
                variant="secondary"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              >
                <span>{t('advancedSettings')}</span>
                {showAdvancedSettings ? <FontAwesomeIcon icon="ChevronUp" size={18} /> : <FontAwesomeIcon icon="ChevronDown" size={18} />}
              </s-button>
            </div>

            {/* Advanced Settings Content */}
            {showAdvancedSettings && (
              <s-stack gap="small">
                <div>
                  <div style={{ marginBottom: '6px' }}>
                    <s-text>{t('labelAlignment')}</s-text>
                  </div>
                  <s-stack direction="inline" gap="small">
                    <s-button
                      variant={(field.labelAlignment || 'right') === 'left' ? 'primary' : 'secondary'}
                      onClick={() => onUpdate(field.id, { labelAlignment: 'left' })}
                      aria-label="Align left"
                    >
                      <FontAwesomeIcon icon="Bars3BottomLeft" size={18} />
                    </s-button>
                    <s-button
                      variant={(field.labelAlignment || 'right') === 'center' ? 'primary' : 'secondary'}
                      onClick={() => onUpdate(field.id, { labelAlignment: 'center' })}
                      aria-label="Align center"
                    >
                      <FontAwesomeIcon icon="Bars3" size={18} />
                    </s-button>
                    <s-button
                      variant={(field.labelAlignment || 'right') === 'right' ? 'primary' : 'secondary'}
                      onClick={() => onUpdate(field.id, { labelAlignment: 'right' })}
                      aria-label="Align right"
                    >
                      <FontAwesomeIcon icon="Bars3BottomRight" size={18} />
                    </s-button>
                  </s-stack>
                </div>

                <div>
                  <div style={{ marginBottom: '6px' }}>
                    <s-text>{t('inputAlignment')}</s-text>
                  </div>
                  <s-stack direction="inline" gap="small">
                    <s-button
                      variant={(field.inputAlignment || 'right') === 'left' ? 'primary' : 'secondary'}
                      onClick={() => onUpdate(field.id, { inputAlignment: 'left' })}
                      aria-label="Align left"
                    >
                      <FontAwesomeIcon icon="Bars3BottomLeft" size={18} />
                    </s-button>
                    <s-button
                      variant={(field.inputAlignment || 'right') === 'center' ? 'primary' : 'secondary'}
                      onClick={() => onUpdate(field.id, { inputAlignment: 'center' })}
                      aria-label="Align center"
                    >
                      <FontAwesomeIcon icon="Bars3" size={18} />
                    </s-button>
                    <s-button
                      variant={(field.inputAlignment || 'right') === 'right' ? 'primary' : 'secondary'}
                      onClick={() => onUpdate(field.id, { inputAlignment: 'right' })}
                      aria-label="Align right"
                    >
                      <FontAwesomeIcon icon="Bars3BottomRight" size={18} />
                    </s-button>
                  </s-stack>
                </div>
              </s-stack>
            )}

            {/* Apply to all inputs button - Only for input fields */}
            <s-divider />
            <s-button
              variant="secondary"
              onClick={() => onApplyToAll(field.id)}
            >
              {t('applyToAll')}
            </s-button>
          </>
        )}
      </s-stack>
    </s-box>
  );
}

