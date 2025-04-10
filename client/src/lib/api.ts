import { apiRequest } from "./queryClient";
import { LeaderboardEntry } from "@shared/schema";

export async function getTopCountries(limit: number = 10): Promise<LeaderboardEntry[]> {
  const response = await apiRequest("GET", `/api/countries/top?limit=${limit}`);
  return response.json();
}

export async function recordClicks(
  countryCode: string,
  countryName: string,
  clicks: number,
  sessionId: string
): Promise<{
  countryClicks: number;
  userClicks: number;
  globalClicks: number;
  countryRank: number;
}> {
  const response = await apiRequest("POST", "/api/clicks", {
    countryCode,
    countryName,
    clicks,
    sessionId
  });
  return response.json();
}

export async function getUserStats(sessionId: string): Promise<{
  userClicks: number;
  countryClicks: number;
  globalClicks: number;
  countryRank: number;
}> {
  const response = await apiRequest("GET", `/api/users/${sessionId}/stats`);
  return response.json();
}

export async function getCountryInfo(): Promise<{
  code: string;
  name: string;
}> {
  const response = await apiRequest("GET", "/api/country-info");
  return response.json();
}
