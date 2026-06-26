'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/actions/auth';
import Image from 'next/image';
import { Menu, X, LogOut, Shield, Compass, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  user?: {
    email: string;
    role: string;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    await logoutAction();
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/catalog', label: 'Catalog', icon: Compass },
  ];

  if (user?.role === 'ADMIN') {
    navLinks.push({ href: '/admin', label: 'Admin Panel', icon: Shield });
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-gold/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-9 h-9 overflow-hidden rounded-full border border-gold/25 bg-beige p-0.5 group-hover:border-gold/50 transition-all flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Satyam Creations Logo"
                width={36}
                height={36}
                className="object-cover rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-sm md:text-base font-light tracking-[0.15em] text-maroon group-hover:text-gold transition-colors">
                SATYAM CREATIONS
              </span>
              <span className="text-[8px] tracking-[0.15em] font-light uppercase text-gold">
                Jaipur Showcase
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const LinkIcon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center space-x-1.5 text-xs font-light uppercase tracking-widest py-2 transition-colors ${
                    active ? 'text-maroon' : 'text-soft-black/60 hover:text-maroon'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gold"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}

            {/* User Session and Logout */}
            {user && (
              <div className="flex items-center space-x-4 border-l border-gold/20 pl-6">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-soft-black/80 font-light max-w-[120px] truncate">
                    {user.email}
                  </span>
                  <span className="text-[8px] tracking-wider uppercase font-semibold text-gold">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-soft-black/60 hover:text-maroon hover:bg-maroon/5 transition-all border border-transparent hover:border-gold/10"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-soft-black/60 hover:text-maroon transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-gold/10 bg-ivory overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-3">
              {navLinks.map((link) => {
                const LinkIcon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-light uppercase tracking-wider transition-colors ${
                      active ? 'bg-maroon/5 text-maroon border-l-2 border-gold' : 'text-soft-black/70 hover:bg-maroon/5 hover:text-maroon'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4 text-gold" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {/* Mobile Logout Info */}
              {user && (
                <div className="border-t border-gold/10 pt-4 mt-4 px-3 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-soft-black/80 font-light truncate max-w-[180px]">
                      {user.email}
                    </span>
                    <span className="text-[9px] tracking-wider uppercase font-semibold text-gold">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 bg-maroon/5 border border-gold/20 rounded-lg text-xs tracking-wider uppercase text-maroon hover:bg-maroon hover:text-white transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
