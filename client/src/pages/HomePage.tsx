import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import TopCountriesDisplay from "@/components/TopCountriesDisplay";
import { useEffect } from "react";
import { LeaderboardEntry } from "@shared/schema";

interface HomePageProps {
  sessionId: string;
}

const HomePage = ({ sessionId }: HomePageProps) => {
  const { data: topCountries, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/countries/top?limit=3"],
  });

  // Staggered animation for elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex flex-col items-center p-6 pt-20 bg-gradient-to-b from-dark to-gray-900 text-light relative overflow-hidden"
    >
      {/* Background Stars Effect */}
      <div className="bg-stars"></div>
      {/* Header */}
      <motion.header 
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-5xl text-center mb-8 mt-10"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-primary animate-pulse">
          <span className="inline-block transform hover:scale-110 transition-transform duration-300">🐱</span> 
          <span className="text-accent">Global</span> Cat Clicker
        </h1>
        <p className="text-xl md:text-2xl mt-4 text-secondary">Click the cat, represent your country!</p>
      </motion.header>

      {/* Main content */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-3xl bg-dark/80 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-lg border border-secondary/20 transform hover:scale-[1.02] transition-all duration-300"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div variants={itemVariants} className="order-2 md:order-1">
            <h2 className="text-3xl font-bold text-accent mb-4">What is this?</h2>
            <p className="mb-4 text-light/90">A global competition where your clicks contribute to your country's score. The more you click, the higher your country ranks!</p>
            <h3 className="text-2xl font-bold text-secondary mb-3">How to play:</h3>
            <ul className="space-y-2 list-disc list-inside text-light/80">
              <li>Click the cat as fast as you can</li>
              <li>Each click adds a point to your country</li>
              <li>Your country is detected automatically</li>
              <li>Top 3 countries get special medals</li>
            </ul>
            <div className="mt-8 flex justify-center md:justify-start">
              <Link href="/clicker">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary hover:bg-primary/80 text-light font-bold py-3 px-8 rounded-full transition-all duration-300 flex items-center shadow-lg group animate-bounce"
                >
                  <span className="mr-2 text-xl">Start Clicking</span>
                  <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                </motion.button>
              </Link>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="order-1 md:order-2 flex justify-center">
            <div className="relative w-full max-w-xs">
              {/* Main cat image with animation */}
              <motion.img 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba" 
                alt="Cute cat ready to be clicked" 
                className="rounded-2xl shadow-xl w-full object-cover aspect-square"
              />
              
              {/* Floating elements around the cat */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                className="absolute -top-4 -right-4 bg-primary rounded-full p-2 shadow-lg"
              >
                <i className="fas fa-globe text-light text-2xl"></i>
              </motion.div>
              
              <motion.div 
                animate={{ rotate: [-3, 3, -3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -bottom-3 -left-3 bg-accent rounded-full p-2 shadow-lg"
              >
                <i className="fas fa-mouse-pointer text-dark text-2xl"></i>
              </motion.div>
              
              {/* Country flags floating around */}
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                className="absolute top-1/4 -right-6"
              >
                <img 
                  src="https://purecatamphetamine.github.io/country-flag-icons/3x2/US.svg" 
                  alt="USA Flag" 
                  className="w-10 h-6 rounded shadow-md"
                />
              </motion.div>
              
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                className="absolute bottom-1/4 -left-6"
              >
                <img 
                  src="https://purecatamphetamine.github.io/country-flag-icons/3x2/JP.svg" 
                  alt="Japan Flag" 
                  className="w-10 h-6 rounded shadow-md"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Leaderboard Preview */}
      <motion.div 
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-3xl mt-10 text-center"
      >
        <h2 className="text-2xl font-bold text-secondary mb-4">Current Leaders</h2>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <TopCountriesDisplay countries={topCountries || []} />
        )}
      </motion.div>

      {/* Footer */}
      <motion.footer 
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-3xl mt-12 mb-6 text-center text-light/60"
      >
        <p>© {new Date().getFullYear()} Global Cat Clicker | All clicks are counted | <span className="text-secondary">Worldwide competition</span></p>
      </motion.footer>
    </motion.div>
  );
};

export default HomePage;
