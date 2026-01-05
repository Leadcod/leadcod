export type FormFieldType = 
  | 'name'
  | 'phone'
  | 'province'
  | 'city'
  | 'email'
  | 'variants'
  | 'quantity'
  | 'coupon'
  | 'summary'
  | 'buyButton';

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  showLabel: boolean;
  placeholder: string;
  showPlaceholder: boolean;
  icon: string;
  required: boolean;
  visible: boolean;
  order: number;
  category: 'client' | 'product' | 'order';
  inputTextColor: string;
  inputBackgroundColor: string;
  fontFamily: 'cairo' | 'nunito' | 'poppins' | 'montserrat';
  // Label styling
  labelColor?: string;
  labelAlignment?: 'left' | 'center' | 'right';
  labelFontSize?: string;
  labelFontWeight?: 'normal' | 'bold' | '600' | '700';
  labelFontStyle?: 'normal' | 'italic';
  // Input styling
  inputAlignment?: 'left' | 'center' | 'right';
  inputFontSize?: string;
  inputFontWeight?: 'normal' | 'bold' | '600' | '700';
  inputFontStyle?: 'normal' | 'italic';
  // Buy button specific
  backgroundType?: 'solid' | 'gradient';
  gradientBackground?: string; // CSS gradient string
  animation?: 'none' | 'background-shift' | 'shake' | 'bounce' | 'pulse' | 'glow';
  buttonSize?: 'small' | 'base' | 'large' | 'extra-large';
}

export interface GlobalFormSettings {
  headline: {
    enabled: boolean;
    text: string;
    color: string;
    alignment: 'left' | 'center' | 'right';
    fontFamily: 'cairo' | 'nunito' | 'poppins' | 'montserrat';
    fontSize: string;
    fontWeight: 'normal' | 'bold' | '600' | '700';
    fontStyle: 'normal' | 'italic';
  };
  subtitle: {
    enabled: boolean;
    text: string;
    color: string;
    alignment: 'left' | 'center' | 'right';
    fontFamily: 'cairo' | 'nunito' | 'poppins' | 'montserrat';
    fontSize: string;
    fontWeight: 'normal' | 'bold' | '600' | '700';
    fontStyle: 'normal' | 'italic';
  };
}

export interface FormSettings {
  fields: FormField[];
  globalSettings?: GlobalFormSettings;
}

export const DEFAULT_FORM_FIELDS: FormField[] = [
  // Product Information
  {
    id: 'variants',
    type: 'variants',
    label: 'Variants',
    showLabel: true,
    placeholder: 'Select variant',
    showPlaceholder: true,
    icon: 'Package',
    required: false,
    visible: false,
    order: 0,
    category: 'product',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff',
    fontFamily: 'nunito',
    labelColor: '#000000',
    labelAlignment: 'left',
    labelFontSize: '14px',
    labelFontWeight: 'normal',
    labelFontStyle: 'normal',
    inputAlignment: 'left',
    inputFontSize: '16px',
    inputFontWeight: 'normal',
    inputFontStyle: 'normal'
  },
  // Client Information
  {
    id: 'name',
    type: 'name',
    label: 'Name',
    showLabel: true,
    placeholder: 'Enter your name',
    showPlaceholder: true,
    icon: 'User',
    required: true, // Always required
    visible: true,
    order: 1,
    category: 'client',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff',
    fontFamily: 'nunito',
    labelColor: '#000000',
    labelAlignment: 'left',
    labelFontSize: '14px',
    labelFontWeight: 'normal',
    labelFontStyle: 'normal',
    inputAlignment: 'left',
    inputFontSize: '16px',
    inputFontWeight: 'normal',
    inputFontStyle: 'normal'
  },
  {
    id: 'phone',
    type: 'phone',
    label: 'Phone',
    showLabel: true,
    placeholder: 'Enter phone number',
    showPlaceholder: true,
    icon: 'Phone',
    required: true, // Always required
    visible: true,
    order: 2,
    category: 'client',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff',
    fontFamily: 'nunito',
    labelColor: '#000000',
    labelAlignment: 'left',
    labelFontSize: '14px',
    labelFontWeight: 'normal',
    labelFontStyle: 'normal',
    inputAlignment: 'left',
    inputFontSize: '16px',
    inputFontWeight: 'normal',
    inputFontStyle: 'normal'
  },
  {
    id: 'province',
    type: 'province',
    label: 'Province',
    showLabel: true,
    placeholder: 'Select province',
    showPlaceholder: true,
    icon: 'MapPin',
    required: true, // Always required
    visible: true,
    order: 3,
    category: 'client',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff',
    fontFamily: 'nunito',
    labelColor: '#000000',
    labelAlignment: 'left',
    labelFontSize: '14px',
    labelFontWeight: 'normal',
    labelFontStyle: 'normal',
    inputAlignment: 'left',
    inputFontSize: '16px',
    inputFontWeight: 'normal',
    inputFontStyle: 'normal'
  },
  {
    id: 'city',
    type: 'city',
    label: 'City',
    showLabel: true,
    placeholder: 'Enter your city',
    showPlaceholder: true,
    icon: 'Building',
    required: true, // Always required
    visible: true,
    order: 4,
    category: 'client',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff',
    fontFamily: 'nunito',
    labelColor: '#000000',
    labelAlignment: 'left',
    labelFontSize: '14px',
    labelFontWeight: 'normal',
    labelFontStyle: 'normal',
    inputAlignment: 'left',
    inputFontSize: '16px',
    inputFontWeight: 'normal',
    inputFontStyle: 'normal'
  },
  {
    id: 'quantity',
    type: 'quantity',
    label: 'Quantity',
    showLabel: true,
    placeholder: '1',
    showPlaceholder: true,
    icon: 'Hash',
    required: false,
    visible: false,
    order: 5,
    category: 'order',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff',
    fontFamily: 'nunito',
    labelColor: '#000000',
    labelAlignment: 'left',
    labelFontSize: '14px',
    labelFontWeight: 'normal',
    labelFontStyle: 'normal',
    inputAlignment: 'left',
    inputFontSize: '16px',
    inputFontWeight: 'normal',
    inputFontStyle: 'normal'
  },
  {
    id: 'email',
    type: 'email',
    label: 'Email',
    showLabel: true,
    placeholder: 'Enter your email',
    showPlaceholder: true,
    icon: 'Mail',
    required: false,
    visible: false,
    order: 6,
    category: 'client',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff',
    fontFamily: 'nunito',
    labelColor: '#000000',
    labelAlignment: 'left',
    labelFontSize: '14px',
    labelFontWeight: 'normal',
    labelFontStyle: 'normal',
    inputAlignment: 'left',
    inputFontSize: '16px',
    inputFontWeight: 'normal',
    inputFontStyle: 'normal'
  },
  {
    id: 'coupon',
    type: 'coupon',
    label: 'Coupon',
    showLabel: true,
    placeholder: 'Enter coupon code',
    showPlaceholder: true,
    icon: 'Ticket',
    required: false,
    visible: false,
    order: 7,
    category: 'order',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff',
    fontFamily: 'nunito',
    labelColor: '#000000',
    labelAlignment: 'left',
    labelFontSize: '14px',
    labelFontWeight: 'normal',
    labelFontStyle: 'normal',
    inputAlignment: 'left',
    inputFontSize: '16px',
    inputFontWeight: 'normal',
    inputFontStyle: 'normal'
  },
  {
    id: 'summary',
    type: 'summary',
    label: 'Summary',
    showLabel: true,
    placeholder: '',
    showPlaceholder: false,
    icon: 'FileText',
    required: false,
    visible: true,
    order: 8,
    category: 'order',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff',
    fontFamily: 'nunito',
    labelColor: '#000000',
    labelAlignment: 'left',
    labelFontSize: '14px',
    labelFontWeight: 'normal',
    labelFontStyle: 'normal',
    inputAlignment: 'left',
    inputFontSize: '16px',
    inputFontWeight: 'normal',
    inputFontStyle: 'normal'
  },
  {
    id: 'buyButton',
    type: 'buyButton',
    label: 'Buy Now Button',
    showLabel: false,
    placeholder: '',
    showPlaceholder: false,
    icon: 'ShoppingCart',
    required: false,
    visible: true,
    order: 9,
    category: 'order',
    inputTextColor: '#ffffff',
    inputBackgroundColor: '#000000',
    fontFamily: 'nunito',
    labelColor: '#000000',
    labelAlignment: 'left',
    labelFontSize: '14px',
    labelFontWeight: 'normal',
    labelFontStyle: 'normal',
    inputAlignment: 'center',
    inputFontSize: '16px',
    inputFontWeight: 'bold',
    inputFontStyle: 'normal',
    backgroundType: 'solid',
    gradientBackground: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    animation: 'none',
    buttonSize: 'base'
  }
];

// High-converting gradient presets for e-commerce buttons
export const GRADIENT_PRESETS = [
  {
    name: 'Deep Purple',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff'
  },
  {
    name: 'Ocean Breeze',
    value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    preview: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    textColor: '#ffffff'
  },
  {
    name: 'Sunset Glow',
    value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    preview: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    textColor: '#ffffff'
  },
  {
    name: 'Emerald Fresh',
    value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    preview: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    textColor: '#ffffff'
  },
  {
    name: 'Crimson Fire',
    value: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
    preview: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
    textColor: '#ffffff'
  },
  {
    name: 'Midnight Sky',
    value: 'linear-gradient(135deg, #0c3487 0%, #a2b6df 100%)',
    preview: 'linear-gradient(135deg, #0c3487 0%, #a2b6df 100%)',
    textColor: '#ffffff'
  },
  {
    name: 'Forest Deep',
    value: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    preview: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    textColor: '#ffffff'
  },
  {
    name: 'Royal Blue',
    value: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    preview: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    textColor: '#ffffff'
  },
  {
    name: 'Vibrant Orange',
    value: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
    preview: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
    textColor: '#ffffff'
  },
  {
    name: 'Pink Passion',
    value: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
    preview: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
    textColor: '#ffffff'
  },
  {
    name: 'Teal Modern',
    value: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
    preview: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
    textColor: '#ffffff'
  },
  {
    name: 'Lavender Dream',
    value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    preview: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    textColor: '#1a1a1a'
  }
];

export const DEFAULT_GLOBAL_SETTINGS: GlobalFormSettings = {
  headline: {
    enabled: true,
    text: 'Order Form',
    color: '#000000',
    alignment: 'center',
    fontFamily: 'nunito',
    fontSize: '24px',
    fontWeight: 'bold',
    fontStyle: 'normal'
  },
  subtitle: {
    enabled: true,
    text: 'Please fill out the form below',
    color: '#666666',
    alignment: 'center',
    fontFamily: 'nunito',
    fontSize: '16px',
    fontWeight: 'normal',
    fontStyle: 'normal'
  }
};

