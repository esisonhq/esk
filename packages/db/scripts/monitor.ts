#!/usr/bin/env tsx

/**
 * Database monitoring script for periodic health checks.
 *
 * Usage:
 * - bun run db:monitor          # Single health check
 * - bun run db:monitor watch    # Continuous monitoring
 */
import { connectDb } from '@esk/db/client';
import { checkDatabaseHealth, type HealthCheckResult } from '@esk/db/health';

interface MonitoringConfig {
  interval: number; // seconds
  alertThreshold: number; // consecutive failures before alert
  maxLatency: number; // ms
}

const defaultConfig: MonitoringConfig = {
  interval: 30, // 30 seconds
  alertThreshold: 3, // 3 consecutive failures
  maxLatency: 1000, // 1 second
};

let consecutiveFailures = 0;
let isRunning = false;

const formatHealth = (result: HealthCheckResult) => {
  const status = result.status?.toUpperCase() || 'UNKNOWN';
  const timestamp = result.timestamp.toLocaleTimeString();
  const latency = result.latency ? `${result.latency}ms` : 'N/A';

  return `[${timestamp}] ${status} (${latency})`;
};

const checkHealth = async (detailed = false): Promise<HealthCheckResult> => {
  try {
    const db = await connectDb();
    const result = await checkDatabaseHealth(db);

    console.log(formatHealth(result));

    return result;
  } catch (error) {
    const errorResult: HealthCheckResult = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date(),
    };

    console.error('ERROR', formatHealth(errorResult));
    if (error instanceof Error) {
      console.error('   Error:', error.message);
    }

    return errorResult;
  }
};

const sendAlert = (message: string) => {
  console.error('ALERT:', message);
  // Add your alerting logic here:
  // - Send to Slack/Discord
  // - Send email
  // - Call webhook
  // - etc.
};

const startMonitoring = async (config = defaultConfig) => {
  if (isRunning) {
    console.log('Monitoring is already running');
    return;
  }

  isRunning = true;
  console.log(`Starting database monitoring (interval: ${config.interval}s)`);
  console.log('Press Ctrl+C to stop');

  const monitorLoop = async () => {
    if (!isRunning) return;

    const result = await checkHealth();

    // Check for failures
    if (result.status === 'unhealthy') {
      consecutiveFailures++;

      if (consecutiveFailures >= config.alertThreshold) {
        sendAlert(
          `Database has been unhealthy for ${consecutiveFailures} consecutive checks`,
        );
      }
    } else if (
      result.status === 'degraded' &&
      result.latency &&
      result.latency > config.maxLatency
    ) {
      console.warn(
        `High latency detected: ${result.latency}ms (threshold: ${config.maxLatency}ms)`,
      );
      consecutiveFailures = 0;
    } else {
      consecutiveFailures = 0;
    }

    // Schedule next check
    setTimeout(monitorLoop, config.interval * 1000);
  };

  // Start monitoring
  await monitorLoop();
};

const stopMonitoring = () => {
  isRunning = false;
  console.log('Stopping database monitoring');
  process.exit(0);
};

// Handle graceful shutdown
process.on('SIGINT', stopMonitoring);
process.on('SIGTERM', stopMonitoring);

// Main execution
const main = async () => {
  const command = process.argv[2];

  switch (command) {
    case 'watch':
      await startMonitoring();
      break;

    case 'detailed':
      await checkHealth(true);
      break;

    case 'help':
      console.log(`
Database Health Monitor

Usage:
  bun run db:monitor              # Single health check
  bun run db:monitor detailed     # Detailed health report
  bun run db:monitor watch        # Continuous monitoring
  bun run db:monitor help         # Show this help
      `);
      break;

    default:
      await checkHealth();
      break;
  }
};

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
