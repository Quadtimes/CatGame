import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertCountrySchema, insertUserClickSchema } from "@shared/schema";
import { nanoid } from "nanoid";
import { 
  isCountryAllowed, 
  getBannedCountryMessage, 
  getDiscordInviteUrl, 
  isVpnDetectionEnabled,
  shouldBlockVpnUsers,
  getVpnBlockedMessage,
  isCountryPermanentlyBanned,
  isCountryTemporarilyBanned,
  getPermanentBanInfo,
  getTemporaryBanInfo
} from "./config";

// Define schema for validation
const clickRequestSchema = z.object({
  countryCode: z.string().min(2).max(2),
  countryName: z.string().min(1),
  clicks: z.number().int().positive(),
  sessionId: z.string().min(1),
  usingVpn: z.boolean().optional(), // Optional VPN detection flag
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for cat clicker app
  
  // Get top countries for the leaderboard
  app.get("/api/countries/top", async (req: Request, res: Response) => {
    try {
      const limit = Number(req.query.limit) || 10;
      const topCountries = await storage.getTopCountries(limit);
      res.json(topCountries);
    } catch (error) {
      console.error("Error fetching top countries:", error);
      res.status(500).json({ message: "Failed to fetch top countries" });
    }
  });

  // Get country by code
  app.get("/api/countries/:code", async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      const country = await storage.getCountryByCode(code);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      res.json(country);
    } catch (error) {
      console.error("Error fetching country:", error);
      res.status(500).json({ message: "Failed to fetch country" });
    }
  });

  // Register clicks
  app.post("/api/clicks", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = clickRequestSchema.parse(req.body);
      const { countryCode, countryName, clicks, sessionId } = validatedData;
      
      // Get VPN status from request - added by the client based on country-info response
      const usingVpn = req.body.usingVpn === true;
      
      // Check if VPN users should be blocked and if the user is using a VPN
      if (shouldBlockVpnUsers() && usingVpn) {
        return res.status(403).json({
          success: false,
          banned: true,
          message: getVpnBlockedMessage()
        });
      }
      
      // Check if country is allowed based on the configuration
      if (!isCountryAllowed(countryCode)) {
        return res.status(403).json({
          success: false,
          banned: true,
          message: getBannedCountryMessage(countryCode)
        });
      }

      // Check if country exists, if not create it
      let country = await storage.getCountryByCode(countryCode);
      if (!country) {
        country = await storage.createCountry({
          code: countryCode,
          name: countryName,
          clicks: 0,
          rank: null
        });
      }

      // Check if user has clicks record, if not create it
      let userClick = await storage.getUserClicksBySessionId(sessionId);
      if (!userClick) {
        userClick = await storage.createUserClick({
          countryCode,
          clicks: 0,
          sessionId
        });
      }

      // Update clicks
      await storage.updateCountryClicks(countryCode, clicks);
      await storage.updateUserClicks(sessionId, clicks);

      // Get updated data
      const updatedCountry = await storage.getCountryByCode(countryCode);
      const updatedUserClick = await storage.getUserClicksBySessionId(sessionId);
      const globalClicks = await storage.getGlobalClickCount();
      const countryRank = await storage.getCountryRank(countryCode);

      res.json({
        success: true,
        countryClicks: updatedCountry?.clicks || 0,
        userClicks: updatedUserClick?.clicks || 0,
        globalClicks,
        countryRank
      });
    } catch (error) {
      console.error("Error registering clicks:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to register clicks" });
    }
  });

  // Get user stats
  app.get("/api/users/:sessionId/stats", async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const userClick = await storage.getUserClicksBySessionId(sessionId);
      
      if (!userClick) {
        return res.json({
          userClicks: 0,
          countryClicks: 0,
          globalClicks: await storage.getGlobalClickCount(),
          countryRank: 0
        });
      }
      
      const country = await storage.getCountryByCode(userClick.countryCode);
      const globalClicks = await storage.getGlobalClickCount();
      const countryRank = await storage.getCountryRank(userClick.countryCode);
      
      res.json({
        userClicks: userClick.clicks,
        countryClicks: country?.clicks || 0,
        globalClicks,
        countryRank
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Generate a session ID
  app.get("/api/session", (_req: Request, res: Response) => {
    const sessionId = nanoid();
    res.json({ sessionId });
  });

  // Get country info from IP
  app.get("/api/country-info", async (req: Request, res: Response) => {
    try {
      // Get IP address with fallbacks for different headers and environments
      const ipRaw = req.headers['x-forwarded-for'] || 
                    req.headers['x-real-ip'] || 
                    req.headers['cf-connecting-ip'] ||
                    req.socket.remoteAddress || 
                    '127.0.0.1';
      
      // Clean the IP address (take first if multiple are provided)
      const ip = Array.isArray(ipRaw) 
        ? ipRaw[0] 
        : ipRaw?.toString().split(',')[0].trim();
      
      console.log("Client IP detection:", { 
        raw: ipRaw, 
        processed: ip,
        headers: {
          forwarded: req.headers['x-forwarded-for'],
          realIp: req.headers['x-real-ip'],
          cfIp: req.headers['cf-connecting-ip']
        }
      });
      
      // For Replit environment, we might need to use a different approach
      // Since the IP detection can be unreliable, let's provide a more robust solution
      
      // Use IP-API for geolocation
      const apiUrl = `http://ip-api.com/json/${ip}`;
      console.log("Fetching geolocation from:", apiUrl);
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      console.log("Geolocation API response:", data);
      
      if (data.status === 'success') {
        const countryCode = data.countryCode;
        
        // Check if country is allowed to play
        const isAllowed = isCountryAllowed(countryCode);
        console.log(`Country ${countryCode} is ${isAllowed ? 'allowed' : 'banned'}`);
        
        // Check for VPN usage if enabled
        let usingVpn = false;
        let vpnMessage = null;
        
        if (isVpnDetectionEnabled()) {
          // VPN detection logic
          // IP-API includes proxy/VPN detection in its response
          usingVpn = data.proxy || data.hosting || false;
          
          if (usingVpn) {
            console.log(`VPN detected for IP ${ip}`);
            if (shouldBlockVpnUsers()) {
              vpnMessage = getVpnBlockedMessage();
            }
          }
        }
        
        // Determine if user should be banned (either country ban or VPN ban)
        const isBanned = !isAllowed || (usingVpn && shouldBlockVpnUsers());
        
        // Check for permanent or temporary ban status
        const isPermanentlyBanned = isCountryPermanentlyBanned(countryCode);
        const isTemporarilyBanned = isCountryTemporarilyBanned(countryCode);
        
        // Get appropriate ban message
        let banMessage = null;
        if (usingVpn && shouldBlockVpnUsers()) {
          banMessage = vpnMessage;
        } else if (isPermanentlyBanned) {
          const permanentBan = getPermanentBanInfo(countryCode);
          banMessage = permanentBan?.message || "This country is permanently banned by Cat Clicker a.s.";
        } else if (isTemporarilyBanned) {
          const temporaryBan = getTemporaryBanInfo(countryCode);
          banMessage = temporaryBan?.message || `This country is temporarily banned until ${new Date(temporaryBan?.expiresAt || "").toLocaleDateString()}.`;
        } else if (isBanned) {
          banMessage = getBannedCountryMessage(countryCode);
        }
        
        res.json({
          code: countryCode,
          name: data.country,
          ip: ip || 'Unknown',
          city: data.city || 'Unknown',
          region: data.regionName || 'Unknown',
          allowed: isAllowed && !(usingVpn && shouldBlockVpnUsers()),
          banned: isBanned,
          isPermanentlyBanned,
          isTemporarilyBanned,
          banMessage,
          discordUrl: isBanned ? getDiscordInviteUrl() : null,
          usingVpn: usingVpn
        });
      } else {
        console.log("No success from IP-API, using alternative method");
        
        // Try an alternative service as IP-API might have limitations
        try {
          const ipinfoResponse = await fetch(`https://ipinfo.io/${ip}/json`);
          const ipinfoData = await ipinfoResponse.json();
          console.log("Alternative IP service response:", ipinfoData);
          
          if (ipinfoData && ipinfoData.country) {
            const countryCode = ipinfoData.country;
            const isAllowed = isCountryAllowed(countryCode);
            
            // Try to detect VPN with the alternative service
            // Note: ipinfo.io might include VPN detection info in their response
            let usingVpn = false;
            let vpnMessage = null;
            
            if (isVpnDetectionEnabled()) {
              // Check if the IP is from a hosting provider (often indicates VPN/proxy)
              usingVpn = ipinfoData.hosting === true || ipinfoData.vpn === true || ipinfoData.proxy === true || false;
              
              if (usingVpn) {
                console.log(`VPN detected for IP ${ip} using alternative service`);
                if (shouldBlockVpnUsers()) {
                  vpnMessage = getVpnBlockedMessage();
                }
              }
            }
            
            // Determine if user should be banned (either country ban or VPN ban)
            const isBanned = !isAllowed || (usingVpn && shouldBlockVpnUsers());
            
            return res.json({
              code: countryCode,
              name: ipinfoData.country_name || countryCode,
              ip: ip || 'Unknown',
              city: ipinfoData.city || 'Unknown',
              region: ipinfoData.region || 'Unknown',
              allowed: isAllowed && !(usingVpn && shouldBlockVpnUsers()),
              banned: isBanned,
              banMessage: isBanned ? 
                (usingVpn && shouldBlockVpnUsers() ? vpnMessage : getBannedCountryMessage(countryCode)) : 
                null,
              discordUrl: isBanned ? getDiscordInviteUrl() : null,
              usingVpn: usingVpn
            });
          }
        } catch (altError) {
          console.error("Alternative IP service also failed:", altError);
        }
        
        // Fallback to default if all geolocation attempts fail
        res.json({
          code: 'US',
          name: 'United States',
          ip: ip || 'Unknown',
          city: 'Unknown',
          region: 'Unknown',
          allowed: isCountryAllowed('US'),
          banned: !isCountryAllowed('US'),
          banMessage: !isCountryAllowed('US') ? getBannedCountryMessage('US') : null,
          discordUrl: !isCountryAllowed('US') ? getDiscordInviteUrl() : null
        });
      }
    } catch (error) {
      console.error("Error fetching country info:", error);
      // Fallback in case of error
      res.json({
        code: 'CZ', // Default to Czechia for testing since it's in our whitelist
        name: 'Czechia',
        ip: 'Unknown (Error)',
        city: 'Unknown',
        region: 'Unknown',
        allowed: true, // Allow by default in case of errors
        banned: false,
        banMessage: null,
        discordUrl: null
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
