import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, LayoutGrid, List, User, Settings, LogOut, Bell, HelpCircle, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { OrderCard, Order } from '@/app/components/order-card';
import { OrderDetailsModal } from '@/app/components/order-details-modal';
import { BatchView } from '@/app/components/batch-view';
import { fetchOrders } from '@/app/services/api';
import { generateMockOrders } from '@/app/mock-data';

export default function App() {
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  // Start with empty array - will fetch from API
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'batch'>('kanban');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render key
  
  // Generate array of 5 consecutive days starting from startDate
  const days = Array.from({ length: 5 }, (_, i) => addDays(startDate, i));
  
  // Fetch orders from API when startDate changes
  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch from API server
        const endDate = addDays(startDate, 4);
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
        console.log('🌐 Fetching orders from API:', `${apiUrl}/orders`);
        console.log('📅 Date range:', { startDate: startDate.toISOString(), endDate: endDate.toISOString() });
        
        const fetchedOrders = await fetchOrders(startDate, endDate);
        console.log('✅ Successfully fetched', fetchedOrders.length, 'orders from API');
        console.log('📦 Orders:', fetchedOrders);
        setOrders(fetchedOrders);
      } catch (err) {
        console.error('❌ API Error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load orders from API';
        setError(errorMessage);
        // Only use hardcoded data as last resort
        console.warn('⚠️ Falling back to hardcoded data');
        const mockOrders = generateMockOrders();
        setOrders(mockOrders);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [startDate]);
  
  // Filter orders by date - this will automatically use the latest orders from state
  const getOrdersForDate = useCallback((date: Date) => {
    const filtered = orders.filter(order => isSameDay(order.deliveryDate, date));
    console.log('📅 getOrdersForDate:', { date: date.toISOString(), count: filtered.length, orders: filtered.map(o => ({ id: o.id, status: o.status })) });
    return filtered;
  }, [orders]);
  
  const handlePrevious = () => {
    setStartDate(prev => addDays(prev, -1));
  };
  
  const handleNext = () => {
    setStartDate(prev => addDays(prev, 1));
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setStartDate(startOfDay(newDate));
    }
  };
  
  const isToday = (date: Date) => isSameDay(date, new Date());
  
  // Update order in the orders array (for state management across screens)
  const updateOrderInState = useCallback((orderId: string, updates: Partial<Order>) => {
    console.log('🔄 updateOrderInState called:', { orderId, updates });
    
    // Update the orders array - this will trigger re-render of all OrderCards
    setOrders(prevOrders => {
      const found = prevOrders.find(o => o.id === orderId);
      console.log('📋 Current order in state:', found);
      
      const updated = prevOrders.map(order => {
        if (order.id === orderId) {
          const newOrder = { ...order, ...updates };
          console.log('🔄 Updating order:', { old: order, new: newOrder });
          return newOrder;
        }
        return order;
      });
      
      const updatedOrder = updated.find(o => o.id === orderId);
      console.log('✅ Updated orders state - new order:', updatedOrder);
      console.log('📊 Total orders:', updated.length);
      return updated;
    });
    
    // Also update selected order if it's the one being updated
    // This ensures the modal shows the updated status immediately
    setSelectedOrder(prev => {
      if (prev?.id === orderId) {
        const updated = { ...prev, ...updates };
        console.log('✅ Updated selected order:', updated);
        return updated;
      }
      return prev;
    });
    
    // Force a re-render by updating the refresh key
    setRefreshKey(prev => prev + 1);
    console.log('🔄 Refresh key updated to force re-render');
  }, []);

  // Refresh orders from API
  const refreshOrders = async () => {
    try {
      const endDate = addDays(startDate, 4);
      const fetchedOrders = await fetchOrders(startDate, endDate);
      setOrders(fetchedOrders);
    } catch (err) {
      console.error('Error refreshing orders:', err);
    }
  };

  // Refresh orders after modal closes (in case changes were made)
  const handleOrderModalClose = async () => {
    console.log('🚪 Modal closing, refreshing orders from server...');
    setSelectedOrder(null);
    // Refresh to get latest data from server
    await refreshOrders();
    console.log('✅ Orders refreshed after modal close');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Order Management</h1>
          
          {/* Navigation Controls */}
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                By Order
              </button>
              <button
                onClick={() => setViewMode('batch')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'batch'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                By Item
              </button>
            </div>

            <div className="w-px h-8 bg-gray-300" />
            
            <button
              onClick={handlePrevious}
              className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
              <Calendar className="w-5 h-5 text-gray-600" />
              <input
                type="date"
                value={format(startDate, 'yyyy-MM-dd')}
                onChange={handleDateChange}
                className="bg-transparent border-none outline-none text-gray-900 cursor-pointer"
              />
            </div>
            
            <button
              onClick={handleNext}
              className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
              aria-label="Next day"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
            
            <div className="ml-auto text-sm text-gray-600">
              Showing {format(days[0], 'MMM d')} - {format(days[4], 'MMM d, yyyy')}
            </div>
            
            {/* User Profile Section */}
            <div className="flex items-center gap-3 ml-6">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5 text-gray-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="w-px h-8 bg-gray-300" />
              
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Sarah Mitchell</p>
                    <p className="text-xs text-gray-600">Vendor Manager</p>
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1655249481446-25d575f1c054?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBlcnNvbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTkzNjAxMHww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Sarah Mitchell"
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                  />
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isProfileDropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsProfileDropdownOpen(false)}
                    />
                    
                    {/* Dropdown Menu */}
                    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[220px] z-20">
                      {/* Profile Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-medium text-gray-900">Sarah Mitchell</p>
                        <p className="text-sm text-gray-600">sarah@butchershop.com</p>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-1">
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3">
                          <User className="w-4 h-4 text-gray-500" />
                          <span>My Profile</span>
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3">
                          <Settings className="w-4 h-4 text-gray-500" />
                          <span>Settings</span>
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3">
                          <HelpCircle className="w-4 h-4 text-gray-500" />
                          <span>Help & Support</span>
                        </button>
                      </div>
                      
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3">
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      {isLoading ? (
        <div className="max-w-[1600px] mx-auto px-6 py-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      ) : error ? (
        <div className="max-w-[1600px] mx-auto px-6 py-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Orders</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => {
                  const endDate = addDays(startDate, 4);
                  fetchOrders(startDate, endDate)
                    .then(setOrders)
                    .catch(err => setError(err instanceof Error ? err.message : 'Failed to load orders'));
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex gap-4 overflow-x-auto pb-4" key={refreshKey}>
            {days.map((day, index) => {
              const dayOrders = getOrdersForDate(day);
              
              return (
                <div
                  key={`${day.toISOString()}-${refreshKey}`}
                  className="flex-shrink-0 w-80 bg-gray-100 rounded-lg p-4"
                >
                  {/* Column Header */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-semibold text-gray-900">
                          {index === 0 && isToday(day) ? 'Today' : format(day, 'EEEE')}
                        </h2>
                        <p className="text-sm text-gray-600">{format(day, 'MMM d, yyyy')}</p>
                      </div>
                      <div className="bg-white rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                        {dayOrders.length}
                      </div>
                    </div>
                  </div>
                  
                  {/* Orders */}
                  <div className="space-y-3">
                    {dayOrders.length > 0 ? (
                      dayOrders.map(order => {
                        // dayOrders comes from getOrdersForDate which uses latest orders state
                        // Include status in key to force re-render when status changes
                        return (
                          <OrderCard 
                            key={`${order.id}-${order.status}`}
                            order={order}
                            onClick={() => {
                              // Get the latest order from state
                              const latestOrder = orders.find(o => o.id === order.id) || order;
                              setSelectedOrder(latestOrder);
                            }}
                          />
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No orders scheduled
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="max-w-[1600px] mx-auto h-[calc(100vh-200px)]">
          <BatchView 
            orders={getOrdersForDate(startDate)} 
            date={startDate}
            onOrderUpdate={updateOrderInState}
          />
        </div>
      )}
      
      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal 
          key={selectedOrder.id}
          order={selectedOrder}
          onClose={handleOrderModalClose}
          onOrderUpdate={(orderId, updates) => {
            console.log('🎯 onOrderUpdate received in App:', { orderId, updates });
            updateOrderInState(orderId, updates);
          }}
        />
      )}
    </div>
  );
}