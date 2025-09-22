#!/bin/bash

# Deploy authentication fix to server
echo "🚀 Deploying authentication fix to server..."

# Server details
SERVER="root@194.164.149.183"
APP_DIR="/var/www/invoiceo"

# Copy fixed files to server
echo "📁 Copying fixed files to server..."
sshpass -p 'Kalilinux@2812' scp -o StrictHostKeyChecking=no app/routes/auth.login.tsx $SERVER:$APP_DIR/app/routes/auth.login.tsx
sshpass -p 'Kalilinux@2812' scp -o StrictHostKeyChecking=no app/routes/app.onboarding.tsx $SERVER:$APP_DIR/app/routes/app.onboarding.tsx
sshpass -p 'Kalilinux@2812' scp -o StrictHostKeyChecking=no app/routes/app.tsx $SERVER:$APP_DIR/app/routes/app.tsx

# Deploy on server
echo "🔧 Building and restarting app on server..."
sshpass -p 'Kalilinux@2812' ssh -o StrictHostKeyChecking=no $SERVER << 'EOF'
cd /var/www/invoiceo
echo "Stopping app..."
pm2 stop gst-invoice-manager

echo "Building app..."
npm run build

echo "Starting app..."
pm2 start gst-invoice-manager

echo "Checking app status..."
pm2 status gst-invoice-manager

echo "Showing recent logs..."
pm2 logs gst-invoice-manager --lines 10
EOF

echo "✅ Deployment complete!"
echo "🔗 Test your app at: https://invoiceo.indigenservices.com"