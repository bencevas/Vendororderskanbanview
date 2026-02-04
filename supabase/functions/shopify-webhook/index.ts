// Supabase Edge Function for receiving Shopify order webhooks
// Deploy with: supabase functions deploy shopify-webhook

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Shopify types
interface ShopifyLineItem {
  id: number;
  title: string;
  sku: string;
  quantity: number;
  price: string;
  grams: number;
  variant_title?: string;
  product_id?: number;
}

interface ShopifyCustomer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface ShopifyNoteAttribute {
  name: string;
  value: string;
}

interface ShopifyOrder {
  id: number;
  name: string;
  order_number: number;
  created_at: string;
  total_price: string;
  customer: ShopifyCustomer;
  line_items: ShopifyLineItem[];
  note?: string;
  tags?: string;
  note_attributes?: ShopifyNoteAttribute[];
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shopify-topic, x-shopify-hmac-sha256, x-shopify-shop-domain',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the Shopify webhook payload
    const shopifyOrder: ShopifyOrder = await req.json();

    console.log('Received Shopify order:', shopifyOrder.name);

    // Extract delivery date from note_attributes or default to tomorrow
    let deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 1);

    if (shopifyOrder.note_attributes) {
      const deliveryAttr = shopifyOrder.note_attributes.find(
        attr => attr.name.toLowerCase() === 'delivery_date'
      );
      if (deliveryAttr?.value) {
        deliveryDate = new Date(deliveryAttr.value);
      }
    }

    // Insert the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_code: shopifyOrder.name,
        shopify_order_id: shopifyOrder.id.toString(),
        customer_name: `${shopifyOrder.customer.first_name} ${shopifyOrder.customer.last_name}`,
        customer_email: shopifyOrder.customer.email,
        total_amount: parseFloat(shopifyOrder.total_price),
        status: 'pending',
        order_placed_at: shopifyOrder.created_at,
        delivery_date: deliveryDate.toISOString().split('T')[0],
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error inserting order:', orderError);
      throw orderError;
    }

    console.log('Order created:', order.id);

    // Insert order items
    const orderItems = shopifyOrder.line_items.map(item => ({
      order_id: order.id,
      product_name: item.title,
      product_sku: item.sku || '',
      ordered_quantity: item.quantity,
      actual_quantity: item.quantity, // Initially same as ordered
      unit: 'kg', // Default unit, could be derived from grams
      price: parseFloat(item.price),
      confirmed: null, // Not confirmed yet
      image_url: '', // Would need to fetch from Shopify product API
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error inserting order items:', itemsError);
      throw itemsError;
    }

    console.log('Order items created:', orderItems.length);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Order ${shopifyOrder.name} processed successfully`,
        orderId: order.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
