/// <reference types="@shopify/app-bridge-types" />
/// <reference types="@shopify/polaris-types" />

import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      's-app-nav': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      's-link': React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
      'ui-save-bar': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        id?: string;
        "aria-hidden"?: boolean;
      }, HTMLElement>;
    }
  }
}
