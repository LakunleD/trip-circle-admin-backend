import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { Twilio } from 'twilio';
import { PrismaService } from '../prisma/prisma.service';

const T7_FEATURE_UPDATE = 'HXee8f6af52ed933469577c4e4744fa62c';

@Injectable()
export class FeatureNotificationsService {
  private readonly logger = new Logger(FeatureNotificationsService.name);
  private resend: Resend | null = null;
  private twilio: Twilio | null = null;

  constructor(private readonly prisma: PrismaService) {
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilio = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
  }

  // Trigger 1: feature assigned to someone
  async notifyAssigned(feature: { id: string; title: string; priority: string; phase?: string | null }, assigneeEmail: string, assignedBy: string) {
    const member = await this.prisma.teamMember.findUnique({ where: { email: assigneeEmail } });
    if (!member) return;

    const link = this.featureLink(feature.id);
    const body =
      `📋 *TripCircle Ops — Feature Assigned*\n\n` +
      `You were assigned a feature.\n` +
      `*Feature:* ${feature.title}\n` +
      `*Priority:* ${feature.priority}\n` +
      `*Phase:* ${feature.phase ?? '—'}\n` +
      `*Assigned by:* ${assignedBy}\n` +
      `View: ${link}`;

    await Promise.allSettled([
      this.sendMessage(member.phone, body, T7_FEATURE_UPDATE),
      this.sendEmail(
        member.email,
        `[Feature Assigned] ${feature.title}`,
        this.emailHtml('Feature Assigned to You', body.replace(/\*/g, ''), link),
      ),
    ]);
  }

  // Trigger 2: @mention in a comment
  async notifyMentioned(feature: { id: string; title: string }, mentionedEmail: string, commentPreview: string) {
    const member = await this.prisma.teamMember.findUnique({ where: { email: mentionedEmail } });
    if (!member) return;

    const link = this.featureLink(feature.id);
    const body =
      `💬 *TripCircle Ops — You were mentioned*\n\n` +
      `*Feature:* ${feature.title}\n` +
      `*Comment:* "${commentPreview.slice(0, 100)}"\n` +
      `View: ${link}`;

    await Promise.allSettled([
      this.sendMessage(member.phone, body, T7_FEATURE_UPDATE),
      this.sendEmail(
        member.email,
        `[Mentioned] ${feature.title}`,
        this.emailHtml('You Were Mentioned', body.replace(/\*/g, ''), link),
      ),
    ]);
  }

  // Trigger 3: feature marked blocked
  async notifyBlocked(feature: { id: string; title: string; assignee?: string | null }) {
    if (!feature.assignee) return;
    const member = await this.prisma.teamMember.findUnique({ where: { email: feature.assignee } });
    if (!member) return;

    const link = this.featureLink(feature.id);
    const body =
      `🚧 *TripCircle Ops — Feature Blocked*\n\n` +
      `A feature you own was marked blocked.\n` +
      `*Feature:* ${feature.title}\n` +
      `View: ${link}`;

    await Promise.allSettled([
      this.sendMessage(member.phone, body, T7_FEATURE_UPDATE),
      this.sendEmail(
        member.email,
        `[Blocked] ${feature.title}`,
        this.emailHtml('Feature Marked Blocked', body.replace(/\*/g, ''), link),
      ),
    ]);
  }

  // Trigger 4: feature marked built
  async notifyBuilt(feature: { id: string; title: string; assignee?: string | null }) {
    if (!feature.assignee) return;
    const member = await this.prisma.teamMember.findUnique({ where: { email: feature.assignee } });
    if (!member) return;

    const link = this.featureLink(feature.id);
    const body =
      `✅ *TripCircle Ops — Feature Built*\n\n` +
      `A feature you own was marked built.\n` +
      `*Feature:* ${feature.title}\n` +
      `View: ${link}`;

    await Promise.allSettled([
      this.sendMessage(member.phone, body, T7_FEATURE_UPDATE),
      this.sendEmail(
        member.email,
        `[Built] ${feature.title}`,
        this.emailHtml('Feature Marked Built', body.replace(/\*/g, ''), link),
      ),
    ]);
  }

  // Route to SMS (+1) or WhatsApp (all others)
  private async sendMessage(phone: string | null | undefined, body: string, _templateSid: string) {
    if (!phone || !this.twilio) return;

    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    if (!messagingServiceSid) {
      this.logger.warn('TWILIO_MESSAGING_SERVICE_SID not set — skipping message');
      return;
    }

    const isUsNumber = phone.startsWith('+1');

    try {
      if (isUsNumber) {
        // SMS for +1 numbers
        await this.twilio.messages.create({ body, messagingServiceSid, to: phone });
      } else {
        // WhatsApp for all others
        // To use T7 template: swap body for contentSid + contentVariables when template vars are confirmed
        await this.twilio.messages.create({ body, messagingServiceSid, to: `whatsapp:${phone}` });
      }
    } catch (err) {
      this.logger.error(`Message send failed to ${phone}`, err?.message);
    }
  }

  private async sendEmail(to: string, subject: string, html: string) {
    if (!this.resend) {
      this.logger.warn('RESEND_API_KEY not set — skipping email');
      return;
    }
    const from = process.env.RESEND_FROM_EMAIL ?? 'ops@tripcircle.us';
    try {
      await this.resend.emails.send({ from, to, subject, html });
    } catch (err) {
      this.logger.error(`Email send failed to ${to}`, err?.message);
    }
  }

  private featureLink(featureId: string): string {
    const base = process.env.OPS_APP_URL ?? 'https://ops.tripcircle.us';
    return `${base}/features/${featureId}`;
  }

  private emailHtml(heading: string, body: string, link: string): string {
    return `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#111">${heading}</h2>
        <p style="color:#444;font-size:15px;line-height:1.6;white-space:pre-line">${body}</p>
        <a href="${link}"
           style="display:inline-block;margin-top:20px;padding:12px 24px;
                  background:#111;color:#fff;text-decoration:none;
                  border-radius:8px;font-size:14px;font-weight:600">
          View Feature
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:32px">TripCircle Ops — Internal Tool</p>
      </div>
    `;
  }
}
