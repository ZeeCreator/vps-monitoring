// app/api/metrics/stream/route.ts
import si from 'systeminformation';

export async function GET() {
  try {
    // Get current CPU load
    let cpuLoad: {
      currentLoad: number;
      currentLoadUser: number;
      currentLoadSystem: number;
      currentLoadNice: number;
      currentLoadIdle: number;
      currentLoadIrq: number;
      rawCurrentLoad: number;
      rawCurrentLoadUser: number;
      rawCurrentLoadSystem: number;
      rawCurrentLoadNice: number;
      rawCurrentLoadIdle: number;
      rawCurrentLoadIrq: number;
      avgLoad: number;
    } = { currentLoad: 0, currentLoadUser: 0, currentLoadSystem: 0, currentLoadNice: 0, currentLoadIdle: 0, currentLoadIrq: 0, rawCurrentLoad: 0, rawCurrentLoadUser: 0, rawCurrentLoadSystem: 0, rawCurrentLoadNice: 0, rawCurrentLoadIdle: 0, rawCurrentLoadIrq: 0, avgLoad: 0 };
    try {
      cpuLoad = await si.currentLoad();
    } catch (e: unknown) {
      console.warn('Could not get CPU load:', e);
    }
    
    // Get memory info
    let mem: {
      total: number;
      free: number;
      used: number;
      active: number;
      available: number;
      buffcache: number;
      buffers: number;
      cached: number;
      slab: number;
      swaptotal: number;
      swapused: number;
      swapfree: number;
    } = { total: 0, free: 0, used: 0, active: 0, available: 0, buffcache: 0, buffers: 0, cached: 0, slab: 0, swaptotal: 0, swapused: 0, swapfree: 0 };
    try {
      mem = await si.mem();
    } catch (e: unknown) {
      console.warn('Could not get memory info:', e);
    }
    
    // Get network stats
    let networkStats: {
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
    }[] = [];
    try {
      networkStats = await si.networkStats();
    } catch (e: unknown) {
      console.warn('Could not get network stats:', e);
    }
    
    // Get disk info
    let fsSize: {
      fs: string;
      type: string;
      size: number;
      used: number;
      available: number;
      use: number;
      mount: string;
    }[] = [];
    try {
      fsSize = await si.fsSize();
    } catch (e: unknown) {
      console.warn('Could not get disk info:', e);
    }
    
    const data = {
      timestamp: new Date().toISOString(),
      cpuLoad: cpuLoad.currentLoad || 0,
      memory: {
        used: mem.used || 0,
        total: mem.total || 0,
        percent: mem.total ? ((mem.used || 0) / mem.total) * 100 : 0
      },
      network: {
        rx: networkStats.length > 0 ? (networkStats[0].rx_sec || 0) : 0,
        tx: networkStats.length > 0 ? (networkStats[0].tx_sec || 0) : 0
      },
      disk: {
        used: fsSize.reduce((acc, disk) => acc + (disk.used || 0), 0),
        total: fsSize.reduce((acc, disk) => acc + (disk.size || 0), 0)
      }
    };

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: unknown) {
    console.error('Error getting system stats:', error);
    return new Response(JSON.stringify({ error: 'Failed to get metrics' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}