// Original hardcoded order items function that was working
export interface OrderItem {
  id: string;
  name: string;
  orderedQuantity: number;
  actualQuantity: number;
  price: number;
  unit: string;
  confirmed: boolean | null;
  image: string;
}

export const getOrderItems = (orderCode: string): OrderItem[] => {
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
    'ORD-2024-003': [
      { id: '1', name: 'Organic Chicken Breast', orderedQuantity: 2.5, actualQuantity: 2.5, price: 12.99, unit: 'kg', confirmed: null, image: 'https://butchershoppeteams.com/cdn/shop/products/butcher-shoppe-direct-boneless-skinless-chicken-breasts-15517883433043_1080x_266ae294-f803-4ef2-8308-0bc060f54d12.webp?v=1680630694' },
      { id: '2', name: 'Fresh Salmon Fillet', orderedQuantity: 1, actualQuantity: 1, price: 24.99, unit: 'kg', confirmed: null, image: 'https://meat4you.ch/media/catalog/product/cache/1e5ed9cbca70cb1b2ba6633fbe65aac9/b/i/bio-lachsfilet-mit-haut-meat4you_24a1909.jpg' },
    ],
  };

  return itemsMap[orderCode] || [
    { id: '1', name: 'Sample Product A', orderedQuantity: 2, actualQuantity: 2, price: 29.99, unit: 'kg', confirmed: null, image: 'figma:asset/3c867424c3791bfcc1f02947243b24a416a57b37.png' },
    { id: '2', name: 'Sample Product B', orderedQuantity: 1, actualQuantity: 1, price: 49.99, unit: 'kg', confirmed: null, image: 'figma:asset/3c867424c3791bfcc1f02947243b24a416a57b37.png' },
    { id: '3', name: 'Sample Product C', orderedQuantity: 1.5, actualQuantity: 1.5, price: 19.99, unit: 'kg', confirmed: null, image: 'figma:asset/3c867424c3791bfcc1f02947243b24a416a57b37.png' },
  ];
};
