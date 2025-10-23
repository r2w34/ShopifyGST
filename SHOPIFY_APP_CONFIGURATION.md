# Shopify App Configuration Guide

**App URL:** https://letsprint.indigenservices.com  
**Status:** ✅ App is RUNNING  
**Issue:** 404 in Shopify Dashboard (Configuration needed)

---

## 🔧 Current Status

### ✅ What's Working
1. **Server is running** on port 3003
2. **Nginx is configured** and proxying correctly
3. **SSL/HTTPS** is working properly
4. **Next.js app** is built and serving pages
5. **Database** is connected and tables exist

### ⚠️ What Needs Configuration
1. **Shopify Partner Dashboard URLs** - Need to be configured correctly
2. **OAuth Redirect URLs** - Must match app configuration
3. **App Scopes** - Need to be set properly
4. **Embedded App Settings** - Must be enabled

---

## 📝 Shopify Partner Dashboard Configuration

### Step 1: Go to Your Shopify Partner Dashboard
1. Log in to https://partners.shopify.com/
2. Navigate to **Apps**
3. Select your app **LetsPrint** (or create new app if needed)

### Step 2: Configure App URLs

#### App URL (Main URL)
```
https://letsprint.indigenservices.com
```

#### Allowed Redirection URLs
Add these URLs (one per line):
```
https://letsprint.indigenservices.com/api/auth
https://letsprint.indigenservices.com/api/auth/callback
https://letsprint.indigenservices.com/auth/callback
```

### Step 3: Configure App Scopes

Navigate to **Configuration** > **App setup** > **Access scopes** and enable:

**Required Scopes:**
- `read_orders` - Read order information
- `read_products` - Read product details for HSN codes  
- `read_customers` - Read customer information for invoices
- `read_locations` - Determine shipping locations for GST
- `write_files` - Upload generated PDF invoices

**Optional Scopes (for full features):**
- `read_analytics` - For GST reports
- `read_reports` - For sales analysis
- `write_orders` - Update order notes with invoice links

### Step 4: Enable Embedded App
1. Go to **Configuration** > **Embedded app**
2. **Enable** embedded app
3. Set **Frame ancestors** to: `https://*.myshopify.com https://admin.shopify.com`

### Step 5: Configure Application Proxy (Optional)
If you want to show invoices in the storefront:

**Subpath prefix:** `apps`  
**Subpath:** `letsprint`  
**Proxy URL:** `https://letsprint.indigenservices.com/proxy`

---

## 🔐 Environment Variables Already Configured

The following are already set in `/var/www/letsprint/.env`:

```env
SHOPIFY_API_KEY=5a5fa193e345adea3497281c7f8d7c5f
SHOPIFY_API_SECRET=[configured]
SHOPIFY_APP_URL=https://letsprint.indigenservices.com
```

**⚠️ Important:** The API Key and Secret shown above must match what's in your Shopify Partner Dashboard under **Client credentials**.

---

## 🧪 Testing the App

### Test Installation Flow

1. In Shopify Partner Dashboard, go to **Test your app**
2. Select a development store
3. Click **Install app**
4. You should be redirected to: `https://letsprint.indigenservices.com/?shop=your-store.myshopify.com`
5. The app will redirect to OAuth: `/api/auth?shop=your-store.myshopify.com`
6. After authorization, you'll be redirected back to your app

### Expected Flow
```
1. Shopify Admin → Click "LetsPrint" app
2. Redirects to: https://letsprint.indigenservices.com/?shop=your-store.myshopify.com&host=xxx
3. App detects shop parameter → Redirects to /api/auth
4. OAuth flow → User authorizes app
5. Callback to /api/auth/callback
6. Session created → User sees app dashboard
```

---

## 🐛 Troubleshooting 404 Errors

### Issue: "404 in Dashboard"

**Possible Causes:**

1. **Wrong App URL in Partner Dashboard**
   - Solution: Verify it's exactly `https://letsprint.indigenservices.com` (no trailing slash)

2. **Missing Redirect URLs**
   - Solution: Add all redirect URLs listed above in Step 2

3. **OAuth Flow Not Completing**
   - Solution: Check that `/api/auth` and `/api/auth/callback` routes exist and are working
   - Test: `curl https://letsprint.indigenservices.com/api/auth?shop=test.myshopify.com`

4. **App Not Embedded Correctly**
   - Solution: Enable embedded app in Partner Dashboard
   - Ensure X-Frame-Options header is set to `ALLOWALL`

5. **Session Issues**
   - Solution: Check database connection
   - Verify Session table exists: `\dt` in PostgreSQL

### Check API Routes

Run these commands to test API endpoints:

```bash
# Test auth endpoint
curl -I https://letsprint.indigenservices.com/api/auth?shop=test.myshopify.com

# Test orders endpoint (will need auth)
curl -I https://letsprint.indigenservices.com/api/orders

# Test webhooks endpoint
curl -I https://letsprint.indigenservices.com/api/webhooks/orders/create
```

---

## 📊 Verify App is Running

SSH to server and check:

```bash
# Check PM2 status
pm2 list

# Check if app is listening
netstat -tlnp | grep 3003

# Check logs
pm2 logs letsprint --lines 20

# Test locally
curl http://localhost:3003

# Test with HTTPS
curl https://letsprint.indigenservices.com
```

---

## 🔄 If You Need to Restart

```bash
# SSH to server
ssh root@72.60.99.154

# Navigate to app
cd /var/www/letsprint

# Restart app
pm2 restart letsprint

# Or rebuild and restart
npm run build
pm2 restart letsprint
```

---

## 📱 Test in Shopify Admin

Once configured, you can test the app:

1. **Install on Development Store**
   - Partners Dashboard > Test your app > Select store > Install

2. **Access from Shopify Admin**
   - Login to your development store admin
   - Go to **Apps** section
   - Click **LetsPrint**

3. **Expected Result**
   - App should load in embedded iframe
   - You should see the app dashboard
   - No 404 errors

---

## 🎯 Next Steps After Configuration

Once the app loads successfully in Shopify admin:

1. **Test OAuth Flow** - Install/uninstall app to verify auth works
2. **Test Order Loading** - Navigate to Orders page, verify orders display
3. **Test PDF Generation** - Click "Print" on an order
4. **Configure GST Settings** - Set your store's state and tax rates
5. **Test Email Sending** - (After implementing email feature)
6. **Configure HSN Codes** - (After implementing HSN management)

---

## 🆘 Still Getting 404?

If you've configured everything above and still see 404:

1. **Check Nginx Logs**
```bash
tail -f /var/log/nginx/letsprint_error.log
```

2. **Check PM2 Logs**
```bash
pm2 logs letsprint --err
```

3. **Verify DNS**
```bash
dig letsprint.indigenservices.com
```

4. **Test Direct Access**
```bash
curl -v https://letsprint.indigenservices.com/?shop=test.myshopify.com 2>&1 | head -50
```

5. **Check Database Connection**
```bash
PGPASSWORD='ShopifyApp2024' psql -U shopify_user -d shopify_order_printer -h localhost -c "SELECT COUNT(*) FROM \"Session\";"
```

---

## 📞 Support Checklist

If you need help, provide:

- [ ] Screenshot of Partner Dashboard App URL configuration
- [ ] Screenshot of 404 error in Shopify admin
- [ ] Output of `pm2 logs letsprint --lines 50`
- [ ] Output of `curl -I https://letsprint.indigenservices.com/?shop=your-store.myshopify.com`
- [ ] Your store's myshopify.com domain

---

## ✅ Confirmation Tests

Run these to confirm everything is working:

```bash
# 1. App is running
pm2 list | grep letsprint

# 2. Port is listening
netstat -tlnp | grep 3003

# 3. HTTPS works
curl -I https://letsprint.indigenservices.com

# 4. API auth exists
curl -I https://letsprint.indigenservices.com/api/auth

# 5. Database connected
cd /var/www/letsprint && node -e "const {PrismaClient}=require('@prisma/client');const prisma=new PrismaClient();prisma.session.count().then(c=>console.log('Sessions:',c)).catch(e=>console.error(e)).finally(()=>prisma.\$disconnect())"
```

All tests should pass before attempting to install in Shopify.

---

**Last Updated:** October 23, 2025  
**App Status:** 🟢 RUNNING  
**Configuration Status:** ⚠️ NEEDS PARTNER DASHBOARD SETUP
