'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Key, Lock, Eye, EyeOff, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dialog, setDialog] = useState({ isOpen: false, message: '', type: 'error' });
  const [isLoading, setIsLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const router = useRouter();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setDialog({ isOpen: false, message: '', type: 'error' });
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost/v1/auth/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_reset', email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setDialog({
          isOpen: true,
          message: data.error || 'Failed to send reset code. Please try again.',
          type: 'error',
        });
        setIsLoading(false);
        return;
      }

      setDialog({
        isOpen: true,
        message: 'A reset code has been sent to your email.',
        type: 'success',
      });
      setShowResetForm(true);
    } catch (err) {
      setDialog({ isOpen: true, message: `Error: ${err.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setDialog({ isOpen: false, message: '', type: 'error' });
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setDialog({
        isOpen: true,
        message: 'Passwords do not match.',
        type: 'error',
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost/v1/auth/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password', email, code: resetCode, new_password: newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setDialog({
          isOpen: true,
          message: data.error || 'Failed to reset password. Please check your code.',
          type: 'error',
        });
        setIsLoading(false);
        return;
      }

      setDialog({
        isOpen: true,
        message: 'Password reset successful! Redirecting to login...',
        type: 'success',
      });
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setDialog({ isOpen: true, message: `Error: ${err.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const closeDialog = () => {
    setDialog({ ...dialog, isOpen: false });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 px-4 sm:px-6 lg:px-8">
      <AnimatePresence>
        {dialog.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
            onClick={closeDialog}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`relative p-6 rounded-lg shadow-xl max-w-sm w-full ${
                dialog.type === 'success' ? 'bg-green-600/80' : 'bg-red-600/80'
              } backdrop-blur-md text-white border-2 border-yellow-500`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeDialog}
                className="absolute top-2 right-2 text-white/80 hover:text-white"
              >
                <X size={20} />
              </button>
              <h3 className="text-lg font-semibold mb-2">
                {dialog.type === 'success' ? 'Success' : 'Error'}
              </h3>
              <p className="text-sm">{dialog.message}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[90]"
          >
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white text-sm font-medium">Processing...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative bg-gray-800/80 backdrop-blur-lg p-6 sm:p-8 rounded-xl shadow-2xl border border-blue-500/30 w-full max-w-md sm:max-w-lg"
      >
        <div className="absolute inset-0 pointer-events-none hidden sm:block">
          <div className="absolute w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ top: '-10%', left: '-10%' }}></div>
          <div className="absolute w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" style={{ bottom: '-10%', right: '-10%' }}></div>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
        >
          {showResetForm ? 'Reset Your Password' : 'Forgot Password'}
        </motion.h2>

        {!showResetForm ? (
          <form onSubmit={handleRequestReset} className="space-y-4 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative"
            >
              <label htmlFor="email" className="block text-sm sm:text-base font-medium text-gray-300">
                Email
              </label>
              <div className="mt-1 sm:mt-2 relative">
                <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                />
              </div>
            </motion.div>

            <motion.button
              type="submit"
              whileHover={{ scale: isLoading ? 1 : 1.05, boxShadow: isLoading ? 'none' : '0 0 20px rgba(59, 130, 246, 0.5)' }}
              whileTap={{ scale: isLoading ? 1 : 0.95 }}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg text-sm sm:text-base touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Key size={20} />
                  Send Reset Code
                </>
              )}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative"
            >
              <label htmlFor="reset-code" className="block text-sm sm:text-base font-medium text-gray-300">
                Reset Code
              </label>
              <div className="mt-1 sm:mt-2 relative">
                <Key size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="reset-code"
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter reset code"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="relative"
            >
              <label htmlFor="new-password" className="block text-sm sm:text-base font-medium text-gray-300">
                New Password
              </label>
              <div className="mt-1 sm:mt-2 relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-10 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="relative"
            >
              <label htmlFor="confirm-password" className="block text-sm sm:text-base font-medium text-gray-300">
                Confirm New Password
              </label>
              <div className="mt-1 sm:mt-2 relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-10 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </motion.div>

            <motion.button
              type="submit"
              whileHover={{ scale: isLoading ? 1 : 1.05, boxShadow: isLoading ? 'none' : '0 0 20px rgba(59, 130, 246, 0.5)' }}
              whileTap={{ scale: isLoading ? 1 : 0.95 }}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg text-sm sm:text-base touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock size={20} />
                  Reset Password
                </>
              )}
            </motion.button>
          </form>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-4 sm:mt-6 text-center text-sm sm:text-base text-gray-300"
        >
          Back to{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            Login
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}