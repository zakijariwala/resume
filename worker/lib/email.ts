import { EmailMessage } from 'cloudflare:email';
import type { Env } from '../env';

const clean = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

/** Plain-text notification to the owner. Silently skipped when email isn't configured. */
export async function notifyOwner(env: Env, subject: string, body: string, replyTo?: string) {
  if (!env.EMAIL || !env.OWNER_EMAIL || !env.SENDER_EMAIL) return;
  const domain = env.SENDER_EMAIL.split('@')[1];
  const headers = [
    `From: Portfolio <${env.SENDER_EMAIL}>`,
    `To: ${env.OWNER_EMAIL}`,
    `Subject: ${clean(subject).replace(/[^\x20-\x7E]/g, '?')}`,
    `Message-ID: <${crypto.randomUUID()}@${domain}>`,
    `Date: ${new Date().toUTCString()}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: 8bit',
  ];
  if (replyTo && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(replyTo)) headers.push(`Reply-To: ${replyTo}`);
  const raw = headers.join('\r\n') + '\r\n\r\n' + body.replace(/\r?\n/g, '\r\n');
  try {
    await env.EMAIL.send(new EmailMessage(env.SENDER_EMAIL, env.OWNER_EMAIL, raw));
  } catch (e) {
    console.error('email failed', (e as Error).message);
  }
}
