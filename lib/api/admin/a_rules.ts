import { Rule, RuleImage } from "@/types/rules";
import { API_BASE_URL } from "@/lib/config";

export async function addNewRule(title: string, description: string, images: RuleImage[]) {
    const response = await fetch (`${API_BASE_URL}/rules/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      description,
      images,
    }),
  });

  if (!response.ok){
    const text = await response.text();
    throw new Error(`Failed to create rule: ${text}`);
  }
  return await response.json();
}


export async function editRule(oldRule: Rule){
    const response = await fetch (`${API_BASE_URL}/rules/edit`, {
        method: "POST",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({
            oldRule,
        }),
    })

    if (!response.ok){
        const text = await response.text();
        throw new Error(`Failed to edit rule: ${text}`);
    }
    return await response.json();
}

export async function deleteRule(oldRule: Rule){
    const response = await fetch (`${API_BASE_URL}/rules/delete`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({
            oldRule,
        }),
    })

    if (!response.ok){
        const text = await response.text();
        throw new Error(`Failed to delete rule: ${text}`);
    }
    return await response.json();
}
