import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

const Navbar = () => {
  const [location] = useLocation();

  // Navigation links
  const navLinks = [
    { title: "Home", href: "/" },
    { title: "Clicker", href: "/clicker" },
    { title: "Leaderboards", href: "/leaderboards" },
  ];

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-dark/70 backdrop-blur-md fixed top-0 left-0 z-50 border-b border-primary/20"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <span className="text-2xl">🐱</span>
            <span className="font-bold text-primary">CatClicker</span>
          </div>
        </Link>

        <nav className="flex items-center space-x-1 md:space-x-4">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div
                className={`px-3 py-2 rounded-md text-sm md:text-base transition-all duration-300 cursor-pointer ${
                  location === link.href
                    ? "bg-primary/20 text-primary font-semibold"
                    : "text-light/70 hover:text-light hover:bg-dark/50"
                }`}
              >
                {link.title}
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </motion.div>
  );
};

export default Navbar;