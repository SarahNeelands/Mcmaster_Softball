async function getErrorMessage(res: Response) {
  const text = await res.text();

  try {
    const data = JSON.parse(text) as { error?: string };
    return data.error || text;
  } catch {
    return text;
  }
}

export async function GetAdminSession(): Promise<{ isAdmin: boolean }> {
  const res = await fetch("/api/admin/session", { cache: "no-store" });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function LoginAdmin(username: string, password: string) {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}

export async function LogoutAdmin() {
  const res = await fetch("/api/admin/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return res.json();
}
