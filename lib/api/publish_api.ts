export async function Publish() {
  const res = await fetch("/api/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function Revert() {
  const res = await fetch("/api/publish/revert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
