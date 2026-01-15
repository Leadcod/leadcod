'use server';

import { FormSettings, DEFAULT_FORM_FIELDS, DEFAULT_GLOBAL_SETTINGS } from '../types/form';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function saveForm(shopUrl: string, formData: FormSettings, isRender: boolean = false) {
  try {
    // Find or create shop
    let shop = await prisma.shop.findFirst({
      where: { url: shopUrl }
    });

    if (!shop) {
      shop = await prisma.shop.create({
        data: {
          url: shopUrl
        }
      });
    }

    // Find or create form
    let form = await prisma.form.findFirst({
      where: { shopId: shop.id }
    });

    if (!form) {
      // Use defaults if fields or settings are missing
      const fields = formData.fields && formData.fields.length > 0 
        ? formData.fields 
        : DEFAULT_FORM_FIELDS;
      
      const settings = formData.globalSettings && Object.keys(formData.globalSettings).length > 0
        ? formData.globalSettings
        : DEFAULT_GLOBAL_SETTINGS;
      
      form = await prisma.form.create({
        data: {
          shopId: shop.id,
          name: 'Order Form',
          fields: fields as any,
          settings: settings as any
        }
      });
    } else {
      // When updating, ensure we have valid fields and settings
      const fields = formData.fields && formData.fields.length > 0 
        ? formData.fields 
        : form.fields as any; // Keep existing if not provided
      
      // Merge with defaults to ensure all required settings are present
      const settings = formData.globalSettings && Object.keys(formData.globalSettings).length > 0
        ? { ...DEFAULT_GLOBAL_SETTINGS, ...formData.globalSettings }
        : form.settings as any; // Keep existing if not provided
      
      form = await prisma.form.update({
        where: { id: form.id },
        data: {
          fields: fields as any,
          settings: settings as any,
          updatedAt: new Date()
        }
      });
    }

    // Only revalidate if not called during render
    if (!isRender) {
      revalidatePath('/form-builder');
    }
    
    return { 
      success: true, 
      formId: form.id,
      shopId: shop.id 
    };
  } catch (error) {
    console.error('Error saving form:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function getForm(shopUrl: string) {
  try {
    const shop = await prisma.shop.findFirst({
      where: { url: shopUrl },
      include: { Form: true }
    });

    if (!shop || !shop.Form[0]) {
      return null;
    }

    return {
      id: shop.Form[0].id,
      fields: shop.Form[0].fields,
      settings: shop.Form[0].settings
    };
  } catch (error) {
    console.error('Error getting form:', error);
    return null;
  }
}


