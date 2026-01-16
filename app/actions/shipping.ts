'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getProvinces() {
  try {
    // Default to Algeria
    const algeria = await prisma.country.findFirst({
      where: { name: 'Algeria' }
    });

    if (!algeria) {
      return {
        success: false,
        error: 'Algeria not found in database',
        data: []
      };
    }

    const states = await prisma.state.findMany({
      where: { countryId: algeria.id },
      orderBy: { code: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        nameAr: true,
      }
    });

    return {
      success: true,
      data: states
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}

export async function getShippingSettings(shopUrl: string) {
  try {
    // Find shop
    const shop = await prisma.shop.findFirst({
      where: { url: shopUrl }
    });

    if (!shop) {
      return {
        success: true,
        data: {
          method: 'per-province' as const,
          stopDeskEnabled: false,
          codLabel: 'Cash on Delivery',
          stopDeskLabel: 'Stop Desk',
          freeShippingLabel: 'Free',
          fees: {}
        }
      };
    }

    // Get shipping settings
    const settings = await prisma.shippingSettings.findUnique({
      where: { shopId: shop.id }
    });

    // Get all shipping fees for this shop
    const fees = await prisma.shippingFee.findMany({
      where: { shopId: shop.id },
      select: {
        stateId: true,
        cashOnDelivery: true,
        stopDesk: true,
      }
    });

    // Convert fees to a record keyed by stateId
    const feesRecord: Record<string, { cashOnDelivery: string; stopDesk: string }> = {};
    fees.forEach(fee => {
      feesRecord[fee.stateId] = {
        cashOnDelivery: fee.cashOnDelivery?.toString() || '',
        stopDesk: fee.stopDesk?.toString() || ''
      };
    });

    return {
      success: true,
      data: {
        method: settings?.method || 'per-province',
        stopDeskEnabled: settings?.stopDeskEnabled || false,
        codLabel: settings?.codLabel || 'Cash on Delivery',
        stopDeskLabel: settings?.stopDeskLabel || 'Stop Desk',
        freeShippingLabel: settings?.freeShippingLabel || 'Free',
        fees: feesRecord
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

export async function getShippingFeesForState(shopUrl: string, stateId: string) {
  try {
    // Find shop
    const shop = await prisma.shop.findFirst({
      where: { url: shopUrl }
    });

    if (!shop) {
      return {
        success: true,
        data: {
          cashOnDelivery: null,
          stopDesk: null
        }
      };
    }

    // Get shipping fee for this state
    const fee = await prisma.shippingFee.findUnique({
      where: {
        shopId_stateId: {
          shopId: shop.id,
          stateId: stateId
        }
      },
      select: {
        cashOnDelivery: true,
        stopDesk: true,
      }
    });

    return {
      success: true,
      data: {
        cashOnDelivery: fee?.cashOnDelivery || null,
        stopDesk: fee?.stopDesk || null
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

export async function saveShippingSettings(
  shopUrl: string,
  method: 'free' | 'per-province',
  stopDeskEnabled: boolean,
  fees: Record<string, { cashOnDelivery: string; stopDesk: string }>,
  codLabel?: string,
  stopDeskLabel?: string,
  freeShippingLabel?: string
) {
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

    // Always use per-province method
    const finalMethod = 'per-province';

    // Upsert shipping settings
    await prisma.shippingSettings.upsert({
      where: { shopId: shop.id },
      update: {
        method: finalMethod,
        stopDeskEnabled,
        codLabel: codLabel || null,
        stopDeskLabel: stopDeskLabel || null,
        freeShippingLabel: freeShippingLabel || null,
        updatedAt: new Date()
      },
      create: {
        shopId: shop.id,
        method: finalMethod,
        stopDeskEnabled,
        codLabel: codLabel || null,
        stopDeskLabel: stopDeskLabel || null,
        freeShippingLabel: freeShippingLabel || null
      }
    });

    // Always save/update fees for all provinces
    const algeria = await prisma.country.findFirst({
      where: { name: 'Algeria' }
    });

    if (algeria) {
      const states = await prisma.state.findMany({
        where: { countryId: algeria.id },
        select: { id: true }
      });

      // Upsert fees for each state
      for (const state of states) {
        const fee = fees[state.id] || { cashOnDelivery: '', stopDesk: '' };
        
        // Convert string to integer, or 0 if empty (default to 0)
        const codValue = fee.cashOnDelivery && fee.cashOnDelivery.trim() !== '' 
          ? parseInt(fee.cashOnDelivery.replace(/[^\d]/g, ''), 10) 
          : 0;
        const stopDeskValue = fee.stopDesk && fee.stopDesk.trim() !== '' 
          ? parseInt(fee.stopDesk.replace(/[^\d]/g, ''), 10) 
          : 0;
        
        await prisma.shippingFee.upsert({
          where: {
            shopId_stateId: {
              shopId: shop.id,
              stateId: state.id
            }
          },
          update: {
            cashOnDelivery: codValue,
            stopDesk: stopDeskValue,
            updatedAt: new Date()
          },
          create: {
            shopId: shop.id,
            stateId: state.id,
            cashOnDelivery: codValue,
            stopDesk: stopDeskValue
          }
        });
      }
    }

    revalidatePath('/shipping-fees');
    
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

