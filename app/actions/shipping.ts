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
    console.error('Error fetching provinces:', error);
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
          method: 'free' as const,
          stopDeskEnabled: false,
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
        method: settings?.method || 'free',
        stopDeskEnabled: settings?.stopDeskEnabled || false,
        fees: feesRecord
      }
    };
  } catch (error) {
    console.error('Error fetching shipping settings:', error);
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
  fees: Record<string, { cashOnDelivery: string; stopDesk: string }>
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

    // Upsert shipping settings
    await prisma.shippingSettings.upsert({
      where: { shopId: shop.id },
      update: {
        method,
        stopDeskEnabled,
        updatedAt: new Date()
      },
      create: {
        shopId: shop.id,
        method,
        stopDeskEnabled
      }
    });

    // If method is per-province, save/update fees
    if (method === 'per-province') {
      // Get all states to ensure we have fees for all
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
          
          // Convert string to integer, or null if empty
          const codValue = fee.cashOnDelivery && fee.cashOnDelivery.trim() !== '' 
            ? parseInt(fee.cashOnDelivery.replace(/[^\d]/g, ''), 10) 
            : null;
          const stopDeskValue = fee.stopDesk && fee.stopDesk.trim() !== '' 
            ? parseInt(fee.stopDesk.replace(/[^\d]/g, ''), 10) 
            : null;
          
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
    } else {
      // If method is free, delete all fees
      await prisma.shippingFee.deleteMany({
        where: { shopId: shop.id }
      });
    }

    revalidatePath('/shipping-fees');
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error saving shipping settings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

