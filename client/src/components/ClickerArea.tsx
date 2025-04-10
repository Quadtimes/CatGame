import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ClickerAreaProps {
  clickCount: number;
  clickRate: number;
  onCatClick: () => void;
  countryRank?: number;
  disableClicks?: boolean;
}

interface ClickEffect {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

const ClickerArea = ({ clickCount, clickRate, onCatClick, countryRank = 0, disableClicks = false }: ClickerAreaProps) => {
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const catImages = [
    "https://images.unsplash.com/photo-1533738363-b7f9aef128ce",
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba",
    "https://images.unsplash.com/photo-1495360010541-f48722b34f7d",
    "https://images.unsplash.com/photo-1573865526739-10659fec78a5",
    "https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a",
    "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13"
  ];
  
  const [currentCatImage, setCurrentCatImage] = useState(catImages[0]);
  
  // Rotate cat images periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * catImages.length);
      setCurrentCatImage(catImages[randomIndex]);
    }, 30000); // Change every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Don't process clicks if disabled
    if (disableClicks) return;
    
    onCatClick();
    
    // Create click effect
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const colors = ['#FF6B6B', '#4ECDC4', '#FFD166'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 20 + 40;
      
      const newEffect = {
        id: `click-${Date.now()}-${Math.random()}`,
        x,
        y,
        size,
        color: randomColor
      };
      
      setClickEffects(prev => [...prev, newEffect]);
      
      // Remove effect after animation completes
      setTimeout(() => {
        setClickEffects(prev => prev.filter(effect => effect.id !== newEffect.id));
      }, 800);
    }
  };

  // Determine click rate bar width and color
  const getClickRateWidth = () => {
    // Max at 10 clicks per second
    return `${Math.min(clickRate / 10 * 100, 100)}%`;
  };

  const getClickRateColor = () => {
    if (clickRate > 7) {
      return "bg-gradient-to-r from-primary to-accent";
    } else if (clickRate > 3) {
      return "bg-gradient-to-r from-secondary to-accent";
    } else {
      return "bg-gradient-to-r from-secondary/70 to-secondary";
    }
  };

  // Get border and glow styling based on country rank
  const getRankStyles = () => {
    if (countryRank === 1) {
      return {
        border: "border-yellow-400",
        glow: "shadow-[0_0_15px_5px_rgba(255,215,0,0.7)]",
        rankBadge: "bg-yellow-400 text-dark"
      };
    } else if (countryRank === 2) {
      return {
        border: "border-gray-300",
        glow: "shadow-[0_0_12px_4px_rgba(192,192,192,0.7)]",
        rankBadge: "bg-gray-300 text-dark"
      };
    } else if (countryRank === 3) {
      return {
        border: "border-amber-700",
        glow: "shadow-[0_0_10px_3px_rgba(205,127,50,0.7)]",
        rankBadge: "bg-amber-700 text-white"
      };
    } else {
      return {
        border: "border-accent/50",
        glow: "",
        rankBadge: "bg-dark/80 text-white"
      };
    }
  };

  const rankStyles = getRankStyles();

  return (
    <>
      <div ref={containerRef} className="relative w-full aspect-square max-w-md mb-6">
        {/* Click target */}
        <div className="w-full h-full flex justify-center items-center">
          <motion.button 
            whileHover={{ scale: disableClicks ? 1 : 1.02 }}
            whileTap={{ scale: disableClicks ? 1 : 0.95 }}
            onClick={handleClick}
            className={`relative w-full h-full transition-all duration-150 focus:outline-none ${disableClicks ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
          >
            {/* Gold/Silver/Bronze glow effects for top 3 countries */}
            {countryRank === 1 && (
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full opacity-30" 
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 2
                }}
              />
            )}
            {countryRank === 2 && (
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full opacity-30" 
                animate={{ 
                  scale: [1, 1.04, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 2.5
                }}
              />
            )}
            {countryRank === 3 && (
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-amber-700 to-amber-600 rounded-full opacity-30" 
                animate={{ 
                  scale: [1, 1.03, 1],
                  opacity: [0.2, 0.35, 0.2]
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 3
                }}
              />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
            <div className="absolute inset-8 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
            
            <motion.img 
              src={currentCatImage}
              alt="Click me! Cute cat" 
              className={`absolute inset-0 w-full h-full object-cover rounded-full shadow-2xl border-4 ${rankStyles.border} ${rankStyles.glow}`}
              key={currentCatImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={countryRank === 1 ? {filter: "brightness(1.1)"} : undefined}
            />
            <div className="absolute inset-0 rounded-full shadow-inner"></div>
            
            {/* Banned overlay */}
            {disableClicks && (
              <div className="absolute inset-0 bg-dark/70 rounded-full flex items-center justify-center z-30">
                <i className="fas fa-ban text-red-500 text-6xl"></i>
              </div>
            )}
            
            {/* Country rank badge */}
            {countryRank > 0 && countryRank <= 10 && !disableClicks && (
              <div className={`absolute -bottom-3 -right-3 z-30 ${rankStyles.rankBadge} rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg`}>
                #{countryRank}
              </div>
            )}
          </motion.button>
        </div>
        
        {/* Click counter bubble */}
        <motion.div 
          key={clickCount}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-white pointer-events-none z-20 font-bold"
          style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
        >
          <span>{clickCount}</span>
        </motion.div>
        
        {/* Click Visual Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
          <AnimatePresence>
            {clickEffects.map(effect => (
              <motion.div
                key={effect.id}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute rounded-full"
                style={{
                  left: effect.x,
                  top: effect.y,
                  width: effect.size,
                  height: effect.size,
                  backgroundColor: effect.color,
                  marginLeft: -effect.size/2,
                  marginTop: -effect.size/2
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Click Rate Indicator */}
      <div className="w-full bg-dark/40 rounded-xl p-4 text-center">
        <p className="text-light/70 mb-2">Your clicking speed</p>
        <div className="w-full bg-dark/60 rounded-full h-4 overflow-hidden">
          <motion.div 
            className={`${getClickRateColor()} h-full rounded-full`}
            style={{ width: getClickRateWidth() }}
            animate={{ width: getClickRateWidth() }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="mt-2 text-sm text-light/60">
          <span>{clickRate.toFixed(1)}</span> clicks per second
        </p>
      </div>
      
      {/* Banned country message */}
      {disableClicks && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-red-900/30 border border-red-500/30 rounded-xl p-4 mt-4 text-center"
        >
          <p className="text-red-300 mb-1">Your country is currently restricted</p>
          <p className="text-light/60 text-sm">
            Check the country status above for more information and how to request access.
          </p>
        </motion.div>
      )}
    </>
  );
};

export default ClickerArea;
