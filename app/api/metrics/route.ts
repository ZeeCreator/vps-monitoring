import si from 'systeminformation';





export async function GET() {
  try {
    // Get CPU information
    const cpu = await si.cpu();
    const cpuCurrentSpeed = await si.cpuCurrentSpeed();
    const cpuTemperature = await si.cpuTemperature();
    
    // Get Memory information
    const mem = await si.mem();
    
    // Get OS information
    const osInfo = await si.osInfo();
    const currentLoad = await si.currentLoad();
    
    // Get Network information
    const networkStats = await si.networkStats();
    const networkInterfaces = await si.networkInterfaces();
    
    // Get Disk information
    const fsSize = await si.fsSize();
    const fsStats = await si.fsStats();
    
    // Get processes
    const processes = await si.processes();
    
    const metrics = {
      timestamp: new Date().toISOString(),
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        cores: cpu.cores,
        speed: cpu.speed,
        currentSpeed: cpuCurrentSpeed.avg,
        temperature: cpuTemperature.main || 0,
        load: currentLoad.avgLoad || 0,
        currentLoad: currentLoad.currentLoad || 0,
        currentLoadUser: currentLoad.currentLoadUser || 0,
        currentLoadSystem: currentLoad.currentLoadSystem || 0,
        currentLoadNice: currentLoad.currentLoadNice || 0,
        currentLoadIdle: currentLoad.currentLoadIdle || 0,
        currentLoadIrq: currentLoad.currentLoadIrq || 0
      },
      memory: {
        total: mem.total,
        free: mem.free,
        used: mem.used,
        active: mem.active,
        available: mem.available,
        utilization: (mem.used / mem.total) * 100
      },
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        codename: osInfo.codename,
        kernel: osInfo.kernel,
        arch: osInfo.arch
      },
      network: {
        interfaces: networkInterfaces.filter(iface => iface.type === 'physical'),
        stats: networkStats
      },
      disk: {
        storage: fsSize,
        fsStats: fsStats
      },
      processes: {
        total: processes.all,
        running: processes.running,
        blocked: processes.blocked,
        sleeping: processes.sleeping,
        unknown: processes.unknown
      }
    };

    return new Response(JSON.stringify(metrics), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: unknown) {
    console.error('Error collecting metrics:', error);
    return new Response(JSON.stringify({ error: 'Failed to collect metrics' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}