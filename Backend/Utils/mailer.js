import nodemailer from "nodemailer";

let cachedTransporter = null;

/**
 * Plain SMTP, so any provider works by changing env only (Brevo, Gmail,
 * SendGrid, Mailtrap…). Returns null when SMTP isn't configured.
 */
const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  const port = Number(SMTP_PORT ?? 587);
  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465, // 465 is implicit TLS; 587 upgrades via STARTTLS
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return cachedTransporter;
};

const buildHtml = (userName, otp) => `
  <div style="background:#080e1e;padding:32px 16px;font-family:Inter,Arial,sans-serif">
    <div style="max-width:480px;margin:0 auto;background:#111a2e;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:32px">
      <h1 style="margin:0 0 4px;font-size:20px;color:#fff">
        <span style="color:#f59e0b">Ex</span>pensely
      </h1>
      <p style="margin:0 0 24px;font-size:13px;color:#64748b">Verify your email address</p>

      <p style="margin:0 0 16px;font-size:14px;color:#cbd5e1">
        Hi ${userName}, use this code to finish setting up your account:
      </p>

      <div style="margin:0 0 20px;padding:16px;text-align:center;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.25);border-radius:12px">
        <span style="font-size:30px;font-weight:700;letter-spacing:8px;color:#fbbf24">${otp}</span>
      </div>

      <p style="margin:0;font-size:12px;color:#64748b;line-height:1.6">
        This code expires in 10 minutes. If you didn't create an Expensely
        account, you can safely ignore this email.
      </p>
    </div>
  </div>
`;

export const sendVerificationEmail = async (to, userName, otp) => {
  const transporter = getTransporter();

  if (!transporter) {
    if (process.env.NODE_ENV === "production") {
      // Never silently swallow this in production — the user would sit waiting
      // for a mail that is never coming.
      throw new Error(
        "SMTP is not configured (SMTP_HOST / SMTP_USER / SMTP_PASS)",
      );
    }
    // Local convenience: no SMTP account needed to exercise the flow.
    console.log(`[mailer] SMTP not configured. OTP for ${to}: ${otp}`);
    return { delivered: false };
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? `"Expensely" <${process.env.SMTP_USER}>`,
    to,
    subject: `${otp} is your Expensely verification code`,
    text: `Hi ${userName}, your Expensely verification code is ${otp}. It expires in 10 minutes.`,
    html: buildHtml(userName, otp),
  });

  return { delivered: true };
};
