# VPS Monitoring System

A comprehensive VPS monitoring system built with Next.js that provides real-time metrics for CPU, memory, disk, and network usage.

## Features

- Real-time system metrics monitoring
- Interactive dashboard with charts
- User authentication
- Password change functionality
- Responsive UI design
- Docker support

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

## Installation on Debian

### Using the automated setup script:

```bash
# Make the script executable
chmod +x debian-setup.sh

# Run the setup script
./debian-setup.sh
```

### Manual installation:

#### 1. Update system packages

```bash
sudo apt update
```

#### 2. Install Node.js

```bash
# Install NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs
```

Alternatively, you can use the Node Version Manager (nvm):

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node.js 18
nvm install 18
nvm use 18
```

#### 3. Install dependencies

```bash
cd vps-monitoring
npm install
```

#### 4. Configure environment variables

Create a `.env.local` file in the root directory:

```env
MONITOR_USERNAME=admin
MONITOR_PASSWORD_HASH=$2a$10$8K5pL8Pn8p9Z.xJ5Y4pHseN0.bFm9zP6yqJ0y3z1o3z1o3z1o3z1o  # Default hash for 'password'
```

The default credentials will be:
- Username: `admin`
- Password: `password`

#### 5. Build and run the application

```bash
# Build the application
npm run build

# Start the application
npm start
```

The application will be available at `http://localhost:8082`

## Debian Systemd Service Deployment

For production deployments on Debian systems, you can deploy the application as a systemd service:

```bash
# Make the deployment script executable
chmod +x debian-deploy.sh

# Run the deployment script as root
sudo ./debian-deploy.sh
```

The application will be installed to `/opt/vps-monitoring` and run as a systemd service.

## Running with Docker

### 1. Install Docker

```bash
# Update package database
sudo apt update

# Install Docker
sudo apt install -y docker.io

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to the docker group (optional)
sudo usermod -aG docker $USER
```

### 2. Build and run with Docker Compose

```bash
# Build and start the containers
docker-compose up -d
```

The application will be available at `http://localhost:8082`

To specify custom credentials when using Docker:

```bash
MONITOR_USERNAME=myuser MONITOR_PASSWORD_HASH=myhash docker-compose up -d
```

## Configuration

### Customizing Credentials

To change the default username and password, set the following environment variables:

- `MONITOR_USERNAME`: The admin username (default: `admin`)
- `MONITOR_PASSWORD_HASH`: The bcrypt hash of the password (default: hash for `password`)

To generate a bcrypt hash for your password, you can use an online bcrypt hash generator or run:

```bash
# Using Node.js
node -e "console.log(require('bcryptjs').hashSync('your_password', 10));"
```

### Production Configuration

For production deployments, ensure you:

1. Use strong, unique passwords
2. Regularly update dependencies
3. Use a reverse proxy like Nginx
4. Configure SSL/TLS certificates
5. Set up proper logging and monitoring

## Development

To run the application in development mode:

```bash
npm run dev
```

The application will be available at `http://localhost:8082`

## Security Considerations

1. Always use strong passwords
2. Regularly update dependencies
3. Use environment variables for sensitive data
4. Implement proper authentication and authorization
5. Consider using HTTPS in production

## Debian-Specific Notes

### System Metrics Collection
The application uses `systeminformation` library to collect metrics. To ensure proper metrics collection on Debian systems, especially in Docker containers, mount the following directories:

- `/proc` for process and system information
- `/sys` for system statistics
- `/etc/machine-id` for system identification

### Running as a Service
When deployed as a systemd service, the application will:
- Run under the `www-data` user for security
- Automatically restart if it crashes
- Log to the systemd journal (view with `journalctl -u vps-monitoring -f`)

## Troubleshooting

### On Debian systems

If you encounter issues collecting system metrics on Debian, make sure to run the Docker container with appropriate volumes:

```bash
docker run -d \
  --name vps-monitoring \
  -p 3000:3000 \
  -v /proc:/host/proc:ro \
  -v /sys:/host/sys:ro \
  -v /etc/machine-id:/etc/machine-id:ro \
  your-registry/vps-monitoring:latest
```

### Common Issues

- **Permission errors**: Make sure your user has appropriate permissions
- **Port conflicts**: Ensure port 3000 is available
- **Missing dependencies**: Verify Node.js and npm are properly installed
- **Metrics not showing**: Ensure the required system directories are accessible, especially when running in containers