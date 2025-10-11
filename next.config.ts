import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Handle optional native dependencies for systeminformation
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "osx-temperature-sensor": false,
      "system-commands": false,
      "drivelist": false,
      "cpu-temperature": false,
      "fs": false,
      "net": false,
      "tls": false,
      "child_process": false,
    };
    
    return config;
  },
};

export default nextConfig;
