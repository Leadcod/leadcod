'use client';

import { useState, FormEvent, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { FormField, GlobalFormSettings } from '@/app/types/form';
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

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
  shopUrl?: string;
}

export default function FormDisplay({ 
  fields, 
  globalSettings, 
  onFieldClick, 
  mode = 'preview',
  onSubmit,
  shippingMethod = 'free',
  stopDeskEnabled = false,
  shopUrl
}: FormDisplayProps) {
  const isPreview = mode === 'preview';
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [shippingFees, setShippingFees] = useState<{ cashOnDelivery: number | null; stopDesk: number | null } | null>(null);
  const [loadingShippingFees, setLoadingShippingFees] = useState(false);

  // Fetch states on mount
  useEffect(() => {
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
  }, []);

  // Fetch cities when state is selected
  useEffect(() => {
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
  }, [selectedStateId]);

  // Fetch shipping fees when state is selected and shipping method is per-province
  useEffect(() => {
    const fetchShippingFees = async () => {
      if (!selectedStateId || !shopUrl || shippingMethod !== 'per-province') {
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
  }, [selectedStateId, shopUrl, shippingMethod]);

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
  // Also filter out shippingOption if shipping method is 'free'
  const visibleFields = fields
    .filter((field) => {
      if (!field.visible) return false;
      // Hide shippingOption if shipping method is 'free'
      if (field.type === 'shippingOption' && shippingMethod === 'free') {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.order - b.order);

  const getFontFamily = (fontFamily?: string) => {
    const fontToUse = fontFamily || globalSettings?.fontFamily || 'nunito';
    const fontMap: Record<string, string> = {
      cairo: 'var(--font-cairo)',
      nunito: 'var(--font-nunito)',
      poppins: 'var(--font-poppins)',
      montserrat: 'var(--font-montserrat)',
    };
    return fontMap[fontToUse] || 'var(--font-nunito)';
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

  const handleInputChange = (fieldId: string, value: any) => {
    if (!isPreview) {
      setFormData(prev => ({ ...prev, [fieldId]: value }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isPreview && onSubmit) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FormField) => {
    const IconComponent = field.icon === 'none' ? null : ((Icons as any)[field.icon] || Icons.Circle);

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

    const inputAlignment = field.inputAlignment || 'left';
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

    const labelAlignment = field.labelAlignment || 'left';
    const labelStyle = {
      fontFamily: getFontFamily(),
      color: primaryColor,
      textAlign: labelAlignment,
      fontSize: globalFontSize,
      fontWeight: globalFontWeight,
      fontStyle: globalFontStyle,
      display: 'block', // Override flex to allow text-align to work
      width: '100%',
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
          <div key={field.id} className="space-y-2">
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
          <div key={field.id} className="space-y-2">
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
                    padding: getPadding(globalFontSize),
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
                      !selectedStateId 
                        ? 'Select province first' 
                        : (field.showPlaceholder ? field.placeholder : 'Select')
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
        
        return (
          <div key={field.id} className="space-y-2">
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
                placeholder={field.showPlaceholder ? field.placeholder : ''}
                style={inputStyle}
                required={field.required}
                readOnly={isPreview}
                className={cursorClass}
                value={isPreview ? '' : (formData[field.id] || '')}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
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
          <div key={field.id} className="space-y-2">
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
                    padding: getPadding(globalFontSize),
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
                    placeholder={field.showPlaceholder ? field.placeholder : 'Select'}
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
          <div key={field.id} className="space-y-2">
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
                  <SelectItem value="small">Size: Small</SelectItem>
                  <SelectItem value="medium">Size: Medium</SelectItem>
                  <SelectItem value="large">Size: Large</SelectItem>
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

      case 'quantity':
        return (
          <div key={field.id} className="space-y-2">
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
                type="number"
                min={1}
                defaultValue="1"
                placeholder={field.showPlaceholder ? field.placeholder : ''}
                style={inputStyle}
                required={field.required}
                readOnly={isPreview}
                className={cursorClass}
                value={isPreview ? '1' : (formData[field.id] || '1')}
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

      case 'coupon':
        return (
          <div key={field.id} className="space-y-2">
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
              <Button type={isPreview ? 'button' : 'button'} disabled={isPreview}>
                Apply
              </Button>
            </div>
          </div>
        );

      case 'summary':
        return (
          <Card key={field.id} className={`bg-muted/50 border-2 ${cursorClass}`} onClick={handleFieldClick}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold" style={labelStyle}>
                {field.showLabel ? field.label : 'Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2" style={labelStyle}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">$99.99</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Shipping:</span>
                <span className="font-medium">$10.00</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-medium">$14.00</span>
              </div>
              <div className="pt-3 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold">Total:</span>
                  <span className="text-xl font-bold">$123.99</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'shippingOption': {
        const ShippingIconComponent = field.icon === 'none' ? null : ((Icons as any)[field.icon] || Icons.Truck);
        const iconSize = getIconSize(globalFontSize, 16);
        
        // Format price with DZD currency
        // In preview mode, show example prices (400 for COD, 300 for Stop Desk)
        // Only show "Free" if shipping method is 'free'
        const formatPrice = (price: number | null, isCOD: boolean): string => {
          if (shippingMethod === 'free') {
            return 'Free';
          }
          if (isPreview) {
            // Show example prices in builder preview
            return isCOD ? '400 DZD' : '300 DZD';
          }
          if (price === null || price === undefined) return 'Free';
          return `${price.toLocaleString('en-US')} DZD`;
        };

        const codPrice = shippingFees?.cashOnDelivery ?? null;
        const stopDeskPrice = shippingFees?.stopDesk ?? null;

        const optionItemStyle = {
          fontFamily: getFontFamily(),
          fontSize: field.inputFontSize || globalFontSize,
          fontWeight: field.inputFontWeight || globalFontWeight,
          fontStyle: field.inputFontStyle || globalFontStyle,
          color: field.inputTextColor,
        };

        // Label style with vertical centering and horizontal alignment from settings
        const labelStyleWithIcon = {
          ...labelStyle,
          display: 'flex',
          alignItems: 'center', // Vertically center
          gap: '8px',
          justifyContent: labelAlignment === 'center' ? 'center' : labelAlignment === 'right' ? 'flex-end' : 'flex-start', // Horizontal alignment from settings
        };

        return (
          <div key={field.id} className="space-y-2">
            {field.showLabel && (
              <Label style={labelStyleWithIcon}>
                {ShippingIconComponent && (
                  <ShippingIconComponent size={iconSize} style={{ color: primaryColor }} />
                )}
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
            )}
            {!field.showLabel && ShippingIconComponent && (
              <div 
                className="flex items-center"
                style={{ 
                  justifyContent: labelAlignment === 'center' ? 'center' : labelAlignment === 'right' ? 'flex-end' : 'flex-start' 
                }}
              >
                <ShippingIconComponent size={iconSize} style={{ color: primaryColor }} />
              </div>
            )}
            <div 
              className={`bg-muted/50 rounded-lg p-4 space-y-3 ${cursorClass}`}
              style={{
                backgroundColor: field.inputBackgroundColor || '#f9fafb',
                borderRadius: '0.5rem',
                padding: '16px',
                boxShadow: '0px 0px 0px 1px rgba(0, 0, 0, 0.08)'
              }}
              onClick={handleFieldClick}
            >
              <div className="space-y-2">
                <label 
                  className="flex items-center justify-between cursor-pointer hover:bg-muted/30 rounded p-2 transition-colors"
                  style={optionItemStyle}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`shipping-option-${field.id}`}
                      value="cod"
                      checked={!isPreview && formData[field.id] === 'cod'}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      disabled={isPreview}
                      className="w-4 h-4"
                      required={field.required}
                      style={{ cursor: isPreview ? 'default' : 'pointer' }}
                    />
                    <span style={optionItemStyle}>
                      Cash on Delivery (COD)
                    </span>
                  </div>
                  <span 
                    style={{
                      ...optionItemStyle,
                      fontWeight: 'bold',
                      color: primaryColor,
                    }}
                  >
                    {loadingShippingFees ? '...' : formatPrice(codPrice, true)}
                  </span>
                </label>
                {stopDeskEnabled && (
                  <label 
                    className="flex items-center justify-between cursor-pointer hover:bg-muted/30 rounded p-2 transition-colors"
                    style={optionItemStyle}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`shipping-option-${field.id}`}
                        value="stopDesk"
                        checked={!isPreview && formData[field.id] === 'stopDesk'}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        disabled={isPreview}
                        className="w-4 h-4"
                        required={field.required}
                        style={{ cursor: isPreview ? 'default' : 'pointer' }}
                      />
                      <span style={optionItemStyle}>
                        Stop Desk
                      </span>
                    </div>
                    <span 
                      style={{
                        ...optionItemStyle,
                        fontWeight: 'bold',
                        color: primaryColor,
                      }}
                    >
                      {loadingShippingFees ? '...' : formatPrice(stopDeskPrice, false)}
                    </span>
                  </label>
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'buyButton': {
        // Map animation type to CSS class
        const getAnimationClass = (animation?: string) => {
          if (!animation || animation === 'none') return '';
          return `button-animate-${animation}`;
        };
        
        // Map button size to Button component size prop
        const getButtonSize = (buttonSize?: string): "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg" => {
          switch (buttonSize) {
            case 'small':
              return 'sm';
            case 'base':
              return 'default';
            case 'large':
              return 'lg';
            case 'extra-large':
              return 'lg'; // Will add custom styling for extra-large
            default:
              return 'default';
          }
        };
        
        // Check if extra-large size needs custom styling
        const isExtraLarge = field.buttonSize === 'extra-large';
        
        // Helper function to extract color from gradient or solid color
        const extractGlowColor = (): string => {
          if (field.backgroundType === 'gradient' && field.gradientBackground) {
            // Extract first color from gradient string (e.g., "linear-gradient(135deg, #667eea 0%, #764ba2 100%)")
            const gradientMatch = field.gradientBackground.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\)/);
            if (gradientMatch) {
              return gradientMatch[0];
            }
          }
          // Use solid background color
          return field.inputBackgroundColor || '#000000';
        };
        
        // Helper function to calculate button padding based on font size
        const getButtonPadding = (fontSize?: string): string => {
          const fontSizeToUse = fontSize || getGlobalFontSize();
          const fontSizeNum = parseInt(fontSizeToUse.replace('px', '')) || 16;
          const verticalPadding = Math.max(10, Math.round(fontSizeNum * 0.625));
          const horizontalPadding = Math.max(20, Math.round(fontSizeNum * 1.5));
          return `${verticalPadding}px ${horizontalPadding}px`;
        };
        
        const globalFontSize = getGlobalFontSize();
        const globalFontWeight = getGlobalFontWeight();
        const globalFontStyle = getGlobalFontStyle();
        
        // Use button-specific font size if available, otherwise fall back to global
        const buttonFontSize = field.buttonFontSize || globalFontSize;
        
        // Use separate background properties to avoid shorthand/non-shorthand conflicts
        const buttonStyle: any = {
          color: field.inputTextColor,
          fontFamily: getFontFamily(),
          textAlign: getTextAlign(field.inputAlignment || 'center'),
          fontSize: buttonFontSize,
          fontWeight: 'bold',
          fontStyle: globalFontStyle,
          padding: getButtonPadding(buttonFontSize),
        };
        
        // Set glow color CSS variable if glow animation is active
        if (field.animation === 'glow') {
          const glowColor = extractGlowColor();
          // Convert hex/rgb to rgba for glow effect
          let rgbaColor = glowColor;
          if (glowColor.startsWith('#')) {
            // Convert hex to rgba
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
          buttonStyle['--glow-color'] = rgbaColor;
        }
        
        // Use button-specific icon size if available, otherwise calculate from button height
        const getButtonHeight = (): number => {
          switch (field.buttonSize) {
            case 'small':
              return 32;
            case 'base':
              return 40;
            case 'large':
              return 48;
            case 'extra-large':
              return 56;
            default:
              return 40;
          }
        };
        const buttonHeight = getButtonHeight();
        const iconSize = field.buttonIconSize ?? Math.round(buttonHeight * 0.6);
        
        // Helper function to lighten a color for gradient effect
        const lightenColor = (color: string, percent: number): string => {
          if (color.startsWith('#')) {
            const hex = color.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            const factor = 1 + (percent / 100);
            const newR = Math.min(255, Math.round(r * factor));
            const newG = Math.min(255, Math.round(g * factor));
            const newB = Math.min(255, Math.round(b * factor));
            return `rgb(${newR}, ${newG}, ${newB})`;
          }
          return color;
        };
        
        // Helper function to convert color to rgba with transparency
        const colorToRgba = (color: string, alpha: number): string => {
          if (color.startsWith('#')) {
            const hex = color.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
          }
          if (color.startsWith('rgb(')) {
            return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
          }
          if (color.startsWith('rgba(')) {
            return color.replace(/rgba\(([^,]+),([^,]+),([^,]+),([^)]+)\)/, `rgba($1,$2,$3,${alpha})`);
          }
          return color;
        };
        
        // Set background properties separately
        if (field.backgroundType === 'gradient' && field.gradientBackground) {
          // For gradients with background-shift, use the gradient directly without overlay
          if (field.animation === 'background-shift') {
            buttonStyle.backgroundImage = field.gradientBackground;
            // background-size is set by CSS class, but we ensure it's here too for consistency
            buttonStyle.backgroundSize = '300% 300%';
          } else {
            buttonStyle.backgroundImage = field.gradientBackground;
          }
        } else {
          const solidColor = field.inputBackgroundColor || '#000000';
          // For background-shift animation with solid colors, convert to gradient with transparency
          if (field.animation === 'background-shift') {
            // Check if color is black or very dark (to handle black specifically)
            const hex = solidColor.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            const isDark = r < 30 && g < 30 && b < 30;
            
            if (isDark) {
              // For black/dark colors, use white overlay with transparency for visible shift
              const rgbaBase = colorToRgba(solidColor, 1);
              buttonStyle.backgroundImage = `linear-gradient(135deg, ${rgbaBase} 0%, rgba(255,255,255,0.15) 25%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.15) 75%, ${rgbaBase} 100%)`;
            } else {
              // For lighter colors, use the original approach with lightening
              const lighterColor = lightenColor(solidColor, 40);
              const rgbaBase = colorToRgba(solidColor, 1);
              const rgbaLight = colorToRgba(lighterColor, 0.7);
              const rgbaTransparent = colorToRgba(solidColor, 0.5);
              buttonStyle.backgroundImage = `linear-gradient(135deg, ${rgbaBase} 0%, ${rgbaTransparent} 25%, ${rgbaLight} 50%, ${rgbaTransparent} 75%, ${rgbaBase} 100%)`;
            }
            // background-size is set by CSS class, but we ensure it's here too for consistency
            buttonStyle.backgroundSize = '300% 300%';
          } else {
            buttonStyle.backgroundColor = solidColor;
          }
        }
        
        // Ensure animations work properly by setting will-change for better performance
        if (field.animation && field.animation !== 'none') {
          if (field.animation === 'background-shift') {
            buttonStyle.willChange = 'background-position';
          } else if (field.animation === 'shake' || field.animation === 'bounce') {
            buttonStyle.willChange = 'transform';
          } else if (field.animation === 'pulse') {
            buttonStyle.willChange = 'transform, opacity';
          } else if (field.animation === 'glow') {
            buttonStyle.willChange = 'box-shadow';
          }
        }
        
        return (
          <div key={field.id}>
            <Button 
              type={isPreview ? 'button' : 'submit'}
              className={`w-full ${getAnimationClass(field.animation)}`}
              size={getButtonSize(field.buttonSize)}
              onClick={isPreview ? handleFieldClick : undefined}
              style={{
                ...buttonStyle,
                ...(isExtraLarge && {
                  height: '56px',
                  padding: '16px 32px',
                  fontSize: buttonFontSize || '18px'
                })
              }}
            >
              {IconComponent && (
                <IconComponent 
                  size={iconSize} 
                  style={{ fill: 'currentColor', strokeWidth: 1.5, width: `${iconSize}px`, height: `${iconSize}px` }}
                />
              )}
              {field.label}
            </Button>
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
    <div className="space-y-4">
      <style>{`
        input::placeholder,
        textarea::placeholder,
        select::placeholder {
          font-weight: normal !important;
          font-style: normal !important;
          font-size: 14px !important;
        }
      `}</style>
      {globalSettings && (
        <div className="space-y-3! mb-0">
          {globalSettings.headline.enabled && (
            <h2
              style={{
                color: getPrimaryColor(),
                textAlign: getTextAlign(globalSettings.headline.alignment),
                fontFamily: getFontFamily(),
                fontSize: '24px',
                fontWeight: 'bold',
                fontStyle: getGlobalFontStyle(),
                margin: 0,
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
          <p className="mb-2 font-medium">No visible fields</p>
          <p className="text-sm text-muted-foreground">
            Enable some fields to see the {isPreview ? 'preview' : 'form'}
          </p>
        </div>
      ) : (
        visibleFields.map(renderField)
      )}
    </div>
  );

  // In preview mode, wrap in Card. In production mode, wrap in form element
  if (isPreview) {
    const borderStyle = getBorderStyle();
    return (
      <Card style={borderStyle} className="p-0">
        <CardContent className="space-y-4 p-0">
          {content}
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" style={getBorderStyle()}>
      {content}
    </form>
  );
}

