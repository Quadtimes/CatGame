import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { CountryInfo } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface StatsResponse {
  userClicks: number;
  countryClicks: number;
  globalClicks: number;
  countryRank: number;
}

interface ClickResponse {
  success: boolean;
  countryClicks: number;
  userClicks: number;
  globalClicks: number;
  countryRank: number;
  banned?: boolean;
  message?: string;
}

interface CountryInfoExtended extends CountryInfo {
  usingVpn?: boolean;
}

const useClicker = (sessionId: string, countryInfo: CountryInfoExtended) => {
  const [clickCount, setClickCount] = useState(0);
  const [personalClicks, setPersonalClicks] = useState(0);
  const [countryRank, setCountryRank] = useState(0);
  const [countryTotal, setCountryTotal] = useState(0);
  const [globalTotal, setGlobalTotal] = useState(0);
  const [clickRate, setClickRate] = useState(0);
  const [countryBanned, setCountryBanned] = useState(false);
  const [banMessage, setBanMessage] = useState<string>("");
  
  const lastClicks = useRef<number[]>([]);
  const clickBuffer = useRef<number>(0);
  const bufferTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Load initial stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/users/${sessionId}/stats`);
        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }
        
        const data: StatsResponse = await response.json();
        setPersonalClicks(data.userClicks);
        setCountryTotal(data.countryClicks);
        setGlobalTotal(data.globalClicks);
        setCountryRank(data.countryRank);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    if (sessionId) {
      fetchStats();
    }
  }, [sessionId]);

  // Handle recording clicks to server
  const clickMutation = useMutation({
    mutationFn: async (clickCount: number) => {
      // Don't send clicks if country is banned
      if (countryBanned) {
        // Return a mock response to avoid unnecessary API calls
        return {
          success: false,
          banned: true,
          message: banMessage,
          countryClicks: 0,
          userClicks: 0,
          globalClicks: 0,
          countryRank: 0
        } as ClickResponse;
      }
      
      const response = await apiRequest("POST", "/api/clicks", {
        countryCode: countryInfo.code,
        countryName: countryInfo.name,
        clicks: clickCount,
        sessionId,
        usingVpn: countryInfo.usingVpn || false
      });
      
      // Handle 403 Forbidden responses (banned countries)
      if (response.status === 403) {
        const data = await response.json() as ClickResponse;
        if (data.banned) {
          setCountryBanned(true);
          setBanMessage(data.message || "This country is currently banned from the clicker game.");
          
          // Show toast notification
          toast({
            title: "Country Banned",
            description: data.message || "This country is currently banned from the clicker game.",
            variant: "destructive",
            duration: 10000 // Show for 10 seconds
          });
        }
        return data;
      }
      
      return response.json() as Promise<ClickResponse>;
    },
    onSuccess: (data) => {
      if (data.success) {
        // Update stats with server response
        setPersonalClicks(data.userClicks);
        setCountryTotal(data.countryClicks);
        setGlobalTotal(data.globalClicks);
        setCountryRank(data.countryRank);
        
        // Invalidate queries to refresh leaderboard
        queryClient.invalidateQueries({ queryKey: ["/api/countries/top"] });
      } else if (data.banned && !countryBanned) {
        // If we just found out the country is banned, update state
        setCountryBanned(true);
        setBanMessage(data.message || "This country is currently banned from the clicker game.");
        
        // Show toast notification only the first time
        toast({
          title: "Country Banned",
          description: data.message || "This country is currently banned from the clicker game.",
          variant: "destructive",
          duration: 10000 // Show for 10 seconds
        });
      }
    },
    onError: (error) => {
      console.error("Error registering clicks:", error);
      toast({
        title: "Error",
        description: "Failed to register clicks. Please try again later.",
        variant: "destructive"
      });
    }
  });

  // Send buffered clicks to server
  const sendBufferedClicks = () => {
    if (clickBuffer.current > 0) {
      clickMutation.mutate(clickBuffer.current);
      clickBuffer.current = 0;
    }
    
    bufferTimeoutRef.current = null;
  };

  // Update click rate
  useEffect(() => {
    // Calculate clicks per second every second
    const interval = setInterval(() => {
      const now = Date.now();
      // Only consider clicks from the last 5 seconds
      lastClicks.current = lastClicks.current.filter(time => now - time < 5000);
      const rate = lastClicks.current.length / 5;
      setClickRate(rate);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (bufferTimeoutRef.current) {
        clearTimeout(bufferTimeoutRef.current);
        sendBufferedClicks();
      }
    };
  }, []);

  // Handle a cat click
  const addClick = () => {
    // Increment local counter
    setClickCount(prev => prev + 1);
    
    // Record timestamp for click rate calculation
    lastClicks.current.push(Date.now());
    
    // Buffer clicks and send in batches
    clickBuffer.current += 1;
    
    // If we already have a timeout, don't set another one
    if (!bufferTimeoutRef.current) {
      bufferTimeoutRef.current = setTimeout(sendBufferedClicks, 1000);
    }
  };

  return {
    clickCount,
    personalClicks,
    countryRank,
    countryTotal,
    globalTotal,
    clickRate,
    addClick
  };
};

export default useClicker;
