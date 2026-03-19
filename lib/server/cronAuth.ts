export function assertCronAuthorized(request: Request) {
  const expected = process.env.CRON_SECRET;

  if (!expected) {
    throw new Error("CRON_SECRET is not configured.");
  }

  const provided =
    request.headers.get("x-cron-secret") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    new URL(request.url).searchParams.get("secret");

  if (provided !== expected) {
    const error = new Error("Unauthorized cron request.");
    // @ts-expect-error custom status for route handling
    error.status = 401;
    throw error;
  }
}
