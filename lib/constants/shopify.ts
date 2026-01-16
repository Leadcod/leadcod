import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Get Shopify API version from shopify.app.toml
 * This is the single source of truth for the API version used throughout the app.
 * To update the API version, edit the api_version field in shopify.app.toml under [webhooks]
 * 
 * Example:
 * [webhooks]
 * api_version = "2026-04"
 */
export function getShopifyApiVersion(): string {
  try {
    const tomlPath = join(process.cwd(), 'shopify.app.toml');
    const tomlContent = readFileSync(tomlPath, 'utf-8');
    
    // Extract api_version from [webhooks] section
    // Handles both double quotes and single quotes, and various whitespace
    const webhooksMatch = tomlContent.match(/\[webhooks\][\s\S]*?api_version\s*=\s*["']([^"']+)["']/);
    if (webhooksMatch && webhooksMatch[1]) {
      return webhooksMatch[1];
    }
    
    // Fallback to default if not found
    return '2026-04';
  } catch (error) {
    // Fallback to default
    return '2026-04';
  }
}

/**
 * Get application URL from shopify.app.toml
 * This is the single source of truth for the application URL used throughout the app.
 * To update the application URL, edit the application_url field in shopify.app.toml
 * 
 * Example:
 * application_url = "https://your-app.com"
 */
export function getApplicationUrl(): string | null {
  try {
    const tomlPath = join(process.cwd(), 'shopify.app.toml');
    const tomlContent = readFileSync(tomlPath, 'utf-8');
    
    // Extract application_url (handles both double quotes and single quotes, and various whitespace)
    const urlMatch = tomlContent.match(/application_url\s*=\s*["']([^"']+)["']/);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1].trim();
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get client ID from shopify.app.toml
 * This is used to construct Shopify admin URLs for embedded apps.
 */
export function getClientId(): string | null {
  try {
    const tomlPath = join(process.cwd(), 'shopify.app.toml');
    const tomlContent = readFileSync(tomlPath, 'utf-8');
    
    // Extract client_id (handles both double quotes and single quotes, and various whitespace)
    const clientIdMatch = tomlContent.match(/client_id\s*=\s*["']([^"']+)["']/);
    if (clientIdMatch && clientIdMatch[1]) {
      return clientIdMatch[1].trim();
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get Shopify admin URL for a specific path
 * Format: https://{shop}/admin/apps/{client_id}/{path}?shop={shop}
 */
export function getShopifyAdminUrl(shopUrl: string, path: string): string {
  const clientId = getClientId();
  
  // Normalize shop URL - remove protocol and trailing slash, ensure it's just the domain
  let shop = shopUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  
  // If shop doesn't end with .myshopify.com, assume it's already just the domain
  // Otherwise ensure it's in the correct format
  if (!shop.includes('.')) {
    shop = `${shop}.myshopify.com`;
  }
  
  const adminPath = path.startsWith('/') ? path : `/${path}`;
  const fullShopUrl = shop.startsWith('http') ? shop : `https://${shop}`;
  
  if (clientId) {
    return `https://${shop}/admin/apps/${clientId}${adminPath}?shop=${encodeURIComponent(fullShopUrl)}`;
  }
  
  // Fallback to application URL if client_id not found
  const baseUrl = getApplicationUrl();
  return baseUrl ? `${baseUrl}${adminPath}?shop=${encodeURIComponent(fullShopUrl)}` : `${adminPath}?shop=${encodeURIComponent(fullShopUrl)}`;
}

/**
 * Shopify API version - single source of truth
 * This value is read from shopify.app.toml at build time
 */
export const SHOPIFY_API_VERSION = getShopifyApiVersion();
