'use server';

import { prisma } from '@/lib/prisma';
import { DEFAULT_FORM_FIELDS, DEFAULT_GLOBAL_SETTINGS } from '../types/form';
import { redirect } from 'next/navigation';

interface TokenExchangeResponse {
  access_token: string;
  scope?: string;
  expires_in?: number;
}

interface InitializeShopResult {
  success: boolean;
  shopId?: string;
  formId?: string;
  error?: string;
}

/**
 * Exchange Shopify session token for offline access token
 * and initialize shop and form if they don't exist
 */
export async function initializeShopWithToken(
  sessionToken: string,
  shopUrl: string,
): Promise<InitializeShopResult> {
  try {
    // Get client secret from server-side environment variable
    const clientSecret = process.env.SHOPIFY_API_SECRET;
    const clientId = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY;
    if (!clientSecret || !clientId) {
      return {
        success: false,
        error: 'Shopify client secret or client id not configured in environment variables',
      };
    }
    const tokenExchangeUrl = `https://${shopUrl}/admin/oauth/access_token`;
    
    const formData = new URLSearchParams();
    formData.append('client_id', clientId || '');
    formData.append('client_secret', clientSecret);
    formData.append('grant_type', 'urn:ietf:params:oauth:grant-type:token-exchange');
    formData.append('subject_token', sessionToken);
    formData.append('subject_token_type', 'urn:ietf:params:oauth:token-type:id_token');
    formData.append('requested_token_type', 'urn:shopify:params:oauth:token-type:offline-access-token');

    const tokenResponse = await fetch(tokenExchangeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: formData.toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return {
        success: false,
        error: `Token exchange failed: ${tokenResponse.status} ${tokenResponse.statusText} - ${errorText}`,
      };
    }

    const tokenData: TokenExchangeResponse = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      return {
        success: false,
        error: 'Access token not found in response',
      };
    }

    const accessToken = tokenData.access_token;

    // Step 2: Find or create shop with access token
    let shop = await prisma.shop.findFirst({
      where: { url: shopUrl },
    });

    if (!shop) {
      shop = await prisma.shop.create({
        data: {
          url: shopUrl,
          accessToken: accessToken,
        },
      });
    } else {
      // Update existing shop with new access token
      shop = await prisma.shop.update({
        where: { id: shop.id },
        data: {
          accessToken: accessToken,
          updatedAt: new Date(),
        },
      });
    }

    // Step 3: Find or create form with default values
    let form = await prisma.form.findFirst({
      where: { shopId: shop.id },
    });

    if (!form) {
      form = await prisma.form.create({
        data: {
          shopId: shop.id,
          name: 'Order Form',
          fields: DEFAULT_FORM_FIELDS as any,
          settings: DEFAULT_GLOBAL_SETTINGS as any,
        },
      });
    }

    return {
      success: true,
      shopId: shop.id,
      formId: form.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Check if a shop exists in the database
 */
export async function shopExists(shopUrl: string): Promise<boolean> {
  try {
    const shop = await prisma.shop.findFirst({
      where: { url: shopUrl },
      select: { id: true }
    });
    return !!shop;
  } catch (error) {
    return false;
  }
}
