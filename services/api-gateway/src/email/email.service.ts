import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getCorsOrigins, isProduction } from '../common/security';

export interface Mail { to: string; toName?: string; subject: string; html: string; text: string }

const esc = (s: string) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

/** Transactional email through Brevo (https://developers.brevo.com/reference/sendtransacemail). */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {
    if (isProduction(config) && !config.get('BREVO_API_KEY')) {
      this.logger.error('BREVO_API_KEY is not set: password reset and verification emails cannot be sent.');
    }
  }

  /** Public address of the web app, used to build links inside emails. */
  baseUrl(): string {
    const configured = this.config.get<string>('APP_BASE_URL');
    return (configured || getCorsOrigins(this.config)[0] || 'http://localhost:3001').replace(/\/+$/, '');
  }

  /** Returns true if the provider accepted the message. Never throws: email problems must not break sign-up. */
  async send(mail: Mail): Promise<boolean> {
    const key = this.config.get<string>('BREVO_API_KEY');
    if (!key) {
      if (!isProduction(this.config)) {
        // Development convenience: the message (with its link) is visible in the server log.
        this.logger.warn(`[email not sent: no BREVO_API_KEY] to=${mail.to} subject="${mail.subject}"\n${mail.text}`);
      } else {
        this.logger.error(`Email not sent (BREVO_API_KEY missing): subject="${mail.subject}"`);
      }
      return false;
    }
    try {
      const res = await fetch(this.config.get<string>('BREVO_API_URL') || 'https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          sender: { name: this.config.get('EMAIL_FROM_NAME') || 'GuruMera', email: this.config.get('EMAIL_FROM') || 'no-reply@gurumera.com' },
          replyTo: { email: this.config.get('EMAIL_REPLY_TO') || 'info@gurumera.com' },
          to: [{ email: mail.to, ...(mail.toName ? { name: mail.toName } : {}) }],
          subject: mail.subject,
          htmlContent: mail.html,
          textContent: mail.text,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        this.logger.error(`Brevo rejected the message (${res.status}): ${(await res.text()).slice(0, 300)}`);
        return false;
      }
      return true;
    } catch (err: any) {
      this.logger.error(`Brevo request failed: ${err?.message}`);
      return false;
    }
  }

  private layout(title: string, bodyHtml: string, buttonText: string, url: string, footer: string): string {
    return `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1E225B">
<h2 style="margin:0 0 12px">${esc(title)}</h2>${bodyHtml}
<p style="margin:24px 0"><a href="${esc(url)}" style="background:#1E225B;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold">${esc(buttonText)}</a></p>
<p style="font-size:12px;color:#64748b">If the button does not work, copy this link into your browser:<br>${esc(url)}</p>
<p style="font-size:12px;color:#64748b">${esc(footer)}</p></div>`;
  }

  verifyEmailMail(to: string, name: string, url: string): Mail {
    return {
      to, toName: name, subject: 'Confirm your GuruMera email',
      html: this.layout('Confirm your email', `<p>Hi ${esc(name)}, please confirm this email address for your GuruMera account. The link works for 24 hours.</p>`, 'Confirm email', url, 'If you did not create a GuruMera account, you can ignore this email.'),
      text: `Hi ${name}, confirm your GuruMera email (link valid for 24 hours): ${url}\nIf you did not create an account, ignore this email.`,
    };
  }

  resetPasswordMail(to: string, name: string, accounts: { schoolName: string; url: string }[]): Mail {
    const list = accounts.map((a) => `<p style="margin:16px 0 4px"><b>${esc(a.schoolName)}</b></p><p style="margin:0 0 8px"><a href="${esc(a.url)}">${esc(a.url)}</a></p>`).join('');
    return {
      to, toName: name, subject: 'Reset your GuruMera password',
      html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1E225B"><h2>Reset your password</h2>
<p>Hi ${esc(name)}, we received a request to reset your password. Choose your account below. Each link works once and expires in 1 hour.</p>${list}
<p style="font-size:12px;color:#64748b;margin-top:24px">If you did not ask for this, ignore this email; your password stays the same.</p></div>`,
      text: `Hi ${name}, reset your GuruMera password (each link works once, expires in 1 hour):\n` + accounts.map((a) => `${a.schoolName}: ${a.url}`).join('\n') + '\nIf you did not ask for this, ignore this email.',
    };
  }

  parentInvitationMail(to: string, parentName: string, schoolName: string, studentFirstName: string, url: string): Mail {
    return {
      to, toName: parentName, subject: `${schoolName} invited you to GuruMera`,
      html: this.layout('You are invited', `<p>Hi ${esc(parentName)}, ${esc(schoolName)} has invited you to see ${esc(studentFirstName)}'s coursework and progress on GuruMera. This invitation link expires in 72 hours.</p>`, 'Accept invitation', url, 'If you were not expecting this, you can ignore this email.'),
      text: `Hi ${parentName}, ${schoolName} invited you to see ${studentFirstName}'s progress on GuruMera (link valid for 72 hours): ${url}`,
    };
  }
}
