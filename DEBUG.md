# Debugging Guide

## Quick Checks

1. **Check if servers are running:**
   ```bash
   # Check API server
   curl http://localhost:3000/api/health
   
   # Check frontend
   curl http://localhost:5173
   ```

2. **Check browser console:**
   - Open DevTools (F12 or Cmd+Option+I)
   - Look for errors in Console tab
   - Look for network requests in Network tab

3. **Test API endpoints:**
   ```bash
   # Get all orders
   curl http://localhost:3000/api/orders
   
   # Get order items
   curl http://localhost:3000/api/orders/1/items
   ```

## Common Issues

1. **No data showing:**
   - Check browser console for API errors
   - Verify server is running on port 3000
   - Check CORS headers

2. **Batch view not grouping:**
   - Check console logs for "Batch view:" messages
   - Verify orders have items
   - Check Network tab for /items requests

3. **Status changes not updating:**
   - Check if onOrderUpdate callback is being called
   - Verify API PATCH requests are successful
   - Check browser console for errors

## Restart Everything

```bash
# Kill existing servers
pkill -f "node server"
pkill -f "vite"

# Start API server
npm run server

# In another terminal, start frontend
npm run dev
```
