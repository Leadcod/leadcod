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
    console.warn('Could not find api_version in shopify.app.toml, using default: 2026-04');
    return '2026-04';
  } catch (error) {
    console.error('Error reading shopify.app.toml:', error);
    // Fallback to default
    return '2026-04';
  }
}

/**
 * Shopify API version - single source of truth
 * This value is read from shopify.app.toml at build time
 */
export const SHOPIFY_API_VERSION = getShopifyApiVersion();
