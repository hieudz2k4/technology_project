import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const PORT = process.env.PORT || 3005;
const HEALTH_URL =
  process.env.HEALTH_CHECK_URL || `http://localhost:${PORT}/health`;
const PUSHOVER_USER = process.env.PUSHOVER_USER_KEY;
const PUSHOVER_TOKEN = process.env.PUSHOVER_API_TOKEN;
const CHECK_INTERVAL = 10000; // 10 seconds
const COOLDOWN_TIME = 30000; // 30 seconds cooldown between alerts

let lastAlertTime = 0;

async function sendAlert(message: string) {
  const now = Date.now();
  if (now - lastAlertTime < COOLDOWN_TIME) {
    console.log('Skipping alert due to cooldown');
    return;
  }

  if (!PUSHOVER_USER || !PUSHOVER_TOKEN) {
    console.error('Pushover credentials missing in .env');
    return;
  }

  try {
    await axios.post('https://api.pushover.net/1/messages.json', {
      token: PUSHOVER_TOKEN,
      user: PUSHOVER_USER,
      message: message,
      title: '🚨 Hyperliquid Service DOWN 🚨',
      priority: 1,
      sound: 'war_alarm',
    });
    console.log('Alert sent via Pushover');
    lastAlertTime = now;
  } catch (error: any) {
    console.error('Failed to send Pushover alert:', (error as Error).message);
  }
}

async function checkHealth() {
  try {
    await axios.get(HEALTH_URL, { timeout: 5000 });
    console.log(`[${new Date().toISOString()}] Service is HEALTHY`);
  } catch (error: any) {
    const errorMsg = `Service check failed: ${(error as Error).message}`;
    console.error(`[${new Date().toISOString()}] ${errorMsg}`);
    await sendAlert(errorMsg);
  }
}

console.log(`Starting health monitor for ${HEALTH_URL}`);
// Initial check
void checkHealth();
// Periodic check
setInterval(() => {
  void checkHealth();
}, CHECK_INTERVAL);
