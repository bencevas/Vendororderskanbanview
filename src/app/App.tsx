import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, LayoutGrid, List, User, Settings, LogOut, Bell, HelpCircle, ChevronDown, Loader2, AlertCircle, LogIn, RefreshCw, Plus } from 'lucide-react';
import { format, addDays, startOfDay, isSameDay, getDay } from 'date-fns';
import { OrderCard, Order } from '@/app/components/order-card';
import { OrderDetailsModal } from '@/app/components/order-details-modal';
import { BatchView } from '@/app/components/batch-view';
import { fetchOrders } from '@/app/services/api';
import { generateMockOrders } from '@/app/mock-data';
import { AuthProvider, useAuth } from '@/app/contexts/AuthContext';
import { LocaleProvider, useLocale } from '@/app/contexts/LocaleContext';
import { ThemeProvider } from '@/app/contexts/ThemeContext';
import { LoginForm } from '@/app/components/auth/LoginForm';
import { AuthScreen } from '@/app/components/auth/AuthScreen';
import { useRealtimeOrders } from '@/app/hooks/useRealtimeOrders';
import { TestPayloadGenerator } from '@/app/components/test-generator/TestPayloadGenerator';
import { SettingsModal } from '@/app/components/settings/SettingsModal';

// Main content component that uses auth context
function AppContent() {
  const { user, isLoading: authLoading, isConfigured, signOut } = useAuth();
  const { t, locale } = useLocale();
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'batch'>('kanban');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showTestGenerator, setShowTestGenerator] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const days = Array.from({ length: 5 }, (_, i) => addDays(startDate, i));
  
  // Track the loaded date range to avoid unnecessary fetches
  const [loadedRange, setLoadedRange] = useState<{ start: Date; end: Date } | null>(null);
  
  useEffect(() => {
    const loadOrders = async () => {
      // Don't load if user is not logged in or still loading auth
      if (!user || authLoading) {
        setIsLoading(false);
        return;
      }
      
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
  }, [startDate, loadedRange, user, authLoading]);
  
  // Reset loaded range when user logs in to force a fresh fetch
  useEffect(() => {
    if (user && !authLoading) {
      setLoadedRange(null);
    }
  }, [user?.id]); // Only trigger when user ID changes (login/logout)
  
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
  const displayName = user?.name || t('guestUser');
  const displayRole = user?.role 
    ? user.role === 'super_admin' 
      ? t('superAdmin') 
      : user.role === 'owner' 
        ? t('storeOwner') 
        : t('teamMember')
    : t('notSignedIn');
  const displayEmail = user?.email || '';
  
  // Helper function to get day name in current locale
  const getDayName = (date: Date) => {
    const dayOfWeek = getDay(date); // 0 = Sunday, 1 = Monday, etc.
    const dayNames = [
      t('sunday'),
      t('monday'),
      t('tuesday'),
      t('wednesday'),
      t('thursday'),
      t('friday'),
      t('saturday'),
    ];
    return dayNames[dayOfWeek];
  };
  
  // Helper function to format date based on locale
  const formatDate = (date: Date, formatType: 'short' | 'full' = 'full') => {
    if (locale === 'hu') {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    } else {
      return formatType === 'short'
        ? format(date, 'MMM d')
        : format(date, 'MMM d, yyyy');
    }
  };
  
  // Show auth screen if user is not logged in
  if (!user && !authLoading) {
    return <AuthScreen />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-[1600px] mx-auto px-4 min-[481px]:px-6 py-4 min-[481px]:py-4">
          
          {/* Row 1: Title + Actions (mobile) / Title only (desktop) */}
          <div className="flex items-center justify-between mb-3 min-[481px]:mb-4">
            <h1 className="text-lg min-[481px]:text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('orderManagement')}</h1>
            
            {/* Mobile: Action buttons in row 1 */}
            <div className="flex items-center gap-2 min-[481px]:hidden">
              {/* Test Generator Button - compact on mobile */}
              <button
                onClick={() => setShowTestGenerator(true)}
                className="p-1.5 text-[#476a30] dark:text-[#EA776C] bg-[#476a30]/10 dark:bg-[#EA776C]/10 hover:bg-[#476a30]/20 dark:hover:bg-[#EA776C]/20 rounded-lg transition-colors cursor-pointer"
                title={t('testOrder')}
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Refresh Button */}
              <button
                onClick={refreshOrders}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                title={t('refreshOrders')}
              >
                <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>

              {/* Notifications */}
              <button className="relative p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                <Bell className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[#EA776C] rounded-full"></span>
              </button>
              
              {/* Profile Dropdown - compact */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1 transition-colors cursor-pointer"
                >
                  {user ? (
                    <div className="w-7 h-7 rounded-full bg-[#476a30] flex items-center justify-center text-white text-xs font-medium">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  <ChevronDown className={`w-3 h-3 text-gray-600 dark:text-gray-400 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Row 2: View Toggle (mobile full width) */}
          <div className="mb-3 min-[481px]:hidden">
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                {t('byOrder')}
              </button>
              <button
                onClick={() => setViewMode('batch')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer ${
                  viewMode === 'batch'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <List className="w-4 h-4" />
                {t('byItem')}
              </button>
            </div>
          </div>
          
          {/* Row 3: Date Navigation (mobile) */}
          <div className="flex items-center justify-between gap-2 min-[481px]:hidden">
            <button
              onClick={handlePrevious}
              className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            
            <div className="flex-1 flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-600">
              <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <input
                type="date"
                value={format(startDate, 'yyyy-MM-dd')}
                onChange={handleDateChange}
                className="bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 cursor-pointer text-sm w-[120px]"
              />
            </div>
            
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              aria-label="Next day"
            >
              <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
          
          <div className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2 min-[481px]:hidden">
            {formatDate(days[0], 'short')} - {formatDate(days[4], 'full')}
          </div>
          
          {/* Desktop Navigation Controls - hidden on mobile */}
          <div className="hidden min-[481px]:flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                {t('byOrder')}
              </button>
              <button
                onClick={() => setViewMode('batch')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer ${
                  viewMode === 'batch'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <List className="w-4 h-4" />
                {t('byItem')}
              </button>
            </div>

            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
            
            <button
              onClick={handlePrevious}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg px-6 py-2 border border-gray-200 dark:border-gray-600">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <input
                type="date"
                value={format(startDate, 'yyyy-MM-dd')}
                onChange={handleDateChange}
                className="bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 cursor-pointer min-w-[140px]"
              />
            </div>
            
            <button
              onClick={handleNext}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              aria-label="Next day"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            
            <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
              {t('showing')} {formatDate(days[0], 'short')} - {formatDate(days[4], 'full')}
            </div>
            
            {/* User Profile Section */}
            <div className="flex items-center gap-3 ml-6">
              {/* Test Generator Button */}
              <button
                onClick={() => setShowTestGenerator(true)}
                className="p-2 text-[#476a30] dark:text-[#EA776C] bg-[#476a30]/10 dark:bg-[#EA776C]/10 hover:bg-[#476a30]/20 dark:hover:bg-[#EA776C]/20 rounded-lg transition-colors cursor-pointer"
                title={t('testOrder')}
              >
                <Plus className="w-5 h-5" />
              </button>

              {/* Refresh Button */}
              <button
                onClick={refreshOrders}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                title={t('refreshOrders')}
              >
                <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#EA776C] rounded-full"></span>
              </button>
              
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
              
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-[#EA776C]/10 rounded-lg p-2 transition-colors cursor-pointer min-w-[140px]"
                >
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{displayName}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">{displayRole}</p>
                  </div>
                  {user ? (
                    <div className="w-10 h-10 rounded-full bg-[#476a30] flex items-center justify-center text-white font-medium">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
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
              
              <div className="absolute right-3 min-[481px]:right-6 top-12 min-[481px]:top-auto mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[220px] z-20">
                {user ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{displayName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{displayEmail}</p>
                      <p className="text-xs text-[#476a30] dark:text-[#5a8a3f] mt-1">{displayRole}</p>
                    </div>
                    
                    <div className="py-1">
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#EA776C]/10 transition-colors flex items-center gap-3 cursor-pointer">
                        <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span>{t('myProfile')}</span>
                      </button>
                      <button 
                        onClick={() => {
                          setShowSettingsModal(true);
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#EA776C]/10 transition-colors flex items-center gap-3 cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span>{t('settings')}</span>
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#EA776C]/10 transition-colors flex items-center gap-3 cursor-pointer">
                        <HelpCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span>{t('helpSupport')}</span>
                      </button>
                    </div>
                    
                    <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                      <button 
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-[#EA776C] hover:bg-[#EA776C]/10 dark:hover:bg-[#EA776C]/20 transition-colors flex items-center gap-3 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('signOut')}</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{t('welcome')}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('signInToManage')}</p>
                    </div>
                    
                    {isConfigured ? (
                      <div className="py-1">
                        <button 
                          onClick={() => {
                            setShowLoginModal(true);
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-[#476a30] dark:text-[#EA776C] hover:bg-[#476a30]/10 dark:hover:bg-[#EA776C]/10 transition-colors flex items-center gap-3 cursor-pointer"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>{t('signIn')}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        <p>{t('authNotConfigured')}</p>
                        <p className="text-xs mt-1">{t('setupSupabase')}</p>
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
            <Loader2 className="w-8 h-8 text-gray-400 dark:text-gray-500 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">{t('loadingOrders')}</p>
          </div>
        </div>
      ) : error ? (
        <div className="max-w-[1600px] mx-auto px-3 min-[481px]:px-6 py-8 min-[481px]:py-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <AlertCircle className="w-12 h-12 text-[#EA776C]" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('errorLoadingOrders')}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => {
                  const endDate = addDays(startDate, 4);
                  fetchOrders(startDate, endDate)
                    .then(setOrders)
                    .catch(err => setError(err instanceof Error ? err.message : 'Failed to load orders'));
                }}
                className="px-4 py-2 bg-[#476a30] text-white rounded-lg hover:bg-[#3d5a28] transition-colors cursor-pointer"
              >
                {t('retry')}
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
                  className="flex-shrink-0 w-64 min-[481px]:w-80 bg-gray-100 dark:bg-gray-800 rounded-lg p-3 min-[481px]:p-4"
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                          {index === 0 && isToday(day) ? t('today') : getDayName(day)}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(day, 'full')}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-700 rounded-full px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                        {t('noOrdersScheduled')}
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
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer z-10"
            >
              <span className="text-gray-500 dark:text-gray-400 text-xl leading-none">&times;</span>
            </button>
            <LoginForm onSuccess={() => setShowLoginModal(false)} />
          </div>
        </div>
      )}

      {/* Test Generator Modal */}
      {showTestGenerator && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
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

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
    </div>
  );
}

// Main App component with providers
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LocaleProvider>
          <AppContent />
        </LocaleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
