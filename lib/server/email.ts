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
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html,
      ...(input.scheduledAt ? { scheduledAt: input.scheduledAt } : {}),
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
  const appUrl = process.env.APP_URL;

  if (!appUrl) {
    throw new Error("APP_URL is not configured.");
  }

  return appUrl.replace(/\/$/, "");
}
