import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import SearchFilters from './SearchFilters';
import { getSession } from '@/lib/auth';
import { getProducts, getCategories, getCollections } from '@/lib/data';
import { Compass, Sparkles } from 'lucide-react';

interface CatalogPageProps {
  searchParams: Promise<{
    category?: string;
    collection?: string;
    search?: string;
    sortBy?: 'latest' | 'price-asc' | 'price-desc' | 'name-asc';
  }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const session = await getSession();
  
  // Resolve async searchParams for Next.js 15
  const resolvedSearchParams = await searchParams;
  const categoryFilter = resolvedSearchParams?.category;
  const collectionFilter = resolvedSearchParams?.collection;
  const searchFilter = resolvedSearchParams?.search;
  const sortByFilter = resolvedSearchParams?.sortBy;

  // Parallel data fetching
  let categories = [];
  let collections = [];
  let products = [];

  try {
    const [cats, cols, prods] = await Promise.all([
      getCategories(),
      getCollections(),
      getProducts({
        categoryId: categoryFilter,
        collectionId: collectionFilter,
        search: searchFilter,
        sortBy: sortByFilter,
      }),
    ]);
    categories = cats;
    collections = cols;
    products = prods;
  } catch (error) {
    console.error('SERVER RENDER ERROR: Data fetching failed in catalog page.tsx:', error);
    throw error;
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col font-sans">
      {/* Navbar */}
      <Navbar user={session ? { email: session.email, role: session.role } : null} />

      {/* Page Header */}
      <div className="bg-beige border-b border-gold/10 py-10 md:py-14 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-maroon/5 border border-gold/20 text-maroon text-[9px] uppercase tracking-widest font-light">
            <Sparkles className="w-3 h-3 text-gold" />
            <span>Exclusive Showcase</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-light text-maroon tracking-wider">
            The Product Catalogue
          </h1>
          <p className="text-xs text-soft-black/60 font-light max-w-md mx-auto leading-relaxed">
            Browse through our current stocks of handmade women&apos;s ethnic silhouettes. Use the filters below to refine your selection.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-10 flex-grow">
        {/* Filters Wrapper */}
        <div className="mb-10">
          <SearchFilters categories={categories} collections={collections} />
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((prod, idx) => (
              <ProductCard key={prod.id} product={prod} index={idx} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center border border-dashed border-gold/20 rounded-2xl bg-white/30 max-w-xl mx-auto space-y-4">
            <Compass className="w-10 h-10 text-gold mx-auto animate-pulse" />
            <h3 className="font-serif text-lg font-light text-maroon">No Matching Items</h3>
            <p className="text-xs text-soft-black/50 max-w-xs mx-auto leading-relaxed">
              We couldn&apos;t find any Kurtis that match your search filters. Try resetting the options.
            </p>
          </div>
        )}
      </main>

      {/* Simple Footer */}
      <footer className="py-8 bg-beige/40 border-t border-gold/10 text-center text-[10px] text-soft-black/40 font-light uppercase tracking-widest">
        <span>Satyam Creations Jaipur Kurti Showroom Catalog</span>
      </footer>
    </div>
  );
}
