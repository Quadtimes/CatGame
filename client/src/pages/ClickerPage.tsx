import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { LeaderboardEntry } from "@shared/schema";
import CountryIndicator from "@/components/CountryIndicator";
import LeaderboardEntryComponent from "@/components/LeaderboardEntry";
import CountryStatus from "@/components/CountryStatus";
import ClickerArea from "@/components/ClickerArea";
import useCountryData from "@/hooks/useCountryData";
import useClicker from "@/hooks/useClicker";
import useVpnDetection from "@/hooks/useVpnDetection";

interface ClickerPageProps {
  sessionId: string;
}

const ClickerPage = ({ sessionId }: ClickerPageProps) => {
  const [_, setLocation] = useLocation();
  const { countryInfo, extendedInfo, isBanned, banMessage, discordUrl, isUsingVpn } = useCountryData();
  const shouldBlockVpnUsers = useVpnDetection();
  
  // Create an extended country info object that includes VPN status
  const extendedCountryInfo = {
    ...countryInfo,
    usingVpn: isUsingVpn
  };
  
  const { 
    clickCount, 
    personalClicks, 
    countryRank, 
    countryTotal, 
    globalTotal, 
    clickRate,
    addClick
  } = useClicker(sessionId, extendedCountryInfo);

  const { data: topCountries, isLoading: isLoadingTop } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/countries/top?limit=3"],
  });

  const { data: otherCountries, isLoading: isLoadingOthers } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/countries/top?limit=10"],
    select: (data) => data.slice(3),
  });

  // No longer needed with navbar
  const handleBackClick = () => {
    setLocation("/");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center p-6 pt-20 bg-gradient-to-b from-dark to-gray-900 text-light relative overflow-hidden"
    >
      {/* Background Stars Effect */}
      <div className="bg-stars"></div>
      {/* Header */}
      <header className="w-full max-w-5xl flex justify-between items-center mb-6 mt-4">
        <div className="w-10"></div> {/* Empty div for spacing */}
        
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">
            <span>🐱</span> 
            <span className="text-accent">Global</span> Cat Clicker
          </h1>
        </div>
        
        <CountryIndicator countryInfo={countryInfo} />
      </header>

      {/* Country Status Display */}
      {extendedInfo && (
        <CountryStatus
          ip={extendedInfo.ip}
          countryCode={extendedInfo.code}
          countryName={extendedInfo.name}
          city={extendedInfo.city}
          region={extendedInfo.region}
          isBanned={isBanned}
          banMessage={banMessage}
          discordUrl={discordUrl}
          usingVpn={isUsingVpn}
        />
      )}

      {/* Game Statistics Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-5xl glass-effect rounded-2xl p-3 mb-6 flex justify-around flex-wrap"
      >
        <motion.div 
          className="text-center px-4 py-2"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <p className="text-light/60 text-sm">Your Clicks</p>
          <p className="text-2xl font-bold text-accent shimmer">{personalClicks}</p>
        </motion.div>
        
        <motion.div 
          className="text-center px-4 py-2"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <p className="text-light/60 text-sm">Country Rank</p>
          <p className="text-2xl font-bold text-secondary shimmer">#{countryRank || "?"}</p>
        </motion.div>
        
        <motion.div 
          className="text-center px-4 py-2"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <p className="text-light/60 text-sm">Country Total</p>
          <p className="text-2xl font-bold text-primary shimmer">{countryTotal.toLocaleString()}</p>
        </motion.div>
        
        <motion.div 
          className="text-center px-4 py-2"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <p className="text-light/60 text-sm">Global Clicks</p>
          <p className="text-2xl font-bold text-light/90 shimmer">{globalTotal.toLocaleString()}</p>
        </motion.div>
      </motion.div>

      {/* Main Clicker Area */}
      <div className="w-full max-w-3xl flex flex-col items-center mb-8">
        <ClickerArea 
          clickCount={clickCount}
          clickRate={clickRate}
          onCatClick={addClick}
          countryRank={countryRank}
          disableClicks={isBanned || (isUsingVpn && shouldBlockVpnUsers)}
        />
      </div>

      {/* Leaderboard */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full max-w-3xl mb-8"
      >
        <h2 className="text-2xl font-bold text-secondary mb-4 text-center relative">
          <span className="relative inline-block">
            Global Leaderboard
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-secondary to-transparent"></span>
          </span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top 3 countries */}
          <motion.div 
            className="glass-effect rounded-xl p-5 shadow-lg border border-light/10 card-hover-effect"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <h3 className="text-xl font-bold text-accent mb-4 flex items-center">
              <span className="mr-2">🏆</span> Top Countries
            </h3>
            
            {isLoadingTop ? (
              <div className="flex justify-center p-8">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"
                />
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {topCountries?.map((country, index) => (
                  <motion.div
                    key={country.code}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    className={index === 0 ? "float-animation-slow" : index === 1 ? "float-animation" : "float-animation-fast"}
                  >
                    <LeaderboardEntryComponent
                      country={country}
                      position={index + 1}
                      isCurrentUserCountry={country.code === countryInfo.code}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
          
          {/* Other countries (positions 4-10) */}
          <motion.div 
            className="glass-effect rounded-xl p-5 shadow-lg border border-light/10 card-hover-effect"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <h3 className="text-xl font-bold text-accent mb-4 flex items-center">
              <span className="mr-2">🚀</span> Challengers
            </h3>
            
            {isLoadingOthers ? (
              <div className="flex justify-center p-8">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"
                />
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {otherCountries?.map((country, index) => (
                  <motion.div
                    key={country.code}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    <LeaderboardEntryComponent
                      country={country}
                      position={index + 4}
                      isCurrentUserCountry={country.code === countryInfo.code}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="w-full max-w-3xl text-center mb-10 glass-effect p-8 rounded-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/30 to-blue-500/30"></div>
        </div>
        
        <motion.p 
          className="text-2xl font-bold text-light mb-6 relative z-10"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        >
          Help <span className="text-primary">{countryInfo.name}</span> reach the top!
        </motion.p>
        
        <div className="flex flex-wrap justify-center gap-4 relative z-10">
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255, 255, 255, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Global Cat Clicker',
                  text: `Help ${countryInfo.name} reach the top of the Global Cat Clicker leaderboard!`,
                  url: window.location.href,
                }).catch(err => console.error('Share failed:', err));
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
            className="bg-secondary hover:bg-secondary/80 text-dark font-bold py-3 px-8 rounded-full transition-all duration-300 flex items-center shadow-lg"
          >
            <span className="mr-2">🔗</span> Share
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255, 255, 255, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert(`Link copied to clipboard! Send it to your friends to help ${countryInfo.name} win!`);
            }}
            className="bg-accent hover:bg-accent/80 text-dark font-bold py-3 px-8 rounded-full transition-all duration-300 flex items-center shadow-lg"
          >
            <span className="mr-2">👥</span> Invite Friends
          </motion.button>
        </div>
        
        <motion.div 
          className="mt-6 text-light/60 text-sm relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Every click counts in this global competition!
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ClickerPage;
