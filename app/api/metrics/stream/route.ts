// app/api/metrics/stream/route.ts
import { NextRequest } from 'next/server';
import si from 'systeminformation';

export async function GET(request: NextRequest) {
  try {
    // Get current CPU load
    let cpuLoad = { currentLoad: 0 };
    try {
      cpuLoad = await si.currentLoad();
    } catch (e) {
      console.warn('Could not get CPU load:', e);
    }
    
    // Get memory info
    let mem = { used: 0, total: 0 };
    try {
      mem = await si.mem();
    } catch (e) {
      console.warn('Could not get memory info:', e);
    }
    
    // Get network stats
    let networkStats = [];
    try {
      networkStats = await si.networkStats();
    } catch (e) {
      console.warn('Could not get network stats:', e);
    }
    
    // Get disk info
    let fsSize = [];
    try {
      fsSize = await si.fsSize();
    } catch (e) {
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
  } catch (error) {
    console.error('Error getting system stats:', error);
    return new Response(JSON.stringify({ error: 'Failed to get metrics' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}