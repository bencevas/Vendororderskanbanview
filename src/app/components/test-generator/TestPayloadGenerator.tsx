import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { Send, Plus, Trash2, Copy, Check, AlertCircle, Loader2, Package, Store, RefreshCw } from 'lucide-react';
import type { Store as StoreType } from '../../types/database';
import { useLocale } from '../../contexts/LocaleContext';

// Shopify Order Types (simplified)
interface ShopifyLineItem {
  id: number;
  title: string;
  sku: string;
  quantity: number;
  price: string;
  grams: number;
}

interface ShopifyCustomer {
  first_name: string;
  last_name: string;
  email: string;
}

interface ShopifyOrder {
  id: number;
  name: string;
  order_number: number;
  created_at: string;
  total_price: string;
  customer: ShopifyCustomer;
  line_items: ShopifyLineItem[];
  note: string;
  tags: string;
  // Custom field for delivery date
  note_attributes: Array<{ name: string; value: string }>;
}

// Sample products for the generator
const SAMPLE_PRODUCTS = [
  { name: 'Organic Chicken Breast', sku: 'CHKN-001', price: '12.99', grams: 1000, image: 'https://butchershoppeteams.com/cdn/shop/products/butcher-shoppe-direct-boneless-skinless-chicken-breasts-15517883433043_1080x_266ae294-f803-4ef2-8308-0bc060f54d12.webp?v=1680630694' },
  { name: 'Fresh Salmon Fillet', sku: 'SLMN-001', price: '24.99', grams: 500, image: 'https://meat4you.ch/media/catalog/product/cache/1e5ed9cbca70cb1b2ba6633fbe65aac9/b/i/bio-lachsfilet-mit-haut-meat4you_24a1909.jpg' },
  { name: 'Ground Beef', sku: 'BEEF-001', price: '15.50', grams: 1000, image: 'https://heatherlea.ca/wp-content/uploads/2022/12/DSC_0760-scaled.jpg' },
  { name: 'Ribeye Steak', sku: 'RBEY-001', price: '28.99', grams: 500, image: 'https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml' },
  { name: 'Pork Tenderloin', sku: 'PORK-001', price: '16.99', grams: 750, image: 'https://cdn.woodwardmeats.com/media/product/1_Pork-Tenderloin.jpg' },
  { name: 'Lamb Chops', sku: 'LAMB-001', price: '32.00', grams: 500, image: 'https://thebutchery.ca/cdn/shop/files/IMG_0126.jpg?v=1686321240&width=800' },
  { name: 'Turkey Breast', sku: 'TRKY-001', price: '14.50', grams: 1000, image: 'https://jmbutcher.mt/wp-content/uploads/2020/05/Turkey-Breast.jpg' },
  { name: 'Duck Breast', sku: 'DUCK-001', price: '22.00', grams: 400, image: 'https://www.countrystylemeats.co.uk/wp-content/uploads/2022/05/duck-breast-jpg.webp' },
];

const SAMPLE_CUSTOMERS = [
  { first_name: 'John', last_name: 'Smith', email: 'john.smith@example.com' },
  { first_name: 'Emma', last_name: 'Johnson', email: 'emma.j@example.com' },
  { first_name: 'Michael', last_name: 'Brown', email: 'michael.b@example.com' },
  { first_name: 'Sarah', last_name: 'Davis', email: 'sarah.davis@example.com' },
  { first_name: 'David', last_name: 'Wilson', email: 'david.w@example.com' },
];

interface Props {
  onClose?: () => void;
  onOrderCreated?: () => void; // Callback to refresh the main view
}

export function TestPayloadGenerator({ onClose, onOrderCreated }: Props) {
  const { t } = useLocale();
  const [customer, setCustomer] = useState(SAMPLE_CUSTOMERS[0]);
  const [deliveryDate, setDeliveryDate] = useState(format(addDays(new Date(), 0), 'yyyy-MM-dd')); // Default to today
  const [lineItems, setLineItems] = useState<Array<{ product: typeof SAMPLE_PRODUCTS[0]; quantity: number }>>([
    { product: SAMPLE_PRODUCTS[0], quantity: 2 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Store selection
  const [stores, setStores] = useState<StoreType[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [isLoadingStores, setIsLoadingStores] = useState(true);

  // Fetch stores on mount
  useEffect(() => {
    const fetchStores = async () => {
      if (!isSupabaseConfigured()) {
        setIsLoadingStores(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;

        setStores(data || []);
        // Auto-select first store if available
        if (data && data.length > 0) {
          setSelectedStoreId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
      } finally {
        setIsLoadingStores(false);
      }
    };

    fetchStores();
  }, []);

  // Generate a random order number
  const generateOrderNumber = () => Math.floor(1000 + Math.random() * 9000);

  // Build the Shopify order payload
  const buildShopifyPayload = (): ShopifyOrder => {
    const orderNumber = generateOrderNumber();
    const totalPrice = lineItems
      .reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0)
      .toFixed(2);

    return {
      id: Date.now(),
      name: `#${orderNumber}`,
      order_number: orderNumber,
      created_at: new Date().toISOString(),
      total_price: totalPrice,
      customer: customer,
      line_items: lineItems.map((item, index) => ({
        id: index + 1,
        title: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        price: item.product.price,
        grams: item.product.grams * item.quantity,
      })),
      note: '',
      tags: 'vendor-app',
      note_attributes: [
        { name: 'delivery_date', value: deliveryDate },
        { name: 'store_id', value: selectedStoreId || '' },
      ],
    };
  };

  // Add a line item
  const addLineItem = () => {
    const availableProducts = SAMPLE_PRODUCTS.filter(
      p => !lineItems.some(item => item.product.sku === p.sku)
    );
    if (availableProducts.length > 0) {
      setLineItems([...lineItems, { product: availableProducts[0], quantity: 1 }]);
    }
  };

  // Remove a line item
  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Update line item product
  const updateLineItemProduct = (index: number, sku: string) => {
    const product = SAMPLE_PRODUCTS.find(p => p.sku === sku);
    if (product) {
      const newItems = [...lineItems];
      newItems[index].product = product;
      setLineItems(newItems);
    }
  };

  // Update line item quantity
  const updateLineItemQuantity = (index: number, quantity: number) => {
    const newItems = [...lineItems];
    newItems[index].quantity = Math.max(1, quantity);
    setLineItems(newItems);
  };

  // Copy payload to clipboard
  const copyPayload = async () => {
    const payload = buildShopifyPayload();
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Submit the order directly to Supabase
  const submitOrder = async () => {
    if (!isSupabaseConfigured()) {
      setResult({
        success: false,
        message: 'Supabase is not configured. Please set up your environment variables.',
      });
      return;
    }

    if (!selectedStoreId) {
      setResult({
        success: false,
        message: 'Please select a store for this order.',
      });
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      const payload = buildShopifyPayload();
      
      // Insert order WITH store_id
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_code: payload.name,
          shopify_order_id: payload.id.toString(),
          customer_name: `${payload.customer.first_name} ${payload.customer.last_name}`,
          customer_email: payload.customer.email,
          total_amount: parseFloat(payload.total_price),
          status: 'pending',
          order_placed_at: payload.created_at,
          delivery_date: deliveryDate,
          store_id: selectedStoreId, // Include store_id!
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items with images
      const orderItems = payload.line_items.map(item => {
        const product = SAMPLE_PRODUCTS.find(p => p.sku === item.sku);
        return {
          order_id: order.id,
          product_name: item.title,
          product_sku: item.sku,
          ordered_quantity: item.quantity,
          actual_quantity: item.quantity,
          unit: 'kg',
          price: parseFloat(item.price),
          image_url: product?.image || '',
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      const selectedStore = stores.find(s => s.id === selectedStoreId);
      setResult({
        success: true,
        message: `Order ${payload.name} created for ${selectedStore?.name || 'store'}! Refreshing view...`,
      });

      // Reset form for next order
      setCustomer(SAMPLE_CUSTOMERS[Math.floor(Math.random() * SAMPLE_CUSTOMERS.length)]);
      
      // Call the refresh callback after a short delay
      setTimeout(() => {
        if (onOrderCreated) {
          onOrderCreated();
        }
      }, 1000);
      
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create order',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const payload = buildShopifyPayload();
  const totalPrice = lineItems.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );

  return (
    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-[#476a30]">
        <div className="flex items-center gap-3 text-white">
          <Package className="w-6 h-6" />
          <div>
            <h2 className="text-lg font-semibold">{t('testPayloadGenerator')}</h2>
            <p className="text-sm text-white/80">{t('generateShopifyOrders')}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl leading-none cursor-pointer"
          >
            &times;
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Left: Form */}
          <div className="space-y-6">
            {/* Store Selection - NEW */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Store className="w-4 h-4" />
                {t('store')}
              </label>
              {isLoadingStores ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('loadingOrders')}
                </div>
              ) : stores.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                  {t('noStoresAvailable')}
                </div>
              ) : (
                <select
                  value={selectedStoreId || ''}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#476a30] focus:border-[#476a30]"
                >
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name} {store.address ? `- ${store.address}` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('customerName')}
              </label>
              <select
                value={`${customer.first_name} ${customer.last_name}`}
                onChange={(e) => {
                  const [firstName, lastName] = e.target.value.split(' ');
                  const selected = SAMPLE_CUSTOMERS.find(
                    c => c.first_name === firstName && c.last_name === lastName
                  );
                  if (selected) setCustomer(selected);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {SAMPLE_CUSTOMERS.map((c) => (
                  <option key={c.email} value={`${c.first_name} ${c.last_name}`}>
                    {c.first_name} {c.last_name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Delivery Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('deliveryDateLabel')}
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tip: Set to today to see the order immediately on the kanban board
              </p>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('orderItems')}
                </label>
                <button
                  onClick={addLineItem}
                  disabled={lineItems.length >= SAMPLE_PRODUCTS.length}
                  className="flex items-center gap-1 text-sm text-[#476a30] hover:text-[#3d5a28] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {t('addItem')}
                </button>
              </div>

              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <select
                      value={item.product.sku}
                      onChange={(e) => updateLineItemProduct(index, e.target.value)}
                      className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#476a30]"
                    >
                      {SAMPLE_PRODUCTS.map((p) => (
                        <option key={p.sku} value={p.sku}>
                          {p.name} (${p.price})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItemQuantity(index, parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#476a30]"
                    />
                    <span className="text-sm text-gray-600 w-16 text-right">
                      ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                    </span>
                    {lineItems.length > 1 && (
                      <button
                        onClick={() => removeLineItem(index)}
                        className="p-1 text-[#EA776C] hover:text-[#d4665c] cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-sm font-medium">
                <span>{t('total')}:</span>
                <span className="text-lg">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Right: Payload Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('generatedPayload')}
              </label>
              <button
                onClick={copyPayload}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#476a30]" />
                    {t('copied')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t('copyPayload')}
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-[400px] font-mono">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        </div>

        {/* Result Message */}
        {result && (
          <div
            className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${
              result.success
                ? 'bg-[#476a30]/10 text-[#476a30] border border-[#476a30]/30'
                : 'bg-[#EA776C]/10 text-[#EA776C] border border-[#EA776C]/30'
            }`}
          >
            {result.success ? (
              <Check className="w-5 h-5 text-[#476a30]" />
            ) : (
              <AlertCircle className="w-5 h-5 text-[#EA776C]" />
            )}
            <p>{result.message}</p>
            {result.success && (
              <RefreshCw className="w-4 h-4 animate-spin ml-auto" />
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            {t('close')}
          </button>
        )}
        <button
          onClick={submitOrder}
          disabled={isSubmitting || lineItems.length === 0 || !selectedStoreId}
          className="flex items-center gap-2 px-4 py-2 bg-[#476a30] text-white rounded-lg hover:bg-[#3d5a28] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('submitting')}
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {t('submitToSupabase')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
