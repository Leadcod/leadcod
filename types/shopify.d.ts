/// <reference types="@shopify/app-bridge-types" />
/// <reference types="@shopify/polaris-types" />

import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      's-app-nav': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      's-link': React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
      's-select': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        label?: string;
        value?: string;
        onChange?: (e: any) => void;
      }, HTMLElement>;
      's-option': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        value?: string;
      }, HTMLElement>;
      's-option-group': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        label?: string;
      }, HTMLElement>;
      'ui-save-bar': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        id?: string;
      }, HTMLElement>;
    }
  }
}
