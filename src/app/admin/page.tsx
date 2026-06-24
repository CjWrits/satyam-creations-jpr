import Navbar from '@/components/Navbar';
import AdminDashboard from './AdminDashboard';
import { getSession } from '@/lib/auth';
import { getProducts, getCategories, getCollections } from '@/lib/data';
import { Shield } from 'lucide-react';

export default async function AdminPage() {
  const session = await getSession();

  // Load all current stocks, silhouettes and collections
  const [products, categories, collections] = await Promise.all([
    getProducts({ sortBy: 'latest' }),
    getCategories(),
    getCollections(),
  ]);

  return (
    <div className="min-h-screen bg-ivory flex flex-col font-sans">
      {/* Navbar */}
      <Navbar user={session ? { email: session.email, role: session.role } : null} />

      {/* Admin header */}
      <div className="bg-beige border-b border-gold/10 py-8 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-left">
            <span className="p-2 bg-maroon/5 rounded-lg border border-gold/20 text-gold">
              <Shield className="w-6 h-6" />
            </span>
            <div>
              <h1 className="font-serif text-2xl font-light text-maroon tracking-wider">
                Catalogue Administration
              </h1>
              <p className="text-[10px] text-soft-black/50 uppercase tracking-widest font-light">
                Manage stock list, categories, collections and uploads
              </p>
            </div>
          </div>
          <div className="px-4 py-2 bg-gold/10 border border-gold/20 rounded-lg text-[10px] uppercase tracking-widest text-gold font-semibold">
            <span>Admin Active Session</span>
          </div>
        </div>
      </div>

      {/* Main Admin area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-10 flex-grow">
        <AdminDashboard 
          initialProducts={products}
          categories={categories}
          collections={collections}
        />
      </main>

      {/* Admin Footer */}
      <footer className="py-6 bg-beige/30 border-t border-gold/10 text-center text-[10px] text-soft-black/40 font-light uppercase tracking-widest">
        <span>Protected Admin Console • Authorized Personnel Only</span>
      </footer>
    </div>
  );
}
