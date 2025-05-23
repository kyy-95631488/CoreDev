'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Check for valid session token on mount
  useEffect(() => {
    const checkSession = async () => {
      const sessionToken = localStorage.getItem('session_token');
      if (sessionToken) {
        setIsLoading(true);
        try {
          const response = await fetch('https://hendriansyah.xyz/v1/auth/verify-session/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_token: sessionToken }),
          });

          const data = await response.json();
          if (response.ok && data.valid) {
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
            localStorage.removeItem('session_token');
          }
        } catch (err) {
          console.error('Session check failed:', err);
          setIsLoggedIn(false);
          localStorage.removeItem('session_token');
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkSession();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Optionally, call a backend logout endpoint to invalidate the token
      await fetch('https://hendriansyah.xyz/v1/auth/logout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token: localStorage.getItem('session_token') }),
      });

      localStorage.removeItem('session_token');
      localStorage.removeItem('rememberedEmail'); // Optional: clear remembered email
      setIsLoggedIn(false);
      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="fixed top-0 w-full bg-opacity-95 backdrop-blur-lg z-50 border-b border-blue-500/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
        >
          CoreDev
        </motion.h1>
        <div className="flex items-center gap-4">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {['About', 'Projects', 'Contact'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="relative text-lg font-medium hover:text-blue-400 transition-colors group"
              >
                {item}
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
            {isLoggedIn ? (
              <>
                <motion.a
                  href="/dashboard"
                  whileHover={{ scale: isLoading ? 1 : 1.1 }}
                  whileTap={{ scale: isLoading ? 1 : 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg"
                >
                  <LayoutDashboard size={20} />
                  Dashboard
                </motion.a>
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: isLoading ? 1 : 1.1 }}
                  whileTap={{ scale: isLoading ? 1 : 0.95 }}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-full hover:from-red-500 hover:to-red-700 transition-all duration-300 shadow-lg"
                >
                  <LogOut size={20} />
                  Logout
                </motion.button>
              </>
            ) : (
              <motion.a
                href="/login"
                whileHover={{ scale: isLoading ? 1 : 1.1 }}
                whileTap={{ scale: isLoading ? 1 : 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg"
              >
                <LogIn size={20} />
                Login
              </motion.a>
            )}
          </div>
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-blue-500/20 transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            disabled={isLoading}
          >
            {isMenuOpen ? <X size={24} className="text-blue-400" /> : <Menu size={24} className="text-blue-400" />}
          </button>
        </div>
      </div>
      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-gray-900/95 backdrop-blur-lg px-4 py-2 border-t border-blue-500/30"
          >
            <div className="flex flex-col gap-4">
              {['About', 'Projects', 'Contact'].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-lg hover:text-blue-400 transition-colors"
                  onClick={toggleMenu}
                >
                  {item}
                </Link>
              ))}
              {isLoggedIn ? (
                <>
                  <motion.a
                    href="/dashboard"
                    whileHover={{ scale: isLoading ? 1 : 1.05 }}
                    whileTap={{ scale: isLoading ? 1 : 0.95 }}
                    className="flex items-center gap-2 p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-500 hover:to-purple-500 transition-all duration-300"
                    onClick={toggleMenu}
                  >
                    <LayoutDashboard size={20} />
                    Dashboard
                  </motion.a>
                  <motion.button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    whileHover={{ scale: isLoading ? 1 : 1.05 }}
                    whileTap={{ scale: isLoading ? 1 : 0.95 }}
                    disabled={isLoading}
                    className="flex items-center gap-2 p-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-full hover:from-red-500 hover:to-red-700 transition-all duration-300"
                  >
                    <LogOut size={20} />
                    Logout
                  </motion.button>
                </>
              ) : (
                <motion.a
                  href="/login"
                  whileHover={{ scale: isLoading ? 1 : 1.05 }}
                  whileTap={{ scale: isLoading ? 1 : 0.95 }}
                  className="flex items-center gap-2 p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-500 hover:to-purple-500 transition-all duration-300"
                  onClick={toggleMenu}
                >
                  <LogIn size={20} />
                  Login
                </motion.a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}