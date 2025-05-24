'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X, LogIn, LogOut, LayoutDashboard, Bot } from 'lucide-react';
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
      await fetch('https://hendriansyah.xyz/v1/auth/logout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token: localStorage.getItem('session_token') }),
      });

      localStorage.removeItem('session_token');
      localStorage.removeItem('rememberedEmail');
      setIsLoggedIn(false);
      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Button animation variants
  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 8px 20px rgba(59, 130, 246, 0.3)",
      transition: { duration: 0.3, ease: "easeOut" }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.2 }
    },
    loading: {
      opacity: 0.7,
      scale: 1,
      transition: { duration: 0.2 }
    }
  };

  // Icon animation for buttons
  const iconVariants = {
    initial: { rotate: 0, scale: 1 },
    hover: { 
      rotate: [0, 10, -10, 0], 
      scale: 1.1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="fixed top-0 w-full bg-opacity-95 backdrop-blur-xl z-50 border-b border-blue-500/20 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{
              scale: 1.05,
              textShadow: "0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(147, 51, 234, 0.6)",
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.95 }}
            className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 cursor-pointer relative"
          >
            CoreDev
            <motion.span
              className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.h1>
        </Link>
        <div className="flex items-center gap-4">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {['About', 'Projects', 'Contact'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="relative text-lg font-medium text-gray-200 hover:text-blue-400 transition-colors group"
              >
                {item}
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
            <motion.a
              href="/ai"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              animate={isLoading ? "loading" : "initial"}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-500 hover:to-teal-500 transition-all duration-300 shadow-md hover:shadow-xl border border-green-500/30 touch-manipulation"
            >
              <motion.span variants={iconVariants}>
                <Bot size={20} />
              </motion.span>
              <span className="font-semibold">AI</span>
            </motion.a>
            {isLoggedIn ? (
              <>
                <motion.a
                  href="/dashboard"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  animate={isLoading ? "loading" : "initial"}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-md hover:shadow-xl border border-blue-500/30 touch-manipulation"
                >
                  <motion.span variants={iconVariants}>
                    <LayoutDashboard size={20} />
                  </motion.span>
                  <span className="font-semibold">Dashboard</span>
                </motion.a>
                <motion.button
                  onClick={handleLogout}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  animate={isLoading ? "loading" : "initial"}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:from-red-500 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-xl border border-red-500/30 touch-manipulation"
                >
                  <motion.span variants={iconVariants}>
                    <LogOut size={20} />
                  </motion.span>
                  <span className="font-semibold">Logout</span>
                </motion.button>
              </>
            ) : (
              <motion.a
                href="/login"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                animate={isLoading ? "loading" : "initial"}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-md hover:shadow-xl border border-blue-500/30 touch-manipulation"
              >
                <motion.span variants={iconVariants}>
                  <LogIn size={20} />
                </motion.span>
                <span className="font-semibold">Login</span>
              </motion.a>
            )}
          </div>
          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2.5 rounded-full bg-gray-800/50 hover:bg-blue-500/20 transition-colors border border-blue-500/30 touch-manipulation"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            disabled={isLoading}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMenuOpen ? <X size={24} className="text-blue-400" /> : <Menu size={24} className="text-blue-400" />}
          </motion.button>
        </div>
      </div>
      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="md:hidden bg-gray-900/95 backdrop-blur-xl px-4 py-4 border-t border-blue-500/20"
          >
            <div className="flex flex-col gap-3">
              {['About', 'Projects', 'Contact'].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-lg text-gray-200 hover:text-blue-400 transition-colors py-2"
                  onClick={toggleMenu}
                >
                  {item}
                </Link>
              ))}
              <motion.a
                href="/ai"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                animate={isLoading ? "loading" : "initial"}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-500 hover:to-teal-500 transition-all duration-300 shadow-md border border-green-500/30 touch-manipulation"
                onClick={toggleMenu}
              >
                <motion.span variants={iconVariants}>
                  <Bot size={20} />
                </motion.span>
                <span className="font-semibold">AI</span>
              </motion.a>
              {isLoggedIn ? (
                <>
                  <motion.a
                    href="/dashboard"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    animate={isLoading ? "loading" : "initial"}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-md border border-blue-500/30 touch-manipulation"
                    onClick={toggleMenu}
                  >
                    <motion.span variants={iconVariants}>
                      <LayoutDashboard size={20} />
                    </motion.span>
                    <span className="font-semibold">Dashboard</span>
                  </motion.a>
                  <motion.button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    animate={isLoading ? "loading" : "initial"}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:from-red-500 hover:to-red-700 transition-all duration-300 shadow-md border border-red-500/30 touch-manipulation"
                  >
                    <motion.span variants={iconVariants}>
                      <LogOut size={20} />
                    </motion.span>
                    <span className="font-semibold">Logout</span>
                  </motion.button>
                </>
              ) : (
                <motion.a
                  href="/login"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  animate={isLoading ? "loading" : "initial"}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-md border border-blue-500/30 touch-manipulation"
                  onClick={toggleMenu}
                >
                  <motion.span variants={iconVariants}>
                    <LogIn size={20} />
                  </motion.span>
                  <span className="font-semibold">Login</span>
                </motion.a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}