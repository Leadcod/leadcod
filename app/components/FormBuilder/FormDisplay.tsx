'use client';

import { useState, FormEvent, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FormField, GlobalFormSettings } from '@/app/types/form';
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

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
  return (Icons as any)[iconName] || Icons.Circle;
};

interface State {
  id: string;
  code: string;
  name: string;
  nameAr: string;
}

interface City {
  id: string;
  name: string;
  nameAr: string;
}

interface FormDisplayProps {
  fields: FormField[];
  globalSettings?: GlobalFormSettings;
  onFieldClick?: (fieldId: string) => void;
  mode?: 'preview' | 'production';
  onSubmit?: (formData: Record<string, any>) => void;
  shippingMethod?: 'free' | 'per-province';
  stopDeskEnabled?: boolean;
  freeShippingLabel?: string;
  shopUrl?: string;
}

export default function FormDisplay({ 
  fields, 
  globalSettings, 
  onFieldClick, 
  mode = 'preview',
  onSubmit,
  shippingMethod = 'per-province',
  stopDeskEnabled = false,
  freeShippingLabel = 'Free',
  shopUrl
}: FormDisplayProps) {
  const t = useTranslations('formDisplay');
  const isPreview = mode === 'preview';
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [shippingFees, setShippingFees] = useState<{ cashOnDelivery: number | null; stopDesk: number | null } | null>(null);
  const [loadingShippingFees, setLoadingShippingFees] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [phoneErrors, setPhoneErrors] = useState<Record<string, string>>({});

  // Fetch states on mount (skip in preview mode)
  useEffect(() => {
    if (isPreview) return; // Skip API call in builder preview
    
    const fetchStates = async () => {
      setLoadingStates(true);
      try {
        const response = await fetch('/api/states');
        const result = await response.json();
        if (result.success) {
          setStates(result.data);
        }
      } catch (error) {
        console.error('Error fetching states:', error);
      } finally {
        setLoadingStates(false);
      }
    };
    fetchStates();
  }, [isPreview]);

  // Fetch cities when state is selected (skip in preview mode)
  useEffect(() => {
    if (isPreview) return; // Skip API call in builder preview
    
    const fetchCities = async () => {
      if (!selectedStateId) {
        setCities([]);
        return;
      }
      setLoadingCities(true);
      try {
        const response = await fetch(`/api/cities?stateId=${selectedStateId}`);
        const result = await response.json();
        if (result.success) {
          setCities(result.data);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, [selectedStateId, isPreview]);

  // Fetch shipping fees when state is selected and shipping method is per-province (skip in preview mode)
  useEffect(() => {
    if (isPreview) return; // Skip API call in builder preview
    
    const fetchShippingFees = async () => {
      if (!selectedStateId || !shopUrl) {
        setShippingFees(null);
        return;
      }
      setLoadingShippingFees(true);
      try {
        const response = await fetch(`/api/shipping-fees?shopUrl=${encodeURIComponent(shopUrl)}&stateId=${selectedStateId}`);
        const result = await response.json();
        if (result.success && result.data) {
          setShippingFees(result.data);
        } else {
          setShippingFees(null);
        }
      } catch (error) {
        console.error('Error fetching shipping fees:', error);
        setShippingFees(null);
      } finally {
        setLoadingShippingFees(false);
      }
    };
    fetchShippingFees();
  }, [selectedStateId, shopUrl, shippingMethod, isPreview]);

  // Sync selectedStateId with formData
  useEffect(() => {
    const provinceField = fields.find(f => f.type === 'province');
    if (provinceField && formData[provinceField.id] && formData[provinceField.id] !== selectedStateId) {
      setSelectedStateId(formData[provinceField.id]);
    }
  }, [formData, fields, selectedStateId]);

  // Handle province/state change
  const handleProvinceChange = (stateId: string) => {
    const provinceField = fields.find(f => f.type === 'province');
    const cityField = fields.find(f => f.type === 'city');
    if (provinceField) {
      setSelectedStateId(stateId);
      const updates: Record<string, any> = { [provinceField.id]: stateId };
      if (cityField) {
        updates[cityField.id] = ''; // Clear city when state changes
      }
      setFormData(prev => ({ ...prev, ...updates }));
      if (!isPreview) {
        handleInputChange(provinceField.id, stateId);
        if (cityField) {
          handleInputChange(cityField.id, '');
        }
      }
    }
  };

  // Filter only visible fields and sort by order
  // In preview mode (builder), always show shippingOption with placeholder values
  // In production mode, hide shippingOption if shipping method is 'free'
  const visibleFields = fields
    .filter((field) => {
      if (!field.visible) return false;
      // Shipping option is always shown (per-province method)
      return true;
    })
    .sort((a, b) => a.order - b.order);

  const getFontFamily = (fontFamily?: string) => {
    const fontToUse = fontFamily || globalSettings?.fontFamily || 'cairo';
    const fontMap: Record<string, string> = {
      cairo: 'var(--font-cairo)',
      nunito: 'var(--font-nunito)',
      poppins: 'var(--font-poppins)',
      montserrat: 'var(--font-montserrat)',
    };
    return fontMap[fontToUse] || 'var(--font-cairo)';
  };

  const getGlobalFontSize = () => {
    return globalSettings?.fontSize || '16px';
  };

  const getGlobalFontWeight = () => {
    return globalSettings?.fontWeight || 'normal';
  };

  const getGlobalFontStyle = () => {
    return globalSettings?.fontStyle || 'normal';
  };

  const getPrimaryColor = () => {
    return globalSettings?.primaryColor || '#000000';
  };

  const getTextAlign = (alignment: 'left' | 'center' | 'right') => {
    return alignment;
  };

  const validatePhone = (phone: string, field?: FormField): string | null => {
    if (!phone) return null;
    const trimmed = phone.trim();
    
    // Get custom error messages or use defaults (Arabic)
    const errorNumbersOnly = field?.phoneErrorNumbersOnly || 'يجب أن يحتوي رقم الهاتف على أرقام فقط';
    const errorInvalidPrefix = field?.phoneErrorInvalidPrefix || 'يجب أن يبدأ رقم الهاتف بـ 05، 06، 07، 5، 6، أو 7';
    const errorWrongLength10 = field?.phoneErrorWrongLength10 || 'يجب أن يكون رقم الهاتف 10 أرقام بالضبط عند البدء بـ 0';
    const errorWrongLength9 = field?.phoneErrorWrongLength9 || 'يجب أن يكون رقم الهاتف 9 أرقام بالضبط عند البدء بـ 5، 6، أو 7';
    
    // Check if phone contains only numbers
    if (!/^\d+$/.test(trimmed)) {
      return errorNumbersOnly;
    }
    
    // Check if phone starts with 05, 06, 07, 5, 6, or 7
    const validPattern = /^(05|06|07|5|6|7)/;
    if (!validPattern.test(trimmed)) {
      return errorInvalidPrefix;
    }
    
    // If starts with 0 (05, 06, 07), must be 10 digits
    // If starts with 5, 6, or 7 (without 0), must be 9 digits
    if (trimmed.startsWith('0')) {
      if (trimmed.length !== 10) {
        return errorWrongLength10;
      }
    } else {
      if (trimmed.length !== 9) {
        return errorWrongLength9;
      }
    }
    
    return null;
  };

  const handleInputChange = (fieldId: string, value: any) => {
    if (!isPreview) {
      // Validate phone field - only allow numbers
      const phoneField = fields.find(f => f.id === fieldId && f.type === 'phone');
      if (phoneField) {
        // Remove any non-numeric characters
        const numericValue = value.replace(/\D/g, '');
        // Limit based on starting digit: 10 if starts with 0, 9 otherwise
        let maxLength = 10;
        if (numericValue.length > 0 && !numericValue.startsWith('0')) {
          maxLength = 9;
        }
        const limitedValue = numericValue.slice(0, maxLength);
        setFormData(prev => ({ ...prev, [fieldId]: limitedValue }));
        // Don't validate on every keystroke - validation happens on blur/change
      } else {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
      }
    }
  };


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isPreview && onSubmit) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FormField) => {
    const IconComponent = field.icon === 'none' ? null : getIconComponent(field.icon);

    // Helper function to calculate icon size based on font size only (independent of padding)
    const getIconSize = (fontSize?: string, defaultSize: number = 16): number => {
      const fontSizeToUse = fontSize || getGlobalFontSize();
      const fontSizeNum = parseInt(fontSizeToUse.replace('px', '')) || defaultSize;
      // Calculate icon size based on font size only, not input height/padding
      // Icon should be about 1.2x the font size to maintain proper visual proportion
      return Math.round(fontSizeNum * 1.2);
    };

    // Helper function to calculate padding based on global settings or font size
    const getPadding = (fontSize?: string): string => {
      // Use global input padding if available
      if (globalSettings?.inputPadding) {
        return `${globalSettings.inputPadding.vertical}px ${globalSettings.inputPadding.horizontal}px`;
      }
      // Fallback to calculated padding based on font size
      const fontSizeToUse = fontSize || getGlobalFontSize();
      const fontSizeNum = parseInt(fontSizeToUse.replace('px', '')) || 16;
      // Padding scales with font size: base padding + proportional increase
      const basePadding = 8;
      const verticalPadding = Math.max(basePadding, Math.round(fontSizeNum * 0.5));
      const horizontalPadding = Math.max(12, Math.round(fontSizeNum * 0.75));
      return `${verticalPadding}px ${horizontalPadding}px`;
    };

    // Helper function to get horizontal-only padding for select fields
    const getHorizontalPadding = (fontSize?: string): string => {
      // Use global input padding if available
      if (globalSettings?.inputPadding) {
        return `0px ${globalSettings.inputPadding.horizontal}px`;
      }
      // Fallback to calculated padding based on font size
      const fontSizeToUse = fontSize || getGlobalFontSize();
      const fontSizeNum = parseInt(fontSizeToUse.replace('px', '')) || 16;
      const horizontalPadding = Math.max(12, Math.round(fontSizeNum * 0.75));
      return `0px ${horizontalPadding}px`;
    };

    // Helper function to calculate height based on font size and global padding
    const getHeight = (fontSize?: string): string => {
      const fontSizeToUse = fontSize || getGlobalFontSize();
      const fontSizeNum = parseInt(fontSizeToUse.replace('px', '')) || 16;
      // Use global input padding if available, otherwise calculate from font size
      const verticalPadding = globalSettings?.inputPadding?.vertical ?? Math.max(8, Math.round(fontSizeNum * 0.5));
      const height = fontSizeNum + (verticalPadding * 2) + 4; // 4px extra for border/line-height
      return `${height}px`;
    };

    const globalFontSize = getGlobalFontSize();
    const globalFontWeight = getGlobalFontWeight();
    const globalFontStyle = getGlobalFontStyle();
    const primaryColor = getPrimaryColor();

    const inputAlignment = field.inputAlignment || 'right';
    const inputStyle = {
      color: field.inputTextColor,
      backgroundColor: field.inputBackgroundColor,
      fontFamily: getFontFamily(),
      textAlign: inputAlignment as 'left' | 'center' | 'right',
      fontSize: globalFontSize,
      // fontWeight and fontStyle removed - these should only apply to labels, not placeholders
      padding: getPadding(globalFontSize),
      height: getHeight(globalFontSize),
      minHeight: getHeight(globalFontSize),
    };

    // Icon style - border radius depends on position (left or right)
    const getIconStyle = (onLeft: boolean) => ({
      fontFamily: getFontFamily(),
      fontSize: globalFontSize,
      fontWeight: globalFontWeight,
      fontStyle: globalFontStyle,
      color: primaryColor,
      height: getHeight(globalFontSize),
      minHeight: getHeight(globalFontSize),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      ...(onLeft ? {
        borderRight: 'none',
        borderTopLeftRadius: '0.375rem',
        borderBottomLeftRadius: '0.375rem',
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      } : {
        borderLeft: 'none',
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: '0.375rem',
        borderBottomRightRadius: '0.375rem',
      }),
    });
    
    // Calculate icon size based on global font size
    const iconSize = getIconSize(globalFontSize, 16);

    const labelAlignment = field.labelAlignment || 'right';
    const labelStyle = {
      fontFamily: getFontFamily(),
      color: primaryColor,
      textAlign: labelAlignment,
      fontSize: globalFontSize,
      fontWeight: globalFontWeight,
      fontStyle: globalFontStyle,
      display: 'block', // Override flex to allow text-align to work
      width: '100%',
      marginBottom: '6px',
      marginTop: 0,
    };

    // Determine icon position based on label alignment
    // left -> icon on left, right -> icon on right, center -> icon on right (default)
    const iconOnLeft = labelAlignment === 'left';
    const iconOnRight = labelAlignment === 'right' || labelAlignment === 'center';

    const handleFieldClick = () => {
      if (isPreview && onFieldClick) {
        onFieldClick(field.id);
      }
    };

    const cursorClass = isPreview && onFieldClick ? 'cursor-pointer' : 'cursor-default';

    switch (field.type) {
      case 'name':
      case 'email':
        return (
          <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {field.showLabel && (
              <Label style={labelStyle}>
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
            )}
            <InputGroup onClick={handleFieldClick} className={cursorClass}>
              {IconComponent && iconOnLeft && (
                <InputGroupAddon style={getIconStyle(true)}>
                  <IconComponent size={iconSize} />
                </InputGroupAddon>
              )}
              <InputGroupInput
                type={field.type === 'email' ? 'email' : 'text'}
                placeholder={field.showPlaceholder ? field.placeholder : ''}
                style={inputStyle}
                required={field.required}
                readOnly={isPreview}
                className={cursorClass}
                value={isPreview ? '' : (formData[field.id] || '')}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
              />
              {IconComponent && iconOnRight && (
                <InputGroupAddon style={getIconStyle(false)}>
                  <IconComponent size={iconSize} />
                </InputGroupAddon>
              )}
            </InputGroup>
          </div>
        );

      case 'city':
        // Select border radius - depends on icon position
        const citySelectClass = IconComponent
          ? iconOnLeft
            ? `w-full flex-1 rounded-none rounded-r-md border-l-0 ${cursorClass}`
            : `w-full flex-1 rounded-none rounded-l-md border-r-0 ${cursorClass}`
          : `w-full rounded-md ${cursorClass}`;
        return (
          <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {field.showLabel && (
              <Label style={labelStyle}>
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
            )}
            <InputGroup onClick={handleFieldClick} className={cursorClass}>
              {IconComponent && iconOnLeft && (
                <InputGroupAddon style={getIconStyle(true)}>
                  <IconComponent size={iconSize} />
                </InputGroupAddon>
              )}
              <Select 
                required={field.required}
                value={isPreview ? undefined : (formData[field.id] || '')}
                onValueChange={(value) => handleInputChange(field.id, value)}
                disabled={isPreview || loadingCities || !selectedStateId}
              >
                <SelectTrigger 
                  className={citySelectClass}
                  style={{
                    ...inputStyle,
                    padding: getHorizontalPadding(globalFontSize),
                    height: getHeight(globalFontSize),
                    minHeight: getHeight(globalFontSize),
                    justifyContent: inputAlignment === 'center' ? 'center' : inputAlignment === 'right' ? 'flex-end' : 'space-between',
                    opacity: (loadingCities || !selectedStateId) ? 0.6 : 1,
                    cursor: (loadingCities || !selectedStateId) ? 'not-allowed' : 'pointer',
                    backgroundColor: (loadingCities || !selectedStateId) ? '#f9fafb' : inputStyle.backgroundColor,
                  }}
                  onClick={(e) => {
                    if (isPreview) {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFieldClick();
                    }
                  }}
                  onPointerDown={(e) => {
                    if (isPreview) {
                      e.preventDefault();
                      handleFieldClick();
                    }
                  }}
                >
                  <SelectValue 
                    placeholder={
                      isPreview 
                        ? (field.showPlaceholder ? field.placeholder : t('select'))
                        : (!selectedStateId 
                          ? (field.selectProvinceFirstHint || t('selectProvinceFirst'))
                          : (field.showPlaceholder ? field.placeholder : t('select')))
                    }
                    style={{ textAlign: inputAlignment }}
                  />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => {
                    const displayName = `${city.name} - ${city.nameAr}`;
                    return (
                      <SelectItem key={city.id} value={city.id}>
                        {displayName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {IconComponent && iconOnRight && (
                <InputGroupAddon style={getIconStyle(false)}>
                  <IconComponent size={iconSize} />
                </InputGroupAddon>
              )}
            </InputGroup>
          </div>
        );

      case 'phone':
        // Phone field is special: +213 follows label position, icon is opposite
        const phoneCodeOnLeft = labelAlignment === 'left';
        const phoneCodeOnRight = labelAlignment === 'right' || labelAlignment === 'center';
        const phoneIconOnLeft = !phoneCodeOnLeft; // Opposite of code position
        const phoneIconOnRight = !phoneCodeOnRight; // Opposite of code position
        const phoneValue = isPreview ? '' : (formData[field.id] || '');
        const phoneError = phoneErrors[field.id];
        const hasError = !!phoneError && phoneValue.length > 0;
        
        return (
          <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {field.showLabel && (
              <Label style={labelStyle}>
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
            )}
            <InputGroup onClick={handleFieldClick} className={cursorClass}>
              {phoneCodeOnLeft && (
                <InputGroupAddon style={getIconStyle(true)}>
                  +213
                </InputGroupAddon>
              )}
              {IconComponent && phoneIconOnLeft && (
                <InputGroupAddon style={getIconStyle(true)}>
                  <IconComponent size={iconSize} />
                </InputGroupAddon>
              )}
              <InputGroupInput
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={phoneValue.startsWith('0') ? 10 : 9}
                placeholder={field.showPlaceholder ? field.placeholder : ''}
                style={{
                  ...inputStyle,
                  borderColor: hasError ? '#ef4444' : inputStyle.borderColor,
                  borderWidth: hasError ? '2px' : inputStyle.borderWidth
                }}
                required={field.required}
                readOnly={isPreview}
                className={cursorClass}
                value={phoneValue}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                onBlur={(e) => {
                  // Validate on blur (when user leaves the field)
                  const phoneField = fields.find(f => f.id === field.id && f.type === 'phone');
                  if (phoneField) {
                    const error = validatePhone(e.target.value, phoneField);
                    setPhoneErrors(prev => ({
                      ...prev,
                      [field.id]: error || ''
                    }));
                  }
                }}
                onKeyDown={(e) => {
                  // Prevent non-numeric keys (except backspace, delete, tab, arrow keys, etc.)
                  const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
                  if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                  }
                }}
              />
              {IconComponent && phoneIconOnRight && (
                <InputGroupAddon style={getIconStyle(false)}>
                  <IconComponent size={iconSize} />
                </InputGroupAddon>
              )}
              {phoneCodeOnRight && (
                <InputGroupAddon style={getIconStyle(false)}>
                  +213
                </InputGroupAddon>
              )}
            </InputGroup>
            {hasError && (
              <span style={{ 
                color: '#ef4444', 
                fontSize: '0.875rem', 
                marginTop: '2px',
                textAlign: (field.inputAlignment || 'right') as 'left' | 'center' | 'right',
                display: 'block'
              }}>
                {phoneError}
              </span>
            )}
          </div>
        );

      case 'province':
        // Select border radius - depends on icon position
        const provinceSelectClass = IconComponent
          ? iconOnLeft
            ? `w-full flex-1 rounded-none rounded-r-md border-l-0 ${cursorClass}`
            : `w-full flex-1 rounded-none rounded-l-md border-r-0 ${cursorClass}`
          : `w-full rounded-md ${cursorClass}`;
        return (
          <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {field.showLabel && (
              <Label style={labelStyle}>
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
            )}
            <InputGroup onClick={handleFieldClick} className={cursorClass}>
              {IconComponent && iconOnLeft && (
                <InputGroupAddon style={getIconStyle(true)}>
                  <IconComponent size={iconSize} />
                </InputGroupAddon>
              )}
              <Select 
                required={field.required}
                value={isPreview ? undefined : (formData[field.id] || '')}
                onValueChange={(value) => handleProvinceChange(value)}
                disabled={isPreview || loadingStates}
              >
                <SelectTrigger 
                  className={provinceSelectClass}
                  style={{
                    ...inputStyle,
                    padding: getHorizontalPadding(globalFontSize),
                    height: getHeight(globalFontSize),
                    minHeight: getHeight(globalFontSize),
                    justifyContent: inputAlignment === 'center' ? 'center' : inputAlignment === 'right' ? 'flex-end' : 'space-between',
                    opacity: loadingStates ? 0.6 : 1,
                    cursor: loadingStates ? 'not-allowed' : 'pointer',
                    backgroundColor: loadingStates ? '#f9fafb' : inputStyle.backgroundColor,
                  }}
                  onClick={(e) => {
                    if (isPreview) {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFieldClick();
                    }
                  }}
                  onPointerDown={(e) => {
                    if (isPreview) {
                      e.preventDefault();
                      handleFieldClick();
                    }
                  }}
                >
                  <SelectValue 
                    placeholder={
                      field.showPlaceholder ? field.placeholder : t('select')
                    }
                    style={{ textAlign: inputAlignment }}
                  />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => {
                    const displayName = `${state.name} - ${state.nameAr} (${state.code})`;
                    return (
                      <SelectItem key={state.id} value={state.id}>
                        {displayName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {IconComponent && iconOnRight && (
                <InputGroupAddon style={getIconStyle(false)}>
                  <IconComponent size={iconSize} />
                </InputGroupAddon>
              )}
            </InputGroup>
          </div>
        );

      case 'variants':
        // Select border radius - depends on icon position
        const variantsSelectClass = IconComponent
          ? iconOnLeft
            ? `w-full flex-1 rounded-none rounded-r-md border-l-0 ${cursorClass}`
            : `w-full flex-1 rounded-none rounded-l-md border-r-0 ${cursorClass}`
          : `w-full rounded-md ${cursorClass}`;
        return (
          <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {field.showLabel && (
              <Label style={labelStyle}>
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
            )}
            <InputGroup onClick={handleFieldClick} className={cursorClass}>
              {IconComponent && iconOnLeft && (
                <InputGroupAddon style={getIconStyle(true)}>
                  <IconComponent size={iconSize} />
                </InputGroupAddon>
              )}
              <Select 
                required={field.required}
                value={isPreview ? undefined : (formData[field.id] || '')}
                onValueChange={(value) => handleInputChange(field.id, value)}
                disabled={isPreview}
              >
                <SelectTrigger 
                  className={variantsSelectClass}
                  style={{
                    ...inputStyle,
                    padding: getHorizontalPadding(globalFontSize),
                    justifyContent: inputAlignment === 'center' ? 'center' : inputAlignment === 'right' ? 'flex-end' : 'space-between',
                  }}
                  onClick={(e) => {
                    if (isPreview) {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFieldClick();
                    }
                  }}
                  onPointerDown={(e) => {
                    if (isPreview) {
                      e.preventDefault();
                      handleFieldClick();
                    }
                  }}
                >
                  <SelectValue 
                    placeholder={field.showPlaceholder ? field.placeholder : 'Select'}
                    style={{ textAlign: inputAlignment }}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">{t('sizeSmall')}</SelectItem>
                  <SelectItem value="medium">{t('sizeMedium')}</SelectItem>
                  <SelectItem value="large">{t('sizeLarge')}</SelectItem>
                </SelectContent>
              </Select>
              {IconComponent && iconOnRight && (
                <InputGroupAddon style={getIconStyle(false)}>
                  <IconComponent size={iconSize} />
                </InputGroupAddon>
              )}
            </InputGroup>
          </div>
        );

      case 'coupon':
        return (
          <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {field.showLabel && (
              <Label style={labelStyle}>
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
            )}
            <div className="flex items-center gap-2">
              <InputGroup className={`flex-1 ${cursorClass}`} onClick={handleFieldClick}>
                {IconComponent && iconOnLeft && (
                  <InputGroupAddon style={getIconStyle(true)}>
                    <IconComponent size={iconSize} />
                  </InputGroupAddon>
                )}
                <InputGroupInput
                  placeholder={field.showPlaceholder ? field.placeholder : ''}
                  style={inputStyle}
                  required={field.required}
                  readOnly={isPreview}
                  className={cursorClass}
                  value={isPreview ? '' : (formData[field.id] || '')}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                />
                {IconComponent && iconOnRight && (
                  <InputGroupAddon style={getIconStyle(false)}>
                    <IconComponent size={iconSize} />
                  </InputGroupAddon>
                )}
              </InputGroup>
              <button type="button" disabled={isPreview} style={{ padding: '8px 16px', borderRadius: '0.375rem', backgroundColor: '#000000', color: '#ffffff', border: 'none', cursor: isPreview ? 'not-allowed' : 'pointer' }}>
                {t('apply')}
              </button>
            </div>
          </div>
        );

      case 'summary': {
        const currency = globalSettings?.currency || 'DZD';
        const summaryPlaceholder = field.summaryPlaceholder || '-';
        const totalLabel = field.totalLabel || t('total');
        const shippingLabel = field.shippingLabel || t('shippingPrice');
        const chooseProvinceHint = field.chooseProvinceHint || t('chooseProvince');
        const selectShippingOptionHint = field.selectShippingOptionHint || t('selectShippingOption');
        const summaryAlignment = field.summaryAlignment || 'right';
        
        // Determine placeholder value when no province/shipping is selected
        const getPlaceholderValue = () => {
          if (isPreview) {
            return summaryPlaceholder;
          }
          // In production, show placeholder if no province selected or no shipping price
          if (!selectedStateId || !shippingFees) {
            return summaryPlaceholder;
          }
          return '-';
        };

        const placeholderValue = getPlaceholderValue();
        const formatPrice = (price: number, quantity: number = 1) => {
          return `${price.toLocaleString('en-US')} ${currency}${quantity > 1 ? ` x${quantity}` : ''}`;
        };

        return (
          <div key={field.id} className="leadcod-field" style={{ marginBottom: 0 }}>
            <div className="leadcod-summary-section">
              <div 
                className="leadcod-summary-content" 
                style={{ 
                  display: 'block',
                  textAlign: summaryAlignment
                }}
              >
                <div className="leadcod-summary-item" style={{ textAlign: summaryAlignment }}>
                  <span className="leadcod-summary-item-label leadcod-product-name">
                    {isPreview ? t('productName') : placeholderValue}
                  </span>
                  <span className="leadcod-summary-item-value leadcod-product-price">
                    {isPreview ? formatPrice(1600, 1) : placeholderValue}
                  </span>
                </div>
                <div className="leadcod-summary-item" style={{ textAlign: summaryAlignment }}>
                  <div>
                    <div className="leadcod-summary-item-label leadcod-shipping-label">
                      {isPreview ? shippingLabel : placeholderValue}
                    </div>
                    {!isPreview && (
                      <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icons.Globe size={14} />
                        <span className="leadcod-shipping-hint-text">{chooseProvinceHint}</span>
                      </div>
                    )}
                  </div>
                  <span className="leadcod-summary-item-value leadcod-shipping-price">
                    {isPreview 
                      ? `${400} ${currency}`
                      : placeholderValue}
                  </span>
                </div>
                <div className="leadcod-summary-total" style={{ textAlign: summaryAlignment }}>
                  <div>
                    <div className="leadcod-summary-total-label">{totalLabel}</div>
                  </div>
                  <span className="leadcod-summary-total-value leadcod-total-price">
                    {isPreview 
                      ? formatPrice(2000)
                      : placeholderValue}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'shippingOption': {
        // Calculate smaller font size for shipping labels and prices (85% of global size, min 12px)
        const fontSizeNum = parseInt(globalFontSize.replace('px', '')) || 16;
        const smallerFontSize = Math.max(12, Math.round(fontSizeNum * 0.85)) + 'px';
        
        const currency = globalSettings?.currency || 'DZD';
        const shippingAlignment = field.shippingAlignment || 'right';
        
        // Format price with currency
        // In preview mode (builder), always show placeholder prices (400 for COD, 300 for Stop Desk)
        // In production mode, show freeShippingLabel if price is 0, otherwise show actual price
        const formatPrice = (price: number | null, isCOD: boolean): string => {
          if (isPreview) {
            // Always show placeholder prices in builder preview
            return isCOD ? `400 ${currency}` : `300 ${currency}`;
          }
          // Production mode - show freeShippingLabel when price is 0 or null
          if (price === null || price === undefined || price === 0) {
            return freeShippingLabel;
          }
          return `${price.toLocaleString('en-US')} ${currency}`;
        };

        const codPrice = shippingFees?.cashOnDelivery ?? null;
        const stopDeskPrice = shippingFees?.stopDesk ?? null;

        const shippingOptionStyle = {
          fontFamily: getFontFamily(),
          fontSize: globalFontSize,
          fontWeight: globalFontWeight,
          fontStyle: globalFontStyle,
          color: primaryColor,
          textAlign: shippingAlignment,
        };

        const shippingOptionItemStyle = {
          fontFamily: getFontFamily(),
          fontSize: smallerFontSize,
          fontWeight: globalFontWeight,
          fontStyle: globalFontStyle,
          color: primaryColor,
          textAlign: shippingAlignment,
        };

        const codLabel = t('cashOnDelivery');
        const stopDeskLabel = t('stopDesk');

        return (
          <div key={field.id} className="leadcod-field" style={{ marginBottom: '4px' }}>
            <div 
              className="leadcod-shipping-section" 
              style={{ display: isPreview ? 'block' : 'none', '--leadcod-primary-color': primaryColor } as React.CSSProperties}
            >
              <div style={shippingOptionStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: shippingAlignment === 'left' ? 'flex-start' : shippingAlignment === 'center' ? 'center' : 'space-between', 
                      gap: '12px', 
                      cursor: 'pointer', 
                      ...shippingOptionItemStyle 
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input 
                        type="radio" 
                        name={field.id} 
                        value="cod"
                        checked={!isPreview && formData[field.id] === 'cod'}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        disabled={isPreview}
                        required={field.required}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <span style={{ textAlign: shippingAlignment }}>{codLabel}</span>
                    </div>
                    <span 
                      className="leadcod-shipping-price-cod" 
                      style={{ fontWeight: 600, fontSize: smallerFontSize, textAlign: shippingAlignment }}
                      data-price="0"
                    >
                      {loadingShippingFees ? '...' : formatPrice(codPrice, true)}
                    </span>
                  </label>
                  {(isPreview || stopDeskEnabled) && (
                    <label 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: shippingAlignment === 'left' ? 'flex-start' : shippingAlignment === 'center' ? 'center' : 'space-between', 
                        gap: '12px', 
                        cursor: 'pointer', 
                        ...shippingOptionItemStyle 
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input 
                          type="radio" 
                          name={field.id} 
                          value="stopDesk"
                          checked={!isPreview && formData[field.id] === 'stopDesk'}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          disabled={isPreview}
                          required={field.required}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span style={{ textAlign: shippingAlignment }}>{stopDeskLabel}</span>
                      </div>
                      <span 
                        className="leadcod-shipping-price-stopdesk" 
                        style={{ fontWeight: 600, fontSize: smallerFontSize, textAlign: shippingAlignment }}
                        data-price="0"
                      >
                        {loadingShippingFees ? '...' : formatPrice(stopDeskPrice, false)}
                      </span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'quantity': {
        const quantity = quantities[field.id] || 1;
        
        const handleFieldClick = () => {
          if (isPreview && onFieldClick) {
            onFieldClick(field.id);
          }
        };
        
        const handleDecrease = (e: React.MouseEvent) => {
          if (isPreview) {
            e.preventDefault();
            e.stopPropagation();
            handleFieldClick();
          } else if (quantity > 1) {
            setQuantities(prev => ({ ...prev, [field.id]: quantity - 1 }));
            handleInputChange(field.id, quantity - 1);
          }
        };
        
        const handleIncrease = (e: React.MouseEvent) => {
          if (isPreview) {
            e.preventDefault();
            e.stopPropagation();
            handleFieldClick();
          } else {
            setQuantities(prev => ({ ...prev, [field.id]: quantity + 1 }));
            handleInputChange(field.id, quantity + 1);
          }
        };
        
        const cursorClass = isPreview && onFieldClick ? 'cursor-pointer' : 'cursor-default';
        
        return (
          <div key={field.id} className="leadcod-field" style={{ marginBottom: 0 }} onClick={handleFieldClick}>
            <div className={`flex items-center justify-between gap-2 bg-white border border-gray-200 rounded-lg p-1 w-full ${cursorClass}`}>
              <button
                type="button"
                onClick={handleDecrease}
                className="flex-1 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-md font-semibold text-gray-700 transition-colors"
                disabled={isPreview}
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                readOnly
                className="w-16 text-center font-semibold text-lg border-none bg-transparent focus:outline-none"
              />
              <button
                type="button"
                onClick={handleIncrease}
                className="flex-1 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-md font-semibold text-gray-700 transition-colors"
                disabled={isPreview}
              >
                +
              </button>
            </div>
          </div>
        );
      }

      case 'buyButton': {
        const [quantity, setQuantity] = useState(1);
        const showQuantity = field.showQuantity !== false; // Default to true if not specified
        
        // Get icon component - use field.icon or default to ArrowRight
        const IconComponent = field.icon && field.icon !== 'none' 
          ? getIconComponent(field.icon)
          : Icons.ArrowRight;
        
        // Calculate button styles based on field properties (matching liquid implementation)
        const buttonGlobalFontSize = getGlobalFontSize();
        const buttonGlobalFontStyle = getGlobalFontStyle();
        const buttonFontSize = field.buttonFontSize || buttonGlobalFontSize;
        
        // Calculate button padding based on font size
        const fontSizeNum = parseInt(buttonFontSize.replace('px', '')) || 16;
        const verticalPadding = Math.max(10, Math.round(fontSizeNum * 0.625));
        const horizontalPadding = Math.max(20, Math.round(fontSizeNum * 1.5));
        const buttonPadding = `${verticalPadding}px ${horizontalPadding}px`;
        
        // Determine button size
        const buttonSize = field.buttonSize === 'extra-large' ? '56px'
          : field.buttonSize === 'large' ? '48px'
          : field.buttonSize === 'small' ? '32px'
          : '40px';
        
        const buttonHeightNum = parseInt(buttonSize.replace('px', '')) || 40;
        const buttonIconSize = field.buttonIconSize || Math.round(buttonHeightNum * 0.6);
        
        const textAlign = field.inputAlignment || 'center';
        const textColor = field.inputTextColor || '#ffffff';
        
        // Build button style object
        const buttonStyle: React.CSSProperties = {
          fontFamily: getFontFamily(field.fontFamily),
          fontSize: buttonFontSize,
          fontWeight: 'bold',
          fontStyle: buttonGlobalFontStyle,
          textAlign: textAlign as 'left' | 'center' | 'right',
          color: textColor,
          padding: buttonPadding,
          height: buttonSize,
          border: 'none',
          borderRadius: '0.375rem',
          width: '100%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        };
        
        // Handle background - always respect field.inputBackgroundColor for solid colors
        const solidColor = field.inputBackgroundColor || '#000000';
        
        if (field.backgroundType === 'gradient' && field.gradientBackground) {
          // Use gradient if explicitly set
          if (field.animation === 'background-shift') {
            buttonStyle.backgroundImage = field.gradientBackground;
            buttonStyle.backgroundSize = '200% 200%';
          } else {
            buttonStyle.backgroundImage = field.gradientBackground;
          }
        } else {
          // Use solid color from field settings
          // For background-shift animation with solid colors, convert to gradient
          if (field.animation === 'background-shift') {
            const hex = solidColor.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            const isDark = r < 30 && g < 30 && b < 30;
            
            if (isDark) {
              // For black/dark colors, use visible gray variations
              buttonStyle.backgroundImage = `linear-gradient(135deg, ${solidColor} 0%, #404040 25%, #606060 50%, #404040 75%, ${solidColor} 100%)`;
              buttonStyle.backgroundSize = '200% 200%';
            } else {
              // For lighter colors, make base color more prominent
              const lighterR = Math.min(255, r + 25);
              const lighterG = Math.min(255, g + 25);
              const lighterB = Math.min(255, b + 25);
              const lighterColor = `rgb(${lighterR}, ${lighterG}, ${lighterB})`;
              buttonStyle.backgroundImage = `linear-gradient(135deg, ${solidColor} 0%, ${solidColor}cc 25%, ${lighterColor} 50%, ${solidColor}cc 75%, ${solidColor} 100%)`;
              buttonStyle.backgroundSize = '200% 200%';
            }
          } else {
            // Always use the background color from field settings
            buttonStyle.backgroundColor = solidColor;
          }
        }
        
        // Add animation styles
        const animationClass = field.animation && field.animation !== 'none' 
          ? `leadcod-button-animation-${field.animation}` 
          : '';
        
        // Handle glow animation CSS variable
        if (field.animation === 'glow') {
          const glowColor = field.inputBackgroundColor || '#000000';
          let rgbaColor = glowColor;
          if (glowColor.startsWith('#')) {
            const hex = glowColor.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            rgbaColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
          } else if (glowColor.startsWith('rgb(')) {
            rgbaColor = glowColor.replace('rgb(', 'rgba(').replace(')', ', 0.6)');
          } else if (!glowColor.startsWith('rgba(')) {
            rgbaColor = `rgba(0, 0, 0, 0.3)`;
          }
          buttonStyle['--glow-color' as any] = rgbaColor;
        }
        
        return (
          <div key={field.id} className="space-y-3">
            {showQuantity && (
              <div className="flex items-center justify-between gap-2 bg-white border border-gray-200 rounded-lg p-1 w-full">
                <button
                  type="button"
                  onClick={() => !isPreview && quantity > 1 && setQuantity(quantity - 1)}
                  className="flex-1 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-md font-semibold text-gray-700 transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  readOnly
                  className="w-16 text-center font-semibold text-lg border-none bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => !isPreview && setQuantity(quantity + 1)}
                  className="flex-1 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-md font-semibold text-gray-700 transition-colors"
                >
                  +
                </button>
              </div>
            )}
            <button 
              type={isPreview ? 'button' : 'submit'}
              className={`w-full flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:-translate-y-0.5 ${animationClass}`}
              style={buttonStyle}
              onClick={isPreview ? handleFieldClick : undefined}
            >
              {field.label}
              <IconComponent size={buttonIconSize} style={field.icon && field.icon !== 'none' ? { fill: 'currentColor', strokeWidth: 1.5 } : undefined} />
            </button>
          </div>
        );
      }

      case 'whatsappButton': {
        // Get icon component - use field.icon or default to WhatsApp
        const IconComponent = field.icon && field.icon !== 'none' 
          ? getIconComponent(field.icon)
          : WhatsAppIcon;
        
        // Calculate button styles based on field properties (matching liquid implementation)
        const buttonGlobalFontSize = getGlobalFontSize();
        const buttonGlobalFontStyle = getGlobalFontStyle();
        const buttonFontSize = field.buttonFontSize || buttonGlobalFontSize;
        
        // Calculate button padding based on font size
        const fontSizeNum = parseInt(buttonFontSize.replace('px', '')) || 16;
        const verticalPadding = Math.max(10, Math.round(fontSizeNum * 0.625));
        const horizontalPadding = Math.max(20, Math.round(fontSizeNum * 1.5));
        const buttonPadding = `${verticalPadding}px ${horizontalPadding}px`;
        
        // Determine button size
        const buttonSize = field.buttonSize === 'extra-large' ? '56px'
          : field.buttonSize === 'large' ? '48px'
          : field.buttonSize === 'small' ? '32px'
          : '40px';
        
        const buttonHeightNum = parseInt(buttonSize.replace('px', '')) || 40;
        const buttonIconSize = field.buttonIconSize || Math.round(buttonHeightNum * 0.6);
        
        const textAlign = field.inputAlignment || 'center';
        const textColor = field.inputTextColor || '#ffffff';
        
        // Build button style object
        const buttonStyle: React.CSSProperties = {
          fontFamily: getFontFamily(field.fontFamily),
          fontSize: buttonFontSize,
          fontWeight: 'bold',
          fontStyle: buttonGlobalFontStyle,
          textAlign: textAlign as 'left' | 'center' | 'right',
          color: textColor,
          padding: buttonPadding,
          height: buttonSize,
          border: 'none',
          borderRadius: '0.375rem',
          width: '100%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        };
        
        // Handle background - always respect field.inputBackgroundColor for solid colors
        const solidColor = field.inputBackgroundColor || '#25D366';
        
        if (field.backgroundType === 'gradient' && field.gradientBackground) {
          // Use gradient if explicitly set
          if (field.animation === 'background-shift') {
            buttonStyle.backgroundImage = field.gradientBackground;
            buttonStyle.backgroundSize = '200% 200%';
          } else {
            buttonStyle.backgroundImage = field.gradientBackground;
          }
        } else {
          // Use solid color from field settings
          // For background-shift animation with solid colors, convert to gradient
          if (field.animation === 'background-shift') {
            const hex = solidColor.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            const isDark = r < 30 && g < 30 && b < 30;
            
            if (isDark) {
              // For black/dark colors, use visible gray variations
              buttonStyle.backgroundImage = `linear-gradient(135deg, ${solidColor} 0%, #404040 25%, #606060 50%, #404040 75%, ${solidColor} 100%)`;
              buttonStyle.backgroundSize = '200% 200%';
            } else {
              // For lighter colors, make base color more prominent
              const lighterR = Math.min(255, r + 25);
              const lighterG = Math.min(255, g + 25);
              const lighterB = Math.min(255, b + 25);
              const lighterColor = `rgb(${lighterR}, ${lighterG}, ${lighterB})`;
              buttonStyle.backgroundImage = `linear-gradient(135deg, ${solidColor} 0%, ${solidColor}cc 25%, ${lighterColor} 50%, ${solidColor}cc 75%, ${solidColor} 100%)`;
              buttonStyle.backgroundSize = '200% 200%';
            }
          } else {
            // Always use the background color from field settings
            buttonStyle.backgroundColor = solidColor;
          }
        }
        
        // Add animation styles
        const animationClass = field.animation && field.animation !== 'none' 
          ? `leadcod-button-animation-${field.animation}` 
          : '';
        
        // Handle glow animation CSS variable
        if (field.animation === 'glow') {
          const glowColor = field.inputBackgroundColor || '#25D366';
          let rgbaColor = glowColor;
          if (glowColor.startsWith('#')) {
            const hex = glowColor.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            rgbaColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
          } else if (glowColor.startsWith('rgb(')) {
            rgbaColor = glowColor.replace('rgb(', 'rgba(').replace(')', ', 0.6)');
          } else if (!glowColor.startsWith('rgba(')) {
            rgbaColor = `rgba(0, 0, 0, 0.3)`;
          }
          buttonStyle['--glow-color' as any] = rgbaColor;
        }
        
        // Get WhatsApp number from field
        const whatsappNumber = field.whatsappNumber || '213000000000';
        
        // Handle WhatsApp button click
        const handleWhatsAppClick = () => {
          if (isPreview) {
            handleFieldClick(field.id);
            return;
          }
          
          // Get form data
          const form = document.querySelector('form');
          if (form) {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            const message = encodeURIComponent('طلب جديد: ' + JSON.stringify(data));
            window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
          }
        };
        
        return (
          <div key={field.id} className="space-y-3">
            <button 
              type="button"
              className={`w-full flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:-translate-y-0.5 ${animationClass}`}
              style={buttonStyle}
              onClick={handleWhatsAppClick}
            >
              {field.label}
              <IconComponent size={buttonIconSize} style={field.icon && field.icon !== 'none' ? { fill: 'currentColor', strokeWidth: 1.5 } : undefined} />
            </button>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const getBorderStyle = () => {
    if (!globalSettings?.border?.enabled) {
      return {};
    }
    const blurRadius = globalSettings.border.width || 4;
    const spreadRadius = 1; // Slight spread for more aggressive shadow
    const shadowColor = globalSettings.border.color || '#9ca3af';
    const shadowOpacity = 0.3;
    
    // Convert hex to rgba for shadow
    let rgbaColor = shadowColor;
    if (shadowColor.startsWith('#')) {
      const hex = shadowColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      rgbaColor = `rgba(${r}, ${g}, ${b}, ${shadowOpacity})`;
    } else if (shadowColor.startsWith('rgb(')) {
      rgbaColor = shadowColor.replace('rgb(', 'rgba(').replace(')', `, ${shadowOpacity})`);
    } else if (!shadowColor.startsWith('rgba(')) {
      rgbaColor = `rgba(156, 163, 175, ${shadowOpacity})`;
    }
    
    return {
      boxShadow: `0 0 ${blurRadius}px ${spreadRadius}px ${rgbaColor}`,
      borderRadius: `${globalSettings.border.radius}px`,
      padding: `${globalSettings.border.padding}px`,
      width: '100%',
      boxSizing: 'border-box' as const,
    };
  };

  const content = (
    <div className="space-y-4" style={{ padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '12px' }}>
      <style>{`
        @keyframes backgroundShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 50% 50%;
          }
        }
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-4px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(4px);
          }
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 8px var(--glow-color, rgba(0, 0, 0, 0.3));
          }
          50% {
            box-shadow: 0 0 20px var(--glow-color, rgba(0, 0, 0, 0.5)), 0 0 35px var(--glow-color, rgba(0, 0, 0, 0.3));
          }
        }
        @keyframes slideDownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
            max-height: 0;
            margin-bottom: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            max-height: 500px;
            margin-bottom: 4px;
          }
        }
        .leadcod-button-animation-background-shift {
          animation: backgroundShift 4s ease infinite !important;
          will-change: background-position;
        }
        .leadcod-button-animation-shake {
          animation: shake 0.6s ease-in-out infinite !important;
          will-change: transform;
          transform-origin: center;
        }
        .leadcod-button-animation-bounce {
          animation: bounce 1s ease-in-out infinite !important;
          will-change: transform;
          transform-origin: center;
        }
        .leadcod-button-animation-pulse {
          animation: pulse 2s ease-in-out infinite !important;
          will-change: transform, opacity;
          transform-origin: center;
        }
        .leadcod-button-animation-glow {
          animation: glow 2s ease-in-out infinite !important;
          will-change: box-shadow;
        }
        input::placeholder,
        textarea::placeholder,
        select::placeholder {
          font-weight: normal !important;
          font-style: normal !important;
          font-size: 14px !important;
        }
        .leadcod-fields-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 0;
        }
        .leadcod-form-section {
          background-color: #ffffff;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 4px;
        }
        .leadcod-form-section:last-child {
          margin-bottom: 0;
        }
        .leadcod-shipping-section {
          overflow: hidden;
        }
        .leadcod-shipping-section.show {
          display: block !important;
          animation: slideDownFadeIn 0.4s ease-out forwards;
        }
        .leadcod-summary-section {
          margin-top: 0;
          margin-bottom: 0;
        }
        .leadcod-summary-content {
          margin-top: 0;
        }
        .leadcod-summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
        }
        .leadcod-summary-item-label {
          color: #6b7280;
          font-size: 14px;
        }
        .leadcod-summary-item-value {
          font-weight: 600;
          color: #1f2937;
          font-size: 14px;
        }
        .leadcod-summary-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 6px;
          margin-top: 0;
        }
        .leadcod-summary-total-label {
          font-weight: 700;
          font-size: 18px;
          color: #1f2937;
        }
        .leadcod-summary-total-value {
          font-weight: 700;
          font-size: 20px;
          color: #1f2937;
        }
        .leadcod-summary-currency {
          font-size: 14px;
          color: #6b7280;
          margin-top: 2px;
        }
        .leadcod-dotted-separator {
          border: none;
          border-top: 1px dotted #d1d5db;
          margin: 6px 0;
        }
      `}</style>
      {globalSettings && (
        <div style={{ marginBottom: '16px' }}>
          {globalSettings.headline.enabled && (
            <h2
              style={{
                color: getPrimaryColor(),
                textAlign: getTextAlign(globalSettings.headline.alignment),
                fontFamily: getFontFamily(),
                fontSize: '24px',
                fontWeight: 'bold',
                fontStyle: getGlobalFontStyle(),
                margin: '0 0 6px 0',
              }}
            >
              {globalSettings.headline.text}
            </h2>
          )}
          {globalSettings.subtitle.enabled && (
            <p
              style={{
                color: getPrimaryColor(),
                textAlign: getTextAlign(globalSettings.subtitle.alignment),
                fontFamily: getFontFamily(),
                fontSize: getGlobalFontSize(),
                fontWeight: getGlobalFontWeight(),
                fontStyle: getGlobalFontStyle(),
                opacity: 0.7,
                margin: 0,
              }}
            >
              {globalSettings.subtitle.text}
            </p>
          )}
        </div>
      )}
      {visibleFields.length === 0 ? (
        <div className="text-center py-8">
          <div className="mb-4 flex justify-center">
            <Icons.AlertCircle size={48} className="text-muted-foreground" />
          </div>
          <p className="mb-2 font-medium">{t('noVisibleFields')}</p>
          <p className="text-sm text-muted-foreground">
            {t('enableFieldsToSee')} {isPreview ? t('preview') : t('form')}
          </p>
        </div>
      ) : (
        <>
          {visibleFields
            .filter(f => f.type !== 'summary' && f.type !== 'buyButton' && f.type !== 'whatsappButton' && f.type !== 'shippingOption' && f.type !== 'quantity')
            .length > 0 && (
            <div className="leadcod-form-section">
              <div className="leadcod-fields-grid">
                {visibleFields
                  .filter(f => f.type !== 'summary' && f.type !== 'buyButton' && f.type !== 'whatsappButton' && f.type !== 'shippingOption' && f.type !== 'quantity')
                  .map(renderField)}
              </div>
            </div>
          )}
          {visibleFields
            .filter(f => f.type === 'shippingOption' || f.type === 'summary' || f.type === 'quantity' || f.type === 'buyButton' || f.type === 'whatsappButton')
            .map(field => (
              <div key={field.id} className="leadcod-form-section">
                {renderField(field)}
              </div>
            ))}
        </>
      )}
    </div>
  );

  // In preview mode, wrap in Card. In production mode, wrap in form element
  if (isPreview) {
    return (
      <Card className="p-0" style={{ boxShadow: 'none', border: 'none', backgroundColor: 'transparent', borderRadius: '12px', width: '100%' }}>
        <CardContent className="space-y-4 p-0">
          {content}
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {content}
    </form>
  );
}

