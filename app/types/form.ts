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
}

export interface FormSettings {
  fields: FormField[];
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
    fontFamily: 'nunito'
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
    fontFamily: 'nunito'
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
    fontFamily: 'nunito'
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
    fontFamily: 'nunito'
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
    fontFamily: 'nunito'
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
    fontFamily: 'nunito'
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
    fontFamily: 'nunito'
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
    fontFamily: 'nunito'
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
    fontFamily: 'nunito'
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
    fontFamily: 'nunito'
  }
];

