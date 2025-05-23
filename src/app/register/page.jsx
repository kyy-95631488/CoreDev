'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, UserPlus, X, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dialog, setDialog] = useState({ isOpen: false, message: '', type: 'error' });
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setDialog({ isOpen: true, message: 'Passwords do not match', type: 'error' });
      return;
    }
    if (!agreeTerms) {
      setDialog({ isOpen: true, message: 'Please agree to the terms', type: 'error' });
      return;
    }
    if (password.length < 8) {
      setDialog({ isOpen: true, message: 'Password must be at least 8 characters long', type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://hendriansyah.xyz/v1/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirmPassword, agreeTerms }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setDialog({
          isOpen: true,
          message: data.verified 
            ? 'Registration successful! You can now log in.'
            : `Registration successful! Please verify your email with code: ${data.verification_code}`,
          type: 'success'
        });
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setAgreeTerms(false);
      } else {
        setDialog({ isOpen: true, message: data.error, type: 'error' });
      }
    } catch (error) {
      setDialog({ isOpen: true, message: `Network error: ${error.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const closeDialog = () => {
    setDialog({ ...dialog, isOpen: false });
  };

  const toggleTermsModal = () => {
    setShowTermsModal(!showTermsModal);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 px-4 sm:px-6 lg:px-8">
      {/* Dialog Component */}
      <AnimatePresence>
        {dialog.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={closeDialog}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`relative p-4 sm:p-6 rounded-lg shadow-xl max-w-xs sm:max-w-sm w-full ${
                dialog.type === 'success' ? 'bg-green-600/80' : 'bg-red-600/80'
              } backdrop-blur-md text-white`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeDialog}
                className="absolute top-2 right-2 text-white/80 hover:text-white"
              >
                <X size={20} />
              </button>
              <h3 className="text-base sm:text-lg font-semibold mb-2">
                {dialog.type === 'success' ? 'Success' : 'Error'}
              </h3>
              <p className="text-xs sm:text-sm">{dialog.message}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
            onClick={toggleTermsModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative p-4 sm:p-6 rounded-lg shadow-xl max-w-xs sm:max-w-md w-full bg-gray-800/90 backdrop-blur-md text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={toggleTermsModal}
                className="absolute top-2 right-2 text-white/80 hover:text-white"
              >
                <X size={20} />
              </button>
              <h3 className="text-base sm:text-lg font-semibold mb-4">Terms of Service</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-h-[70vh] overflow-y-auto">
                By agreeing to these Terms of Service, you confirm that you are at least 13 years old and agree to abide by our policies. You are responsible for maintaining the confidentiality of your account and password. We reserve the right to modify or terminate services at any time without prior notice. Your data will be handled in accordance with our Privacy Policy.
                <br /><br />
                You agree not to use our services for any illegal or unauthorized purpose. Any violation of these terms may result in the termination of your account.
              </p>
              <button
                onClick={toggleTermsModal}
                className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all duration-200 text-sm sm:text-base"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-10 sm:w-12 h-10 sm:h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white text-xs sm:text-sm font-medium">Registering...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative bg-gray-800/80 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-xl shadow-2xl border border-blue-500/30 w-full max-w-[90%] sm:max-w-sm md:max-w-md"
      >
        <div className="absolute inset-0 pointer-events-none hidden sm:block">
          <div className="absolute w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ top: '-10%', left: '-10%' }}></div>
          <div className="absolute w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" style={{ bottom: '-10%', right: '-10%' }}></div>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
        >
          Create Account
        </motion.h2>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="relative"
          >
            <label htmlFor="email" className="block text-xs sm:text-sm md:text-base font-medium text-gray-300">
              Email
            </label>
            <div className="mt-1 relative">
              <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your email"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="relative"
          >
            <label htmlFor="password" className="block text-xs sm:text-sm md:text-base font-medium text-gray-300">
              Password
            </label>
            <div className="mt-1 relative">
              <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full pl-10 pr-10 py-2 sm:py-3 text-xs sm:text-sm md:text-base bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="relative"
          >
            <label htmlFor="confirm-password" className="block text-xs sm:text-sm md:text-base font-medium text-gray-300">
              Confirm Password
            </label>
            <div className="mt-1 relative">
              <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full pl-10 pr-10 py-2 sm:py-3 text-xs sm:text-sm md:text-base bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <div className="relative flex items-center">
              <input
                id="agree-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={isLoading}
                className="hidden"
              />
              <motion.label
                htmlFor="agree-terms"
                whileHover={{ scale: isLoading ? 1 : 1.05 }}
                whileTap={{ scale: isLoading ? 1 : 0.95 }}
                className={`relative w-10 sm:w-12 h-5 sm:h-6 rounded-full p-0.5 sm:p-1 cursor-pointer transition-all duration-300 ${
                  agreeTerms ? 'bg-blue-600' : 'bg-gray-600'
                } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-start`}
              >
                <motion.div
                  className="w-4 sm:w-5 h-4 sm:h-5 bg-white rounded-full shadow-md flex items-center justify-center"
                  animate={{
                    x: agreeTerms ? '1.5rem' : '0.125rem',
                    scale: agreeTerms ? 1.1 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {agreeTerms && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center text-blue-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CheckCircle size={12} className="sm:w-14 sm:h-14" />
                    </motion.div>
                  )}
                </motion.div>
              </motion.label>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm md:text-base text-gray-300">
                I agree to the
              </span>
              <button
                type="button"
                onClick={toggleTermsModal}
                disabled={isLoading}
                className="text-xs sm:text-sm md:text-base text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Terms of Service
              </button>
            </div>
          </motion.div>

          <motion.button
            type="submit"
            whileHover={{ scale: isLoading ? 1 : 1.05, boxShadow: isLoading ? 'none' : '0 0 15px rgba(59, 130, 246, 0.4)' }}
            whileTap={{ scale: isLoading ? 1 : 0.95 }}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2 sm:py-3 text-xs sm:text-sm md:text-base bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-4 sm:w-5 h-4 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus size={16} />
                Sign Up
              </>
            )}
          </motion.button>
        </form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="mt-4 sm:mt-5 text-center text-xs sm:text-sm md:text-base text-gray-300"
        >
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}