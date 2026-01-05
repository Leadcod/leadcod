'use client';

import { useState } from 'react';

interface CompactColorSwatchProps {
  value: string;
  onChange: (color: string) => void;
}

export default function CompactColorSwatch({ value, onChange }: CompactColorSwatchProps) {
  const [showPicker, setShowPicker] = useState(false);
  
  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={() => setShowPicker(!showPicker)}
        style={{
          width: '32px',
          height: '32px',
          backgroundColor: value,
          border: '1px solid #e5e5e5',
          borderRadius: '4px',
          cursor: 'pointer',
          flexShrink: 0
        }}
      />
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
              value={value} 
              alpha 
              onChange={(e: any) => {
                onChange(e.target.value || e.detail?.value || value);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

