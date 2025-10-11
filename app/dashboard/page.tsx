// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Activity,
  LogOut
} from 'lucide-react';
import Link from 'next/link';

// Define simple SVG icon components
const Cpu = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2"/>
    <path d="M9 9h6v6H9z" strokeWidth="2"/>
    <path d="M15 2v2M15 20v2M5 15h2M2 15h2M15 9h2M15 9v2M9 9H7M9 9V7M20 15v-2M14 15h2" strokeWidth="2"/>
  </svg>
);

const HardDrive = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <line x1="22" y1="12" x2="2" y2="12" strokeWidth="2"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" strokeWidth="2"/>
    <path d="M6 16h.01M10 16h.01" strokeWidth="2"/>
  </svg>
);

const Memory = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="5" width="12" height="14" rx="2" strokeWidth="2"/>
    <path d="M18 13v5M6 13v5M10 7h4M9 11h6" strokeWidth="2"/>
  </svg>
);

const Network = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 16L2 12 8 8v4h8V8l6 4-6 4H8z" strokeWidth="2"/>
  </svg>
);
import { useMetricsStream } from './useMetricsStream';

// Dynamically import ApexCharts components to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type NetworkInterface = {
  iface: string;
  ifaceName: string;
  ip4: string;
  ip6: string;
  mac: string;
  internal: boolean;
  virtual: boolean;
  operstate: string;
  type: string;
  duplex: string;
  mtu: number;
  speed: number;
  metric: number;
  rx_bytes: number;
  tx_bytes: number;
  rx_dropped: number;
  tx_dropped: number;
  rx_errors: number;
  tx_errors: number;
};

type NetworkStats = {
  iface: string;
  operstate: string;
  rx_bytes: number;
  rx_dropped: number;
  rx_errors: number;
  tx_bytes: number;
  tx_dropped: number;
  tx_errors: number;
  rx_sec: number;
  tx_sec: number;
};

type DiskStorage = {
  fs: string;
  type: string;
  size: number;
  used: number;
  available: number;
  use: number;
  mount: string;
};

type FsStats = {
  rx_bytes: number;
  wx_bytes: number;
  tx_bytes: number;
  rx_errors: number;
  wx_errors: number;
  tx_errors: number;
};

type DetailedMetricsData = {
  timestamp: string;
  cpu: {
    manufacturer: string;
    brand: string;
    cores: number;
    speed: number;
    currentSpeed: number;
    temperature: number;
    load: number;
    currentLoad: number;
    currentLoadUser: number;
    currentLoadSystem: number;
    currentLoadNice: number;
    currentLoadIdle: number;
    currentLoadIrq: number;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    active: number;
    available: number;
    utilization: number;
  };
  os: {
    platform: string;
    distro: string;
    release: string;
    codename: string;
    kernel: string;
    arch: string;
  };
  network: {
    interfaces: NetworkInterface[];
    stats: NetworkStats[];
  };
  disk: {
    storage: DiskStorage[];
    fsStats: FsStats[];
  };
  processes: {
    total: number;
    running: number;
    blocked: number;
    sleeping: number;
    unknown: number;
  };
};

const Dashboard = () => {
  const [detailedMetrics, setDetailedMetrics] = useState<DetailedMetricsData | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const { data: realTimeData, loading: realTimeLoading, error } = useMetricsStream();
  const router = useRouter();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      
      if (!data.authenticated) {
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router]);

  // Fetch detailed metrics once on initial load
  useEffect(() => {
    const fetchDetailedMetrics = async () => {
      try {
        const response = await fetch('/api/metrics');
        if (response.ok) {
          const data = await response.json();
          setDetailedMetrics(data);
        } else {
          console.error('Failed to fetch detailed metrics');
        }
      } catch (error) {
        console.error('Error fetching detailed metrics:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchDetailedMetrics();
  }, []);

  const handleRefresh = async () => {
    setInitialLoading(true);
    try {
      const response = await fetch('/api/metrics');
      if (response.ok) {
        const data = await response.json();
        setDetailedMetrics(data);
      } else {
        console.error('Failed to fetch metrics');
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleLogout = async () => {
    // Clear the session cookie
    document.cookie = 'vps_monitor_session=; Max-Age=0; path=/;';
    
    // Optionally call the logout API
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (err) {
      console.error('Logout API error:', err);
    }
    
    router.push('/login');
  };

  // Prepare chart data using real-time data when available, fallback to detailed metrics
  const cpuChartData = realTimeData ? 
    [realTimeData.cpuLoad, 100 - realTimeData.cpuLoad] : 
    detailedMetrics ? 
    [detailedMetrics.cpu.currentLoad, 100 - detailedMetrics.cpu.currentLoad] : 
    [0, 100];
    
  const memoryChartData = detailedMetrics ? 
    [detailedMetrics.memory.used, detailedMetrics.memory.free] : 
    [0, 0];
    
  const diskChartData = detailedMetrics && detailedMetrics.disk.storage 
    ? detailedMetrics.disk.storage.map(disk => disk.used / disk.size * 100) 
    : [0];

  // Chart options
  const cpuChartOptions = {
    chart: {
      type: 'pie' as const,
      width: 380
    },
    labels: ['CPU Load', 'CPU Free'],
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom' as const
        }
      }
    }]
  };

  const memoryChartOptions = {
    chart: {
      type: 'pie' as const,
      width: 380
    },
    labels: ['Used Memory', 'Free Memory'],
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom' as const
        }
      }
    }]
  };

  const diskChartOptions = {
    chart: {
      type: 'bar' as const,
      height: 350
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: detailedMetrics?.disk.storage.map(disk => disk.fs) || [],
      labels: {
        formatter: (value: string) => value // Just return the string value as is for the labels
      }
    },
    yaxis: {
      title: {
        text: 'Disk'
      }
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${(val / 1024 / 1024 / 1024).toFixed(2)} GB`
      }
    }
  };

  if (initialLoading || (realTimeLoading && !realTimeData)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading VPS metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">VPS Monitoring Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {realTimeData ? `Updated: ${new Date(realTimeData.timestamp).toLocaleTimeString()}` : 'Connecting...'}
            </div>
            <button
              onClick={handleRefresh}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Refresh
            </button>
            <Link href="/change-password" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Change Password
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* CPU Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <Cpu className="h-8 w-8 text-blue-500" />
                <h3 className="ml-3 text-lg font-medium text-gray-900">CPU</h3>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-semibold text-gray-900">
                  {realTimeData ? `${realTimeData.cpuLoad.toFixed(1)}%` : 'N/A'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {detailedMetrics ? `${detailedMetrics.cpu.cores} cores at ${detailedMetrics.cpu.speed} GHz` : 'Loading...'}
                </p>
                {realTimeData && (
                  <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                    realTimeData.cpuLoad < 70 ? 'bg-green-100 text-green-800' : 
                    realTimeData.cpuLoad < 90 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {realTimeData.cpuLoad < 70 ? 'Stabil' : 
                     realTimeData.cpuLoad < 90 ? 'Sedang' : 
                     'Tinggi'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Memory Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <Memory className="h-8 w-8 text-green-500" />
                <h3 className="ml-3 text-lg font-medium text-gray-900">Memory</h3>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-semibold text-gray-900">
                  {realTimeData ? 
                    `${(realTimeData.memory.used / 1024 / 1024 / 1024).toFixed(1)} GB` : 
                    'N/A'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {realTimeData ? 
                    `${realTimeData.memory.percent.toFixed(1)}% utilized` : 
                    'Loading...'}
                </p>
                {realTimeData && (
                  <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                    realTimeData.memory.percent < 70 ? 'bg-green-100 text-green-800' : 
                    realTimeData.memory.percent < 90 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {realTimeData.memory.percent < 70 ? 'Stabil' : 
                     realTimeData.memory.percent < 90 ? 'Sedang' : 
                     'Tinggi'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Disk Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <HardDrive className="h-8 w-8 text-yellow-500" />
                <h3 className="ml-3 text-lg font-medium text-gray-900">Disk</h3>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-semibold text-gray-900">
                  {realTimeData ? 
                    `${(realTimeData.disk.used / 1024 / 1024 / 1024).toFixed(1)} GB` 
                    : 'N/A'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {realTimeData ? 
                    `${(realTimeData.disk.used / realTimeData.disk.total * 100).toFixed(1)}% utilized` 
                    : 'Loading...'}
                </p>
                {realTimeData && (
                  <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                    (realTimeData.disk.used / realTimeData.disk.total * 100) < 70 ? 'bg-green-100 text-green-800' : 
                    (realTimeData.disk.used / realTimeData.disk.total * 100) < 90 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {(realTimeData.disk.used / realTimeData.disk.total * 100) < 70 ? 'Stabil' : 
                     (realTimeData.disk.used / realTimeData.disk.total * 100) < 90 ? 'Sedang' : 
                     'Tinggi'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Network Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <Network className="h-8 w-8 text-purple-500" />
                <h3 className="ml-3 text-lg font-medium text-gray-900">Network</h3>
              </div>
              <div className="mt-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-gray-500">RX</p>
                    <p className="text-sm font-medium text-gray-900">
                      {realTimeData ? 
                        `${(realTimeData.network.rx / 1024 / 1024).toFixed(2)} MB/s` : 
                        'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">TX</p>
                    <p className="text-sm font-medium text-gray-900">
                      {realTimeData ? 
                        `${(realTimeData.network.tx / 1024 / 1024).toFixed(2)} MB/s` : 
                        'N/A'}
                    </p>
                  </div>
                </div>
                {realTimeData && (
                  <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                    (realTimeData.network.rx + realTimeData.network.tx) < 10 * 1024 * 1024 ? 'bg-green-100 text-green-800' : 
                    (realTimeData.network.rx + realTimeData.network.tx) < 50 * 1024 * 1024 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {(realTimeData.network.rx + realTimeData.network.tx) < 10 * 1024 * 1024 ? 'Stabil' : 
                     (realTimeData.network.rx + realTimeData.network.tx) < 50 * 1024 * 1024 ? 'Sedang' : 
                     'Tinggi'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* CPU Chart */}
          <div className="bg-white p-6 shadow rounded-lg">
            <div className="flex items-center mb-4">
              <Activity className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">CPU Usage</h2>
            </div>
            {detailedMetrics ? (
              <Chart 
                options={cpuChartOptions} 
                series={cpuChartData} 
                type="pie" 
                width={380} 
              />
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">Loading chart data...</p>
              </div>
            )}
          </div>

          {/* Memory Chart */}
          <div className="bg-white p-6 shadow rounded-lg">
            <div className="flex items-center mb-4">
              <Memory className="h-5 w-5 text-green-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Memory Usage</h2>
            </div>
            {detailedMetrics ? (
              <Chart 
                options={memoryChartOptions} 
                series={memoryChartData} 
                type="pie" 
                width={380} 
              />
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">Loading chart data...</p>
              </div>
            )}
          </div>
        </div>

        {/* Disk Usage Bar Chart */}
        <div className="bg-white p-6 shadow rounded-lg mb-8">
          <div className="flex items-center mb-4">
            <HardDrive className="h-5 w-5 text-yellow-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Disk Usage</h2>
          </div>
          {detailedMetrics ? (
            <Chart 
              options={diskChartOptions} 
              series={[{
                name: 'Used (%)',
                data: diskChartData
              }]} 
              type="bar" 
              height={350} 
            />
          ) : (
            <div className="h-96 flex items-center justify-center">
              <p className="text-gray-500">Loading chart data...</p>
            </div>
          )}
        </div>

        {/* System Information */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">System Information</h3>
            <p className="mt-1 text-sm text-gray-500">Detailed information about your VPS</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Operating System</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {detailedMetrics ? `${detailedMetrics.os.distro} ${detailedMetrics.os.release} (${detailedMetrics.os.kernel})` : 'Loading...'}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">CPU</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {detailedMetrics ? `${detailedMetrics.cpu.manufacturer} ${detailedMetrics.cpu.brand} @ ${detailedMetrics.cpu.speed} GHz (${detailedMetrics.cpu.cores} cores)` : 'Loading...'}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">CPU Temperature</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {detailedMetrics ? `${detailedMetrics.cpu.temperature}°C` : 'Loading...'}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Memory</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {detailedMetrics ? 
                    `${(detailedMetrics.memory.total / 1024 / 1024 / 1024).toFixed(1)} GB total, 
                     ${(detailedMetrics.memory.used / 1024 / 1024 / 1024).toFixed(1)} GB used` : 
                    'Loading...'}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Processes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {detailedMetrics ? 
                    `${detailedMetrics.processes.total} total (${detailedMetrics.processes.running} running, 
                     ${detailedMetrics.processes.sleeping} sleeping, ${detailedMetrics.processes.blocked} blocked)` : 
                    'Loading...'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
            <p>Error: {error}</p>
            <p className="text-sm mt-1">Attempting to reconnect...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;