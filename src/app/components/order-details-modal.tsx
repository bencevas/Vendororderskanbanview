import { X, Check, XIcon, ChevronDown, Plus, Minus, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Order } from './order-card';
import { fetchOrderItems, updateOrderStatus, updateOrderItemQuantity, updateOrderItemConfirmation, saveOrderChanges, OrderItem } from '@/app/services/api';
import { getOrderItems as getMockOrderItems } from '@/app/mock-order-items';
import { useLocale } from '@/app/contexts/LocaleContext';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onOrderUpdate?: (orderId: string, updates: Partial<Order>) => void;
}

const statusColors = {
  pending: 'bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border-red-400 dark:border-red-500/50',
  confirmed: 'bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 border-orange-400 dark:border-orange-500/50',
  processing: 'bg-white dark:bg-gray-800 text-yellow-600 dark:text-yellow-400 border-yellow-400 dark:border-yellow-500/50',
  ready: 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 border-green-400 dark:border-green-500/50',
};

const statuses: Order['status'][] = ['pending', 'confirmed', 'processing', 'ready'];

export function OrderDetailsModal({ order, onClose, onOrderUpdate }: OrderDetailsModalProps) {
  const { t } = useLocale();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Translate status
  const statusTranslations = {
    pending: t('pending'),
    confirmed: t('confirmed'),
    processing: t('processing'),
    ready: t('ready'),
  };

  // Fetch order items from API when modal opens
  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('🌐 Fetching order items for order:', order.id);
        const fetchedItems = await fetchOrderItems(order.id);
        console.log('✅ Fetched items from API:', fetchedItems.length);
        setItems(fetchedItems);
      } catch (err) {
        console.error('❌ API failed, using hardcoded order items:', err);
        // Fallback to hardcoded data if API fails
        const mockItems = getMockOrderItems(order.orderCode);
        setItems(mockItems);
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, [order.id, order.orderCode]);

  const handleStatusChange = (newStatus: Order['status']) => {
    // Just update local state - don't save to server yet
    // Save will happen when "Save Changes" button is clicked
    console.log('🔄 Status change in dropdown (local only):', { orderId: order.id, oldStatus: currentStatus, newStatus });
    setCurrentStatus(newStatus);
    setIsDropdownOpen(false);
  };

  const handleQuantityChange = async (itemId: string, newQuantity: string) => {
    const quantity = parseFloat(newQuantity);
    if (!isNaN(quantity) && quantity >= 0) {
      // Optimistically update UI
      setItems(items.map(item => 
        item.id === itemId ? { ...item, actualQuantity: quantity } : item
      ));
      
      // Update backend
      try {
        await updateOrderItemQuantity(order.id, itemId, quantity);
      } catch (err) {
        console.error('Error updating quantity:', err);
        // Could revert on error if needed
      }
    }
  };

  const incrementQuantity = (itemId: string, step: number = 0.1) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, actualQuantity: Math.round((item.actualQuantity + step) * 100) / 100 } : item
    ));
  };

  const decrementQuantity = (itemId: string, step: number = 0.1) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, actualQuantity: Math.max(0, Math.round((item.actualQuantity - step) * 100) / 100) } : item
    ));
  };

  const handleConfirm = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // Optimistically update UI
    setItems(items.map(item => 
      item.id === itemId ? { ...item, confirmed: true } : item
    ));
    
    // Update backend - save both confirmation AND current quantity
    try {
      // First save the quantity if it changed
      if (Math.abs(item.actualQuantity - item.orderedQuantity) > 0.01) {
        await updateOrderItemQuantity(order.id, itemId, item.actualQuantity);
      }
      // Then save the confirmation
      await updateOrderItemConfirmation(order.id, itemId, true);
    } catch (err) {
      console.error('Error confirming item:', err);
      // Revert on error
      setItems(items.map(item => 
        item.id === itemId ? { ...item, confirmed: null } : item
      ));
    }
  };

  const handleDeny = async (itemId: string) => {
    // Optimistically update UI
    setItems(items.map(item => 
      item.id === itemId ? { ...item, confirmed: false } : item
    ));
    
    // Update backend
    try {
      await updateOrderItemConfirmation(order.id, itemId, false);
    } catch (err) {
      console.error('Error denying item:', err);
      // Revert on error
      setItems(items.map(item => 
        item.id === itemId ? { ...item, confirmed: null } : item
      ));
    }
  };

  const handleRevertConfirmation = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const previousConfirmed = item.confirmed;
    
    // Optimistically revert confirmation back to pending (null)
    setItems(items.map(i => 
      i.id === itemId ? { ...i, confirmed: null } : i
    ));
    
    // Update backend - save quantity first, then revert confirmation
    try {
      // Save current quantity to ensure it's persisted
      await updateOrderItemQuantity(order.id, itemId, item.actualQuantity);
      // Revert confirmation to null
      await updateOrderItemConfirmation(order.id, itemId, null);
    } catch (err) {
      console.error('Error reverting confirmation:', err);
      // Revert on error
      setItems(items.map(i => 
        i.id === itemId ? { ...i, confirmed: previousConfirmed } : i
      ));
    }
  };

  const calculateTotal = () => {
    return items
      .filter(item => item.confirmed !== false)
      .reduce((sum, item) => sum + (item.actualQuantity * item.price), 0);
  };

  const hasQuantityDifference = (item: OrderItem) => {
    return Math.abs(item.orderedQuantity - item.actualQuantity) > 0.01;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-end min-[481px]:items-center justify-center z-50 min-[481px]:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-t-xl min-[481px]:rounded-lg shadow-xl w-full min-[481px]:max-w-3xl h-[95vh] min-[481px]:h-auto min-[481px]:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 px-4 min-[481px]:px-6 py-3 min-[481px]:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-[481px]:gap-4 flex-wrap">
            <h2 className="text-base min-[481px]:text-xl font-semibold text-gray-900 dark:text-gray-100">{order.orderCode}</h2>
            
            {/* Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-1 min-[481px]:gap-2 px-2 min-[481px]:px-3 py-1 min-[481px]:py-1.5 rounded-full text-xs min-[481px]:text-sm font-medium border ${statusColors[currentStatus]} hover:opacity-80 transition-opacity`}
              >
                <span>{statusTranslations[currentStatus]}</span>
                <ChevronDown className="w-3 h-3 min-[481px]:w-4 min-[481px]:h-4" />
              </button>
              
              {isDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  
                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[150px] z-20">
                    {statuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          status === currentStatus ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''
                        }`}
                      >
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${statusColors[status]}`}>
                          {statusTranslations[status]}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 min-[481px]:p-2 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Customer Info */}
        <div className="px-4 min-[481px]:px-6 py-3 min-[481px]:py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs min-[481px]:text-sm text-gray-600 dark:text-gray-400">{t('customer')}</p>
              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm min-[481px]:text-base">{order.customerName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs min-[481px]:text-sm text-gray-600 dark:text-gray-400">{t('deliveryDate')}</p>
              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm min-[481px]:text-base">
                {order.deliveryDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-3 min-[481px]:px-6 py-3 min-[481px]:py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                <p className="text-gray-600">{t('loadingOrderItems')}</p>
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
          ) : (
            <div className="space-y-3">
              {/* Item Cards */}
              {items.map((item) => (
              <div
                key={item.id}
                className={`bg-white dark:bg-gray-800 border rounded-lg p-3 min-[481px]:p-4 transition-all ${
                  item.confirmed === false ? 'opacity-60 border-[#EA776C]/30 dark:border-[#EA776C]/40 bg-[#EA776C]/10 dark:bg-[#EA776C]/20' : 
                  item.confirmed === true ? 'border-[#476a30]/30 dark:border-[#476a30]/40 bg-[#476a30]/10 dark:bg-[#476a30]/20' : 
                  'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {/* Mobile Layout */}
                <div className="min-[481px]:hidden">
                  {/* Row 1: Image + Name + Price */}
                  <div className="flex gap-3 mb-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">{item.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">@${item.price.toFixed(2)} / {item.unit}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 ml-4 flex-shrink-0">${(item.actualQuantity * item.price).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {/* Row 2: Quantity Adjuster + Action Buttons in one line */}
                  <div className="flex items-center gap-2">
                    {/* Quantity Adjuster */}
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                      <button
                        onClick={() => decrementQuantity(item.id)}
                        disabled={item.confirmed !== null}
                        className={`px-2 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-r dark:border-gray-600 transition-colors rounded-l-lg ${
                          item.confirmed !== null ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </button>
                      <input
                        type="number"
                        step="0.01"
                        value={item.actualQuantity}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        disabled={item.confirmed !== null}
                        className={`w-16 px-2 py-2 text-center text-sm font-medium border-0 focus:outline-none rounded-none ${
                          item.confirmed !== null 
                            ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-400' 
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        } ${hasQuantityDifference(item) ? 'bg-[#EA776C]/10 dark:bg-[#EA776C]/20' : ''}`}
                      />
                      <button
                        onClick={() => incrementQuantity(item.id)}
                        disabled={item.confirmed !== null}
                        className={`px-2 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-l dark:border-gray-600 transition-colors rounded-r-lg ${
                          item.confirmed !== null ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Plus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </button>
                    </div>
                    
                    {/* Unit + difference */}
                    <div className="flex flex-col text-xs text-gray-600 dark:text-gray-400 min-w-0">
                      <span>{item.unit}</span>
                      {hasQuantityDifference(item) && (
                        <span className="text-[#EA776C] whitespace-nowrap">{t('was')} {item.orderedQuantity} ({item.unit})</span>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-1.5 ml-auto flex-shrink-0">
                      {item.confirmed === null ? (
                        <>
                          <button
                            onClick={() => handleConfirm(item.id)}
                            className="w-9 h-9 flex items-center justify-center bg-[#476a30] hover:bg-[#3d5a28] text-white rounded-lg transition-colors"
                            title={t('confirm')}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeny(item.id)}
                            className="w-9 h-9 flex items-center justify-center bg-[#EA776C] hover:bg-[#d4665c] text-white rounded-lg transition-colors"
                            title={t('deny')}
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </>
                      ) : item.confirmed ? (
                          <button
                            onClick={() => handleRevertConfirmation(item.id)}
                            className="h-9 px-3 flex items-center justify-center gap-1 text-[#476a30] dark:text-[#476a30] bg-[#476a30]/10 dark:bg-[#476a30]/20 hover:bg-[#476a30]/20 dark:hover:bg-[#476a30]/30 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                            title={t('clickToRevert')}
                          >
                            <Check className="w-3 h-3" />
                            <span>{t('ok')}</span>
                          </button>
                      ) : (
                        <button
                          onClick={() => handleRevertConfirmation(item.id)}
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
                <div className="hidden min-[481px]:flex gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg bg-gray-100 dark:bg-gray-700"
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">{item.name}</h3>
                        
                        {/* Quantity, Price, Total in one line */}
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                              <button
                                onClick={() => decrementQuantity(item.id)}
                                disabled={item.confirmed !== null}
                                className={`px-2 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-r dark:border-gray-600 transition-colors rounded-l-lg ${
                                  item.confirmed !== null ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                              </button>
                              <input
                                type="number"
                                step="0.01"
                                value={item.actualQuantity}
                                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                disabled={item.confirmed !== null}
                                className={`w-16 px-2 py-1.5 text-center font-medium border-0 focus:outline-none rounded-none ${
                                  item.confirmed !== null 
                                    ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-400' 
                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
                                } ${hasQuantityDifference(item) ? 'bg-[#EA776C]/10 dark:bg-[#EA776C]/20' : ''}`}
                              />
                              <button
                                onClick={() => incrementQuantity(item.id)}
                                disabled={item.confirmed !== null}
                                className={`px-2 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-l dark:border-gray-600 transition-colors rounded-r-lg ${
                                  item.confirmed !== null ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                <Plus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                              </button>
                            </div>
                            <span className="text-gray-600 dark:text-gray-400">{item.unit}</span>
                            {hasQuantityDifference(item) && (
                              <span className="text-xs text-[#EA776C] whitespace-nowrap">
                                {t('was')} {item.orderedQuantity} ({item.unit})
                              </span>
                            )}
                          </div>
                          
                          <div className="text-gray-700 dark:text-gray-300">
                            <span className="text-gray-500 dark:text-gray-400">{t('price')}: </span>
                            <span className="font-medium">${item.price.toFixed(2)}</span>
                          </div>
                          
                          <div className="text-gray-900 dark:text-gray-100 ml-auto">
                            <span className="text-gray-500 dark:text-gray-400">{t('total')}: </span>
                            <span className="font-semibold text-lg">${(item.actualQuantity * item.price).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-shrink-0">
                        {item.confirmed === null ? (
                          <>
                            <button
                              onClick={() => handleConfirm(item.id)}
                              className="w-10 h-10 flex items-center justify-center bg-[#476a30] hover:bg-[#3d5a28] text-white rounded-lg transition-colors shadow-sm"
                              title={t('confirmAvailability')}
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeny(item.id)}
                              className="w-10 h-10 flex items-center justify-center bg-[#EA776C] hover:bg-[#d4665c] text-white rounded-lg transition-colors shadow-sm"
                              title={t('denyAvailability')}
                            >
                              <XIcon className="w-5 h-5" />
                            </button>
                          </>
                        ) : item.confirmed ? (
                          <button
                            onClick={() => handleRevertConfirmation(item.id)}
                            className="flex items-center gap-2 text-[#476a30] dark:text-[#476a30] bg-[#476a30]/10 dark:bg-[#476a30]/20 hover:bg-[#476a30]/20 dark:hover:bg-[#476a30]/30 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                            title={t('clickToRevert')}
                          >
                            <Check className="w-4 h-4" />
                            <span className="text-sm font-medium">{t('confirmed')}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRevertConfirmation(item.id)}
                            className="flex items-center gap-2 text-[#EA776C] bg-[#EA776C]/10 hover:bg-[#EA776C]/20 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                            title={t('clickToRevert')}
                          >
                            <XIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">{t('denied')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>

        {/* Footer with Total and Buttons - always at bottom */}
        <div className="bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 px-4 min-[481px]:px-6 py-3 min-[481px]:py-4">
          {/* Total Section */}
          <div className="flex justify-between items-center mb-3 min-[481px]:mb-4 pb-3 min-[481px]:pb-4 border-b border-gray-200 dark:border-gray-600">
            <div>
              <p className="text-xs min-[481px]:text-sm text-gray-600 dark:text-gray-400">
                {items.filter(i => i.confirmed === true).length} {t('of')} {items.length} {t('itemsConfirmed')}
              </p>
              {items.some(i => i.confirmed === false) && (
                <p className="text-xs min-[481px]:text-sm text-[#EA776C] mt-0.5">
                  {items.filter(i => i.confirmed === false).length} {t('itemsDenied')}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs min-[481px]:text-sm text-gray-600 dark:text-gray-400">{t('orderTotal')}</p>
              <p className="text-xl min-[481px]:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                ${calculateTotal().toFixed(2)}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 min-[481px]:gap-3 flex-1 min-[481px]:flex-none min-[481px]:justify-end">
            <button
              onClick={onClose}
              className="flex-1 min-[481px]:flex-none px-4 py-2.5 min-[481px]:py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm min-[481px]:text-base"
            >
              {t('close')}
            </button>
            <button
              onClick={async () => {
                setIsSaving(true);
                try {
                  console.log('💾 Save Changes clicked:', { orderId: order.id, status: currentStatus, itemsCount: items.length });
                  
                  // First, save the status to the server if it changed
                  if (currentStatus !== order.status) {
                    console.log('📤 Saving status change:', { from: order.status, to: currentStatus });
                    await updateOrderStatus(order.id, currentStatus);
                  }
                  
                  // Then save all order changes (items and status)
                  console.log('💾 Saving order changes...');
                  await saveOrderChanges(order.id, items, currentStatus);
                  console.log('✅ All changes saved to server');
                  
                  // Update parent state - this will update the main board
                  if (onOrderUpdate) {
                    console.log('🔄 Updating parent state with new status:', currentStatus);
                    onOrderUpdate(order.id, { status: currentStatus });
                  } else {
                    console.warn('⚠️ onOrderUpdate not provided!');
                  }
                  
                  // Small delay to ensure state update propagates, then close modal
                  // The parent's handleOrderModalClose will refresh orders from server
                  setTimeout(() => {
                    console.log('🚪 Closing modal - parent will refresh');
                    onClose();
                  }, 100);
                } catch (err) {
                  console.error('❌ Error saving changes:', err);
                  alert(t('failedToSave'));
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={isSaving || isLoading}
              className="flex-1 min-[481px]:flex-none px-4 py-2.5 min-[481px]:py-2 text-white bg-[#476a30] hover:bg-[#3d5a28] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm min-[481px]:text-base"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('saveChanges')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}