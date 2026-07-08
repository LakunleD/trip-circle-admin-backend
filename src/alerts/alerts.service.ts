import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { Twilio } from 'twilio';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);
  private resend: Resend | null = null;
  private twilio: Twilio | null = null;

  constructor() {
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilio = new Twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );
    }
  }

  async sendInviteEmail(tester: { name: string; email: string; wave: number }) {
    if (!this.resend) {
      this.logger.warn('RESEND_API_KEY not set — skipping invite email');
      return;
    }

    const from = process.env.RESEND_FROM_EMAIL ?? 'beta@tripcircle.us';
    const appUrl = process.env.BETA_APP_URL ?? 'https://tripcircle.us';

    try {
      await this.resend.emails.send({
        from,
        to: tester.email,
        subject: `You're in — TripCircle Beta Wave ${tester.wave} 🎉`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h1 style="color:#111">Hey ${tester.name}, you're in.</h1>
            <p style="color:#444;font-size:16px;line-height:1.6">
              You've been invited to TripCircle Beta — Wave ${tester.wave}.
              You're among the first people to experience trip planning built differently.
            </p>
            <p style="color:#444;font-size:16px;line-height:1.6">
              Sign up with this exact email address to get access:
            </p>
            <p style="font-size:16px;font-weight:bold;color:#111">${tester.email}</p>
            <a href="${appUrl}"
               style="display:inline-block;margin-top:24px;padding:14px 28px;
                      background:#111;color:#fff;text-decoration:none;
                      border-radius:8px;font-size:16px;font-weight:600">
              Join the Beta
            </a>
            <p style="color:#6b7280;font-size:13px;margin-top:40px">
              If you have any issues, reply to this email and we'll sort it out.
              — The TripCircle Team
            </p>
          </div>
        `,
      });
      this.logger.log(`Invite email sent to ${tester.email}`);
    } catch (err) {
      this.logger.error(`Invite email failed for ${tester.email}`, err?.message);
    }
  }

  async firePriorityAlert(bug: {
    ticketNumber: string;
    title: string;
    priority: string;
    module: string;
    reporterType: string;
    description: string;
  }) {
    await Promise.allSettled([this.sendEmail(bug), this.sendWhatsApp(bug)]);
  }

  private async sendEmail(bug: {
    ticketNumber: string;
    title: string;
    priority: string;
    module: string;
    description: string;
  }) {
    if (!this.resend) {
      this.logger.warn('RESEND_API_KEY not set — skipping email alert');
      return;
    }

    const to = process.env.ALERT_EMAIL_TO;
    const from = process.env.RESEND_FROM_EMAIL ?? 'alerts@tripcircle.us';

    if (!to) {
      this.logger.warn('ALERT_EMAIL_TO not set — skipping email alert');
      return;
    }

    const color = bug.priority === 'P0' ? '#dc2626' : '#ea580c';

    try {
      await this.resend.emails.send({
        from,
        to,
        subject: `[${bug.priority}] ${bug.ticketNumber}: ${bug.title}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px">
            <h2 style="color:${color}">${bug.priority} Bug — ${bug.ticketNumber}</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px;font-weight:bold">Title</td><td style="padding:8px">${bug.title}</td></tr>
              <tr><td style="padding:8px;font-weight:bold">Module</td><td style="padding:8px">${bug.module}</td></tr>
              <tr><td style="padding:8px;font-weight:bold">Priority</td><td style="padding:8px;color:${color}"><strong>${bug.priority}</strong></td></tr>
            </table>
            <p style="margin-top:16px"><strong>Description:</strong></p>
            <p style="background:#f4f4f5;padding:12px;border-radius:6px">${bug.description}</p>
            <p style="color:#6b7280;font-size:12px;margin-top:24px">Review in your admin dashboard · TripCircle Bug Tracker</p>
          </div>
        `,
      });
    } catch (err) {
      this.logger.error('Email alert failed', err?.message);
    }
  }

  async sendCircleAutoReply(submission: {
    submitterEmail: string;
    submitterName?: string;
    submissionType: string;
    ticketNumber: string;
  }) {
    if (!this.resend) {
      this.logger.warn('RESEND_API_KEY not set — skipping Circle auto-reply');
      return;
    }

    const from = 'Huncho at TripCircle <founders@tripcircle.us>';

    const firstName = submission.submitterName?.split(' ')[0] ?? 'there';

    const typeLabel: Record<string, string> = {
      idea: 'idea',
      improvement: 'improvement',
      love_it: 'kind words',
      question: 'question',
      other: 'message',
    };
    const readableType = typeLabel[submission.submissionType] ?? 'message';

    try {
      await this.resend.emails.send({
        from,
        to: submission.submitterEmail,
        subject: 'you just made TripCircle better',
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">
            <p style="font-size:16px;line-height:1.6">Hey ${firstName},</p>
            <p style="font-size:16px;line-height:1.6">
              Got your ${readableType}. We actually read every single one of these —
              this goes straight into the team's review queue.
            </p>
            <p style="font-size:16px;line-height:1.6">
              If there's anything that needs a follow-up from us, we'll reach out directly.
              Either way, thank you for taking the time — it shapes what we build next.
            </p>
            <p style="font-size:16px;line-height:1.6">— Huncho at TripCircle</p>
            <p style="color:#9ca3af;font-size:12px;margin-top:32px">
              Reference: ${submission.ticketNumber}
            </p>
          </div>
        `,
      });

      this.logger.log(`Circle auto-reply sent to ${submission.submitterEmail}`);
    } catch (err) {
      this.logger.error(
        `Circle auto-reply failed for ${submission.submitterEmail}`,
        (err as Error)?.message,
      );
    }
  }

  private async sendWhatsApp(bug: {
    ticketNumber: string;
    title: string;
    priority: string;
    module: string;
  }) {
    if (!this.twilio) {
      this.logger.warn('Twilio credentials not set — skipping WhatsApp alert');
      return;
    }

    const to = process.env.ALERT_WHATSAPP_TO;
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

    if (!to || !messagingServiceSid) {
      this.logger.warn('ALERT_WHATSAPP_TO or TWILIO_MESSAGING_SERVICE_SID not set — skipping WhatsApp alert');
      return;
    }

    const body =
      `🚨 *TripCircle ${bug.priority} Bug*\n\n` +
      `*Ticket:* ${bug.ticketNumber}\n` +
      `*Title:* ${bug.title}\n` +
      `*Module:* ${bug.module}\n\n` +
      `Check the admin dashboard.`;

    try {
      await this.twilio.messages.create({
        body,
        messagingServiceSid,
        to: `whatsapp:${to}`,
      });
    } catch (err) {
      this.logger.error('WhatsApp alert failed', err?.message);
    }
  }
}