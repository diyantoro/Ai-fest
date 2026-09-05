import { runHeartbeatCheck } from '../heartbeat/heartbeat_service.js';
import { logger } from '../utils/logger.js';

export class SchedulerAgent {
  constructor(channelAdapters) {
    this.channelAdapters = channelAdapters;
  }

  async tick() {
    logger.info('SchedulerAgent: Executing OpenClaw heartbeat tick...');
    const result = await runHeartbeatCheck(this.channelAdapters);
    logger.info('SchedulerAgent: Heartbeat tick completed', result);
    return result;
  }
}
