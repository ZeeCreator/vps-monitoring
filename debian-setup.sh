#!/bin/bash

# Debian Setup Script for VPS Monitoring System
# This script installs all required dependencies on a Debian system

set -e  # Exit on any error

echo "Setting up VPS Monitoring System on Debian..."

# Update package list
echo "Updating package list..."
sudo apt update

# Install Node.js 18.x
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install other required packages
echo "Installing additional packages..."
sudo apt-get install -y build-essential curl git

# Verify installations
echo "Verifying installations..."
node --version
npm --version

# Navigate to project directory (assuming this script is in the root)
echo "Installing project dependencies..."
npm install

echo "Setup complete!"
echo "To start the application, run: npm run dev"