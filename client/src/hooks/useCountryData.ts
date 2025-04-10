import { useState, useEffect } from "react";
import { CountryInfo } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ExtendedCountryInfo extends CountryInfo {
  ip: string;
  city: string;
  region: string;
  allowed: boolean;
  banned: boolean;
  banMessage: string | null;
  discordUrl: string | null;
  usingVpn?: boolean;
}

const useCountryData = () => {
  const [countryInfo, setCountryInfo] = useState<CountryInfo>({
    code: "US",
    name: "United States"
  });
  const [extendedInfo, setExtendedInfo] = useState<ExtendedCountryInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCountryInfo = async () => {
      try {
        setLoading(true);
        
        // Try to get country info from API
        const response = await fetch("/api/country-info");
        
        if (!response.ok) {
          throw new Error("Failed to fetch country info");
        }
        
        const data = await response.json();
        
        if (data && data.code && data.name) {
          // Set basic country info for components that only need code and name
          setCountryInfo({
            code: data.code,
            name: data.name
          });
          
          // Store full extended data
          setExtendedInfo(data as ExtendedCountryInfo);
          
          // If country is banned, show a toast notification
          if (data.banned) {
            toast({
              title: "Country Restricted",
              description: data.banMessage || "Your country is currently not allowed to participate in the clicker game.",
              variant: "destructive",
              duration: 10000 // Show for 10 seconds
            });
          }
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching country info:", err);
        setError("Failed to detect your country");
        // Keep the default values
      } finally {
        setLoading(false);
      }
    };

    fetchCountryInfo();
  }, [toast]);

  return { 
    countryInfo, 
    extendedInfo,
    loading, 
    error,
    isBanned: extendedInfo?.banned || false,
    banMessage: extendedInfo?.banMessage || null,
    discordUrl: extendedInfo?.discordUrl || null,
    isUsingVpn: extendedInfo?.usingVpn || false
  };
};

export default useCountryData;
