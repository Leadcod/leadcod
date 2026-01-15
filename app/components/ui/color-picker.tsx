'use client';

import { useState } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
}

export default function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  // Ensure we have a valid color value
  // Handle undefined, null, empty string, or invalid values
  const colorValue = (value && typeof value === 'string' && value.trim()) 
    ? value.trim() 
    : '#000000';

  return (
    <div>
      <s-text>
        {label}
      </s-text>
      <div style={{ marginTop: '4px', position: 'relative' }}>
        <div
          onClick={() => setShowPicker(!showPicker)}
          style={{
            width: '40px',
            height: '40px',
            position: 'relative',
            borderRadius: '4px',
            cursor: 'pointer',
            border: '1px solid #d1d5db',
            boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
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
          {/* Color overlay - on top of pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: colorValue,
              zIndex: 1
            }}
          />
        </div>
        {showPicker && (
          <div style={{ 
            position: 'absolute', 
            zIndex: 100,
            marginTop: '8px'
          }}>
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
              }}
              onClick={() => setShowPicker(false)}
            />
            <div style={{ position: 'relative' }}>
              <s-color-picker 
                value={colorValue} 
                alpha 
                onChange={(e: any) => {
                  const newColor = e?.target?.value || e?.detail?.value || e?.currentTarget?.value || colorValue;
                  if (newColor && newColor !== colorValue) {
                    onChange(newColor);
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

