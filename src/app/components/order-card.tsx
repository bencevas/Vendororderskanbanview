import { Package, ShoppingBag, DollarSign } from 'lucide-react';
import { useLocale } from '@/app/contexts/LocaleContext';

export interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  itemCount: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'ready';
  deliveryDate: Date;
}

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

const statusColors = {
  pending: 'bg-red-50 text-red-700 border-red-300',
  confirmed: 'bg-orange-50 text-orange-700 border-orange-300',
  processing: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  ready: 'bg-green-50 text-green-700 border-green-300',
};

export function OrderCard({ order, onClick }: OrderCardProps) {
  const { t } = useLocale();
  
  // Translate status
  const statusTranslations = {
    pending: t('pending'),
    confirmed: t('confirmed'),
    processing: t('processing'),
    ready: t('ready'),
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-3 min-[481px]:p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2 min-[481px]:mb-3 gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm min-[481px]:text-base truncate">{order.orderCode}</h3>
          <p className="text-xs min-[481px]:text-sm text-gray-600 mt-0.5 min-[481px]:mt-1 truncate">{order.customerName}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${statusColors[order.status]}`}>
          {statusTranslations[order.status]}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Package className="w-4 h-4 text-gray-500" />
          <span>{order.itemCount} {order.itemCount === 1 ? t('item') : t('items')}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <DollarSign className="w-4 h-4 text-gray-500" />
          <span className="font-medium">${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}