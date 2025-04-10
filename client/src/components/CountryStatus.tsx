import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CountryStatusProps {
  ip: string;
  countryCode: string;
  countryName: string;
  city: string;
  region: string;
  isBanned: boolean;
  banMessage: string | null;
  discordUrl: string | null;
  usingVpn?: boolean;
}

const CountryStatus = ({
  ip,
  countryCode,
  countryName,
  city,
  region,
  isBanned,
  banMessage,
  discordUrl,
  usingVpn = false
}: CountryStatusProps) => {
  const [detailsVisible, setDetailsVisible] = useState(false);

  const handleJoinDiscord = () => {
    if (discordUrl) {
      window.open(discordUrl, '_blank');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-6">
      {isBanned && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Alert variant="destructive" className="border-2 border-red-500">
            <AlertTitle className="text-xl">Country Restricted</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-4">{banMessage || "Your country is currently not allowed to participate in the clicker game."}</p>
              {discordUrl && (
                <Button 
                  variant="outline" 
                  className="bg-primary/80 hover:bg-primary text-white border-white/20"
                  onClick={handleJoinDiscord}
                >
                  <i className="fab fa-discord mr-2"></i> Join our Discord to request access
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <img 
            src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${countryCode}.svg`}
            alt={`${countryName} Flag`}
            className="w-10 h-6 rounded shadow-md mr-3"
            onError={(e) => {
              // Fallback if flag image fails to load
              e.currentTarget.src = "https://purecatamphetamine.github.io/country-flag-icons/3x2/XX.svg";
            }}
          />
          <div>
            <h3 className="font-bold text-light">{countryName}</h3>
            <p className="text-sm text-light/60">{city}, {region}</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setDetailsVisible(!detailsVisible)}
          className="text-light/70 hover:text-light"
        >
          {detailsVisible ? 'Hide Details' : 'Show Details'}
        </Button>
      </div>

      {detailsVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden bg-dark/50 rounded-lg p-3 mb-3"
        >
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-light/60">IP Address:</p>
              <p className="font-mono">{ip}</p>
            </div>
            <div>
              <p className="text-light/60">Country Code:</p>
              <p className="font-mono">{countryCode}</p>
            </div>
            <div>
              <p className="text-light/60">Status:</p>
              <p className={isBanned ? "text-red-400" : "text-green-400"}>
                {isBanned ? "Restricted" : "Allowed"}
              </p>
            </div>
            <div>
              <p className="text-light/60">Click Tracking:</p>
              <p className={isBanned ? "text-red-400" : "text-green-400"}>
                {isBanned ? "Disabled" : "Active"}
              </p>
            </div>
            {usingVpn && (
              <div className="col-span-2">
                <p className="text-light/60">VPN Status:</p>
                <p className="text-amber-400 flex items-center">
                  <span className="mr-1">⚠️</span> VPN/Proxy detected
                </p>
                <p className="text-xs text-light/40 mt-1">
                  Using a VPN or proxy service may affect your ability to participate in the game.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CountryStatus;