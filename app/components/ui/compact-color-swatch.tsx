'use client';

import { useState } from 'react';

interface CompactColorSwatchProps {
  value: string;
  onChange: (color: string) => void;
}

export default function CompactColorSwatch({ value, onChange }: CompactColorSwatchProps) {
  const [showPicker, setShowPicker] = useState(false);
  
  // Ensure we have a valid color value
  // Handle undefined, null, empty string, or invalid values
  const colorValue = (value && typeof value === 'string' && value.trim()) 
    ? value.trim() 
    : '#000000';
  
  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={() => setShowPicker(!showPicker)}
        style={{
          width: '32px',
          height: '32px',
          position: 'relative',
          borderRadius: '4px',
          cursor: 'pointer',
          border: '1px solid #d1d5db',
          boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.1)',
          flexShrink: 0,
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
            onClick={() => setShowPicker(false)}
          />
          <div style={{ 
            position: 'absolute', 
            zIndex: 100,
            top: '100%',
            left: 0,
            marginTop: '8px'
          }}>
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
        </>
      )}
    </div>
  );
}

