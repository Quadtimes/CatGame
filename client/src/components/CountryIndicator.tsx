import { motion } from "framer-motion";
import { CountryInfo } from "@shared/schema";

interface CountryIndicatorProps {
  countryInfo: CountryInfo;
}

const CountryIndicator = ({ countryInfo }: CountryIndicatorProps) => {
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center space-x-2 bg-dark/60 px-4 py-2 rounded-full shadow-md"
    >
      <img 
        src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${countryInfo.code}.svg`}
        alt={`${countryInfo.name} flag`}
        className="w-8 h-5 rounded"
        onError={(e) => {
          // Fallback if flag image fails to load
          e.currentTarget.src = "https://purecatamphetamine.github.io/country-flag-icons/3x2/XX.svg";
        }}
      />
      <span className="font-bold text-light/90">{countryInfo.name}</span>
    </motion.div>
  );
};

export default CountryIndicator;
