import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ImageGallery from '@/components/ImageGallery';
import { getSession } from '@/lib/auth';
import { getProductById } from '@/lib/data';
import { ArrowLeft, Info, Mail, Phone, Sparkles } from 'lucide-react';
import { notFound } from 'next/navigation';

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const session = await getSession();
  
  // Resolve async route params for Next.js 15
  const resolvedParams = await params;
  const product = await getProductById(resolvedParams.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col font-sans">
      {/* Navbar */}
      <Navbar user={session ? { email: session.email, role: session.role } : null} />

      {/* Back Button / Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 select-none">
        <Link
          href="/catalog"
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-soft-black/60 hover:text-maroon transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalogue</span>
        </Link>
      </div>

      {/* Product Showcase */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-20 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Image Gallery (Takes 7 columns on desktop) */}
          <div className="lg:col-span-7">
            <ImageGallery images={product.images} />
          </div>

          {/* Right Column: Product Specs (Takes 5 columns on desktop) */}
          <div className="lg:col-span-5 flex flex-col justify-start text-left space-y-6">
            {/* Tag & Code */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-maroon/5 border border-gold/20 text-gold text-[9px] uppercase tracking-widest font-semibold">
                {product.code}
              </span>
              <span className="text-[10px] text-soft-black/50 uppercase tracking-widest font-light">
                {product.category.name}
              </span>
            </div>

            {/* Title & Collection */}
            <div className="space-y-2">
              {product.collection && (
                <span className="text-[10px] text-gold uppercase tracking-[0.15em] font-light flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {product.collection.name} Collection
                </span>
              )}
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-light text-maroon leading-tight tracking-wide">
                {product.name}
              </h1>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-soft-black/70 font-light leading-relaxed">
              {product.description || 'This is a premium handcrafted women&apos;s ethnic wear design, woven using high-quality textiles and traditional patterns. The intricate hand detailing on the collar and hem makes it unique.'}
            </p>

            {/* Reference Value */}
            {product.price !== null && (
              <div className="py-4 border-y border-gold/10 flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-light text-soft-black/50">Reference Value</span>
                <span className="font-serif text-2xl font-light text-maroon">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {/* Luxury Contact/Enquiry Box */}
            <div className="p-6 bg-beige/60 border border-gold/20 rounded-xl space-y-4">
              <div className="flex items-start space-x-3 text-gold">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-[11px] uppercase tracking-widest font-semibold text-maroon">Showroom Enquiry</h4>
                  <p className="text-[10px] text-soft-black/60 font-light leading-relaxed">
                    This is a private showroom catalogue. Direct online purchases or checkout features are disabled. Please contact our showroom desk to enquire about this bespoke piece.
                  </p>
                </div>
              </div>
              
              <div className="h-[1px] bg-gold/15" />

              <div className="space-y-2.5">
                <a
                  href={`mailto:info@royalrajasthan.com?subject=Enquiry%20for%20Product%20${product.code}%20-%20${product.name}`}
                  className="flex items-center space-x-3 text-xs text-soft-black/80 hover:text-maroon transition-colors"
                >
                  <Mail className="w-4 h-4 text-gold" />
                  <span className="font-light">enquiry@royalrajasthan.com</span>
                </a>
                <div className="flex items-center space-x-3 text-xs text-soft-black/80">
                  <Phone className="w-4 h-4 text-gold" />
                  <span className="font-light">+91 141 234 5678 (Jaipur Office)</span>
                </div>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-3 pt-4">
              <h3 className="text-[11px] uppercase tracking-widest font-semibold text-maroon">Product Specifications</h3>
              <div className="grid grid-cols-2 gap-4 text-xs font-light">
                <div className="border-b border-gold/10 py-1.5 flex justify-between pr-4">
                  <span className="text-soft-black/40">Code</span>
                  <span className="text-soft-black/80 font-medium">{product.code}</span>
                </div>
                <div className="border-b border-gold/10 py-1.5 flex justify-between pr-4">
                  <span className="text-soft-black/40">Silhouette</span>
                  <span className="text-soft-black/80 font-medium">{product.category.name}</span>
                </div>
                <div className="border-b border-gold/10 py-1.5 flex justify-between pr-4">
                  <span className="text-soft-black/40">Collection</span>
                  <span className="text-soft-black/80 font-medium">{product.collection?.name || 'Heritage'}</span>
                </div>
                <div className="border-b border-gold/10 py-1.5 flex justify-between pr-4">
                  <span className="text-soft-black/40">Showroom Status</span>
                  <span className="text-emerald-800 font-semibold uppercase tracking-wider text-[10px]">Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
