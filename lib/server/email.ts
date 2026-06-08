type EmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  scheduledAt?: string;
  idempotencyKey?: string;
};

export async function sendEmail(input: EmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = input.to.trim();

  if (!apiKey || !from) {
    throw new Error("Email is not configured. Set RESEND_API_KEY and EMAIL_FROM.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(input.idempotencyKey ? { "Idempotency-Key": input.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: input.subject,
      text: input.text,
      html: input.html,
      ...(input.scheduledAt ? { scheduled_at: input.scheduledAt } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(`Email send failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

export function getFounderEmail() {
  const founderEmail = process.env.FOUNDER_EMAIL;

  if (!founderEmail) {
    throw new Error("FOUNDER_EMAIL is not configured.");
  }

  return founderEmail;
}

export function getAppUrl() {
  const rawAppUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (!rawAppUrl) {
    throw new Error(
      "App URL is not configured. Set APP_URL, NEXT_PUBLIC_APP_URL, VERCEL_PROJECT_PRODUCTION_URL, or VERCEL_URL."
    );
  }

  const normalizedAppUrl = /^https?:\/\//i.test(rawAppUrl)
    ? rawAppUrl
    : `https://${rawAppUrl}`;

  return normalizedAppUrl.replace(/\/$/, "");
}
