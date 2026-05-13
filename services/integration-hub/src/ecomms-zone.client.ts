import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface EcommsHighHeatMonetizationPayload {
  session_id: string;
  creator_id: string;
  guest_id: string;
  tier: string;
  ffs_score: number;
  suggested_category: string | null;
  suggestion_id: string | null;
  captured_at_utc: string;
  rule_applied_id: string;
}

@Injectable()
export class EcommsZoneClient {
  private readonly logger = new Logger(EcommsZoneClient.name);

  async sendHighHeatMonetization(payload: EcommsHighHeatMonetizationPayload): Promise<void> {
    const webhookUrl = process.env.ECOMMSZONE_WEBHOOK_URL;
    if (!webhookUrl) {
      this.logger.debug('EcommsZone webhook dispatch skipped: ECOMMSZONE_WEBHOOK_URL not set');
      return;
    }

    const timeoutMs = Number(process.env.ECOMMSZONE_WEBHOOK_TIMEOUT_MS ?? '5000');
    const webhookSecret = process.env.ECOMMSZONE_WEBHOOK_SECRET ?? '';
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      'x-oqmi-source': 'cyranozone',
      'x-oqmi-event': 'hub.high_heat_monetization.v1',
      'x-oqmi-rule-applied-id': 'GOVERNANCE-EQ-v1',
    };
    if (webhookSecret) {
      headers['x-oqmi-webhook-secret'] = webhookSecret;
    }

    try {
      await axios.post(webhookUrl, payload, {
        headers,
        timeout: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 5000,
      });
    } catch (error) {
      this.logger.warn('EcommsZone webhook dispatch failed', error);
    }
  }
}
