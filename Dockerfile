# Use the official Node.js 18 image based on Debian
FROM node:18-bullseye-slim

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies for systeminformation and other native modules
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Create a user to run the application
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nodejs

# Change ownership of the app directory to the nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port 3000 to allow communication to/from the VPS monitoring app
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]