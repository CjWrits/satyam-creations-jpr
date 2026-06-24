'use client';

import { useTransition, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CategoryData, CollectionData } from '@/lib/data';
import { Search, SlidersHorizontal } from 'lucide-react';

interface SearchFiltersProps {
  categories: CategoryData[];
  collections: CollectionData[];
}

export default function SearchFilters({ categories, collections }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const categoryId = searchParams.get('category') || 'all';
  const collectionId = searchParams.get('collection') || 'all';
  const sortBy = searchParams.get('sortBy') || 'latest';

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === 'all' || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`/catalog?${params.toString()}`);
    });
  };

  // Debounced search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (searchParams.get('search') || '')) {
        updateFilters({ search });
      }
    }, 450);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="bg-white/40 border border-gold/15 rounded-xl p-5 md:p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2 text-maroon mb-2">
        <SlidersHorizontal className="w-4 h-4 text-gold" />
        <h3 className="text-xs uppercase tracking-widest font-semibold">Filter Catalogue</h3>
        {isPending && <span className="text-[10px] text-gold animate-pulse">Syncing...</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gold/60">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or code..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/60 border border-gold/25 rounded-lg text-xs text-soft-black placeholder-soft-black/40 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-col">
          <select
            value={categoryId}
            onChange={(e) => updateFilters({ category: e.target.value })}
            className="w-full px-3 py-2.5 bg-white/60 border border-gold/25 rounded-lg text-xs text-soft-black focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all cursor-pointer"
          >
            <option value="all">All Silhouettes</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Collection Filter */}
        <div className="flex flex-col">
          <select
            value={collectionId}
            onChange={(e) => updateFilters({ collection: e.target.value })}
            className="w-full px-3 py-2.5 bg-white/60 border border-gold/25 rounded-lg text-xs text-soft-black focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all cursor-pointer"
          >
            <option value="all">All Collections</option>
            {collections.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sorting Selection */}
        <div className="flex flex-col">
          <select
            value={sortBy}
            onChange={(e) => updateFilters({ sortBy: e.target.value })}
            className="w-full px-3 py-2.5 bg-white/60 border border-gold/25 rounded-lg text-xs text-soft-black focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all cursor-pointer"
          >
            <option value="latest">Sort: Latest Additions</option>
            <option value="price-asc">Sort: Price Low to High</option>
            <option value="price-desc">Sort: Price High to Low</option>
            <option value="name-asc">Sort: Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
