#!/bin/bash

# Debian Deployment Script for VPS Monitoring System
# This script deploys the application as a systemd service on Debian

set -e  # Exit on any error

echo "Deploying VPS Monitoring System as a systemd service on Debian..."

# Ensure we are running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root"
  exit 1
fi

# Create application directory
APP_DIR="/opt/vps-monitoring"
SERVICE_FILE="/etc/systemd/system/vps-monitoring.service"

echo "Creating application directory: $APP_DIR"
mkdir -p $APP_DIR

# Copy application files (assuming this script is run from the project root)
echo "Copying application files..."
cp -r . $APP_DIR/
cd $APP_DIR

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Build the application
echo "Building the application..."
npm run build

# Create systemd service file
echo "Creating systemd service file: $SERVICE_FILE"
cat > $SERVICE_FILE << EOF
[Unit]
Description=VPS Monitoring System
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

# Environment variables
Environment=NODE_ENV=production
Environment=MONITOR_USERNAME=${MONITOR_USERNAME:-admin}
Environment=MONITOR_PASSWORD_HASH=${MONITOR_PASSWORD_HASH:-\$2a\$10\$8K5pL8Pn8p9Z.xJ5Y4pHseN0.bFm9zP6yqJ0y3z1o3z1o3z1o3z1o}

# Increase the number of file descriptors
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd daemon
echo "Reloading systemd daemon..."
systemctl daemon-reload

# Enable and start the service
echo "Enabling and starting the service..."
systemctl enable vps-monitoring
systemctl start vps-monitoring

# Check status
echo "Checking service status..."
systemctl status vps-monitoring --no-pager -l

echo "Deployment complete!"
echo "The application is now running as a systemd service."
echo "It will be accessible at http://localhost:8082"
echo ""
echo "To check logs: sudo journalctl -u vps-monitoring -f"
echo "To restart: sudo systemctl restart vps-monitoring"
echo "To stop: sudo systemctl stop vps-monitoring"