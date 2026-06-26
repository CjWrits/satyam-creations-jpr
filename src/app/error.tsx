'use client';

import { useEffect } from 'react';
import Image from 'next/image';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the full error to client console
    console.error('Next.js Page Render Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
      {/* Background glow styling */}
      <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-maroon/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-md w-full p-8 bg-white/70 backdrop-blur-md border border-gold/25 rounded-2xl shadow-xl space-y-6">
        {/* Company logo above error */}
        <div className="relative w-14 h-14 mx-auto overflow-hidden rounded-full border border-gold/20 bg-beige flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Satyam Creations Logo"
            width={56}
            height={56}
            className="object-cover rounded-full"
          />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-lg tracking-wider text-maroon uppercase">Render Error Occurred</h2>
          <p className="text-xs text-soft-black/60 font-light leading-relaxed">
            Something went wrong while displaying this page. The error details have been logged.
          </p>
        </div>

        {/* Display details of the error */}
        <div className="p-4 bg-beige/40 border border-gold/15 rounded-xl text-[10px] font-mono text-soft-black/80 text-left space-y-2.5 break-all max-h-[220px] overflow-y-auto">
          <div>
            <span className="font-semibold text-maroon uppercase text-[9px] tracking-wider block">Error Message</span>
            <span className="opacity-90">{error.message || 'Details redacted by Next.js in production build.'}</span>
          </div>
          {error.digest && (
            <div>
              <span className="font-semibold text-maroon uppercase text-[9px] tracking-wider block">Digest ID</span>
              <span className="opacity-90">{error.digest}</span>
            </div>
          )}
          <div>
            <span className="font-semibold text-gold uppercase text-[9px] tracking-wider block">Diagnostics</span>
            <span className="opacity-70">Please check your Netlify Function Console logs or browser DevTools console for the complete stack trace.</span>
          </div>
        </div>

        <div className="flex justify-center space-x-3 pt-2">
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-maroon text-white text-xs uppercase tracking-widest font-semibold rounded-lg shadow-md hover:bg-maroon-hover hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Reload Page
          </button>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-white border border-gold/30 text-maroon text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-beige active:scale-[0.98] transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}


the eisnt anyu reaosn for this to work wihotut any erorrs ..but still ti has more erros tba the orking paet of thee code hence making it enough for the woking patience