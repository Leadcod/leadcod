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
  | 'shippingOption'
  | 'buyButton'
  | 'whatsappButton';

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
  fontFamily: 'cairo' | 'poppins' | 'montserrat';
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
  // Shadow settings (for shippingOption)
  shadow?: {
    enabled: boolean;
    color: string;
    blur: number; // blur radius in px
    spread: number; // spread radius in px
    offsetX: number; // horizontal offset in px
    offsetY: number; // vertical offset in px
  };
  // Buy button specific
  backgroundType?: 'solid' | 'gradient';
  gradientBackground?: string; // CSS gradient string
  animation?: 'none' | 'background-shift' | 'shake' | 'bounce' | 'pulse' | 'glow';
  buttonSize?: 'small' | 'base' | 'large' | 'extra-large';
  buttonFontSize?: string; // Font size for button text
  buttonIconSize?: number; // Icon size in pixels
  showQuantity?: boolean; // Show/hide quantity selector in buy button
  // WhatsApp button specific
  whatsappNumber?: string; // WhatsApp number (e.g., "213000000000")
  // Summary field specific
  summaryPlaceholder?: string; // Placeholder text when no province/shipping is selected
  totalLabel?: string; // Custom text for "Total" label
  shippingLabel?: string; // Custom text for shipping price label (e.g., "Shipping Price", "Prix de livraison")
  chooseProvinceHint?: string; // Custom text for "Choose province" hint
  selectShippingOptionHint?: string; // Custom text for "Select shipping option" hint
  summaryAlignment?: 'left' | 'center' | 'right'; // Text alignment in summary
  // Shipping option field specific
  shippingAlignment?: 'left' | 'center' | 'right'; // Text alignment in shipping options
  // City field specific
  selectProvinceFirstHint?: string; // Custom text for "Select province first" hint when no province is selected
  // Phone field specific
  phoneErrorNumbersOnly?: string; // Custom error message for non-numeric input
  phoneErrorInvalidPrefix?: string; // Custom error message for invalid prefix
  phoneErrorWrongLength10?: string; // Custom error message for wrong length when starting with 0
  phoneErrorWrongLength9?: string; // Custom error message for wrong length when starting with 5, 6, or 7
}

export interface GlobalFormSettings {
  primaryColor: string;
  fontFamily: 'cairo' | 'poppins' | 'montserrat';
  fontSize: string;
  fontWeight: 'normal' | 'bold' | '600' | '700';
  fontStyle: 'normal' | 'italic';
  inputPadding: {
    vertical: number;
    horizontal: number;
  };
  headline: {
    enabled: boolean;
    text: string;
    alignment: 'left' | 'center' | 'right';
    color?: string;
    fontSize?: string;
    fontWeight?: 'normal' | 'bold' | '600' | '700';
    fontStyle?: 'normal' | 'italic';
  };
  subtitle: {
    enabled: boolean;
    text: string;
    alignment: 'left' | 'center' | 'right';
    color?: string;
    fontSize?: string;
    fontWeight?: 'normal' | 'bold' | '600' | '700';
    fontStyle?: 'normal' | 'italic';
  };
  border: {
    enabled: boolean;
    width: number;
    style: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
    radius: number;
    padding: number;
    color: string;
  };
  currency?: string; // Currency symbol/text (e.g., "DZD", "$", "€")
  thankYouPopup?: {
    title: string;
    message: string;
    buttonText: string;
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
    label: 'المتغيرات',
    showLabel: true,
    placeholder: 'اختر المتغير',
    showPlaceholder: true,
    icon: 'Package',
    required: false,
    visible: false,
    order: 0,
    category: 'product',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff',
    fontFamily: 'cairo',
    labelColor: '#000000',
    labelAlignment: 'right',
    inputAlignment: 'right'
  },
  // Client Information
  {
    id: 'name',
    type: 'name',
    label: 'الاسم',
    showLabel: true,
    placeholder: 'أدخل اسمك',
    showPlaceholder: true,
    icon: 'User',
    required: true, // Always required
    visible: true,
    order: 1,
    category: 'client',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff',
    fontFamily: 'cairo',
    labelColor: '#000000',
    labelAlignment: 'right',
    inputAlignment: 'right'
  },
  {
    id: 'phone',
    type: 'phone',
    label: 'رقم الهاتف',
    showLabel: true,
    placeholder: 'أدخل رقم الهاتف',
    showPlaceholder: true,
    icon: 'Phone',
    required: true, // Always required
    visible: true,
    order: 2,
    category: 'client',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff',
    fontFamily: 'cairo',
    labelColor: '#000000',
    labelAlignment: 'right',
    inputAlignment: 'right'
  },
  {
    id: 'province',
    type: 'province',
    label: 'الولاية',
    showLabel: true,
    placeholder: 'اختر الولاية',
    showPlaceholder: true,
    icon: 'MapPin',
    required: true, // Always required
    visible: true,
    order: 3,
    category: 'client',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff',
    fontFamily: 'cairo',
    labelColor: '#000000',
    labelAlignment: 'right',
    inputAlignment: 'right'
  },
  {
    id: 'city',
    type: 'city',
    label: 'المدينة',
    showLabel: true,
    placeholder: 'أدخل مدينتك',
    showPlaceholder: true,
    icon: 'Building',
    required: true, // Always required
    visible: true,
    order: 4,
    category: 'client',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff',
    fontFamily: 'cairo',
    labelColor: '#000000',
    labelAlignment: 'right',
    inputAlignment: 'right',
    selectProvinceFirstHint: 'اختر الولاية أولاً'
  },
  {
    id: 'quantity',
    type: 'quantity',
    label: 'الكمية',
    showLabel: true,
    placeholder: '1',
    showPlaceholder: true,
    icon: 'Hash',
    required: false,
    visible: true,
    order: 10,
    category: 'order',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff',
    fontFamily: 'cairo',
    labelColor: '#000000',
    labelAlignment: 'right',
    inputAlignment: 'right'
  },
  {
    id: 'email',
    type: 'email',
    label: 'البريد الإلكتروني',
    showLabel: true,
    placeholder: 'أدخل بريدك الإلكتروني',
    showPlaceholder: true,
    icon: 'Mail',
    required: false,
    visible: false,
    order: 6,
    category: 'client',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff',
    fontFamily: 'cairo',
    labelColor: '#000000',
    labelAlignment: 'right',
    inputAlignment: 'right'
  },
  {
    id: 'coupon',
    type: 'coupon',
    label: 'الكوبون',
    showLabel: true,
    placeholder: 'أدخل رمز الكوبون',
    showPlaceholder: true,
    icon: 'Ticket',
    required: false,
    visible: false,
    order: 7,
    category: 'order',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff',
    fontFamily: 'cairo',
    labelColor: '#000000',
    labelAlignment: 'right',
    inputAlignment: 'right'
  },
  {
    id: 'summary',
    type: 'summary',
    label: 'الملخص',
    showLabel: true,
    placeholder: '',
    showPlaceholder: false,
    icon: 'FileText',
    required: false,
    visible: true,
    order: 9,
    category: 'order',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff',
    fontFamily: 'cairo',
    labelColor: '#000000',
    labelAlignment: 'right',
    inputAlignment: 'right',
    summaryPlaceholder: '-',
    totalLabel: 'المجموع',
    shippingLabel: 'سعر الشحن',
    chooseProvinceHint: 'اختر الولاية',
    selectShippingOptionHint: 'اختر خيار الشحن',
    summaryAlignment: 'right'
  },
  {
    id: 'shippingOption',
    type: 'shippingOption',
    label: 'خيار الشحن',
    showLabel: true,
    placeholder: '',
    showPlaceholder: false,
    icon: 'Truck',
    required: false,
    visible: true,
    order: 8,
    category: 'order',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff',
    fontFamily: 'cairo',
    labelColor: '#000000',
    labelAlignment: 'right',
    shippingAlignment: 'right',
    shadow: {
      enabled: false,
      color: '#000000',
      blur: 4,
      spread: 0,
      offsetX: 0,
      offsetY: 2
    }
  },
  {
    id: 'buyButton',
    type: 'buyButton',
    label: 'شراء الآن',
    showLabel: false,
    placeholder: '',
    showPlaceholder: false,
    icon: 'ShoppingCart',
    required: false,
    visible: true,
    order: 11,
    category: 'order',
    inputTextColor: '#ffffff',
    inputBackgroundColor: '#000000',
    fontFamily: 'cairo',
    labelColor: '#000000',
    labelAlignment: 'right',
    inputAlignment: 'right',
    backgroundType: 'solid',
    gradientBackground: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    animation: 'none',
    buttonSize: 'base',
    buttonFontSize: '16px',
    buttonIconSize: 20,
    showQuantity: false
  },
  {
    id: 'whatsappButton',
    type: 'whatsappButton',
    label: 'طلب عبر واتساب',
    showLabel: false,
    placeholder: '',
    showPlaceholder: false,
    icon: 'MessageCircle',
    required: false,
    visible: true,
    order: 12,
    category: 'order',
    inputTextColor: '#ffffff',
    inputBackgroundColor: '#25D366',
    fontFamily: 'cairo',
    labelColor: '#000000',
    labelAlignment: 'right',
    inputAlignment: 'right',
    backgroundType: 'solid',
    gradientBackground: 'linear-gradient(135deg, #25D366 0%, #20ba5a 100%)',
    animation: 'none',
    buttonSize: 'base',
    buttonFontSize: '16px',
    buttonIconSize: 20,
    whatsappNumber: '213000000000'
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

export const BRAND_COLOR = '#15803d';

export const DEFAULT_GLOBAL_SETTINGS: GlobalFormSettings = {
  primaryColor: BRAND_COLOR,
  fontFamily: 'cairo',
  fontSize: '16px',
  fontWeight: 'bold',
  fontStyle: 'normal',
  inputPadding: {
    vertical: 12,
    horizontal: 12
  },
  headline: {
    enabled: true,
    text: 'نموذج الطلب',
    alignment: 'center',
    color: '#000000',
    fontSize: '24px',
    fontWeight: 'bold',
    fontStyle: 'normal'
  },
  subtitle: {
    enabled: true,
    text: 'يرجى ملء النموذج أدناه',
    alignment: 'center',
    color: '#000000',
    fontSize: '16px',
    fontWeight: 'normal',
    fontStyle: 'normal'
  },
  border: {
    enabled: true,
    width: 1,
    style: 'solid',
    radius: 6,
    padding: 16,
    color: '#9ca3af'
  },
  currency: 'دج',
  thankYouPopup: {
    title: 'شكراً لك!',
    message: 'تم تقديم طلبك بنجاح. سنتواصل معك قريباً.',
    buttonText: 'موافق'
  }
};

