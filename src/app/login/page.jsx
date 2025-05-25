'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Mail, Lock, Eye, EyeOff, Key, X, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [dialog, setDialog] = useState({ isOpen: false, message: '', type: 'error' });
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const sessionToken = localStorage.getItem('session_token');
      if (sessionToken) {
        setIsLoading(true);
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/verify-session/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_token: sessionToken }),
          });

          const data = await response.json();
          if (response.ok && data.valid) {
            router.push('/dashboard');
          }
        } catch (err) {
          console.error('Session check failed:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkSession();

    const storedEmail = localStorage.getItem('rememberedEmail');
    if (storedEmail) {
      setEmail(storedEmail);
      setRememberMe(true);
    }
  }, [router]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDialog({ isOpen: false, message: '', type: 'error' });
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 301 && data.action_required === 'verify') {
          setDialog({
            isOpen: true,
            message: 'Your account is not verified. Please check your email for the verification code.',
            type: 'error',
          });
          setShowVerificationDialog(true);
        } else {
          setDialog({
            isOpen: true,
            message: data.error || 'Login failed. Please check your credentials.',
            type: 'error',
          });
        }
        setIsLoading(false);
        return;
      }

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      localStorage.setItem('session_token', data.session_token);
      setDialog({ isOpen: true, message: 'Login successful! Redirecting...', type: 'success' });
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      setDialog({ isOpen: true, message: `firewood error: ${err.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setDialog({ isOpen: false, message: '', type: 'error' });
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', email, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.action_required === 'resend') {
          setDialog({
            isOpen: true,
            message: 'Verification code expired. Please request a new one.',
            type: 'error',
          });
        } else {
          setDialog({
            isOpen: true,
            message: data.error || 'Invalid verification code. Please try again.',
            type: 'error',
          });
        }
        setIsLoading(false);
        return;
      }

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      localStorage.setItem('session_token', data.session_token);
      setDialog({ isOpen: true, message: 'Verification successful! Logging in...', type: 'success' });
      setShowVerificationDialog(false);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      setDialog({ isOpen: true, message: `firewood error: ${err.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setDialog({ isOpen: false, message: '', type: 'error' });
    setIsLoading(true);
    setResendCooldown(30);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend', email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setDialog({
          isOpen: true,
          message: data.error || 'Failed to resend verification code.',
          type: 'error',
        });
        setIsLoading(false);
        return;
      }

      setDialog({
        isOpen: true,
        message: 'A new verification code has been sent to your email.',
        type: 'success',
      });
    } catch (err) {
      setDialog({ isOpen: true, message: `firewood error: ${err.message}`, type: 'error' });
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
          Welcome Back
        </motion.h2>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="relative"
          >
            <label htmlFor="password" className="block text-sm sm:text-base font-medium text-gray-300">
              Password
            </label>
            <div className="mt-1 sm:mt-2 relative">
              <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full pl-10 pr-10 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your password"
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="hidden"
                />
                <motion.label
                  htmlFor="remember-me"
                  whileHover={{ scale: isLoading ? 1 : 1.05 }}
                  whileTap={{ scale: isLoading ? 1 : 0.95 }}
                  className={`relative w-10 sm:w-12 h-5 sm:h-6 rounded-full p-0.5 sm:p-1 cursor-pointer transition-all duration-300 ${
                    rememberMe ? 'bg-blue-600' : 'bg-gray-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-start`}
                >
                  <motion.div
                    className="w-4 sm:w-5 h-4 sm:h-5 bg-white rounded-full shadow-md flex items-center justify-center"
                    animate={{
                      x: rememberMe ? '1.5rem' : '0.125rem',
                      scale: rememberMe ? 1.1 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {rememberMe && (
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
              <span className="text-sm sm:text-base text-gray-300">Remember me</span>
            </div>
            <Link href="/forgot-password" className="text-sm sm:text-base text-blue-400 hover:text-blue-300 transition-colors">
              Forgot Password?
            </Link>
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
                <LogIn size={20} />
                Sign In
              </>
            )}
          </motion.button>
        </form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-4 sm:mt-6 text-center text-sm sm:text-base text-gray-300"
        >
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
            Sign up
          </Link>
        </motion.p>
      </motion.div>

      {showVerificationDialog && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[80]"
        >
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative bg-gray-800/90 backdrop-blur-lg p-6 sm:p-8 rounded-xl shadow-2xl border border-blue-500/30 w-full max-w-sm sm:max-w-md border-2 border-green-500"
          >
            <button
              onClick={() => setShowVerificationDialog(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-300"
              disabled={isLoading}
            >
              <X size={20} />
            </button>
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Verify Your Account
            </h3>
            <p className="text-gray-300 text-center mb-4 text-sm sm:text-base">
              A verification code was sent to {email}. Please enter it below.
            </p>
            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              <div className="relative">
                <Key size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter verification code"
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: isLoading ? 1 : 1.05 }}
                whileTap={{ scale: isLoading ? 1 : 0.95 }}
                disabled={isLoading}
                className="w-full py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'Verify'
                )}
              </motion.button>
            </form>
            <motion.button
              onClick={handleResendCode}
              whileHover={{ scale: isLoading || resendCooldown > 0 ? 1 : 1.05 }}
              whileTap={{ scale: isLoading || resendCooldown > 0 ? 1 : 0.95 }}
              disabled={isLoading || resendCooldown > 0}
              className="w-full mt-4 text-blue-400 hover:text-blue-300 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}