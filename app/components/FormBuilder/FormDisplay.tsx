'use client';

import { useState, FormEvent } from 'react';
import * as Icons from 'lucide-react';
import { FormField, GlobalFormSettings } from '@/app/types/form';
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface FormDisplayProps {
  fields: FormField[];
  globalSettings?: GlobalFormSettings;
  onFieldClick?: (fieldId: string) => void;
  mode?: 'preview' | 'production';
  onSubmit?: (formData: Record<string, any>) => void;
}

export default function FormDisplay({ 
  fields, 
  globalSettings, 
  onFieldClick, 
  mode = 'preview',
  onSubmit 
}: FormDisplayProps) {
  const isPreview = mode === 'preview';
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Filter only visible fields and sort by order
  const visibleFields = fields
    .filter((field) => field.visible)
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

    const inputStyle = {
      color: field.inputTextColor,
      backgroundColor: field.inputBackgroundColor,
      fontFamily: getFontFamily(),
      textAlign: getTextAlign(field.inputAlignment || 'left'),
      fontSize: globalFontSize,
      fontWeight: globalFontWeight,
      fontStyle: globalFontStyle,
      padding: getPadding(globalFontSize),
      height: getHeight(globalFontSize),
      minHeight: getHeight(globalFontSize),
    };

    const iconStyle = {
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
    };
    
    // Calculate icon size based on global font size
    const iconSize = getIconSize(globalFontSize, 16);

    const labelStyle = {
      fontFamily: getFontFamily(),
      color: primaryColor,
      textAlign: getTextAlign(field.labelAlignment || 'left'),
      fontSize: globalFontSize,
      fontWeight: globalFontWeight,
      fontStyle: globalFontStyle,
    };

    const handleFieldClick = () => {
      if (isPreview && onFieldClick) {
        onFieldClick(field.id);
      }
    };

    const cursorClass = isPreview && onFieldClick ? 'cursor-pointer' : 'cursor-default';

    switch (field.type) {
      case 'name':
      case 'city':
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
              {IconComponent && (
                <InputGroupAddon style={iconStyle}>
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
            </InputGroup>
          </div>
        );

      case 'phone':
        return (
          <div key={field.id} className="space-y-2">
            {field.showLabel && (
              <Label style={labelStyle}>
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
            )}
            <InputGroup onClick={handleFieldClick} className={cursorClass}>
              <InputGroupAddon style={iconStyle}>
                +213
              </InputGroupAddon>
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
              {IconComponent && (
                <InputGroupAddon style={iconStyle}>
                  <IconComponent size={iconSize} />
                </InputGroupAddon>
              )}
            </InputGroup>
          </div>
        );

      case 'province':
        return (
          <div key={field.id} className="space-y-2">
            {field.showLabel && (
              <Label style={labelStyle}>
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
            )}
            <InputGroup onClick={handleFieldClick} className={cursorClass}>
              {IconComponent && (
                <InputGroupAddon style={iconStyle}>
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
                  className={`w-full flex-1 rounded-none rounded-r-md border-l-0 ${cursorClass}`}
                  style={inputStyle}
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
                  <SelectValue placeholder={field.showPlaceholder ? field.placeholder : 'Select'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ontario">Ontario</SelectItem>
                  <SelectItem value="quebec">Quebec</SelectItem>
                  <SelectItem value="british-columbia">British Columbia</SelectItem>
                  <SelectItem value="alberta">Alberta</SelectItem>
                  <SelectItem value="manitoba">Manitoba</SelectItem>
                  <SelectItem value="saskatchewan">Saskatchewan</SelectItem>
                </SelectContent>
              </Select>
            </InputGroup>
          </div>
        );

      case 'variants':
        return (
          <div key={field.id} className="space-y-2">
            {field.showLabel && (
              <Label style={labelStyle}>
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
            )}
            <InputGroup onClick={handleFieldClick} className={cursorClass}>
              {IconComponent && (
                <InputGroupAddon style={iconStyle}>
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
                  className={`w-full flex-1 rounded-none rounded-r-md border-l-0 ${cursorClass}`}
                  style={inputStyle}
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
                  <SelectValue placeholder={field.showPlaceholder ? field.placeholder : 'Select'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Size: Small</SelectItem>
                  <SelectItem value="medium">Size: Medium</SelectItem>
                  <SelectItem value="large">Size: Large</SelectItem>
                </SelectContent>
              </Select>
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
              {IconComponent && (
                <InputGroupAddon style={iconStyle}>
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
                {IconComponent && (
                  <InputGroupAddon style={iconStyle}>
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

      case 'buyButton':
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
        
        // Use separate background properties to avoid shorthand/non-shorthand conflicts
        const buttonStyle: any = {
          color: field.inputTextColor,
          fontFamily: getFontFamily(),
          textAlign: getTextAlign(field.inputAlignment || 'center'),
          fontSize: globalFontSize,
          fontWeight: 'bold',
          fontStyle: globalFontStyle,
          padding: getButtonPadding(globalFontSize),
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
        
        // Calculate icon size based on button height (60% of button height)
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
        const iconSize = Math.round(buttonHeight * 0.6);
        
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
          // For gradients with background-shift, enhance with transparency overlay
          if (field.animation === 'background-shift') {
            const baseGradient = field.gradientBackground;
            // Add a semi-transparent overlay gradient for more dramatic effect
            buttonStyle.backgroundImage = `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.4) 100%), ${baseGradient}`;
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
            buttonStyle.backgroundSize = '300% 300%';
          } else {
            buttonStyle.backgroundColor = solidColor;
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
                  fontSize: '18px'
                })
              }}
            >
              {IconComponent && <IconComponent size={iconSize} />}
              {field.label}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const getBorderStyle = () => {
    if (!globalSettings?.border?.enabled) {
      return {};
    }
    return {
      borderWidth: `${globalSettings.border.width}px`,
      borderStyle: globalSettings.border.style,
      borderColor: globalSettings.border.color || '#9ca3af',
      borderRadius: `${globalSettings.border.radius}px`,
      padding: `${globalSettings.border.padding}px`,
      width: '100%',
      boxSizing: 'border-box',
    };
  };

  const content = (
    <div className="space-y-4">
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

