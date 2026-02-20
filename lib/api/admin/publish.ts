import { API_BASE_URL } from "@/lib/config";

export async function publish(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/publish`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to publish schedule");
  }
}