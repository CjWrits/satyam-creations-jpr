'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ProductData } from '@/lib/data';
import { motion } from 'framer-motion';
import { Compass, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: ProductData;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const imageUrl = primaryImage?.thumbnail || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
      className="group flex flex-col bg-white/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gold/10 hover:border-gold/30 hover:bg-white/80 shadow-sm hover:shadow-xl transition-all duration-500"
    >
      <Link href={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden w-full bg-beige">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-top group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
          loading="lazy"
        />
        
        {/* Luxury collection tag if present */}
        {product.collection && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-[9px] font-light uppercase tracking-widest bg-maroon text-white border border-gold/20 rounded-full shadow-md z-10 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-gold" />
            {product.collection.name}
          </span>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-soft-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
          <span className="px-4 py-2 bg-ivory text-maroon text-xs uppercase tracking-widest font-light border border-gold/40 rounded-lg flex items-center space-x-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-lg">
            <Compass className="w-3.5 h-3.5" />
            <span>View Catalogue</span>
          </span>
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-grow relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-gold uppercase tracking-widest">
            {product.code}
          </span>
          <span className="text-[10px] text-soft-black/50 uppercase tracking-wider font-light">
            {product.category.name}
          </span>
        </div>

        <Link href={`/product/${product.id}`}>
          <h3 className="font-serif text-base font-light text-maroon tracking-wide group-hover:text-gold transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-[11px] font-light text-soft-black/60 line-clamp-2 mt-2 leading-relaxed">
          {product.description || 'No description available for this handcrafted ethnic piece.'}
        </p>

        {product.price !== null && (
          <div className="mt-4 pt-3 border-t border-gold/10 flex items-center justify-between">
            <span className="text-[10px] uppercase font-light tracking-wider text-soft-black/40">Reference Value</span>
            <span className="font-serif text-sm font-light text-maroon">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
