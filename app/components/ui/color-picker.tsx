'use client';

import { useState } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
}

export default function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

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
            backgroundColor: value,
            border: '1px solid #e5e5e5',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        />
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
                value={value} 
                alpha 
                onChange={(e: any) => {
                  onChange(e.target.value || e.detail?.value || value);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

