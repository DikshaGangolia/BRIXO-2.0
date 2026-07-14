import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Sparkles, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const signup = useAuthStore(state => state.signup);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await signup(name, email, password);
    setIsLoading(false);

    if (success) {
      navigate('/dashboard');
    } else {
      setError('An account with this email address already exists.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">

      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl relative z-10 space-y-6"
      >
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20 mb-3">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent">Create Account</h2>
          <p className="text-xs text-slate-400">Join the Universal Website Builder platform today</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 bg-red-950/30 border border-red-900/60 rounded-2xl flex items-start gap-2.5 text-xs text-red-300"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-slate-950/60 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl pl-10 pr-4 py-3 text-xs outline-none text-slate-200 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full bg-slate-950/60 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl pl-10 pr-4 py-3 text-xs outline-none text-slate-200 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-3xs font-bold uppercase tracking-wider text-slate-400">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/60 border border-slate-850 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl pl-10 pr-4 py-3 text-xs outline-none text-slate-200 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold rounded-2xl shadow-lg transition-all active:scale-99 flex items-center justify-center gap-2 text-white"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : 'Sign Up'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 border-t border-slate-850/60 pt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
};
