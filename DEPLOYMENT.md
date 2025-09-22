# 🚀 Deployment Guide - GST Invoice & Shipping Manager

This guide covers the complete deployment process for the GST Invoice & Shipping Manager Shopify app.

## 📋 Prerequisites

- Ubuntu/Debian server with root access
- Domain name with DNS configured
- Node.js 18+ and npm
- PostgreSQL database
- SSL certificate (Let's Encrypt recommended)

## 🛠️ Server Setup

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js 18+
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Install PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 4. Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 5. Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 🗄️ Database Setup

### 1. Create Database and User
```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE gst_invoice_manager;
CREATE USER gst_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE gst_invoice_manager TO gst_user;
\q
```

### 2. Configure Database URL
```bash
DATABASE_URL="postgresql://gst_user:your_secure_password@localhost:5432/gst_invoice_manager"
```

## 📦 Application Deployment

### 1. Clone Repository
```bash
cd /var/www
git clone https://github.com/r2w34/ShopifyGST.git
cd ShopifyGST
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create `.env` file:
```bash
nano .env
```

```env
# Shopify App Configuration
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SHOPIFY_APP_URL=https://your-domain.com
SCOPES=write_orders,read_orders,write_customers,read_customers,write_products,read_products,write_shipping,read_shipping

# Database
DATABASE_URL=postgresql://gst_user:your_secure_password@localhost:5432/gst_invoice_manager

# Session Storage
SESSION_SECRET=your_very_secure_session_secret_at_least_32_characters

# App Configuration
NODE_ENV=production
PORT=3000
```

### 4. Database Migration
```bash
npx prisma generate
npx prisma db push
```

### 5. Build Application
```bash
npm run build
```

### 6. PM2 Configuration
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'gst-invoice-manager',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/ShopifyGST',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### 7. Start Application
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🌐 Nginx Configuration

### 1. Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/gst-invoice-manager
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # Security Headers
    add_header X-Frame-Options "ALLOWALL" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "frame-ancestors https://*.shopify.com https://admin.shopify.com https://*.myshopify.com" always;

    # Proxy Configuration
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static Files
    location /static/ {
        alias /var/www/ShopifyGST/build/client/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/gst-invoice-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 SSL Certificate Setup

### 1. Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Obtain SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 3. Auto-renewal Setup
```bash
sudo crontab -e
```

Add this line:
```bash
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Shopify App Configuration

### 1. Partner Dashboard Setup
1. Go to [Shopify Partners](https://partners.shopify.com)
2. Create new app or update existing app
3. Set App URL: `https://your-domain.com`
4. Set Allowed redirection URLs: `https://your-domain.com/auth/callback`
5. Configure required scopes in app settings

### 2. App Distribution
- Set distribution to "Public app" for App Store
- Or "Custom app" for private distribution

## 📊 Monitoring & Maintenance

### 1. PM2 Monitoring
```bash
pm2 status
pm2 logs gst-invoice-manager
pm2 monit
```

### 2. Database Backup
Create backup script `/var/www/backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U gst_user gst_invoice_manager > /var/backups/gst_backup_$DATE.sql
find /var/backups -name "gst_backup_*.sql" -mtime +7 -delete
```

Make executable and add to cron:
```bash
chmod +x /var/www/backup.sh
sudo crontab -e
```

Add:
```bash
0 2 * * * /var/www/backup.sh
```

### 3. Log Rotation
```bash
sudo nano /etc/logrotate.d/gst-invoice-manager
```

```
/root/.pm2/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 0644 root root
    postrotate
        pm2 reloadLogs
    endscript
}
```

## 🚨 Troubleshooting

### Common Issues

1. **App not loading in Shopify admin**
   - Check SSL certificate is valid
   - Verify Content-Security-Policy headers
   - Ensure app URL matches exactly

2. **Database connection errors**
   - Verify PostgreSQL is running: `sudo systemctl status postgresql`
   - Check database credentials in `.env`
   - Test connection: `psql $DATABASE_URL`

3. **PM2 process crashes**
   - Check logs: `pm2 logs gst-invoice-manager`
   - Restart process: `pm2 restart gst-invoice-manager`
   - Check memory usage: `pm2 monit`

4. **Nginx errors**
   - Test configuration: `sudo nginx -t`
   - Check error logs: `sudo tail -f /var/log/nginx/error.log`
   - Reload configuration: `sudo systemctl reload nginx`

### Health Checks
```bash
# Check application health
curl https://your-domain.com/health

# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Check PostgreSQL status
sudo systemctl status postgresql
```

## 🔄 Updates & Deployment

### 1. Update Application
```bash
cd /var/www/ShopifyGST
git pull origin main
npm install
npm run build
pm2 restart gst-invoice-manager
```

### 2. Database Migrations
```bash
npx prisma db push
```

### 3. Zero-downtime Deployment
```bash
# Create deployment script
nano deploy.sh
```

```bash
#!/bin/bash
set -e

echo "Starting deployment..."

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Run database migrations
npx prisma generate
npx prisma db push

# Build application
npm run build

# Restart application
pm2 restart gst-invoice-manager

echo "Deployment completed successfully!"
```

## 📈 Performance Optimization

### 1. Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_invoice_shop ON "Invoice"("shop");
CREATE INDEX idx_customer_shop ON "Customer"("shop");
CREATE INDEX idx_shipping_label_shop ON "ShippingLabel"("shop");
```

### 2. Nginx Caching
Add to Nginx configuration:
```nginx
# Enable gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

# Browser caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. PM2 Cluster Mode
Update `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'gst-invoice-manager',
    script: 'npm',
    args: 'start',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    // ... other configurations
  }]
};
```

## 🔐 Security Checklist

- [ ] SSL certificate installed and auto-renewing
- [ ] Firewall configured (UFW recommended)
- [ ] Database user has minimal required permissions
- [ ] Environment variables secured
- [ ] Regular security updates applied
- [ ] Backup system in place
- [ ] Monitoring and alerting configured
- [ ] Content Security Policy headers set
- [ ] Rate limiting implemented (optional)

## 📞 Support

For deployment issues:
- Check application logs: `pm2 logs gst-invoice-manager`
- Review Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Monitor system resources: `htop` or `pm2 monit`
- Database logs: `sudo tail -f /var/log/postgresql/postgresql-*.log`

---

**Deployment completed successfully! 🎉**

Your GST Invoice & Shipping Manager is now live at: `https://your-domain.com`