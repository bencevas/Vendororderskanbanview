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
  pending: 'bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 border-red-400 dark:border-red-500/50',
  confirmed: 'bg-gray-100 dark:bg-gray-800 text-orange-600 dark:text-orange-400 border-orange-400 dark:border-orange-500/50',
  processing: 'bg-gray-100 dark:bg-gray-800 text-yellow-600 dark:text-yellow-400 border-yellow-400 dark:border-yellow-500/50',
  ready: 'bg-gray-100 dark:bg-gray-800 text-green-600 dark:text-green-400 border-green-400 dark:border-green-500/50',
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
      className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 dark:border-gray-600 p-3 min-[481px]:p-4 hover:shadow-md dark:hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2 min-[481px]:mb-3 gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm min-[481px]:text-base truncate">{order.orderCode}</h3>
          <p className="text-xs min-[481px]:text-sm text-gray-600 dark:text-gray-400 mt-0.5 min-[481px]:mt-1 truncate">{order.customerName}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${statusColors[order.status]}`}>
          {statusTranslations[order.status]}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span>{order.itemCount} {order.itemCount === 1 ? t('item') : t('items')}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="font-medium">${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}