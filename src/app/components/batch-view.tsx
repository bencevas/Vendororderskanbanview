import { Check, XIcon, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { Order } from './order-card';

interface BatchItem {
  itemName: string;
  image: string;
  unit: string;
  instances: {
    id: string;
    orderCode: string;
    customerName: string;
    orderedQuantity: number;
    actualQuantity: number;
    price: number;
    confirmed: boolean | null;
  }[];
}

interface BatchViewProps {
  orders: Order[];
  date: Date;
}

// Helper to get all items from all orders
const getOrderItems = (orderCode: string) => {
  const itemsMap: Record<string, any[]> = {
    'ORD-2024-001': [
      { name: 'Organic Chicken Breast', orderedQuantity: 2, price: 12.99, unit: 'kg', image: 'https://butchershoppeteams.com/cdn/shop/products/butcher-shoppe-direct-boneless-skinless-chicken-breasts-15517883433043_1080x_266ae294-f803-4ef2-8308-0bc060f54d12.webp?v=1680630694' },
      { name: 'Fresh Salmon Fillet', orderedQuantity: 1.5, price: 24.99, unit: 'kg', image: 'https://meat4you.ch/media/catalog/product/cache/1e5ed9cbca70cb1b2ba6633fbe65aac9/b/i/bio-lachsfilet-mit-haut-meat4you_24a1909.jpg' },
      { name: 'Ground Beef', orderedQuantity: 1, price: 15.50, unit: 'kg', image: 'https://heatherlea.ca/wp-content/uploads/2022/12/DSC_0760-scaled.jpg' },
    ],
    'ORD-2024-002': [
      { name: 'Organic Chicken Breast', orderedQuantity: 1.5, price: 12.99, unit: 'kg', image: 'https://butchershoppeteams.com/cdn/shop/products/butcher-shoppe-direct-boneless-skinless-chicken-breasts-15517883433043_1080x_266ae294-f803-4ef2-8308-0bc060f54d12.webp?v=1680630694' },
      { name: 'Ribeye Steak', orderedQuantity: 2, price: 28.99, unit: 'kg', image: 'https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml' },
      { name: 'Ground Beef', orderedQuantity: 2, price: 15.50, unit: 'kg', image: 'https://heatherlea.ca/wp-content/uploads/2022/12/DSC_0760-scaled.jpg' },
    ],
    'ORD-2024-003': [
      { name: 'Organic Chicken Breast', orderedQuantity: 2.5, price: 12.99, unit: 'kg', image: 'https://butchershoppeteams.com/cdn/shop/products/butcher-shoppe-direct-boneless-skinless-chicken-breasts-15517883433043_1080x_266ae294-f803-4ef2-8308-0bc060f54d12.webp?v=1680630694' },
      { name: 'Fresh Salmon Fillet', orderedQuantity: 1, price: 24.99, unit: 'kg', image: 'https://meat4you.ch/media/catalog/product/cache/1e5ed9cbca70cb1b2ba6633fbe65aac9/b/i/bio-lachsfilet-mit-haut-meat4you_24a1909.jpg' },
      { name: 'Pork Tenderloin', orderedQuantity: 1.5, price: 16.99, unit: 'kg', image: 'https://cdn.woodwardmeats.com/media/product/1_Pork-Tenderloin.jpg' },
    ],
  };

  return itemsMap[orderCode] || [];
};

export function BatchView({ orders, date }: BatchViewProps) {
  // Group items by item name
  const [batchItems, setBatchItems] = useState<BatchItem[]>(() => {
    const itemsMap = new Map<string, BatchItem>();

    orders.forEach((order) => {
      const orderItems = getOrderItems(order.orderCode);
      orderItems.forEach((item, index) => {
        const existing = itemsMap.get(item.name);
        const instance = {
          id: `${order.orderCode}-${index}`,
          orderCode: order.orderCode,
          customerName: order.customerName,
          orderedQuantity: item.orderedQuantity,
          actualQuantity: item.orderedQuantity,
          price: item.price,
          confirmed: null as boolean | null,
        };

        if (existing) {
          existing.instances.push(instance);
        } else {
          itemsMap.set(item.name, {
            itemName: item.name,
            image: item.image,
            unit: item.unit,
            instances: [instance],
          });
        }
      });
    });

    return Array.from(itemsMap.values());
  });

  const handleQuantityChange = (itemName: string, instanceId: string, newQuantity: string) => {
    const quantity = parseFloat(newQuantity);
    if (!isNaN(quantity) && quantity >= 0) {
      setBatchItems(
        batchItems.map((item) =>
          item.itemName === itemName
            ? {
                ...item,
                instances: item.instances.map((inst) =>
                  inst.id === instanceId ? { ...inst, actualQuantity: quantity } : inst
                ),
              }
            : item
        )
      );
    }
  };

  const incrementQuantity = (itemName: string, instanceId: string, step: number = 0.1) => {
    setBatchItems(
      batchItems.map((item) =>
        item.itemName === itemName
          ? {
              ...item,
              instances: item.instances.map((inst) =>
                inst.id === instanceId
                  ? { ...inst, actualQuantity: Math.round((inst.actualQuantity + step) * 100) / 100 }
                  : inst
              ),
            }
          : item
      )
    );
  };

  const decrementQuantity = (itemName: string, instanceId: string, step: number = 0.1) => {
    setBatchItems(
      batchItems.map((item) =>
        item.itemName === itemName
          ? {
              ...item,
              instances: item.instances.map((inst) =>
                inst.id === instanceId
                  ? { ...inst, actualQuantity: Math.max(0, Math.round((inst.actualQuantity - step) * 100) / 100) }
                  : inst
              ),
            }
          : item
      )
    );
  };

  const handleConfirm = (itemName: string, instanceId: string) => {
    setBatchItems(
      batchItems.map((item) =>
        item.itemName === itemName
          ? {
              ...item,
              instances: item.instances.map((inst) =>
                inst.id === instanceId ? { ...inst, confirmed: true } : inst
              ),
            }
          : item
      )
    );
  };

  const handleDeny = (itemName: string, instanceId: string) => {
    setBatchItems(
      batchItems.map((item) =>
        item.itemName === itemName
          ? {
              ...item,
              instances: item.instances.map((inst) =>
                inst.id === instanceId ? { ...inst, confirmed: false } : inst
              ),
            }
          : item
      )
    );
  };

  const confirmAllForItem = (itemName: string) => {
    setBatchItems(
      batchItems.map((item) =>
        item.itemName === itemName
          ? {
              ...item,
              instances: item.instances.map((inst) => ({ ...inst, confirmed: true })),
            }
          : item
      )
    );
  };

  const getTotalQuantityForItem = (item: BatchItem) => {
    return item.instances
      .filter((inst) => inst.confirmed !== false)
      .reduce((sum, inst) => sum + inst.actualQuantity, 0);
  };

  const hasQuantityDifference = (instance: BatchItem['instances'][0]) => {
    return Math.abs(instance.orderedQuantity - instance.actualQuantity) > 0.01;
  };

  return (
    <div className="h-full overflow-y-auto px-6 py-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Batch Processing - {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Items grouped by type for efficient batch preparation
        </p>
      </div>

      <div className="space-y-6">
        {batchItems.map((item) => (
          <div key={item.itemName} className="bg-white border border-gray-200 rounded-lg p-5">
            {/* Item Header */}
            <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.itemName}
                  className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{item.itemName}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.instances.length} order{item.instances.length > 1 ? 's' : ''} • Total:{' '}
                    <span className="font-medium text-gray-900">
                      {getTotalQuantityForItem(item).toFixed(2)} {item.unit}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => confirmAllForItem(item.itemName)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Confirm All
              </button>
            </div>

            {/* Order Instances */}
            <div className="space-y-2">
              {item.instances.map((instance) => (
                <div
                  key={instance.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    instance.confirmed === false
                      ? 'opacity-60 border-red-300 bg-red-50'
                      : instance.confirmed === true
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  {/* Order Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="min-w-[120px]">
                      <p className="font-medium text-gray-900 text-sm">{instance.orderCode}</p>
                      <p className="text-xs text-gray-600">{instance.customerName}</p>
                    </div>

                    {/* Quantity Adjuster */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button
                          onClick={() => decrementQuantity(item.itemName, instance.id)}
                          disabled={instance.confirmed !== null}
                          className={`px-2 py-1.5 bg-white hover:bg-gray-100 border-r transition-colors ${
                            instance.confirmed !== null ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <Minus className="w-4 h-4 text-gray-700" />
                        </button>
                        <input
                          type="number"
                          step="0.01"
                          value={instance.actualQuantity}
                          onChange={(e) => handleQuantityChange(item.itemName, instance.id, e.target.value)}
                          disabled={instance.confirmed !== null}
                          className={`w-16 px-2 py-1.5 text-center font-medium border-0 focus:outline-none ${
                            instance.confirmed !== null
                              ? 'bg-gray-100 cursor-not-allowed text-gray-600'
                              : 'bg-white focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
                          } ${hasQuantityDifference(instance) ? 'bg-orange-50' : ''}`}
                        />
                        <button
                          onClick={() => incrementQuantity(item.itemName, instance.id)}
                          disabled={instance.confirmed !== null}
                          className={`px-2 py-1.5 bg-white hover:bg-gray-100 border-l transition-colors ${
                            instance.confirmed !== null ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <Plus className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>
                      <span className="text-sm text-gray-600 min-w-[30px]">{item.unit}</span>
                      {hasQuantityDifference(instance) && (
                        <span className="text-xs text-orange-600">(was {instance.orderedQuantity})</span>
                      )}
                    </div>

                    {/* Price Info */}
                    <div className="flex items-center gap-4 text-sm ml-auto">
                      <div className="text-gray-700">
                        <span className="text-gray-500">@</span> ${instance.price.toFixed(2)}
                      </div>
                      <div className="text-gray-900 font-medium min-w-[80px] text-right">
                        ${(instance.actualQuantity * instance.price).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 ml-4">
                    {instance.confirmed === null ? (
                      <>
                        <button
                          onClick={() => handleConfirm(item.itemName, instance.id)}
                          className="w-9 h-9 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                          title="Confirm"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeny(item.itemName, instance.id)}
                          className="w-9 h-9 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                          title="Deny"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </>
                    ) : instance.confirmed ? (
                      <div className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded text-xs font-medium">
                        <Check className="w-3 h-3" />
                        <span>OK</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded text-xs font-medium">
                        <XIcon className="w-3 h-3" />
                        <span>Denied</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
