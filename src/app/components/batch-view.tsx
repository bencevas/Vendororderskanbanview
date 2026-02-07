import { Check, XIcon, Plus, Minus, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Order } from './order-card';
import { fetchOrderItems, updateOrderItemQuantity, updateOrderItemConfirmation, OrderItem } from '@/app/services/api';
import { useLocale } from '@/app/contexts/LocaleContext';

interface BatchItem {
  itemName: string;
  image: string;
  unit: string;
  instances: {
    id: string;
    orderId: string;
    itemId: string;
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
  onOrderUpdate?: (orderId: string, updates: Partial<Order>) => void;
}

export function BatchView({ orders, date, onOrderUpdate }: BatchViewProps) {
  const { t } = useLocale();
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all order items and group them
  useEffect(() => {
    const loadBatchItems = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const itemsMap = new Map<string, BatchItem>();

        // Fetch items for all orders in parallel
        const itemsPromises = orders.map(order => 
          fetchOrderItems(order.id).catch(err => {
            console.error(`Error fetching items for order ${order.id}:`, err);
            return [];
          })
        );
        
        const allOrderItems = await Promise.all(itemsPromises);

        // Group items by name - identical items from different orders are grouped together
        orders.forEach((order, orderIndex) => {
          const orderItems = allOrderItems[orderIndex];
          console.log(`📦 Processing order ${order.orderCode} with ${orderItems.length} items`);
          
          orderItems.forEach((item, itemIndex) => {
            const existing = itemsMap.get(item.name);
            const instance = {
              id: `${order.id}-${item.id}`,
              orderId: order.id,
              itemId: item.id,
              orderCode: order.orderCode,
              customerName: order.customerName,
              orderedQuantity: item.orderedQuantity,
              actualQuantity: item.actualQuantity,
              price: item.price,
              confirmed: item.confirmed,
            };

            if (existing) {
              // Add to existing batch group
              existing.instances.push(instance);
              console.log(`➕ Added ${item.name} to existing batch (${existing.instances.length} instances)`);
            } else {
              // Create new batch group
              itemsMap.set(item.name, {
                itemName: item.name,
                image: item.image,
                unit: item.unit,
                instances: [instance],
              });
              console.log(`🆕 Created new batch group for ${item.name}`);
            }
          });
        });

        const groupedItems = Array.from(itemsMap.values());
        console.log(`✅ Batch view: ${groupedItems.length} unique items grouped from ${orders.length} orders`);
        groupedItems.forEach(item => {
          console.log(`  - ${item.itemName}: ${item.instances.length} order(s)`);
        });
        setBatchItems(groupedItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load batch items');
        console.error('Error loading batch items:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (orders.length > 0) {
      loadBatchItems();
    } else {
      setBatchItems([]);
      setIsLoading(false);
    }
  }, [orders]);

  const handleQuantityChange = async (itemName: string, instanceId: string, newQuantity: string) => {
    const quantity = parseFloat(newQuantity);
    if (!isNaN(quantity) && quantity >= 0) {
      // Find the instance to get orderId and itemId
      const instance = batchItems
        .find(item => item.itemName === itemName)
        ?.instances.find(inst => inst.id === instanceId);
      
      if (!instance) return;

      // Optimistically update UI
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

      // Update backend
      try {
        await updateOrderItemQuantity(instance.orderId, instance.itemId, quantity);
      } catch (err) {
        console.error('Error updating quantity:', err);
      }
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

  const handleConfirm = async (itemName: string, instanceId: string) => {
    const instance = batchItems
      .find(item => item.itemName === itemName)
      ?.instances.find(inst => inst.id === instanceId);
    
    if (!instance) return;

    // Optimistically update UI
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

    // Update backend
    try {
      await updateOrderItemConfirmation(instance.orderId, instance.itemId, true);
    } catch (err) {
      console.error('Error confirming item:', err);
      // Revert on error
      setBatchItems(
        batchItems.map((item) =>
          item.itemName === itemName
            ? {
                ...item,
                instances: item.instances.map((inst) =>
                  inst.id === instanceId ? { ...inst, confirmed: null } : inst
                ),
              }
            : item
        )
      );
    }
  };

  const handleDeny = async (itemName: string, instanceId: string) => {
    const instance = batchItems
      .find(item => item.itemName === itemName)
      ?.instances.find(inst => inst.id === instanceId);
    
    if (!instance) return;

    // Optimistically update UI
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

    // Update backend
    try {
      await updateOrderItemConfirmation(instance.orderId, instance.itemId, false);
    } catch (err) {
      console.error('Error denying item:', err);
      // Revert on error
      setBatchItems(
        batchItems.map((item) =>
          item.itemName === itemName
            ? {
                ...item,
                instances: item.instances.map((inst) =>
                  inst.id === instanceId ? { ...inst, confirmed: null } : inst
                ),
              }
            : item
        )
      );
    }
  };

  const confirmAllForItem = async (itemName: string) => {
    const item = batchItems.find(i => i.itemName === itemName);
    if (!item) return;

    // Optimistically update UI
    setBatchItems(
      batchItems.map((batchItem) =>
        batchItem.itemName === itemName
          ? {
              ...batchItem,
              instances: batchItem.instances.map((inst) => ({ ...inst, confirmed: true })),
            }
          : batchItem
      )
    );

    // Update backend for all instances
    try {
      await Promise.all(
        item.instances.map(instance =>
          updateOrderItemConfirmation(instance.orderId, instance.itemId, true)
        )
      );
      console.log(`✅ Confirmed all ${item.instances.length} instances of ${itemName}`);
    } catch (err) {
      console.error('Error confirming all items:', err);
      // Revert on error
      setBatchItems(
        batchItems.map((batchItem) =>
          batchItem.itemName === itemName
            ? {
                ...batchItem,
                instances: batchItem.instances.map((inst) => ({ ...inst, confirmed: null })),
              }
            : batchItem
        )
      );
    }
  };

  const handleRevertConfirmation = async (itemName: string, instanceId: string) => {
    const instance = batchItems
      .find(item => item.itemName === itemName)
      ?.instances.find(inst => inst.id === instanceId);
    
    if (!instance) return;

    const previousConfirmed = instance.confirmed;

    // Optimistically revert to pending (null)
    setBatchItems(
      batchItems.map((item) =>
        item.itemName === itemName
          ? {
              ...item,
              instances: item.instances.map((inst) =>
                inst.id === instanceId ? { ...inst, confirmed: null } : inst
              ),
            }
          : item
      )
    );

    // Update backend
    try {
      await updateOrderItemQuantity(instance.orderId, instance.itemId, instance.actualQuantity);
      await updateOrderItemConfirmation(instance.orderId, instance.itemId, null);
    } catch (err) {
      console.error('Error reverting confirmation:', err);
      // Revert on error
      setBatchItems(
        batchItems.map((item) =>
          item.itemName === itemName
            ? {
                ...item,
                instances: item.instances.map((inst) =>
                  inst.id === instanceId ? { ...inst, confirmed: previousConfirmed } : inst
                ),
              }
            : item
        )
      );
    }
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
    <div className="h-full overflow-y-auto px-3 min-[481px]:px-6 py-3 min-[481px]:py-4">
      <div className="mb-3 min-[481px]:mb-4">
        <h2 className="text-base min-[481px]:text-lg font-semibold text-gray-900">
          {t('batchProcessing')} - {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </h2>
        <p className="text-xs min-[481px]:text-sm text-gray-600 mt-1">
          {t('itemsGroupedByType')}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            <p className="text-gray-600">{t('loadingBatchItems')}</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <AlertCircle className="w-12 h-12 text-[#EA776C]" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('errorLoadingItems')}</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      ) : batchItems.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">{t('noItemsFound')}</p>
        </div>
      ) : (
        <div className="space-y-4 min-[481px]:space-y-6">
          {batchItems.map((item) => (
          <div key={item.itemName} className="bg-white border border-gray-200 rounded-lg p-3 min-[481px]:p-5">
            {/* Item Header */}
            <div className="flex items-center justify-between mb-3 min-[481px]:mb-4 pb-3 min-[481px]:pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2 min-[481px]:gap-4">
                <img
                  src={item.image}
                  alt={item.itemName}
                  className="w-10 h-10 min-[481px]:w-16 min-[481px]:h-16 object-cover rounded-lg bg-gray-100"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm min-[481px]:text-lg truncate">{item.itemName}</h3>
                  <p className="text-xs min-[481px]:text-sm text-gray-600 mt-0.5 min-[481px]:mt-1">
                    {item.instances.length} {item.instances.length > 1 ? t('orders') : t('order')} • {getTotalQuantityForItem(item).toFixed(1)} {item.unit}
                  </p>
                </div>
              </div>
              <button
                onClick={() => confirmAllForItem(item.itemName)}
                className="px-2 py-1 min-[481px]:px-4 min-[481px]:py-2 bg-[#476a30] hover:bg-[#3d5a28] text-white text-xs min-[481px]:text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                {t('confirmAll')}
              </button>
            </div>

            {/* Order Instances */}
            <div className="space-y-2">
              {item.instances.map((instance) => (
                <div
                  key={instance.id}
                  className={`p-2 min-[481px]:p-3 rounded-lg border transition-all ${
                    instance.confirmed === false
                      ? 'opacity-60 border-[#EA776C]/30 bg-[#EA776C]/10'
                      : instance.confirmed === true
                      ? 'border-[#476a30]/30 bg-[#476a30]/10'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  {/* Mobile Layout */}
                  <div className="min-[481px]:hidden">
                    {/* Row 1: Order info + Price */}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900 text-xs">{instance.orderCode}</p>
                        <p className="text-xs text-gray-600">{instance.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-900 font-medium">${(instance.actualQuantity * instance.price).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">@${instance.price.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    {/* Row 2: Quantity Adjuster + Action Buttons in one line */}
                    <div className="flex items-center gap-2">
                      {/* Quantity Adjuster */}
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden flex-shrink-0">
                        <button
                          onClick={() => decrementQuantity(item.itemName, instance.id)}
                          disabled={instance.confirmed !== null}
                          className={`px-2 py-2 bg-white hover:bg-gray-100 border-r transition-colors ${
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
                          className={`w-14 px-1 py-2 text-center text-sm font-medium border-0 focus:outline-none ${
                            instance.confirmed !== null
                              ? 'bg-gray-100 cursor-not-allowed text-gray-600'
                              : 'bg-white'
                          } ${hasQuantityDifference(instance) ? 'bg-[#EA776C]/10' : ''}`}
                        />
                        <button
                          onClick={() => incrementQuantity(item.itemName, instance.id)}
                          disabled={instance.confirmed !== null}
                          className={`px-2 py-2 bg-white hover:bg-gray-100 border-l transition-colors ${
                            instance.confirmed !== null ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <Plus className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>
                      
                      {/* Unit + difference */}
                      <div className="flex flex-col text-xs text-gray-600 min-w-0">
                        <span>{item.unit}</span>
                        {hasQuantityDifference(instance) && (
                          <span className="text-[#EA776C]">(was {instance.orderedQuantity})</span>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-1.5 ml-auto flex-shrink-0">
                        {instance.confirmed === null ? (
                          <>
                            <button
                              onClick={() => handleConfirm(item.itemName, instance.id)}
                              className="w-9 h-9 flex items-center justify-center bg-[#476a30] hover:bg-[#3d5a28] text-white rounded-lg transition-colors"
                              title={t('confirm')}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeny(item.itemName, instance.id)}
                              className="w-9 h-9 flex items-center justify-center bg-[#EA776C] hover:bg-[#d4665c] text-white rounded-lg transition-colors"
                              title={t('deny')}
                            >
                              <XIcon className="w-4 h-4" />
                            </button>
                          </>
                        ) : instance.confirmed ? (
                          <button
                            onClick={() => handleRevertConfirmation(item.itemName, instance.id)}
                            className="h-9 px-3 flex items-center justify-center gap-1 text-[#476a30] bg-[#476a30]/10 hover:bg-[#476a30]/20 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                            title={t('clickToRevert')}
                          >
                            <Check className="w-3 h-3" />
                            <span>{t('ok')}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRevertConfirmation(item.itemName, instance.id)}
                            className="h-9 px-3 flex items-center justify-center gap-1 text-[#EA776C] bg-[#EA776C]/10 hover:bg-[#EA776C]/20 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                            title={t('clickToRevert')}
                          >
                            <XIcon className="w-3 h-3" />
                            <span>{t('no')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop Layout */}
                  <div className="hidden min-[481px]:flex items-center justify-between">
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
                            } ${hasQuantityDifference(instance) ? 'bg-[#EA776C]/10' : ''}`}
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
                          <span className="text-xs text-[#EA776C]">(was {instance.orderedQuantity})</span>
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
                            className="w-9 h-9 flex items-center justify-center bg-[#476a30] hover:bg-[#3d5a28] text-white rounded-lg transition-colors"
                            title={t('confirm')}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeny(item.itemName, instance.id)}
                            className="w-9 h-9 flex items-center justify-center bg-[#EA776C] hover:bg-[#d4665c] text-white rounded-lg transition-colors"
                            title={t('deny')}
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </>
                      ) : instance.confirmed ? (
                        <button
                          onClick={() => handleRevertConfirmation(item.itemName, instance.id)}
                          className="flex items-center gap-1 text-[#476a30] bg-[#476a30]/10 hover:bg-[#476a30]/20 px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors"
                          title={t('clickToRevert')}
                        >
                          <Check className="w-3 h-3" />
                          <span>{t('ok')}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRevertConfirmation(item.itemName, instance.id)}
                          className="flex items-center gap-1 text-[#EA776C] bg-[#EA776C]/10 hover:bg-[#EA776C]/20 px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors"
                          title={t('clickToRevert')}
                        >
                          <XIcon className="w-3 h-3" />
                          <span>{t('denied')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
