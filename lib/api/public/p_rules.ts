import { Rule } from "@/types/rules";
import { API_BASE_URL } from "@/lib/config";

export async function fetchAllRules(): Promise<Rule[]> {
    const response = await fetch (`${API_BASE_URL}/rules` );
    if (!response.ok) {
        throw new Error("Failed to fetch all rules");
    }
    return response.json();
}