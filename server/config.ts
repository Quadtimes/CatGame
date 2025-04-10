/**
 * Country access configuration for the Cat Clicker game
 */

interface TemporaryBan {
  // ISO 3166-1 alpha-2 country code
  countryCode: string;
  
  // Reason for the temporary ban
  reason: string;
  
  // Expiration date in ISO format (e.g., "2025-12-31T23:59:59Z")
  expiresAt: string;
  
  // Custom message to display to users from this country
  message?: string;
}

interface PermanentBan {
  // ISO 3166-1 alpha-2 country code
  countryCode: string;
  
  // Reason for the permanent ban
  reason: string;
  
  // Custom message to display to users from this country
  message?: string;
}

interface CountryConfig {
  // Mode can be "whitelist" (only allowed countries can play) or "blacklist" (all countries except banned ones can play)
  // Or mode can be "allow_all" to allow all countries regardless of the list
  mode: "whitelist" | "blacklist" | "allow_all";
  
  // List of country codes that are either allowed (for whitelist) or banned (for blacklist)
  countries: string[];
  
  // Permanently banned countries (these override the above settings)
  permanentlyBannedCountries: PermanentBan[];
  
  // Temporarily banned countries with expiration dates
  temporarilyBannedCountries: TemporaryBan[];

  // Discord invite link for banned users
  discordInviteUrl: string;
  
  // VPN detection & prevention settings
  vpnDetection: {
    // Enable VPN detection
    enabled: boolean;
    
    // Block users if they're detected using a VPN/proxy
    blockVpnUsers: boolean;
    
    // Message to display to users who are detected as using a VPN
    vpnBlockedMessage: string;
  };
}

// Default configuration - only Czechia is allowed
export const countryConfig: CountryConfig = {
  // CONFIGURATION OPTIONS:
  // 1. WHITELIST MODE: Only listed countries can play
  // 2. BLACKLIST MODE: All countries except listed ones can play
  // 3. ALLOW ALL MODE: Everyone can play regardless of country
  
  // To allow all countries, uncomment this line:
  // mode: "allow_all",
  
  // Current mode: whitelist - only countries in the list can play
  mode: "allow_all",
  
  // List of countries (ISO 3166-1 alpha-2 country codes)
  // Add more country codes to allow more countries in whitelist mode 
  // or to ban specific countries in blacklist mode
  countries: [
   //"CZ", // Czechia
    // Add more countries as needed:
    // "US", // United States
    // "GB", // United Kingdom 
    // "DE", // Germany
    // "FR", // France
  ],
  
  // Permanently banned countries (override whitelist/blacklist settings)
  permanentlyBannedCountries: [
    {
      countryCode: "",
      reason: "Violation of terms of service",
      message: "This country is permanently banned by Cat Clicker a.s."
    },
    {
      countryCode: "",
      reason: "Excessive automated clicking detected",
      message: "This country has been permanently banned due to bot activity."
    }
  ],
  
  // Temporarily banned countries with expiration dates
  temporarilyBannedCountries: [
    {
      countryCode: "",
      reason: "Suspicious activity investigation",
      expiresAt: "2025-06-30T23:59:59Z",
      message: "This country is temporarily banned until June 30, 2025 due to suspicious activity."
    },
    {
      countryCode: "",
      reason: "System maintenance for this region",
      expiresAt: "2025-05-15T12:00:00Z",
      message: "Access from Brazil is temporarily restricted until May 15, 2025 due to regional maintenance."
    }
  ],
  
  // Discord invite link for banned users to request their country be whitelisted
  // Replace with your actual Discord server invite link
  discordInviteUrl: "https://discord.gg/your-invite-link",
  
  // VPN detection & prevention options
  vpnDetection: {
    // Set to true to enable VPN detection
    enabled: true,
    
    // Set to true to block users that are detected as using a VPN or proxy
    blockVpnUsers: true,
    
    // Message to display to users who are detected as using a VPN
    vpnBlockedMessage: "Don't cheat or use any type of bots. We've prevented this by disabling VPN services. Please disable your VPN to continue playing."
  }
};

/**
 * Check if a country is permanently banned
 * @param countryCode ISO 3166-1 alpha-2 country code
 * @returns boolean indicating if the country is permanently banned
 */
export function isCountryPermanentlyBanned(countryCode: string): boolean {
  if (!countryCode) return false;
  
  const upperCountryCode = countryCode.toUpperCase();
  
  return countryConfig.permanentlyBannedCountries.some(
    ban => ban.countryCode.toUpperCase() === upperCountryCode
  );
}

/**
 * Check if a country is temporarily banned
 * @param countryCode ISO 3166-1 alpha-2 country code
 * @returns boolean indicating if the country is temporarily banned
 */
export function isCountryTemporarilyBanned(countryCode: string): boolean {
  if (!countryCode) return false;
  
  const upperCountryCode = countryCode.toUpperCase();
  const now = new Date();
  
  return countryConfig.temporarilyBannedCountries.some(
    ban => ban.countryCode.toUpperCase() === upperCountryCode && 
           new Date(ban.expiresAt) > now
  );
}

/**
 * Get temporary ban details for a country
 * @param countryCode ISO 3166-1 alpha-2 country code
 * @returns temporary ban information or undefined if not temporarily banned
 */
export function getTemporaryBanInfo(countryCode: string): TemporaryBan | undefined {
  if (!countryCode) return undefined;
  
  const upperCountryCode = countryCode.toUpperCase();
  const now = new Date();
  
  return countryConfig.temporarilyBannedCountries.find(
    ban => ban.countryCode.toUpperCase() === upperCountryCode && 
           new Date(ban.expiresAt) > now
  );
}

/**
 * Get permanent ban details for a country
 * @param countryCode ISO 3166-1 alpha-2 country code
 * @returns permanent ban information or undefined if not permanently banned
 */
export function getPermanentBanInfo(countryCode: string): PermanentBan | undefined {
  if (!countryCode) return undefined;
  
  const upperCountryCode = countryCode.toUpperCase();
  
  return countryConfig.permanentlyBannedCountries.find(
    ban => ban.countryCode.toUpperCase() === upperCountryCode
  );
}

/**
 * Check if a country is allowed to play the game
 * @param countryCode ISO 3166-1 alpha-2 country code
 * @returns boolean indicating if the country is allowed to play
 */
export function isCountryAllowed(countryCode: string): boolean {
  if (!countryCode) return false;
  
  const upperCountryCode = countryCode.toUpperCase();
  
  // First check if country is permanently banned
  if (isCountryPermanentlyBanned(upperCountryCode)) {
    return false;
  }
  
  // Then check if country is temporarily banned
  if (isCountryTemporarilyBanned(upperCountryCode)) {
    return false;
  }
  
  // If mode is set to allow_all, all countries are allowed regardless of the countries list
  if (countryConfig.mode === "allow_all") {
    return true;
  }
  
  if (countryConfig.mode === "whitelist") {
    // Only countries in the whitelist are allowed
    return countryConfig.countries.includes(upperCountryCode);
  } else {
    // All countries except those in the blacklist are allowed
    return !countryConfig.countries.includes(upperCountryCode);
  }
}

/**
 * Get status message for a banned/disallowed country
 * @param countryCode ISO 3166-1 alpha-2 country code
 * @returns Custom message based on ban type, or a generic message
 */
export function getBannedCountryMessage(countryCode: string): string {
  if (!countryCode) {
    return "This country is not recognized or is banned from the clicker game.";
  }
  
  const upperCountryCode = countryCode.toUpperCase();
  
  // Check for permanent ban message first
  const permanentBan = getPermanentBanInfo(upperCountryCode);
  if (permanentBan) {
    return permanentBan.message || "This country is permanently banned by Cat Clicker a.s.";
  }
  
  // Check for temporary ban message
  const temporaryBan = getTemporaryBanInfo(upperCountryCode);
  if (temporaryBan) {
    return temporaryBan.message || `This country is temporarily banned until ${new Date(temporaryBan.expiresAt).toLocaleDateString()}.`;
  }
  
  // Default message for regular bans
  return "This country is currently banned from the clicker game. If you want to have this country working, check out our Discord and request to have your country whitelisted.";
}

/**
 * Get Discord invite URL for banned users
 * @returns Discord invite URL
 */
export function getDiscordInviteUrl(): string {
  return countryConfig.discordInviteUrl;
}

/**
 * Get the VPN blocked message
 * @returns Message to display to users who are detected as using a VPN
 */
export function getVpnBlockedMessage(): string {
  return countryConfig.vpnDetection.vpnBlockedMessage;
}

/**
 * Check if VPN detection is enabled
 * @returns boolean indicating if VPN detection is enabled
 */
export function isVpnDetectionEnabled(): boolean {
  return countryConfig.vpnDetection.enabled;
}

/**
 * Check if VPN users should be blocked
 * @returns boolean indicating if VPN users should be blocked
 */
export function shouldBlockVpnUsers(): boolean {
  return countryConfig.vpnDetection.enabled && countryConfig.vpnDetection.blockVpnUsers;
}