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
}

export interface FormSettings {
  fields: FormField[];
}

export const DEFAULT_FORM_FIELDS: FormField[] = [
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
    order: 0,
    category: 'client',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff'
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
    order: 1,
    category: 'client',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff'
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
    order: 2,
    category: 'client',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff'
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
    order: 3,
    category: 'client',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff'
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
    visible: true,
    order: 4,
    category: 'client',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff'
  },
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
    visible: true,
    order: 5,
    category: 'product',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff'
  },
  // Order Information
  {
    id: 'quantity',
    type: 'quantity',
    label: 'Quantity',
    showLabel: true,
    placeholder: '1',
    showPlaceholder: true,
    icon: 'Hash',
    required: false,
    visible: true,
    order: 6,
    category: 'order',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff'
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
    visible: true,
    order: 7,
    category: 'order',
    inputTextColor: '#000000',
    inputBackgroundColor: '#ffffff'
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
    inputBackgroundColor: '#ffffff'
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
    inputBackgroundColor: '#000000'
  }
];

