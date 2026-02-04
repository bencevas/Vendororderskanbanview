-- Seed data for testing (run after 001_initial_schema.sql)
-- This creates sample orders similar to the mock data

-- Insert sample orders for the next 5 days
INSERT INTO orders (id, order_code, customer_name, customer_email, total_amount, status, delivery_date) VALUES
  -- Today
  ('11111111-1111-1111-1111-111111111101', 'ORD-2024-001', 'John Smith', 'john@example.com', 124.99, 'pending', CURRENT_DATE),
  ('11111111-1111-1111-1111-111111111102', 'ORD-2024-002', 'Emma Johnson', 'emma@example.com', 289.50, 'confirmed', CURRENT_DATE),
  ('11111111-1111-1111-1111-111111111103', 'ORD-2024-003', 'Michael Brown', 'michael@example.com', 89.99, 'processing', CURRENT_DATE),
  -- Tomorrow
  ('11111111-1111-1111-1111-111111111104', 'ORD-2024-004', 'Sarah Davis', 'sarah@example.com', 456.75, 'confirmed', CURRENT_DATE + INTERVAL '1 day'),
  ('11111111-1111-1111-1111-111111111105', 'ORD-2024-005', 'David Wilson', 'david@example.com', 49.99, 'pending', CURRENT_DATE + INTERVAL '1 day'),
  -- Day 2
  ('11111111-1111-1111-1111-111111111106', 'ORD-2024-006', 'Jessica Martinez', 'jessica@example.com', 199.99, 'confirmed', CURRENT_DATE + INTERVAL '2 days'),
  ('11111111-1111-1111-1111-111111111107', 'ORD-2024-007', 'Robert Taylor', 'robert@example.com', 342.00, 'ready', CURRENT_DATE + INTERVAL '2 days'),
  ('11111111-1111-1111-1111-111111111108', 'ORD-2024-008', 'Amanda Anderson', 'amanda@example.com', 156.25, 'processing', CURRENT_DATE + INTERVAL '2 days'),
  -- Day 3
  ('11111111-1111-1111-1111-111111111109', 'ORD-2024-009', 'Christopher Lee', 'chris@example.com', 523.40, 'confirmed', CURRENT_DATE + INTERVAL '3 days'),
  ('11111111-1111-1111-1111-111111111110', 'ORD-2024-010', 'Michelle White', 'michelle@example.com', 78.50, 'pending', CURRENT_DATE + INTERVAL '3 days'),
  -- Day 4
  ('11111111-1111-1111-1111-111111111111', 'ORD-2024-011', 'James Harris', 'james@example.com', 267.80, 'confirmed', CURRENT_DATE + INTERVAL '4 days'),
  ('11111111-1111-1111-1111-111111111112', 'ORD-2024-012', 'Lisa Thompson', 'lisa@example.com', 145.99, 'pending', CURRENT_DATE + INTERVAL '4 days'),
  ('11111111-1111-1111-1111-111111111113', 'ORD-2024-013', 'Daniel Garcia', 'daniel@example.com', 234.00, 'ready', CURRENT_DATE + INTERVAL '4 days');

-- Insert order items for each order
-- Order 1 items
INSERT INTO order_items (order_id, product_name, product_sku, ordered_quantity, actual_quantity, unit, price, image_url) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Organic Chicken Breast', 'CHKN-001', 2, 2, 'kg', 12.99, 'https://butchershoppeteams.com/cdn/shop/products/butcher-shoppe-direct-boneless-skinless-chicken-breasts-15517883433043_1080x_266ae294-f803-4ef2-8308-0bc060f54d12.webp?v=1680630694'),
  ('11111111-1111-1111-1111-111111111101', 'Fresh Salmon Fillet', 'SLMN-001', 1.5, 1.5, 'kg', 24.99, 'https://meat4you.ch/media/catalog/product/cache/1e5ed9cbca70cb1b2ba6633fbe65aac9/b/i/bio-lachsfilet-mit-haut-meat4you_24a1909.jpg'),
  ('11111111-1111-1111-1111-111111111101', 'Ground Beef', 'BEEF-001', 1, 1, 'kg', 15.50, 'https://heatherlea.ca/wp-content/uploads/2022/12/DSC_0760-scaled.jpg');

-- Order 2 items
INSERT INTO order_items (order_id, product_name, product_sku, ordered_quantity, actual_quantity, unit, price, image_url) VALUES
  ('11111111-1111-1111-1111-111111111102', 'Ribeye Steak', 'RBEY-001', 2, 2, 'kg', 28.99, 'https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml'),
  ('11111111-1111-1111-1111-111111111102', 'Pork Tenderloin', 'PORK-001', 1.5, 1.5, 'kg', 16.99, 'https://cdn.woodwardmeats.com/media/product/1_Pork-Tenderloin.jpg'),
  ('11111111-1111-1111-1111-111111111102', 'Lamb Chops', 'LAMB-001', 1, 1, 'kg', 32.00, 'https://thebutchery.ca/cdn/shop/files/IMG_0126.jpg?v=1686321240&width=800'),
  ('11111111-1111-1111-1111-111111111102', 'Turkey Breast', 'TRKY-001', 2.5, 2.5, 'kg', 14.50, 'https://jmbutcher.mt/wp-content/uploads/2020/05/Turkey-Breast.jpg'),
  ('11111111-1111-1111-1111-111111111102', 'Duck Breast', 'DUCK-001', 0.8, 0.8, 'kg', 22.00, 'https://www.countrystylemeats.co.uk/wp-content/uploads/2022/05/duck-breast-jpg.webp');

-- Order 3 items
INSERT INTO order_items (order_id, product_name, product_sku, ordered_quantity, actual_quantity, unit, price, image_url) VALUES
  ('11111111-1111-1111-1111-111111111103', 'Organic Chicken Breast', 'CHKN-001', 2.5, 2.5, 'kg', 12.99, 'https://butchershoppeteams.com/cdn/shop/products/butcher-shoppe-direct-boneless-skinless-chicken-breasts-15517883433043_1080x_266ae294-f803-4ef2-8308-0bc060f54d12.webp?v=1680630694'),
  ('11111111-1111-1111-1111-111111111103', 'Fresh Salmon Fillet', 'SLMN-001', 1, 1, 'kg', 24.99, 'https://meat4you.ch/media/catalog/product/cache/1e5ed9cbca70cb1b2ba6633fbe65aac9/b/i/bio-lachsfilet-mit-haut-meat4you_24a1909.jpg');

-- Order 4 items (7 items)
INSERT INTO order_items (order_id, product_name, product_sku, ordered_quantity, actual_quantity, unit, price, image_url) VALUES
  ('11111111-1111-1111-1111-111111111104', 'Ribeye Steak', 'RBEY-001', 3, 3, 'kg', 28.99, 'https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml'),
  ('11111111-1111-1111-1111-111111111104', 'Ground Beef', 'BEEF-001', 2, 2, 'kg', 15.50, 'https://heatherlea.ca/wp-content/uploads/2022/12/DSC_0760-scaled.jpg'),
  ('11111111-1111-1111-1111-111111111104', 'Pork Tenderloin', 'PORK-001', 1.5, 1.5, 'kg', 16.99, 'https://cdn.woodwardmeats.com/media/product/1_Pork-Tenderloin.jpg'),
  ('11111111-1111-1111-1111-111111111104', 'Lamb Chops', 'LAMB-001', 2, 2, 'kg', 32.00, 'https://thebutchery.ca/cdn/shop/files/IMG_0126.jpg?v=1686321240&width=800'),
  ('11111111-1111-1111-1111-111111111104', 'Turkey Breast', 'TRKY-001', 1, 1, 'kg', 14.50, 'https://jmbutcher.mt/wp-content/uploads/2020/05/Turkey-Breast.jpg'),
  ('11111111-1111-1111-1111-111111111104', 'Duck Breast', 'DUCK-001', 1.2, 1.2, 'kg', 22.00, 'https://www.countrystylemeats.co.uk/wp-content/uploads/2022/05/duck-breast-jpg.webp'),
  ('11111111-1111-1111-1111-111111111104', 'Organic Chicken Breast', 'CHKN-001', 2, 2, 'kg', 12.99, 'https://butchershoppeteams.com/cdn/shop/products/butcher-shoppe-direct-boneless-skinless-chicken-breasts-15517883433043_1080x_266ae294-f803-4ef2-8308-0bc060f54d12.webp?v=1680630694');

-- Order 5 items
INSERT INTO order_items (order_id, product_name, product_sku, ordered_quantity, actual_quantity, unit, price, image_url) VALUES
  ('11111111-1111-1111-1111-111111111105', 'Fresh Salmon Fillet', 'SLMN-001', 1, 1, 'kg', 24.99, 'https://meat4you.ch/media/catalog/product/cache/1e5ed9cbca70cb1b2ba6633fbe65aac9/b/i/bio-lachsfilet-mit-haut-meat4you_24a1909.jpg');

-- Order 6 items
INSERT INTO order_items (order_id, product_name, product_sku, ordered_quantity, actual_quantity, unit, price, image_url) VALUES
  ('11111111-1111-1111-1111-111111111106', 'Ribeye Steak', 'RBEY-001', 2, 2, 'kg', 28.99, 'https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml'),
  ('11111111-1111-1111-1111-111111111106', 'Ground Beef', 'BEEF-001', 1, 1, 'kg', 15.50, 'https://heatherlea.ca/wp-content/uploads/2022/12/DSC_0760-scaled.jpg'),
  ('11111111-1111-1111-1111-111111111106', 'Pork Tenderloin', 'PORK-001', 1, 1, 'kg', 16.99, 'https://cdn.woodwardmeats.com/media/product/1_Pork-Tenderloin.jpg'),
  ('11111111-1111-1111-1111-111111111106', 'Organic Chicken Breast', 'CHKN-001', 1.5, 1.5, 'kg', 12.99, 'https://butchershoppeteams.com/cdn/shop/products/butcher-shoppe-direct-boneless-skinless-chicken-breasts-15517883433043_1080x_266ae294-f803-4ef2-8308-0bc060f54d12.webp?v=1680630694');

-- Order 7 items (6 items)
INSERT INTO order_items (order_id, product_name, product_sku, ordered_quantity, actual_quantity, unit, price, image_url) VALUES
  ('11111111-1111-1111-1111-111111111107', 'Lamb Chops', 'LAMB-001', 3, 3, 'kg', 32.00, 'https://thebutchery.ca/cdn/shop/files/IMG_0126.jpg?v=1686321240&width=800'),
  ('11111111-1111-1111-1111-111111111107', 'Turkey Breast', 'TRKY-001', 2, 2, 'kg', 14.50, 'https://jmbutcher.mt/wp-content/uploads/2020/05/Turkey-Breast.jpg'),
  ('11111111-1111-1111-1111-111111111107', 'Duck Breast', 'DUCK-001', 1, 1, 'kg', 22.00, 'https://www.countrystylemeats.co.uk/wp-content/uploads/2022/05/duck-breast-jpg.webp'),
  ('11111111-1111-1111-1111-111111111107', 'Ribeye Steak', 'RBEY-001', 2.5, 2.5, 'kg', 28.99, 'https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml'),
  ('11111111-1111-1111-1111-111111111107', 'Ground Beef', 'BEEF-001', 1.5, 1.5, 'kg', 15.50, 'https://heatherlea.ca/wp-content/uploads/2022/12/DSC_0760-scaled.jpg'),
  ('11111111-1111-1111-1111-111111111107', 'Fresh Salmon Fillet', 'SLMN-001', 1, 1, 'kg', 24.99, 'https://meat4you.ch/media/catalog/product/cache/1e5ed9cbca70cb1b2ba6633fbe65aac9/b/i/bio-lachsfilet-mit-haut-meat4you_24a1909.jpg');

-- Order 8 items
INSERT INTO order_items (order_id, product_name, product_sku, ordered_quantity, actual_quantity, unit, price, image_url) VALUES
  ('11111111-1111-1111-1111-111111111108', 'Pork Tenderloin', 'PORK-001', 2, 2, 'kg', 16.99, 'https://cdn.woodwardmeats.com/media/product/1_Pork-Tenderloin.jpg'),
  ('11111111-1111-1111-1111-111111111108', 'Organic Chicken Breast', 'CHKN-001', 1, 1, 'kg', 12.99, 'https://butchershoppeteams.com/cdn/shop/products/butcher-shoppe-direct-boneless-skinless-chicken-breasts-15517883433043_1080x_266ae294-f803-4ef2-8308-0bc060f54d12.webp?v=1680630694'),
  ('11111111-1111-1111-1111-111111111108', 'Lamb Chops', 'LAMB-001', 1.5, 1.5, 'kg', 32.00, 'https://thebutchery.ca/cdn/shop/files/IMG_0126.jpg?v=1686321240&width=800');

-- Order 9 items (8 items)
INSERT INTO order_items (order_id, product_name, product_sku, ordered_quantity, actual_quantity, unit, price, image_url) VALUES
  ('11111111-1111-1111-1111-111111111109', 'Ribeye Steak', 'RBEY-001', 4, 4, 'kg', 28.99, 'https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml'),
  ('11111111-1111-1111-1111-111111111109', 'Ground Beef', 'BEEF-001', 2, 2, 'kg', 15.50, 'https://heatherlea.ca/wp-content/uploads/2022/12/DSC_0760-scaled.jpg'),
  ('11111111-1111-1111-1111-111111111109', 'Pork Tenderloin', 'PORK-001', 1.5, 1.5, 'kg', 16.99, 'https://cdn.woodwardmeats.com/media/product/1_Pork-Tenderloin.jpg'),
  ('11111111-1111-1111-1111-111111111109', 'Lamb Chops', 'LAMB-001', 2, 2, 'kg', 32.00, 'https://thebutchery.ca/cdn/shop/files/IMG_0126.jpg?v=1686321240&width=800'),
  ('11111111-1111-1111-1111-111111111109', 'Turkey Breast', 'TRKY-001', 1.5, 1.5, 'kg', 14.50, 'https://jmbutcher.mt/wp-content/uploads/2020/05/Turkey-Breast.jpg'),
  ('11111111-1111-1111-1111-111111111109', 'Duck Breast', 'DUCK-001', 1, 1, 'kg', 22.00, 'https://www.countrystylemeats.co.uk/wp-content/uploads/2022/05/duck-breast-jpg.webp'),
  ('11111111-1111-1111-1111-111111111109', 'Organic Chicken Breast', 'CHKN-001', 2, 2, 'kg', 12.99, 'https://butchershoppeteams.com/cdn/shop/products/butcher-shoppe-direct-boneless-skinless-chicken-breasts-15517883433043_1080x_266ae294-f803-4ef2-8308-0bc060f54d12.webp?v=1680630694'),
  ('11111111-1111-1111-1111-111111111109', 'Fresh Salmon Fillet', 'SLMN-001', 1.5, 1.5, 'kg', 24.99, 'https://meat4you.ch/media/catalog/product/cache/1e5ed9cbca70cb1b2ba6633fbe65aac9/b/i/bio-lachsfilet-mit-haut-meat4you_24a1909.jpg');

-- Order 10 items
INSERT INTO order_items (order_id, product_name, product_sku, ordered_quantity, actual_quantity, unit, price, image_url) VALUES
  ('11111111-1111-1111-1111-111111111110', 'Ground Beef', 'BEEF-001', 1, 1, 'kg', 15.50, 'https://heatherlea.ca/wp-content/uploads/2022/12/DSC_0760-scaled.jpg'),
  ('11111111-1111-1111-1111-111111111110', 'Organic Chicken Breast', 'CHKN-001', 1, 1, 'kg', 12.99, 'https://butchershoppeteams.com/cdn/shop/products/butcher-shoppe-direct-boneless-skinless-chicken-breasts-15517883433043_1080x_266ae294-f803-4ef2-8308-0bc060f54d12.webp?v=1680630694');

-- Order 11 items (5 items)
INSERT INTO order_items (order_id, product_name, product_sku, ordered_quantity, actual_quantity, unit, price, image_url) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Ribeye Steak', 'RBEY-001', 3, 3, 'kg', 28.99, 'https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml'),
  ('11111111-1111-1111-1111-111111111111', 'Ground Beef', 'BEEF-001', 1.5, 1.5, 'kg', 15.50, 'https://heatherlea.ca/wp-content/uploads/2022/12/DSC_0760-scaled.jpg'),
  ('11111111-1111-1111-1111-111111111111', 'Pork Tenderloin', 'PORK-001', 1, 1, 'kg', 16.99, 'https://cdn.woodwardmeats.com/media/product/1_Pork-Tenderloin.jpg'),
  ('11111111-1111-1111-1111-111111111111', 'Lamb Chops', 'LAMB-001', 1.5, 1.5, 'kg', 32.00, 'https://thebutchery.ca/cdn/shop/files/IMG_0126.jpg?v=1686321240&width=800'),
  ('11111111-1111-1111-1111-111111111111', 'Turkey Breast', 'TRKY-001', 1, 1, 'kg', 14.50, 'https://jmbutcher.mt/wp-content/uploads/2020/05/Turkey-Breast.jpg');

-- Order 12 items
INSERT INTO order_items (order_id, product_name, product_sku, ordered_quantity, actual_quantity, unit, price, image_url) VALUES
  ('11111111-1111-1111-1111-111111111112', 'Duck Breast', 'DUCK-001', 1, 1, 'kg', 22.00, 'https://www.countrystylemeats.co.uk/wp-content/uploads/2022/05/duck-breast-jpg.webp'),
  ('11111111-1111-1111-1111-111111111112', 'Organic Chicken Breast', 'CHKN-001', 1, 1, 'kg', 12.99, 'https://butchershoppeteams.com/cdn/shop/products/butcher-shoppe-direct-boneless-skinless-chicken-breasts-15517883433043_1080x_266ae294-f803-4ef2-8308-0bc060f54d12.webp?v=1680630694'),
  ('11111111-1111-1111-1111-111111111112', 'Fresh Salmon Fillet', 'SLMN-001', 1, 1, 'kg', 24.99, 'https://meat4you.ch/media/catalog/product/cache/1e5ed9cbca70cb1b2ba6633fbe65aac9/b/i/bio-lachsfilet-mit-haut-meat4you_24a1909.jpg');

-- Order 13 items
INSERT INTO order_items (order_id, product_name, product_sku, ordered_quantity, actual_quantity, unit, price, image_url) VALUES
  ('11111111-1111-1111-1111-111111111113', 'Ribeye Steak', 'RBEY-001', 2, 2, 'kg', 28.99, 'https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml'),
  ('11111111-1111-1111-1111-111111111113', 'Ground Beef', 'BEEF-001', 1, 1, 'kg', 15.50, 'https://heatherlea.ca/wp-content/uploads/2022/12/DSC_0760-scaled.jpg'),
  ('11111111-1111-1111-1111-111111111113', 'Pork Tenderloin', 'PORK-001', 1, 1, 'kg', 16.99, 'https://cdn.woodwardmeats.com/media/product/1_Pork-Tenderloin.jpg'),
  ('11111111-1111-1111-1111-111111111113', 'Lamb Chops', 'LAMB-001', 1, 1, 'kg', 32.00, 'https://thebutchery.ca/cdn/shop/files/IMG_0126.jpg?v=1686321240&width=800');

-- Update order item counts (for display purposes)
UPDATE orders SET total_amount = (
  SELECT COALESCE(SUM(price * ordered_quantity), 0)
  FROM order_items
  WHERE order_items.order_id = orders.id
);
