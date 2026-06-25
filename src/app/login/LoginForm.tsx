'use client';

import { useActionState, useState } from 'react';
import { loginAction, ActionResponse } from '@/app/actions/auth';
import { Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const initialState: ActionResponse = {
  success: false,
};

export default function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="w-full max-w-md p-8 rounded-2xl glass border border-gold/20 shadow-2xl relative overflow-hidden"
    >
      {/* Decorative luxury gradient background */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-maroon/5 rounded-full blur-3xl" />

      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-maroon/10 border border-gold/30 mb-4 animate-pulse">
          <Sparkles className="w-6 h-6 text-gold" />
        </div>
        <h1 className="font-serif text-2xl font-light tracking-widest text-maroon mb-2">
          SATYAM CREATIONS
        </h1>
        <p className="text-[10px] tracking-[0.2em] text-gold font-light uppercase">
          Jaipur Heritage Kurti Showcase
        </p>
      </div>

      <form action={formAction} className="space-y-6 relative z-10">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <input type="hidden" name="rememberMe" value={rememberMe ? 'true' : 'false'} />

        {/* Error message */}
        {state?.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-red-950/20 border border-red-800/40 text-red-300 text-sm text-center"
          >
            {state.error}
          </motion.div>
        )}

        <div>
          <label className="block text-xs font-light uppercase tracking-wider text-maroon/80 mb-2">
            Catalog Access Email
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gold/60">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              name="email"
              required
              placeholder="admin-login"
              className="w-full pl-10 pr-4 py-3 bg-white/40 border border-gold/20 rounded-lg text-sm text-soft-black placeholder-soft-black/40 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-light uppercase tracking-wider text-maroon/80 mb-2">
            Access Key
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gold/60">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-3 bg-white/40 border border-gold/20 rounded-lg text-sm text-soft-black placeholder-soft-black/40 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gold/60 hover:text-gold"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gold text-maroon focus:ring-maroon bg-white/40"
            />
            <span className="text-xs text-maroon/80 font-light tracking-wide">Remember my session</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 bg-gradient-to-r from-maroon to-red-950 text-white rounded-lg text-sm tracking-widest font-light uppercase shadow-lg shadow-maroon/20 hover:shadow-maroon/40 transition-all border border-gold/30 disabled:opacity-50 hover:brightness-110 active:scale-[0.98]"
        >
          {isPending ? 'Authenticating...' : 'Enter Catalogue'}
        </button>
      </form>
    </motion.div>
  );
}
