import { X, Check, XIcon, ChevronDown, Plus, Minus, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Order } from './order-card';
import { fetchOrderItems, updateOrderStatus, updateOrderItemQuantity, updateOrderItemConfirmation, saveOrderChanges, OrderItem } from '@/app/services/api';
import { getOrderItems as getMockOrderItems } from '@/app/mock-order-items';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onOrderUpdate?: (orderId: string, updates: Partial<Order>) => void;
}

const statusColors = {
  pending: 'bg-red-50 text-red-700 border-red-300',
  confirmed: 'bg-orange-50 text-orange-700 border-orange-300',
  processing: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  ready: 'bg-green-50 text-green-700 border-green-300',
};

const statuses: Order['status'][] = ['pending', 'confirmed', 'processing', 'ready'];

export function OrderDetailsModal({ order, onClose, onOrderUpdate }: OrderDetailsModalProps) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">{order.orderCode}</h2>
            
            {/* Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${statusColors[currentStatus]} hover:opacity-80 transition-opacity`}
              >
                <span>{currentStatus}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {isDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  
                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[150px] z-20">
                    {statuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          status === currentStatus ? 'bg-gray-100 font-medium' : ''
                        }`}
                      >
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${statusColors[status]}`}>
                          {status}
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
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Customer Info */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-medium text-gray-900">{order.customerName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Delivery Date</p>
              <p className="font-medium text-gray-900">
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
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                <p className="text-gray-600">Loading order items...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4 max-w-md text-center">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Items</h3>
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
                className={`bg-white border rounded-lg p-4 transition-all ${
                  item.confirmed === false ? 'opacity-60 border-red-300 bg-red-50' : 
                  item.confirmed === true ? 'border-green-300 bg-green-50' : 
                  'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-3">{item.name}</h3>
                        
                        {/* Quantity, Price, Total in one line */}
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border rounded-lg overflow-hidden">
                              <button
                                onClick={() => decrementQuantity(item.id)}
                                disabled={item.confirmed !== null}
                                className={`px-2 py-1.5 bg-gray-100 hover:bg-gray-200 border-r transition-colors ${
                                  item.confirmed !== null ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                <Minus className="w-4 h-4 text-gray-700" />
                              </button>
                              <input
                                type="number"
                                step="0.01"
                                value={item.actualQuantity}
                                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                disabled={item.confirmed !== null}
                                className={`w-16 px-2 py-1.5 text-center font-medium border-0 focus:outline-none ${
                                  item.confirmed !== null 
                                    ? 'bg-gray-100 cursor-not-allowed text-gray-600' 
                                    : 'bg-white focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
                                } ${hasQuantityDifference(item) ? 'bg-orange-50' : ''}`}
                              />
                              <button
                                onClick={() => incrementQuantity(item.id)}
                                disabled={item.confirmed !== null}
                                className={`px-2 py-1.5 bg-gray-100 hover:bg-gray-200 border-l transition-colors ${
                                  item.confirmed !== null ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                <Plus className="w-4 h-4 text-gray-700" />
                              </button>
                            </div>
                            <span className="text-gray-600">{item.unit}</span>
                            {hasQuantityDifference(item) && (
                              <span className="text-xs text-orange-600">
                                (was {item.orderedQuantity})
                              </span>
                            )}
                          </div>
                          
                          <div className="text-gray-700">
                            <span className="text-gray-500">Price: </span>
                            <span className="font-medium">${item.price.toFixed(2)}</span>
                          </div>
                          
                          <div className="text-gray-900">
                            <span className="text-gray-500">Total: </span>
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
                              className="w-10 h-10 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-sm"
                              title="Confirm availability"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeny(item.id)}
                              className="w-10 h-10 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm"
                              title="Deny availability"
                            >
                              <XIcon className="w-5 h-5" />
                            </button>
                          </>
                        ) : item.confirmed ? (
                          <button
                            onClick={() => handleRevertConfirmation(item.id)}
                            className="flex items-center gap-2 text-green-700 bg-green-100 hover:bg-green-200 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                            title="Click to revert confirmation"
                          >
                            <Check className="w-4 h-4" />
                            <span className="text-sm font-medium">Confirmed</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRevertConfirmation(item.id)}
                            className="flex items-center gap-2 text-red-700 bg-red-100 hover:bg-red-200 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                            title="Click to revert denial"
                          >
                            <XIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">Denied</span>
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

          {/* Total Section */}
          <div className="mt-6 pt-4 border-t-2 border-gray-300">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  {items.filter(i => i.confirmed === true).length} of {items.length} items confirmed
                </p>
                {items.some(i => i.confirmed === false) && (
                  <p className="text-sm text-red-600 mt-1">
                    {items.filter(i => i.confirmed === false).length} item(s) denied
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Order Total</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${calculateTotal().toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
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
                alert('Failed to save changes. Please try again.');
              } finally {
                setIsSaving(false);
              }
            }}
            disabled={isSaving || isLoading}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}