'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center relative select-none">
      {/* Soft background glow */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-6">
        {/* Animated Gold Ring Spinner */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="w-14 h-14 border-2 border-gold/20 border-t-gold rounded-full"
          />
          <Sparkles className="w-5 h-5 text-gold absolute animate-pulse" />
        </div>

        {/* Brand Text */}
        <div className="text-center space-y-1.5">
          <h2 className="font-serif text-lg tracking-[0.2em] text-maroon uppercase font-light">
            Satyam Creations
          </h2>
          <p className="text-[9px] tracking-widest text-gold uppercase font-light">
            Loading Heritage Catalogue
          </p>
        </div>
      </div>
    </div>
  );
}
