import { NextRequest } from 'next/server';
import si from 'systeminformation';

export async function GET(request: NextRequest) {
  try {
    const cpuLoad = await si.currentLoad();
    const mem = await si.mem();
    const networkStats = await si.networkStats();
    const fsSize = await si.fsSize();
    
    const stats = {
      timestamp: new Date().toISOString(),
      cpuLoad: cpuLoad.currentLoad,
      memory: {
        used: mem.used,
        total: mem.total,
        percent: mem.used / mem.total * 100
      },
      network: {
        rx: networkStats.length > 0 ? networkStats[0].rx_sec : 0,
        tx: networkStats.length > 0 ? networkStats[0].tx_sec : 0
      },
      disk: {
        used: fsSize.reduce((acc, disk) => acc + disk.used, 0),
        total: fsSize.reduce((acc, disk) => acc + disk.size, 0)
      }
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error collecting real-time stats:', error);
    return new Response(JSON.stringify({ error: 'Failed to collect real-time stats' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}