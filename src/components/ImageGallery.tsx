'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ImageData } from '@/lib/data';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageGalleryProps {
  images: ImageData[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [lightboxActiveIndex, setLightboxActiveIndex] = useState(0);

  const activeImage = images[activeIndex] || images[0];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openLightbox = (index: number) => {
    setLightboxActiveIndex(index);
    setZoomScale(1);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setZoomScale(1);
  };

  const handleLightboxNext = () => {
    setZoomScale(1);
    setLightboxActiveIndex((prev) => (prev + 1) % images.length);
  };

  const handleLightboxPrev = () => {
    setZoomScale(1);
    setLightboxActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const toggleZoom = () => {
    setZoomScale((prev) => (prev === 1 ? 2.5 : 1));
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleLightboxNext();
      if (e.key === 'ArrowLeft') handleLightboxPrev();
      if (e.key === 'Escape') closeLightbox();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLightboxOpen]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[3/4] bg-beige flex items-center justify-center rounded-xl border border-gold/10">
        <span className="text-xs uppercase tracking-widest text-soft-black/40">No Catalogue Images</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col md:flex-row-reverse gap-4">
      {/* Main Showcase Image */}
      <div className="flex-1 relative aspect-[3/4] rounded-xl overflow-hidden bg-beige group shadow-sm border border-gold/10">
        <Image
          src={activeImage.url}
          alt="Selected showcase image"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-top transition-transform duration-[1.2s]"
          priority
        />
        
        {/* Floating Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-soft-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-between justify-between p-4">
          <button 
            onClick={() => openLightbox(activeIndex)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 hover:bg-white text-maroon hover:text-gold transition-colors z-20 shadow-md backdrop-blur-sm"
            title="Full Screen Gallery"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/60 hover:bg-white text-maroon shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/60 hover:bg-white text-maroon shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Sidebar / Bottombar */}
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[500px] no-scrollbar py-1 justify-start">
        {images.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => setActiveIndex(idx)}
            className={`relative w-20 md:w-24 aspect-[3/4] rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
              idx === activeIndex ? 'border-gold shadow-md scale-95' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Image
              src={img.thumbnail}
              alt={`Thumbnail image ${idx + 1}`}
              fill
              sizes="96px"
              className="object-cover object-top"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* Full-screen Zoomable Lightbox Gallery */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between"
          >
            {/* Header / Top Bar */}
            <div className="flex items-center justify-between p-4 md:p-6 text-white relative z-10 bg-gradient-to-b from-black/60 to-transparent">
              <span className="text-xs uppercase tracking-widest font-light">
                Catalogue Image {lightboxActiveIndex + 1} of {images.length}
              </span>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleZoom}
                  className="p-2.5 rounded-full hover:bg-white/10 text-gold transition-colors"
                  title="Toggle Zoom"
                >
                  {zoomScale === 1 ? <ZoomIn className="w-5 h-5" /> : <ZoomOut className="w-5 h-5" />}
                </button>
                <button
                  onClick={closeLightbox}
                  className="p-2.5 rounded-full hover:bg-white/10 text-white transition-colors"
                  title="Close Gallery"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Large Image Showcase Area */}
            <div className="flex-grow flex items-center justify-center relative overflow-hidden px-4">
              {images.length > 1 && zoomScale === 1 && (
                <button
                  onClick={handleLightboxPrev}
                  className="absolute left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20 shadow-lg"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              <motion.div
                animate={{ scale: zoomScale }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                onClick={toggleZoom}
                className={`relative w-full max-w-4xl h-[75vh] cursor-zoom-in ${
                  zoomScale > 1 ? 'cursor-zoom-out' : ''
                }`}
              >
                <Image
                  src={images[lightboxActiveIndex].url}
                  alt={`Catalogue image zoom ${lightboxActiveIndex + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </motion.div>

              {images.length > 1 && zoomScale === 1 && (
                <button
                  onClick={handleLightboxNext}
                  className="absolute right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20 shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Bottom Thumbnail Bar */}
            <div className="p-4 md:p-6 bg-gradient-to-t from-black/60 to-transparent flex justify-center overflow-x-auto gap-2">
              {images.map((img, idx) => (
                <button
                  key={`lightbox-thumb-${img.id}`}
                  onClick={() => {
                    setLightboxActiveIndex(idx);
                    setZoomScale(1);
                  }}
                  className={`relative w-14 aspect-[3/4] rounded border-2 transition-all flex-shrink-0 ${
                    idx === lightboxActiveIndex ? 'border-gold scale-105 opacity-100' : 'border-transparent opacity-40 hover:opacity-70'
                  }`}
                >
                  <Image
                    src={img.thumbnail}
                    alt={`Lightbox thumbnail ${idx + 1}`}
                    fill
                    sizes="56px"
                    className="object-cover object-top"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
