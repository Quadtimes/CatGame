import { motion } from "framer-motion";
import { LeaderboardEntry as LeaderboardEntryType } from "@shared/schema";

interface LeaderboardEntryProps {
  country: LeaderboardEntryType;
  position: number;
  isCurrentUserCountry: boolean;
}

const LeaderboardEntryComponent = ({ country, position, isCurrentUserCountry }: LeaderboardEntryProps) => {
  // Medal components based on position
  const getMedalComponent = () => {
    if (position === 1) {
      return (
        <div className="medal gold-medal mr-2">
          <i className="fas fa-trophy text-2xl gold-text"></i>
        </div>
      );
    } else if (position === 2) {
      return (
        <div className="medal silver-medal mr-2">
          <i className="fas fa-medal text-2xl silver-text"></i>
        </div>
      );
    } else if (position === 3) {
      return (
        <div className="medal bronze-medal mr-2">
          <i className="fas fa-award text-2xl bronze-text"></i>
        </div>
      );
    } else {
      return (
        <p className="w-6 text-center font-bold text-light/70 mr-2">{position}</p>
      );
    }
  };

  // Text style based on position
  const getTextStyle = () => {
    if (position === 1) return "gold-text";
    if (position === 2) return "silver-text";
    if (position === 3) return "bronze-text";
    return "text-light/90";
  };

  // Background style based on user's country
  const getContainerStyle = () => {
    if (isCurrentUserCountry) {
      return "bg-accent/20 rounded-lg p-3 mb-2 flex items-center border border-accent/30 relative";
    }
    
    if (position <= 3) {
      return "bg-dark/60 rounded-lg p-3 mb-3 flex items-center";
    }
    
    return "bg-dark/60 rounded-lg p-3 mb-2 flex items-center";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={getContainerStyle()}
    >
      {isCurrentUserCountry && (
        <div className="absolute -left-2 -top-2 bg-accent rounded-full w-6 h-6 flex items-center justify-center">
          <i className="fas fa-star text-xs text-dark"></i>
        </div>
      )}
      
      {getMedalComponent()}
      
      <img 
        src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${country.code}.svg`}
        alt={`${country.name} Flag`}
        className={position <= 3 ? "w-10 h-6 rounded shadow-md mr-3" : "w-8 h-5 rounded shadow-md mr-3"}
        onError={(e) => {
          // Fallback if flag image fails to load
          e.currentTarget.src = "https://purecatamphetamine.github.io/country-flag-icons/3x2/XX.svg";
        }}
      />
      
      <div className="flex-1">
        <p className={`font-bold ${getTextStyle()}`}>{country.name}</p>
      </div>
      
      <p className={`${position <= 3 ? "text-xl" : "text-lg"} font-bold ${getTextStyle()}`}>
        {country.clicks.toLocaleString()}
      </p>
    </motion.div>
  );
};

export default LeaderboardEntryComponent;
