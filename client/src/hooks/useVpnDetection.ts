import { useState, useEffect } from 'react';

/**
 * Hook to check if VPN blocking is enabled via API
 * This hook helps determine if VPN users should be blocked from interacting
 * Returns a boolean indicating if VPN blocking is active
 */
export function useVpnDetection() {
  const [shouldBlockVpnUsers, setShouldBlockVpnUsers] = useState(false);
  
  useEffect(() => {
    // Check server configuration for VPN blocking
    const checkVpnPolicy = async () => {
      try {
        // This endpoint could return VPN policy settings
        // For now we'll default to true since we don't have a dedicated endpoint
        setShouldBlockVpnUsers(true);
      } catch (error) {
        console.error("Failed to fetch VPN policy:", error);
        // Default to blocking if we can't determine the policy
        setShouldBlockVpnUsers(true);
      }
    };
    
    checkVpnPolicy();
  }, []);
  
  return shouldBlockVpnUsers;
}

export default useVpnDetection;