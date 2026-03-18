import { Rule } from "@/types/rule_mod";

export async function GetRules(): Promise<Rule[]> {
  const res = await fetch("/api/rules");

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function CreateRule(data: Rule): Promise<Rule> {
  const res = await fetch("/api/rules", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function UpdateRule(data: Rule): Promise<Rule> {
  const res = await fetch("/api/rules", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function DeleteRule(data: Rule): Promise<Rule> {
  const res = await fetch("/api/rules", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function UploadRuleImage(file: File): Promise<{ src: string; alt: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/rule-images", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
