import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { getSession } from '@/lib/auth';
import { getProducts, getCategories, getCollections } from '@/lib/data';
import { Compass, Sparkles, Star, Shield, ArrowRight } from 'lucide-react';

export default async function HomePage() {
  const session = await getSession();
  let categories = [];
  let collections = [];
  let products = [];
  let latestProducts = [];

  try {
    const [cats, cols, prods] = await Promise.all([
      getCategories(),
      getCollections(),
      getProducts({ sortBy: 'latest' }),
    ]);
    categories = cats;
    collections = cols;
    products = prods;
    latestProducts = products.slice(0, 4);
  } catch (error) {
    console.error('SERVER RENDER ERROR: Data fetching failed in home page.tsx:', error);
    throw error;
  }

  // Luxury visual image for the hero section banner (from Unsplash)
  const heroImage = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&auto=format&fit=crop&q=80';

  return (
    <div className="min-h-screen bg-ivory flex flex-col font-sans">
      {/* Navigation */}
      <Navbar user={session ? { email: session.email, role: session.role } : null} />

      {/* Hero Showcase Section */}
      <header className="relative py-24 md:py-36 overflow-hidden bg-beige border-b border-gold/10">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt="Royal Heritage Kurti Showcase"
            fill
            priority
            className="object-cover object-[center_20%] opacity-20 brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ivory via-ivory/90 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl flex flex-col items-start text-left space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-maroon/10 border border-gold/30 text-maroon text-xs uppercase tracking-widest font-light">
              <Sparkles className="w-3.5 h-3.5 text-gold animate-spin" />
              <span>Royal Couture</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light text-maroon leading-tight tracking-wide">
              Timeless Heritage. <br />
              <span className="text-gold font-light">Modern Grace.</span>
            </h1>

            <p className="text-sm md:text-base text-soft-black/70 font-light leading-relaxed max-w-lg">
              Explore our exclusive, private showroom showcase of handcrafted women&apos;s designer Kurtis. Combining Rajasthani palace craftsmanship with contemporary silhouettes.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="/catalog"
                className="px-6 py-3 bg-maroon hover:bg-maroon-hover text-white rounded-lg text-xs uppercase tracking-widest font-light shadow-md transition-all flex items-center space-x-2 border border-gold/30"
              >
                <Compass className="w-4 h-4 text-gold" />
                <span>Browse Catalogue</span>
              </Link>
              {session?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="px-6 py-3 bg-white/60 hover:bg-white text-maroon border border-gold/30 rounded-lg text-xs uppercase tracking-widest font-light transition-all flex items-center space-x-2 shadow-sm"
                >
                  <Shield className="w-4 h-4 text-gold" />
                  <span>Manage Products</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Categories Panel */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-12">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gold block mb-2">
            Curated Styles
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-maroon tracking-wider">
            Shop by Silhouettes
          </h2>
          <div className="h-[1px] w-24 bg-gold/30 mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.slice(0, 4).map((cat, idx) => {
            // Unsplash visuals representing Kurti structures
            const catImages = [
              'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
              'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400',
              'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=400',
              'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400',
            ];
            return (
              <Link
                key={cat.id}
                href={`/catalog?category=${cat.id}`}
                className="group relative aspect-[4/5] rounded-xl overflow-hidden shadow-sm border border-gold/10 hover:border-gold/30 transition-all flex flex-col justify-end p-4 bg-beige"
              >
                <Image
                  src={catImages[idx] || catImages[0]}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out brightness-95 opacity-70"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-soft-black/80 via-soft-black/20 to-transparent" />
                <div className="relative z-10 flex flex-col text-left">
                  <h3 className="font-serif text-base font-light text-white tracking-wider group-hover:text-gold transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[9px] text-white/60 uppercase tracking-widest font-light mt-1 flex items-center space-x-1">
                    <span>View Catalog</span>
                    <ArrowRight className="w-2.5 h-2.5 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Collection Highlights */}
      <section className="py-20 bg-beige/40 border-y border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gold block mb-2">
              Featured Concepts
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-maroon tracking-wider">
              Bespoke Heritage Collections
            </h2>
            <div className="h-[1px] w-24 bg-gold/30 mx-auto mt-4" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {collections.slice(0, 3).map((col, idx) => {
              const colImages = [
                'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
                'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600',
                'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=600',
              ];
              return (
                <div
                  key={col.id}
                  className="flex flex-col bg-white/40 border border-gold/10 rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="relative aspect-[3/2] overflow-hidden bg-beige">
                    <Image
                      src={colImages[idx] || colImages[0]}
                      alt={col.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-top group-hover:scale-103 transition-transform duration-1000"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-maroon/5 group-hover:bg-transparent transition-colors duration-500" />
                  </div>
                  <div className="p-6 flex-grow flex flex-col justify-between items-start text-left">
                    <div className="space-y-2 mb-4">
                      <h3 className="font-serif text-lg font-light text-maroon tracking-wide">
                        {col.name}
                      </h3>
                      <p className="text-xs text-soft-black/60 font-light leading-relaxed">
                        {col.description || 'Exclusive collections woven with perfection and premium threads.'}
                      </p>
                    </div>
                    <Link
                      href={`/catalog?collection=${col.id}`}
                      className="text-[10px] uppercase tracking-widest font-semibold text-gold hover:text-maroon transition-colors flex items-center space-x-1.5"
                    >
                      <span>Explore Collection</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Arrivals */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gold block mb-2">
              Fresh Additions
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-maroon tracking-wider">
              The Latest Masterpieces
            </h2>
          </div>
          <Link
            href="/catalog"
            className="px-5 py-2.5 bg-white border border-gold/30 hover:border-gold hover:bg-beige text-maroon text-xs uppercase tracking-widest font-light transition-all rounded-lg flex items-center space-x-2 shadow-sm"
          >
            <span>View Complete Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 text-gold" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {latestProducts.map((prod, idx) => (
            <ProductCard key={prod.id} product={prod} index={idx} />
          ))}
        </div>
      </section>

      {/* Brand Value Statements */}
      <footer className="bg-soft-black text-ivory border-t border-gold/20 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-12 text-center md:text-left mb-12">
          <div className="flex flex-col items-center md:items-start space-y-4">
            <span className="p-2 bg-white/5 rounded-full border border-gold/20">
              <Star className="w-5 h-5 text-gold" />
            </span>
            <h4 className="font-serif text-base font-light text-gold uppercase tracking-widest">
              Uncompromising Quality
            </h4>
            <p className="text-xs text-ivory/60 font-light leading-relaxed max-w-xs">
              Every Kurti is woven from handpicked premium fabrics, boasting flawless hand embroideries and tailoring.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start space-y-4">
            <span className="p-2 bg-white/5 rounded-full border border-gold/20">
              <Sparkles className="w-5 h-5 text-gold" />
            </span>
            <h4 className="font-serif text-base font-light text-gold uppercase tracking-widest">
              Exclusive Showroom
            </h4>
            <p className="text-xs text-ivory/60 font-light leading-relaxed max-w-xs">
              A private digital showroom displaying premium designer stock list catalogs, protected for selected clients.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start space-y-4">
            <span className="p-2 bg-white/5 rounded-full border border-gold/20">
              <Shield className="w-5 h-5 text-gold" />
            </span>
            <h4 className="font-serif text-base font-light text-gold uppercase tracking-widest">
              Secure Access
            </h4>
            <p className="text-xs text-ivory/60 font-light leading-relaxed max-w-xs">
              Strict access controls ensure that only invited clients and partners can browse the catalog details.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-serif text-sm tracking-widest text-gold uppercase">SATYAM CREATIONS JAIPUR</span>
            <span className="text-[9px] text-ivory/40 uppercase tracking-wider font-light mt-1">© 2026 Kurti Showcase. All rights reserved.</span>
          </div>
          <div className="flex space-x-6 text-[10px] text-ivory/60 uppercase tracking-widest font-light mt-4 md:mt-0">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <Link href="/catalog" className="hover:text-gold transition-colors">Catalog</Link>
            {session?.role === 'ADMIN' && (
              <Link href="/admin" className="hover:text-gold transition-colors">Admin Panel</Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
