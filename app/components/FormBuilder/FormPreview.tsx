'use client';

import * as Icons from 'lucide-react';
import { FormField } from '@/app/types/form';
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface FormPreviewProps {
  fields: FormField[];
}

export default function FormPreview({ fields }: FormPreviewProps) {
  // Filter only visible fields and sort by order
  const visibleFields = fields
    .filter((field) => field.visible)
    .sort((a, b) => a.order - b.order);

  const renderField = (field: FormField) => {
    const IconComponent = (Icons as any)[field.icon] || Icons.Circle;

    const inputStyle = {
      color: field.inputTextColor,
      backgroundColor: field.inputBackgroundColor,
    };

    const iconStyle = {
      color: field.inputTextColor,
    };

    switch (field.type) {
      case 'name':
      case 'city':
      case 'email':
        return (
          <div key={field.id} className="space-y-2">
            {field.showLabel && (
              <Label>
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
            )}
            <InputGroup>
              <InputGroupAddon style={iconStyle}>
                <IconComponent size={16} />
              </InputGroupAddon>
              <InputGroupInput
                type={field.type === 'email' ? 'email' : 'text'}
                placeholder={field.showPlaceholder ? field.placeholder : ''}
                style={inputStyle}
                required={field.required}
              />
            </InputGroup>
          </div>
        );

      case 'phone':
        return (
          <div key={field.id} className="space-y-2">
            {field.showLabel && (
              <Label>
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
            )}
            <InputGroup>
              <InputGroupAddon style={iconStyle}>
                +213
              </InputGroupAddon>
              <InputGroupInput
                type="tel"
                placeholder={field.showPlaceholder ? field.placeholder : ''}
                style={inputStyle}
                required={field.required}
              />
              <InputGroupAddon style={iconStyle}>
                <IconComponent size={16} />
              </InputGroupAddon>
            </InputGroup>
          </div>
        );

      case 'province':
        return (
          <div key={field.id} className="space-y-2">
            {field.showLabel && (
              <Label>
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
            )}
            <InputGroup>
              <InputGroupAddon style={iconStyle}>
                <IconComponent size={16} />
              </InputGroupAddon>
              <Select required={field.required}>
                <SelectTrigger className="w-full flex-1 rounded-none rounded-r-md border-l-0" style={inputStyle}>
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
              <Label>
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
            )}
            <InputGroup>
              <InputGroupAddon style={iconStyle}>
                <IconComponent size={16} />
              </InputGroupAddon>
              <Select required={field.required}>
                <SelectTrigger className="w-full flex-1 rounded-none rounded-r-md border-l-0" style={inputStyle}>
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
              <Label>
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
            )}
            <InputGroup>
              <InputGroupAddon style={iconStyle}>
                <IconComponent size={16} />
              </InputGroupAddon>
              <InputGroupInput
                type="number"
                min={1}
                defaultValue="1"
                placeholder={field.showPlaceholder ? field.placeholder : ''}
                style={inputStyle}
                required={field.required}
              />
            </InputGroup>
          </div>
        );

      case 'coupon':
        return (
          <div key={field.id} className="space-y-2">
            {field.showLabel && (
              <Label>
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
            )}
            <div className="flex items-center gap-2">
              <InputGroup className="flex-1">
                <InputGroupAddon style={iconStyle}>
                  <IconComponent size={16} />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder={field.showPlaceholder ? field.placeholder : ''}
                  style={inputStyle}
                  required={field.required}
                />
              </InputGroup>
              <Button>
                Apply
              </Button>
            </div>
          </div>
        );

      case 'summary':
        return (
          <Card key={field.id} className="bg-muted/50 border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                {field.showLabel ? field.label : 'Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
        return (
          <div key={field.id} className="pt-2">
            <Button 
              className="w-full" 
              size="lg"
              style={{
                color: field.inputTextColor,
                backgroundColor: field.inputBackgroundColor,
              }}
            >
              <IconComponent size={20} />
              {field.label}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-xl">Order Form Preview</CardTitle>
        <CardDescription>
          This is how your form will appear to customers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {visibleFields.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4 flex justify-center">
              <Icons.AlertCircle size={48} className="text-muted-foreground" />
            </div>
            <p className="mb-2 font-medium">No visible fields</p>
            <p className="text-sm text-muted-foreground">
              Enable some fields to see the preview
            </p>
          </div>
        ) : (
          visibleFields.map(renderField)
        )}
      </CardContent>
    </Card>
  );
}
