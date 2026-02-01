import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, LayoutGrid, List, User, Settings, LogOut, Bell, HelpCircle, ChevronDown } from 'lucide-react';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { OrderCard, Order } from '@/app/components/order-card';
import { OrderDetailsModal } from '@/app/components/order-details-modal';
import { BatchView } from '@/app/components/batch-view';

// Mock order data
const generateMockOrders = (): Order[] => {
  const baseDate = startOfDay(new Date());
  
  return [
    // Today
    {
      id: '1',
      orderCode: 'ORD-2024-001',
      customerName: 'John Smith',
      itemCount: 3,
      totalAmount: 124.99,
      status: 'pending',
      deliveryDate: baseDate,
    },
    {
      id: '2',
      orderCode: 'ORD-2024-002',
      customerName: 'Emma Johnson',
      itemCount: 5,
      totalAmount: 289.50,
      status: 'confirmed',
      deliveryDate: baseDate,
    },
    {
      id: '3',
      orderCode: 'ORD-2024-003',
      customerName: 'Michael Brown',
      itemCount: 2,
      totalAmount: 89.99,
      status: 'processing',
      deliveryDate: baseDate,
    },
    
    // Tomorrow
    {
      id: '4',
      orderCode: 'ORD-2024-004',
      customerName: 'Sarah Davis',
      itemCount: 7,
      totalAmount: 456.75,
      status: 'confirmed',
      deliveryDate: addDays(baseDate, 1),
    },
    {
      id: '5',
      orderCode: 'ORD-2024-005',
      customerName: 'David Wilson',
      itemCount: 1,
      totalAmount: 49.99,
      status: 'pending',
      deliveryDate: addDays(baseDate, 1),
    },
    
    // Day 2
    {
      id: '6',
      orderCode: 'ORD-2024-006',
      customerName: 'Jessica Martinez',
      itemCount: 4,
      totalAmount: 199.99,
      status: 'confirmed',
      deliveryDate: addDays(baseDate, 2),
    },
    {
      id: '7',
      orderCode: 'ORD-2024-007',
      customerName: 'Robert Taylor',
      itemCount: 6,
      totalAmount: 342.00,
      status: 'ready',
      deliveryDate: addDays(baseDate, 2),
    },
    {
      id: '8',
      orderCode: 'ORD-2024-008',
      customerName: 'Amanda Anderson',
      itemCount: 3,
      totalAmount: 156.25,
      status: 'processing',
      deliveryDate: addDays(baseDate, 2),
    },
    
    // Day 3
    {
      id: '9',
      orderCode: 'ORD-2024-009',
      customerName: 'Christopher Lee',
      itemCount: 8,
      totalAmount: 523.40,
      status: 'confirmed',
      deliveryDate: addDays(baseDate, 3),
    },
    {
      id: '10',
      orderCode: 'ORD-2024-010',
      customerName: 'Michelle White',
      itemCount: 2,
      totalAmount: 78.50,
      status: 'pending',
      deliveryDate: addDays(baseDate, 3),
    },
    
    // Day 4
    {
      id: '11',
      orderCode: 'ORD-2024-011',
      customerName: 'James Harris',
      itemCount: 5,
      totalAmount: 267.80,
      status: 'confirmed',
      deliveryDate: addDays(baseDate, 4),
    },
    {
      id: '12',
      orderCode: 'ORD-2024-012',
      customerName: 'Lisa Thompson',
      itemCount: 3,
      totalAmount: 145.99,
      status: 'pending',
      deliveryDate: addDays(baseDate, 4),
    },
    {
      id: '13',
      orderCode: 'ORD-2024-013',
      customerName: 'Daniel Garcia',
      itemCount: 4,
      totalAmount: 234.00,
      status: 'ready',
      deliveryDate: addDays(baseDate, 4),
    },
  ];
};

export default function App() {
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [orders] = useState(generateMockOrders());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'batch'>('kanban');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  // Generate array of 5 consecutive days starting from startDate
  const days = Array.from({ length: 5 }, (_, i) => addDays(startDate, i));
  
  // Filter orders by date
  const getOrdersForDate = (date: Date) => {
    return orders.filter(order => isSameDay(order.deliveryDate, date));
  };
  
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
      {viewMode === 'kanban' ? (
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {days.map((day, index) => {
              const dayOrders = getOrdersForDate(day);
              
              return (
                <div
                  key={day.toISOString()}
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
                      dayOrders.map(order => (
                        <OrderCard 
                          key={order.id} 
                          order={order}
                          onClick={() => setSelectedOrder(order)}
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
        <div className="max-w-[1600px] mx-auto h-[calc(100vh-200px)]">
          <BatchView orders={getOrdersForDate(startDate)} date={startDate} />
        </div>
      )}
      
      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}