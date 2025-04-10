import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { LeaderboardEntry } from "@shared/schema";
import LeaderboardEntryComponent from "@/components/LeaderboardEntry";
import useCountryData from "@/hooks/useCountryData";

interface LeaderboardsPageProps {
  sessionId: string;
}

const LeaderboardsPage = ({ sessionId }: LeaderboardsPageProps) => {
  const { countryInfo } = useCountryData();
  const [showAll, setShowAll] = useState(false);
  
  // Get top 20 countries for leaderboard
  const { data: topCountries, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/countries/top?limit=100"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Staggered animation for elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
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
      <header className="w-full max-w-5xl flex justify-center items-center mb-6 mt-4">
        <motion.h1 
          className="text-3xl md:text-4xl font-bold text-primary"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
        >
          <span className="text-accent">Global</span> Leaderboard
        </motion.h1>
      </header>
      
      {/* Leaderboard Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-4xl"
      >
        {/* Display loading animation if data is being fetched */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
            />
          </div>
        ) : (
          <>
            {/* Top 3 Countries Podium */}
            <motion.div 
              className="mb-12"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-2xl font-bold text-secondary mb-6 text-center relative">
                <span className="relative">
                  Top Countries
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-secondary to-transparent"></span>
                </span>
              </h2>
              
              <div className="flex flex-col md:flex-row justify-center items-end gap-4 pb-10">
                {/* Second Place */}
                {topCountries && topCountries.length > 1 && (
                  <motion.div 
                    variants={itemVariants}
                    className="order-2 md:order-1 w-full md:w-1/3"
                  >
                    <div className="glass-effect p-6 rounded-t-xl text-center h-40 md:h-60 flex flex-col justify-end items-center float-animation">
                      <div className="silver-glow rounded-full p-2 mb-3">
                        <span className="text-4xl">🥈</span>
                      </div>
                      <h3 className="text-xl font-bold silver-text mb-1">{topCountries[1]?.name || "No country yet"}</h3>
                      <p className="text-sm text-light/70">
                        {topCountries[1]?.clicks?.toLocaleString() || "0"} clicks
                      </p>
                    </div>
                    <div className="h-10 bg-secondary/30 backdrop-blur-sm rounded-b-xl"></div>
                  </motion.div>
                )}
                
                {/* First Place */}
                {topCountries && topCountries.length > 0 && (
                  <motion.div 
                    variants={itemVariants}
                    className="order-1 md:order-2 w-full md:w-1/3 -mt-5 md:-mt-10 z-10"
                  >
                    <div className="glass-effect p-6 rounded-t-xl text-center h-48 md:h-72 flex flex-col justify-end items-center float-animation-slow">
                      <div className="gold-glow rounded-full p-3 mb-3">
                        <span className="text-5xl">🥇</span>
                      </div>
                      <h3 className="text-2xl font-bold gold-text mb-1">{topCountries[0]?.name || "No country yet"}</h3>
                      <p className="text-light/70">
                        {topCountries[0]?.clicks?.toLocaleString() || "0"} clicks
                      </p>
                      {topCountries[0]?.code === countryInfo.code && (
                        <span className="bg-primary/40 text-light text-xs py-1 px-2 rounded-full mt-2">Your Country</span>
                      )}
                    </div>
                    <div className="h-14 bg-primary/30 backdrop-blur-sm rounded-b-xl"></div>
                  </motion.div>
                )}
                
                {/* Third Place */}
                {topCountries && topCountries.length > 2 && (
                  <motion.div 
                    variants={itemVariants}
                    className="order-3 w-full md:w-1/3"
                  >
                    <div className="glass-effect p-6 rounded-t-xl text-center h-32 md:h-52 flex flex-col justify-end items-center float-animation-fast">
                      <div className="bronze-glow rounded-full p-2 mb-3">
                        <span className="text-3xl">🥉</span>
                      </div>
                      <h3 className="text-lg font-bold bronze-text mb-1">{topCountries[2]?.name || "No country yet"}</h3>
                      <p className="text-sm text-light/70">
                        {topCountries[2]?.clicks?.toLocaleString() || "0"} clicks
                      </p>
                    </div>
                    <div className="h-8 bg-accent/30 backdrop-blur-sm rounded-b-xl"></div>
                  </motion.div>
                )}
              </div>
            </motion.div>
            
            {/* Full Leaderboard */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="glass-effect rounded-xl p-6 mb-8"
            >
              <h2 className="text-xl font-bold text-accent mb-6 flex items-center">
                <span className="mr-2">🏆</span> Complete Rankings
              </h2>
              
              <div className="space-y-3">
                {topCountries && (showAll ? topCountries : topCountries.slice(0, 10)).map((country, index) => (
                  <motion.div
                    key={country.code}
                    variants={itemVariants}
                    className="card-hover-effect"
                    whileHover={{ x: 5 }}
                  >
                    <LeaderboardEntryComponent
                      country={country}
                      position={index + 1}
                      isCurrentUserCountry={country.code === countryInfo.code}
                    />
                  </motion.div>
                ))}
              </div>
              
              {topCountries && topCountries.length > 10 && (
                <motion.div
                  className="mt-6 text-center"
                  variants={itemVariants}
                >
                  <motion.button
                    onClick={() => setShowAll(!showAll)}
                    className="bg-dark/60 hover:bg-dark/40 text-light font-medium py-2 px-6 rounded-full transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showAll ? "Show Less" : `Show All (${topCountries.length})`}
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
            
            {/* Stats and Info */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="glass-effect rounded-xl p-6 mb-8 text-center"
            >
              <motion.div variants={itemVariants}>
                <h3 className="text-lg font-bold text-secondary mb-2">Total Global Clicks</h3>
                <p className="text-3xl font-bold text-primary shimmer">
                  {topCountries ? topCountries.reduce((sum, country) => sum + country.clicks, 0).toLocaleString() : 0}
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <motion.div variants={itemVariants} className="p-4 bg-dark/30 rounded-lg">
                  <h4 className="text-sm text-light/70 mb-1">Countries Competing</h4>
                  <p className="text-xl font-bold text-accent">{topCountries?.length || 0}</p>
                </motion.div>
                
                <motion.div variants={itemVariants} className="p-4 bg-dark/30 rounded-lg">
                  <h4 className="text-sm text-light/70 mb-1">Leaderboard Updated</h4>
                  <p className="text-xl font-bold text-secondary">Live</p>
                </motion.div>
                
                <motion.div variants={itemVariants} className="p-4 bg-dark/30 rounded-lg">
                  <h4 className="text-sm text-light/70 mb-1">Your Country Rank</h4>
                  <p className="text-xl font-bold text-primary">
                    {topCountries && Array.isArray(topCountries) && 
                      (() => {
                        const index = topCountries.findIndex(c => c.code === countryInfo.code);
                        return index !== -1 ? `#${index + 1}` : 'N/A';
                      })()
                    }
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
      
      {/* Call to Action */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl mb-8 text-center"
      >
        <motion.div variants={itemVariants}>
          <Link href="/clicker">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255, 255, 255, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary hover:bg-primary/80 text-light font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg"
            >
              <span className="mr-2">🐱</span> Go Back to Clicking
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
      
      {/* Footer */}
      <motion.footer 
        className="text-center text-light/40 text-sm mt-auto py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p>© {new Date().getFullYear()} Global Cat Clicker | All clicks are counted | Updated in real-time</p>
      </motion.footer>
    </motion.div>
  );
};

export default LeaderboardsPage;