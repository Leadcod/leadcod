import { t } from 'elysia'
import { prisma } from '@/lib/prisma'

export class OrderController {
  static async createOrder({ body, request }: { 
    body: { 
      shopUrl: string
      name: string
      phone: string
      city: string
      province: string
      productId: string | number
      shippingPrice?: number
      shippingLabel?: string
      shippingType?: string
    },
    request?: Request
  }) {
    const { shopUrl, name, phone, city, province, productId, shippingPrice, shippingLabel, shippingType } = body;
    
    // Get IP address from request headers
    let ipAddress = 'Unknown';
    if (request) {
      const forwardedFor = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      const cfConnectingIp = request.headers.get('cf-connecting-ip');
      
      ipAddress = cfConnectingIp || 
                  (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || 
                  realIp || 
                  'Unknown';
    }

    // Log received data for debugging
    console.log('Received order data:', { shopUrl, name, phone, city, province, productId, productIdType: typeof productId, shippingPrice, shippingLabel });

    if (!shopUrl || !name || !phone || !city || !province || productId === undefined || productId === null) {
      return {
        success: false,
        error: 'shopUrl, name, phone, city, province, and productId are required',
        received: { shopUrl, name, phone, city, province, productId }
      };
    }

    try {
      // Normalize shopUrl - remove protocol if present
      const normalizedShopUrl = shopUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      
      // Get shop and access token
      const shop = await prisma.shop.findFirst({
        where: { url: normalizedShopUrl }
      });

      if (!shop || !shop.accessToken) {
        return {
          success: false,
          error: 'Shop not found or access token not available'
        };
      }

      // Create the order on Shopify using productId directly as variant_id
      const shopifyApiVersion = '2024-10'; // Use the latest stable API version
      const baseUrl = `https://${normalizedShopUrl}/admin/api/${shopifyApiVersion}`;
      
      // Convert productId to number if it's a string
      const variantId = typeof productId === 'string' ? parseInt(productId, 10) : productId;
      
      // Step 1: Check if customer exists by phone number
      let customerId: number | null = null;
      const searchUrl = `${baseUrl}/customers/search.json?query=phone:${encodeURIComponent(phone)}`;
      
      try {
        const searchResponse = await fetch(searchUrl, {
          method: 'GET',
          headers: {
            'X-Shopify-Access-Token': shop.accessToken,
            'Content-Type': 'application/json',
          },
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.customers && searchData.customers.length > 0) {
            customerId = searchData.customers[0].id;
            console.log('Found existing customer:', customerId);
          }
        }
      } catch (error) {
        console.log('Customer search failed, will try to create new customer:', error);
      }

      // Step 2: If customer not found, try to create a new one
      if (!customerId) {
        try {
          const createCustomerUrl = `${baseUrl}/customers.json`;
          const customerResponse = await fetch(createCustomerUrl, {
            method: 'POST',
            headers: {
              'X-Shopify-Access-Token': shop.accessToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customer: {
                first_name: name,
                last_name: '',
                phone: phone,
                addresses: [
                  {
                    first_name: name,
                    last_name: '',
                    city: city,
                    address1:province,
                    province: province,
                    country: 'Algeria',
                    phone: phone
                  }
                ]
              }
            }),
          });

          if (customerResponse.ok) {
            const customerData = await customerResponse.json();
            customerId = customerData.customer.id;
            console.log('Created new customer:', customerId);
          } else {
            // If creation fails (e.g., phone already taken), search again
            const errorText = await customerResponse.text();
            console.log('Customer creation failed, searching again:', errorText);
            
            const retrySearchResponse = await fetch(searchUrl, {
              method: 'GET',
              headers: {
                'X-Shopify-Access-Token': shop.accessToken,
                'Content-Type': 'application/json',
              },
            });

            if (retrySearchResponse.ok) {
              const retrySearchData = await retrySearchResponse.json();
              if (retrySearchData.customers && retrySearchData.customers.length > 0) {
                customerId = retrySearchData.customers[0].id;
                console.log('Found existing customer on retry:', customerId);
              }
            }
          }
        } catch (error) {
          console.log('Customer creation failed:', error);
        }
      }

      // Step 3: Create the order with customer ID
      const orderUrl = `${baseUrl}/orders.json`;
      
      // Build tags array: always include LEADCOD, and add COD or STOP_DESK based on shipping type
      const tags = ['LEADCOD'];
      if (shippingType === 'cod') {
        tags.push('COD');
      } else if (shippingType === 'stopDesk') {
        tags.push('STOP_DESK');
      }
      
      const orderData: any = {
        order: {
          line_items: [
            {
              variant_id: variantId,
              quantity: 1
            }
          ],
          financial_status: 'pending',
          fulfillment_status: null,
          tags: tags.join(', '),
          note_attributes: [
            {
              name: 'Province',
              value: province
            },
            {
              name: 'City',
              value: city
            },
            {
              name: 'IP Address',
              value: ipAddress
            }
          ]
        }
      };

      // Add shipping price if provided
      if (shippingPrice !== undefined && shippingPrice !== null) {
        orderData.order.shipping_lines = [
          {
            title: shippingLabel || 'Shipping',
            price: shippingPrice.toString(),
            code: 'manual'
          }
        ];
      }

      // Add customer ID if we have one
      if (customerId) {
        orderData.order.customer = {
          id: customerId
        };
      }

      const orderResponse = await fetch(orderUrl, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': shop.accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error('Shopify order creation failed:', errorText);
        return {
          success: false,
          error: `Failed to create order: ${orderResponse.status} ${orderResponse.statusText} - ${errorText}`
        };
      }

      const orderResult = await orderResponse.json();

      return {
        success: true,
        data: orderResult.order
      };
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static createOrderSchema = {
    body: t.Object({
      shopUrl: t.String(),
      name: t.String(),
      phone: t.String(),
      city: t.String(),
      province: t.String(),
      productId: t.Union([t.String(), t.Number()]),
      shippingPrice: t.Optional(t.Number()),
      shippingLabel: t.Optional(t.String()),
      shippingType: t.Optional(t.String())
    })
  }
}
