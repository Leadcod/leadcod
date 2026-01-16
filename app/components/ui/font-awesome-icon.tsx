'use client';

import React from 'react';

interface FontAwesomeIconProps {
  icon: string;
  className?: string;
  size?: number | string;
  style?: React.CSSProperties;
}

// Mapping from icon names to Font Awesome icon classes
const iconMap: Record<string, string> = {
  // Direct mappings
  User: 'fa-user',
  Phone: 'fa-phone',
  Mail: 'fa-envelope',
  MapPin: 'fa-location-dot',
  Building: 'fa-building',
  Home: 'fa-house',
  Map: 'fa-map',
  Package: 'fa-cube',
  ShoppingCart: 'fa-cart-shopping',
  ShoppingBag: 'fa-bag-shopping',
  Tag: 'fa-tag',
  Ticket: 'fa-ticket',
  Hash: 'fa-hashtag',
  FileText: 'fa-file-lines',
  Calendar: 'fa-calendar',
  Clock: 'fa-clock',
  CreditCard: 'fa-credit-card',
  DollarSign: 'fa-dollar-sign',
  Heart: 'fa-heart',
  Star: 'fa-star',
  Bookmark: 'fa-bookmark',
  MessageSquare: 'fa-comment',
  MessageCircle: 'fa-comment-dots',
  Message: 'fa-message',
  Send: 'fa-paper-plane',
  Globe: 'fa-globe',
  Link: 'fa-link',
  Image: 'fa-image',
  File: 'fa-file',
  Folder: 'fa-folder',
  Search: 'fa-magnifying-glass',
  Filter: 'fa-filter',
  Check: 'fa-check',
  X: 'fa-xmark',
  XMark: 'fa-xmark',
  Plus: 'fa-plus',
  Minus: 'fa-minus',
  Zap: 'fa-bolt',
  ArrowRight: 'fa-arrow-right',
  ArrowPath: 'fa-arrow-rotate-right',
  CheckCircle: 'fa-circle-check',
  CircleStack: 'fa-circle',
  Eye: 'fa-eye',
  EyeSlash: 'fa-eye-slash',
  Bars3: 'fa-bars',
  Bars3BottomLeft: 'fa-bars',
  Bars3BottomRight: 'fa-bars',
  ChevronDown: 'fa-chevron-down',
  ChevronUp: 'fa-chevron-up',
  Cog6Tooth: 'fa-gear',
};

export const FontAwesomeIcon: React.FC<FontAwesomeIconProps> = ({ 
  icon, 
  className = '', 
  size,
  style = {}
}) => {
  const iconClass = iconMap[icon] || `fa-${icon.toLowerCase()}`;
  const sizeStyle = size ? { fontSize: typeof size === 'number' ? `${size}px` : size } : {};
  
  return (
    <i 
      className={`fa-solid ${iconClass} ${className}`}
      style={{ ...sizeStyle, ...style }}
    />
  );
};

// Helper function to get Font Awesome icon class name
export const getFontAwesomeIcon = (iconName: string): string => {
  return iconMap[iconName] || `fa-${iconName.toLowerCase()}`;
};
