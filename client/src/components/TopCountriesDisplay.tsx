import { motion } from "framer-motion";
import { LeaderboardEntry } from "@shared/schema";

interface TopCountriesDisplayProps {
  countries: LeaderboardEntry[];
}

const TopCountriesDisplay = ({ countries }: TopCountriesDisplayProps) => {
  // Handle empty or incomplete data
  if (!countries || countries.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-dark/60 rounded-xl p-4 border border-light/30 shadow-lg">
            <div className="h-40 flex items-center justify-center">
              <p className="text-light/50">No data yet</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const getCountry = (position: number) => {
    return countries.find(country => country.rank === position) || null;
  };

  const firstPlace = getCountry(1);
  const secondPlace = getCountry(2);
  const thirdPlace = getCountry(3);

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Silver medal (2nd place) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="order-1 md:order-1"
      >
        {secondPlace ? (
          <div className="bg-dark/60 rounded-xl p-4 border border-silver/30 shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="medal silver-medal mb-2">
              <i className="fas fa-medal text-4xl silver-text"></i>
            </div>
            <img 
              src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${secondPlace.code}.svg`}
              alt={`${secondPlace.name} Flag`}
              className="w-16 h-10 mx-auto rounded shadow-md"
              onError={(e) => {
                e.currentTarget.src = "https://purecatamphetamine.github.io/country-flag-icons/3x2/XX.svg";
              }}
            />
            <p className="mt-2 font-bold silver-text">{secondPlace.name}</p>
            <p className="text-xl font-bold silver-text">{secondPlace.clicks.toLocaleString()}</p>
          </div>
        ) : (
          <div className="bg-dark/60 rounded-xl p-4 border border-silver/30 shadow-lg">
            <div className="h-40 flex items-center justify-center">
              <p className="text-light/50">No data yet</p>
            </div>
          </div>
        )}
      </motion.div>
      
      {/* Gold medal (1st place) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="order-2 md:order-2 -mt-6"
      >
        {firstPlace ? (
          <div className="bg-dark/60 rounded-xl p-4 border border-gold/30 shadow-xl transform hover:scale-105 transition-all duration-300">
            <div className="medal gold-medal mb-2">
              <i className="fas fa-trophy text-5xl gold-text"></i>
            </div>
            <img 
              src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${firstPlace.code}.svg`}
              alt={`${firstPlace.name} Flag`}
              className="w-20 h-12 mx-auto rounded shadow-md"
              onError={(e) => {
                e.currentTarget.src = "https://purecatamphetamine.github.io/country-flag-icons/3x2/XX.svg";
              }}
            />
            <p className="mt-2 font-bold gold-text">{firstPlace.name}</p>
            <p className="text-2xl font-bold gold-text">{firstPlace.clicks.toLocaleString()}</p>
          </div>
        ) : (
          <div className="bg-dark/60 rounded-xl p-4 border border-gold/30 shadow-xl">
            <div className="h-40 flex items-center justify-center">
              <p className="text-light/50">No data yet</p>
            </div>
          </div>
        )}
      </motion.div>
      
      {/* Bronze medal (3rd place) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="order-3 md:order-3"
      >
        {thirdPlace ? (
          <div className="bg-dark/60 rounded-xl p-4 border border-bronze/30 shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="medal bronze-medal mb-2">
              <i className="fas fa-award text-4xl bronze-text"></i>
            </div>
            <img 
              src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${thirdPlace.code}.svg`}
              alt={`${thirdPlace.name} Flag`}
              className="w-16 h-10 mx-auto rounded shadow-md"
              onError={(e) => {
                e.currentTarget.src = "https://purecatamphetamine.github.io/country-flag-icons/3x2/XX.svg";
              }}
            />
            <p className="mt-2 font-bold bronze-text">{thirdPlace.name}</p>
            <p className="text-xl font-bold bronze-text">{thirdPlace.clicks.toLocaleString()}</p>
          </div>
        ) : (
          <div className="bg-dark/60 rounded-xl p-4 border border-bronze/30 shadow-lg">
            <div className="h-40 flex items-center justify-center">
              <p className="text-light/50">No data yet</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TopCountriesDisplay;
