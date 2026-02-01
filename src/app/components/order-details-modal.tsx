import { X, Check, XIcon, ChevronDown, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { Order } from './order-card';

interface OrderItem {
  id: string;
  name: string;
  orderedQuantity: number;
  actualQuantity: number;
  price: number;
  unit: string;
  confirmed: boolean | null; // null = pending, true = confirmed, false = denied
  image: string;
}

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
}

// Mock order items data
const getOrderItems = (orderCode: string): OrderItem[] => {
  const itemsMap: Record<string, OrderItem[]> = {
    'ORD-2024-001': [
      { id: '1', name: 'Organic Chicken Breast', orderedQuantity: 2, actualQuantity: 2, price: 12.99, unit: 'kg', confirmed: null, image: 'https://butchershoppeteams.com/cdn/shop/products/butcher-shoppe-direct-boneless-skinless-chicken-breasts-15517883433043_1080x_266ae294-f803-4ef2-8308-0bc060f54d12.webp?v=1680630694' },
      { id: '2', name: 'Fresh Salmon Fillet', orderedQuantity: 1.5, actualQuantity: 1.5, price: 24.99, unit: 'kg', confirmed: null, image: 'https://meat4you.ch/media/catalog/product/cache/1e5ed9cbca70cb1b2ba6633fbe65aac9/b/i/bio-lachsfilet-mit-haut-meat4you_24a1909.jpg' },
      { id: '3', name: 'Ground Beef', orderedQuantity: 1, actualQuantity: 1, price: 15.50, unit: 'kg', confirmed: null, image: 'https://heatherlea.ca/wp-content/uploads/2022/12/DSC_0760-scaled.jpg' },
    ],
    'ORD-2024-002': [
      { id: '1', name: 'Ribeye Steak', orderedQuantity: 2, actualQuantity: 2, price: 28.99, unit: 'kg', confirmed: null, image: 'https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml' },
      { id: '2', name: 'Pork Tenderloin', orderedQuantity: 1.5, actualQuantity: 1.5, price: 16.99, unit: 'kg', confirmed: null, image: 'https://cdn.woodwardmeats.com/media/product/1_Pork-Tenderloin.jpg' },
      { id: '3', name: 'Lamb Chops', orderedQuantity: 1, actualQuantity: 1, price: 32.00, unit: 'kg', confirmed: null, image: 'https://thebutchery.ca/cdn/shop/files/IMG_0126.jpg?v=1686321240&width=800' },
      { id: '4', name: 'Turkey Breast', orderedQuantity: 2.5, actualQuantity: 2.5, price: 14.50, unit: 'kg', confirmed: null, image: 'https://jmbutcher.mt/wp-content/uploads/2020/05/Turkey-Breast.jpg' },
      { id: '5', name: 'Duck Breast', orderedQuantity: 0.8, actualQuantity: 0.8, price: 22.00, unit: 'kg', confirmed: null, image: 'https://www.countrystylemeats.co.uk/wp-content/uploads/2022/05/duck-breast-jpg.webp' },
    ],
  };

  return itemsMap[orderCode] || [
    { id: '1', name: 'Sample Product A', orderedQuantity: 2, actualQuantity: 2, price: 29.99, unit: 'kg', confirmed: null, image: 'figma:asset/3c867424c3791bfcc1f02947243b24a416a57b37.png' },
    { id: '2', name: 'Sample Product B', orderedQuantity: 1, actualQuantity: 1, price: 49.99, unit: 'kg', confirmed: null, image: 'figma:asset/3c867424c3791bfcc1f02947243b24a416a57b37.png' },
    { id: '3', name: 'Sample Product C', orderedQuantity: 1.5, actualQuantity: 1.5, price: 19.99, unit: 'kg', confirmed: null, image: 'figma:asset/3c867424c3791bfcc1f02947243b24a416a57b37.png' },
  ];
};

const statusColors = {
  pending: 'bg-red-50 text-red-700 border-red-300',
  confirmed: 'bg-orange-50 text-orange-700 border-orange-300',
  processing: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  ready: 'bg-green-50 text-green-700 border-green-300',
};

const statuses: Order['status'][] = ['pending', 'confirmed', 'processing', 'ready'];

export function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  const [items, setItems] = useState<OrderItem[]>(getOrderItems(order.orderCode));
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleStatusChange = (newStatus: Order['status']) => {
    setCurrentStatus(newStatus);
    setIsDropdownOpen(false);
    // Here you would update the backend
  };

  const handleQuantityChange = (itemId: string, newQuantity: string) => {
    const quantity = parseFloat(newQuantity);
    if (!isNaN(quantity) && quantity >= 0) {
      setItems(items.map(item => 
        item.id === itemId ? { ...item, actualQuantity: quantity } : item
      ));
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

  const handleConfirm = (itemId: string) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, confirmed: true } : item
    ));
  };

  const handleDeny = (itemId: string) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, confirmed: false } : item
    ));
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
                          <div className="flex items-center gap-2 text-green-700 bg-green-100 px-3 py-2 rounded-lg">
                            <Check className="w-4 h-4" />
                            <span className="text-sm font-medium">Confirmed</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-700 bg-red-100 px-3 py-2 rounded-lg">
                            <XIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">Denied</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}