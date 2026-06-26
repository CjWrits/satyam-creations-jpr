import prisma from './prisma';
import { Prisma } from '@prisma/client';

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
}

export interface CollectionData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface ImageData {
  id: string;
  url: string;
  thumbnail: string;
  original: string;
  isPrimary: boolean;
}

export interface ProductData {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number | null;
  category: CategoryData;
  collection: CollectionData | null;
  images: ImageData[];
  createdAt: string;
}

// High-quality royalty-free images of Indian ethnic fashion from Unsplash
const MOCK_IMAGES = {
  anarkali1: [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1608748010899-18f300247112?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&auto=format&fit=crop&q=80'
  ],
  straight1: [
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=1200&auto=format&fit=crop&q=80'
  ],
  aline1: [
    'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1608748010899-18f300247112?w=1200&auto=format&fit=crop&q=80'
  ],
  velvet1: [
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=80'
  ],
  cotton1: [
    'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1200&auto=format&fit=crop&q=80'
  ]
};

const MOCK_CATEGORIES: CategoryData[] = [
  { id: 'cat-1', name: 'Anarkali', slug: 'anarkali' },
  { id: 'cat-2', name: 'Straight Cut', slug: 'straight-cut' },
  { id: 'cat-3', name: 'A-Line', slug: 'a-line' },
  { id: 'cat-4', name: 'Short Kurti', slug: 'short-kurti' },
];

const MOCK_COLLECTIONS: CollectionData[] = [
  { id: 'col-1', name: 'Royal Heritage', slug: 'royal-heritage', description: 'Timeless masterpieces inspired by Rajasthani palace artistry.' },
  { id: 'col-2', name: 'Velvet Dreams', slug: 'velvet-dreams', description: 'Plush velvet designs detailed with hand-embroidered Zardozi.' },
  { id: 'col-3', name: 'Summer Breeze', slug: 'summer-breeze', description: 'Lightweight linen and pure cotton kurtas for breezy summer afternoons.' },
];

const MOCK_PRODUCTS: ProductData[] = [
  {
    id: 'prod-1',
    code: 'RR-AN-101',
    name: 'Jaipur Crimson Anarkali Kurta',
    description: 'An elegant long-flared Anarkali kurta crafted from premium pure cotton. Embellished with heavy gold gota patti embroidery on the neckline, cuffs, and hem. Pairs beautifully with an organza dupatta.',
    price: 4999,
    category: MOCK_CATEGORIES[0],
    collection: MOCK_COLLECTIONS[0],
    images: MOCK_IMAGES.anarkali1.map((url, idx) => ({
      id: `img-1-${idx}`,
      url,
      thumbnail: url.replace('w=1200', 'w=400'),
      original: url,
      isPrimary: idx === 0,
    })),
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(), // 2 days ago
  },
  {
    id: 'prod-2',
    code: 'RR-ST-204',
    name: 'Emerald Ivory Straight Silk Kurti',
    description: 'A contemporary straight silhouette made in rich tussar silk. Featuring subtle hand-painted kalamkari floral motifs and detailed thread borders for a sophisticated look.',
    price: 3899,
    category: MOCK_CATEGORIES[1],
    collection: MOCK_COLLECTIONS[2],
    images: MOCK_IMAGES.straight1.map((url, idx) => ({
      id: `img-2-${idx}`,
      url,
      thumbnail: url.replace('w=1200', 'w=400'),
      original: url,
      isPrimary: idx === 0,
    })),
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
  },
  {
    id: 'prod-3',
    code: 'RR-AL-309',
    name: 'Saffron Ochre A-Line Kurta',
    description: 'A relaxed elegant A-Line kurta in breathable handloom cotton. Includes side slit pockets, subtle gold thread-work detailing on the collar, and geometric prints.',
    price: 2499,
    category: MOCK_CATEGORIES[2],
    collection: MOCK_COLLECTIONS[2],
    images: MOCK_IMAGES.aline1.map((url, idx) => ({
      id: `img-3-${idx}`,
      url,
      thumbnail: url.replace('w=1200', 'w=400'),
      original: url,
      isPrimary: idx === 0,
    })),
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
  },
  {
    id: 'prod-4',
    code: 'RR-VL-402',
    name: 'Mughal Royal Velvet Kurta Set',
    description: 'A regal silk-velvet kurta in deep wine. Exquisitely embroidered with intricate Zari and Dabka hand embroidery. Designed for special evening celebrations and festive ceremonies.',
    price: 7899,
    category: MOCK_CATEGORIES[0],
    collection: MOCK_COLLECTIONS[1],
    images: MOCK_IMAGES.velvet1.map((url, idx) => ({
      id: `img-4-${idx}`,
      url,
      thumbnail: url.replace('w=1200', 'w=400'),
      original: url,
      isPrimary: idx === 0,
    })),
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
  },
  {
    id: 'prod-5',
    code: 'RR-ST-112',
    name: 'Pastel Mint Linen Kurti',
    description: 'A lightweight mint green straight kurta crafted from premium Irish linen. Features minimalist mother-of-pearl buttons and clean cuffs. Perfect for casual business meetings or daylight wear.',
    price: 2199,
    category: MOCK_CATEGORIES[1],
    collection: MOCK_COLLECTIONS[2],
    images: MOCK_IMAGES.cotton1.map((url, idx) => ({
      id: `img-5-${idx}`,
      url,
      thumbnail: url.replace('w=1200', 'w=400'),
      original: url,
      isPrimary: idx === 0,
    })),
    createdAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
  },
];

let isSeeded = false;
let seedingPromise: Promise<void> | null = null;

async function seedDefaultData() {
  if (isSeeded) return;
  if (seedingPromise) return seedingPromise;

  seedingPromise = (async () => {
    try {
      const catCount = await prisma.category.count();
      const colCount = await prisma.collection.count();
      const prodCount = await prisma.product.count();

      // Only seed mock data if the database is completely empty (brand new deploy)
      if (catCount === 0 && colCount === 0 && prodCount === 0) {
        console.log('Database is completely empty. Auto-seeding default categories, collections, and products...');
        
        // 1. Seed categories
        await prisma.category.createMany({
          data: MOCK_CATEGORIES.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
          })),
        });

        // 2. Seed collections
        await prisma.collection.createMany({
          data: MOCK_COLLECTIONS.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
          })),
        });

        // 3. Seed products
        for (const p of MOCK_PRODUCTS) {
          await prisma.product.create({
            data: {
              id: p.id,
              code: p.code,
              name: p.name,
              description: p.description,
              price: p.price,
              categoryId: p.category.id,
              collectionId: p.collection?.id || null,
            },
          });

          if (p.images && p.images.length > 0) {
            await prisma.image.createMany({
              data: p.images.map((img, idx) => ({
                id: img.id,
                productId: p.id,
                url: img.url,
                thumbnail: img.thumbnail,
                original: img.original,
                isPrimary: img.isPrimary,
                order: idx,
              })),
            });
          }
        }
        console.log('Database auto-seeding completed successfully.');
      } else {
        console.log('Database contains existing user data. Skipping auto-seeding.');
      }
      isSeeded = true;
    } catch (error) {
      console.error('Error during auto-seeding default data:', error);
    } finally {
      seedingPromise = null;
    }
  })();

  return seedingPromise;
}

/**
 * Safe fetch for categories. Falls back to mock data if Prisma fails or is empty.
 */
export async function getCategories(): Promise<CategoryData[]> {
  try {
    await seedDefaultData();
    const cats = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return cats.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    }));
  } catch (error) {
    console.warn('Database query failed for categories, falling back to mock data.', error);
    return MOCK_CATEGORIES;
  }
}

/**
 * Safe fetch for collections. Falls back to mock data if Prisma fails or is empty.
 */
export async function getCollections(): Promise<CollectionData[]> {
  try {
    await seedDefaultData();
    const cols = await prisma.collection.findMany({
      orderBy: { name: 'asc' },
    });
    return cols.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
    }));
  } catch (error) {
    console.warn('Database query failed for collections, falling back to mock data.', error);
    return MOCK_COLLECTIONS;
  }
}

/**
 * Safe fetch for products. Falls back to mock data if Prisma fails or is empty.
 * Supports filters (category, collection, search) and sorting.
 */
export async function getProducts(filters?: {
  categoryId?: string;
  collectionId?: string;
  search?: string;
  sortBy?: 'latest' | 'price-asc' | 'price-desc' | 'name-asc';
}): Promise<ProductData[]> {
  try {
    await seedDefaultData();
    // Construct where clause
    const where: Prisma.ProductWhereInput = {};
    if (filters?.categoryId && filters.categoryId !== 'all') {
      where.categoryId = filters.categoryId;
    }
    if (filters?.collectionId && filters.collectionId !== 'all') {
      where.collectionId = filters.collectionId;
    }
    if (filters?.search && filters.search.trim()) {
      where.OR = [
        { name: { contains: filters.search.trim(), mode: 'insensitive' } },
        { code: { contains: filters.search.trim(), mode: 'insensitive' } },
        { description: { contains: filters.search.trim(), mode: 'insensitive' } },
      ];
    }

    // Sort order
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }; // default
    if (filters?.sortBy === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (filters?.sortBy === 'price-desc') {
      orderBy = { price: 'desc' };
    } else if (filters?.sortBy === 'name-asc') {
      orderBy = { name: 'asc' };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        collection: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return products.map(prod => ({
      id: prod.id,
      code: prod.code,
      name: prod.name,
      description: prod.description,
      price: prod.price,
      category: {
        id: prod.category.id,
        name: prod.category.name,
        slug: prod.category.slug,
      },
      collection: prod.collection ? {
        id: prod.collection.id,
        name: prod.collection.name,
        slug: prod.collection.slug,
        description: prod.collection.description,
      } : null,
      images: prod.images.map(img => ({
        id: img.id,
        url: '', // Exclude large optimized base64 image from lists to keep HTML payloads under 150KB
        thumbnail: img.thumbnail, // Kept since grids only render thumbnails
        original: '', // Exclude raw backup base64 image from lists to keep HTML payloads under 150KB
        isPrimary: img.isPrimary,
      })),
      createdAt: prod.createdAt.toISOString(),
    }));
  } catch (error) {
    console.warn('Database query failed for products, falling back to mock data.', error);
    return getFilteredMockProducts(filters);
  }
}

/**
 * Safe fetch for single product details. Falls back to mock data if not found.
 */
export async function getProductById(id: string): Promise<ProductData | null> {
  try {
    await seedDefaultData();
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        collection: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (product) {
      return {
        id: product.id,
        code: product.code,
        name: product.name,
        description: product.description,
        price: product.price,
        category: {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        },
        collection: product.collection ? {
          id: product.collection.id,
          name: product.collection.name,
          slug: product.collection.slug,
          description: product.collection.description,
        } : null,
        images: product.images.map(img => ({
          id: img.id,
          url: img.url,
          thumbnail: img.thumbnail,
          original: img.original,
          isPrimary: img.isPrimary,
        })),
        createdAt: product.createdAt.toISOString(),
      };
    }
  } catch (error) {
    console.warn(`Database query failed for product ID ${id}, searching in mock data.`, error);
  }

  // Fallback to mock search
  return MOCK_PRODUCTS.find((p) => p.id === id) || null;
}

function getFilteredMockProducts(filters?: {
  categoryId?: string;
  collectionId?: string;
  search?: string;
  sortBy?: 'latest' | 'price-asc' | 'price-desc' | 'name-asc';
}): ProductData[] {
  let list = [...MOCK_PRODUCTS];

  if (filters?.categoryId && filters.categoryId !== 'all') {
    list = list.filter((p) => p.category.id === filters.categoryId || p.category.slug === filters.categoryId);
  }

  if (filters?.collectionId && filters.collectionId !== 'all') {
    list = list.filter((p) => p.collection?.id === filters.collectionId || p.collection?.slug === filters.collectionId);
  }

  if (filters?.search && filters.search.trim()) {
    const s = filters.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.code.toLowerCase().includes(s) ||
        p.description?.toLowerCase().includes(s)
    );
  }

  // Sorting
  if (filters?.sortBy === 'price-asc') {
    list.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (filters?.sortBy === 'price-desc') {
    list.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (filters?.sortBy === 'name-asc') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // Default latest
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return list;
}
