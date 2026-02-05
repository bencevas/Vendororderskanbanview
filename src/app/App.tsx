import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, LayoutGrid, List, User, Settings, LogOut, Bell, HelpCircle, ChevronDown, Loader2, AlertCircle, LogIn, RefreshCw } from 'lucide-react';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { OrderCard, Order } from '@/app/components/order-card';
import { OrderDetailsModal } from '@/app/components/order-details-modal';
import { BatchView } from '@/app/components/batch-view';
import { fetchOrders } from '@/app/services/api';
import { generateMockOrders } from '@/app/mock-data';
import { AuthProvider, useAuth } from '@/app/contexts/AuthContext';
import { LoginForm } from '@/app/components/auth/LoginForm';
import { useRealtimeOrders } from '@/app/hooks/useRealtimeOrders';
import { TestPayloadGenerator } from '@/app/components/test-generator/TestPayloadGenerator';

// Main content component that uses auth context
function AppContent() {
  const { user, isLoading: authLoading, isConfigured, signOut } = useAuth();
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'batch'>('kanban');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showTestGenerator, setShowTestGenerator] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const days = Array.from({ length: 5 }, (_, i) => addDays(startDate, i));
  
  // Track the loaded date range to avoid unnecessary fetches
  const [loadedRange, setLoadedRange] = useState<{ start: Date; end: Date } | null>(null);
  
  useEffect(() => {
    const loadOrders = async () => {
      // Calculate the visible range
      const visibleStart = startDate;
      const visibleEnd = addDays(startDate, 4);
      
      // Check if we already have data for this range (with buffer)
      if (loadedRange) {
        const bufferStart = addDays(loadedRange.start, 2); // 2 day buffer
        const bufferEnd = addDays(loadedRange.end, -2);
        
        if (visibleStart >= bufferStart && visibleEnd <= bufferEnd) {
          // Data already loaded, no need to fetch
          return;
        }
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch a wider range (14 days before and after) to reduce API calls when navigating
        const fetchStart = addDays(startDate, -7);
        const fetchEnd = addDays(startDate, 14);
        console.log('🌐 Fetching orders for range:', fetchStart.toDateString(), '-', fetchEnd.toDateString());
        const fetchedOrders = await fetchOrders(fetchStart, fetchEnd);
        console.log('✅ Successfully fetched', fetchedOrders.length, 'orders');
        setOrders(fetchedOrders);
        setLoadedRange({ start: fetchStart, end: fetchEnd });
      } catch (err) {
        console.error('❌ API Error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load orders';
        setError(errorMessage);
        console.warn('⚠️ Falling back to mock data');
        const mockOrders = generateMockOrders();
        setOrders(mockOrders);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [startDate, loadedRange]);
  
  const getOrdersForDate = useCallback((date: Date) => {
    return orders.filter(order => isSameDay(order.deliveryDate, date));
  }, [orders]);
  
  const handlePrevious = () => setStartDate(prev => addDays(prev, -1));
  const handleNext = () => setStartDate(prev => addDays(prev, 1));
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setStartDate(startOfDay(newDate));
    }
  };
  
  const isToday = (date: Date) => isSameDay(date, new Date());
  
  const updateOrderInState = useCallback((orderId: string, updates: Partial<Order>) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, ...updates } : order
      )
    );
    
    setSelectedOrder(prev => 
      prev?.id === orderId ? { ...prev, ...updates } : prev
    );
    
    setRefreshKey(prev => prev + 1);
  }, []);

  const refreshOrders = async () => {
    try {
      // Use the same wide range as the initial load to avoid losing orders
      const fetchStart = addDays(startDate, -7);
      const fetchEnd = addDays(startDate, 14);
      const fetchedOrders = await fetchOrders(fetchStart, fetchEnd);
      setOrders(fetchedOrders);
      setLoadedRange({ start: fetchStart, end: fetchEnd });
    } catch (err) {
      console.error('Error refreshing orders:', err);
    }
  };

  // Real-time subscription for order updates
  useRealtimeOrders({
    onOrderInsert: (newOrder) => {
      setOrders(prev => [...prev, newOrder]);
      setRefreshKey(k => k + 1);
    },
    onOrderUpdate: (updatedOrder) => {
      setOrders(prev =>
        prev.map(order =>
          order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
        )
      );
      setSelectedOrder(prev =>
        prev?.id === updatedOrder.id ? { ...prev, ...updatedOrder } : prev
      );
      setRefreshKey(k => k + 1);
    },
    onOrderDelete: (deletedId) => {
      setOrders(prev => prev.filter(order => order.id !== deletedId));
      if (selectedOrder?.id === deletedId) {
        setSelectedOrder(null);
      }
      setRefreshKey(k => k + 1);
    },
    enabled: isConfigured,
  });

  const handleOrderModalClose = async () => {
    setSelectedOrder(null);
    await refreshOrders();
  };

  const handleSignOut = async () => {
    await signOut();
    setIsProfileDropdownOpen(false);
  };

  // Display name and role
  const displayName = user?.name || 'Guest User';
  const displayRole = user?.role 
    ? user.role === 'super_admin' 
      ? 'Super Admin' 
      : user.role === 'owner' 
        ? 'Store Owner' 
        : 'Team Member'
    : 'Not signed in';
  const displayEmail = user?.email || '';
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 min-[481px]:px-6 py-4 min-[481px]:py-4">
          
          {/* Row 1: Title + Actions (mobile) / Title only (desktop) */}
          <div className="flex items-center justify-between mb-3 min-[481px]:mb-4">
            <h1 className="text-lg min-[481px]:text-2xl font-semibold text-gray-900">Order Management</h1>
            
            {/* Mobile: Action buttons in row 1 */}
            <div className="flex items-center gap-2 min-[481px]:hidden">
              {/* Test Generator Button - compact on mobile */}
              <button
                onClick={() => setShowTestGenerator(true)}
                className="px-2 py-1 text-xs font-medium text-[#476a30] bg-[#476a30]/10 hover:bg-[#476a30]/20 rounded-lg transition-colors cursor-pointer"
                title="Generate test orders"
              >
                + Test
              </button>

              {/* Refresh Button */}
              <button
                onClick={refreshOrders}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                title="Refresh orders"
              >
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>

              {/* Notifications */}
              <button className="relative p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <Bell className="w-4 h-4 text-gray-700" />
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[#EA776C] rounded-full"></span>
              </button>
              
              {/* Profile Dropdown - compact */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-1 hover:bg-gray-50 rounded-lg p-1 transition-colors cursor-pointer"
                >
                  {user ? (
                    <div className="w-7 h-7 rounded-full bg-[#476a30] flex items-center justify-center text-white text-xs font-medium">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                  <ChevronDown className={`w-3 h-3 text-gray-600 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Row 2: View Toggle (mobile full width) */}
          <div className="mb-3 min-[481px]:hidden">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer ${
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
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer ${
                  viewMode === 'batch'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                By Item
              </button>
            </div>
          </div>
          
          {/* Row 3: Date Navigation (mobile) */}
          <div className="flex items-center justify-between gap-2 min-[481px]:hidden">
            <button
              onClick={handlePrevious}
              className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>
            
            <div className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-200">
              <Calendar className="w-4 h-4 text-gray-600" />
              <input
                type="date"
                value={format(startDate, 'yyyy-MM-dd')}
                onChange={handleDateChange}
                className="bg-transparent border-none outline-none text-gray-900 cursor-pointer text-sm w-[110px]"
              />
            </div>
            
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
              aria-label="Next day"
            >
              <ChevronRight className="w-4 h-4 text-gray-700" />
            </button>
          </div>
          
          <div className="text-xs text-gray-600 text-center mt-2 min-[481px]:hidden">
            {format(days[0], 'MMM d')} - {format(days[4], 'MMM d, yyyy')}
          </div>
          
          {/* Desktop Navigation Controls - hidden on mobile */}
          <div className="hidden min-[481px]:flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer ${
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
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer ${
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
              className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
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
              className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
              aria-label="Next day"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
            
            <div className="ml-auto text-sm text-gray-600">
              Showing {format(days[0], 'MMM d')} - {format(days[4], 'MMM d, yyyy')}
            </div>
            
            {/* User Profile Section */}
            <div className="flex items-center gap-3 ml-6">
              {/* Test Generator Button */}
              <button
                onClick={() => setShowTestGenerator(true)}
                className="px-3 py-1.5 text-sm font-medium text-[#476a30] bg-[#476a30]/10 hover:bg-[#476a30]/20 rounded-lg transition-colors cursor-pointer"
                title="Generate test orders"
              >
                + Test Order
              </button>

              {/* Refresh Button */}
              <button
                onClick={refreshOrders}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                title="Refresh orders"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <Bell className="w-5 h-5 text-gray-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#EA776C] rounded-full"></span>
              </button>
              
              <div className="w-px h-8 bg-gray-300" />
              
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors cursor-pointer"
                >
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{displayName}</p>
                    <p className="text-xs text-gray-600">{displayRole}</p>
                  </div>
                  {user ? (
                    <div className="w-10 h-10 rounded-full bg-[#476a30] flex items-center justify-center text-white font-medium">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Profile Dropdown Menu - shared between mobile and desktop */}
          {isProfileDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsProfileDropdownOpen(false)}
              />
              
              <div className="absolute right-3 min-[481px]:right-6 top-12 min-[481px]:top-auto mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[220px] z-20">
                {user ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{displayName}</p>
                      <p className="text-sm text-gray-600">{displayEmail}</p>
                      <p className="text-xs text-[#476a30] mt-1">{displayRole}</p>
                    </div>
                    
                    <div className="py-1">
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 cursor-pointer">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>My Profile</span>
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 cursor-pointer">
                        <Settings className="w-4 h-4 text-gray-500" />
                        <span>Settings</span>
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 cursor-pointer">
                        <HelpCircle className="w-4 h-4 text-gray-500" />
                        <span>Help & Support</span>
                      </button>
                    </div>
                    
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button 
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-[#EA776C] hover:bg-[#EA776C]/10 transition-colors flex items-center gap-3 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900">Welcome</p>
                      <p className="text-sm text-gray-600">Sign in to manage orders</p>
                    </div>
                    
                    {isConfigured ? (
                      <div className="py-1">
                        <button 
                          onClick={() => {
                            setShowLoginModal(true);
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-[#476a30] hover:bg-[#476a30]/10 transition-colors flex items-center gap-3 cursor-pointer"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Sign In</span>
                        </button>
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        <p>Authentication not configured.</p>
                        <p className="text-xs mt-1">Set up Supabase to enable login.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Main Content Area */}
      {isLoading || authLoading ? (
        <div className="max-w-[1600px] mx-auto px-3 min-[481px]:px-6 py-8 min-[481px]:py-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      ) : error ? (
        <div className="max-w-[1600px] mx-auto px-3 min-[481px]:px-6 py-8 min-[481px]:py-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <AlertCircle className="w-12 h-12 text-[#EA776C]" />
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
                className="px-4 py-2 bg-[#476a30] text-white rounded-lg hover:bg-[#3d5a28] transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="max-w-[1600px] mx-auto px-2 min-[481px]:px-6 py-4 min-[481px]:py-6">
          <div className="flex gap-2 min-[481px]:gap-4 overflow-x-auto pb-4" key={refreshKey}>
            {days.map((day, index) => {
              const dayOrders = getOrdersForDate(day);
              
              return (
                <div
                  key={`${day.toISOString()}-${refreshKey}`}
                  className="flex-shrink-0 w-64 min-[481px]:w-80 bg-gray-100 rounded-lg p-3 min-[481px]:p-4"
                >
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
                  
                  <div className="space-y-3">
                    {dayOrders.length > 0 ? (
                      dayOrders.map(order => (
                        <OrderCard 
                          key={`${order.id}-${order.status}`}
                          order={order}
                          onClick={() => {
                            const latestOrder = orders.find(o => o.id === order.id) || order;
                            setSelectedOrder(latestOrder);
                          }}
                        />
                      ))
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
        <div className="max-w-[1600px] mx-auto h-[calc(100vh-180px)] min-[481px]:h-[calc(100vh-200px)]">
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
            updateOrderInState(orderId, updates);
          }}
        />
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 cursor-pointer z-10"
            >
              <span className="text-gray-500 text-xl leading-none">&times;</span>
            </button>
            <LoginForm onSuccess={() => setShowLoginModal(false)} />
          </div>
        </div>
      )}

      {/* Test Generator Modal */}
      {showTestGenerator && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <TestPayloadGenerator 
            onClose={() => setShowTestGenerator(false)} 
            onOrderCreated={() => {
              // Refresh orders after a new test order is created
              refreshOrders();
              setShowTestGenerator(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

// Main App component with AuthProvider wrapper
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
