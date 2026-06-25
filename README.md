# Satyam Creations Jaipur - Luxury Kurti Catalog Portal

A premium production-ready catalogue showcase website designed for **Satyam Creations Jaipur**, a boutique ethnic wear brand specializing in designer women's Kurtis. 

This portal is designed strictly for **product showcasing** and contains **no e-commerce checkout, cart, or payment features**. Access to the catalogue is protected behind secure authentication.

---

## 📖 System & Agent Blueprint

> [!NOTE]
> This section is formatted specifically as a reference guide for future AI coding agents or developers onboarding onto this project.

### 🏗 Architecture & Tech Stack
* **Framework:** Next.js 15.5.19 (App Router)
* **Styling:** Tailwind CSS v4 (configured via `@theme` utility tokens inside `src/app/globals.css`)
* **Animations:** Framer Motion (for luxury dropdowns, sliders, and modal transitions)
* **Icons:** Lucide React
* **Database ORM:** Prisma Client (`postgresql` connector)
* **Session Management:** Pure JS Edge-compatible JWS/JWT tokens using the `jose` library
* **Image Processing:** `sharp` for server-side image compression, WebP conversion, and thumbnail generation.

### 📁 Directory Layout
* `/prisma/schema.prisma` — Core PostgreSQL schema definitions (User, Product, Category, Collection, Image models).
* `/prisma/seed.ts` — Seeds default admin credentials, categories (Anarkali, Straight Cut, A-Line), and collections.
* `/src/middleware.ts` — Next.js Edge Middleware for route protection, admin check, and sliding window session refreshes.
* `/src/lib/auth.ts` — Authentication session creation, cookie encryption, and password verification.
* `/src/lib/data.ts` — Data access layer. **CRITICAL ARCHITECTURAL DETAIL:** All queries to Prisma are wrapped in try-catch blocks. If PostgreSQL is offline or unmigrated, it logs a warning and returns pre-compiled mock collections and high-res Unsplash product cards, ensuring the UI remains visually pristine.
* `/src/lib/imageProcessor.ts` — Sharp-based image optimization pipeline (saves original backup, compresses to 1600px optimized WebP, and generates 400px thumbnails).
* `/src/components/ImageGallery.tsx` — Slideshow component with thumbnails and a modal lightbox supporting zoom controls.
* `/src/app/admin/AdminDashboard.tsx` — Full-suite client workspace for stock management, editing modals, and bulk product auto-creation from image uploads.

---

## 🔒 Route Protection & Access Control

Access control is enforced at the network edge using Next.js Middleware:
1. **Public Routes:** `/login` and `_next` static assets are open.
2. **Protected Routes:** All other matching routes require a signed session cookie. Unauthenticated requests are redirected to `/login` with a `callbackUrl` query parameter.
3. **Authorization:** Routes starting with `/admin` require the user session payload to have `role: "ADMIN"`. If they do not, they are redirected to `/`.
4. **Sliding Sessions:** If the user is active and has less than 25 minutes left in their session, the middleware automatically extends the session by 30 minutes, signs a new JWT token, and rolls the cookie.
5. **Session Encryption:** Expiration values passed to `SignJWT.setExpirationTime()` are converted to numerical Unix epoch timestamps (seconds) to prevent runtime crashes.
6. **Redirect Handling:** In compliance with Next.js 15 rules, all `redirect()` triggers inside server actions are called **outside** try-catch blocks.

---

## 💾 Connecting with Supabase (Production Database)

To connect this application to a hosted **Supabase PostgreSQL** database:

1. Create a project in your [Supabase Dashboard](https://supabase.com/).
2. Navigate to **Project Settings > Database > Connection String** and copy the **Transaction (Port 5432)** or **Session** URL.
3. Replace the local `DATABASE_URL` in your production environment variables (or `.env` file) with your Supabase string. Ensure the password placeholder is populated.
4. Run the Prisma migration pipeline to map the tables onto Supabase:
   ```bash
   npx prisma db push
   ```
5. Seed the default admin user, categories, and collections into the Supabase database:
   ```bash
   npx prisma db seed
   ```

---

## 🖼 Production Image Storage Strategy

### Current Setup (Disk Storage)
Images uploaded via the Admin Panel or bulk upload pipeline are optimized into WebP format and saved locally to `/public/uploads/` on the server filesystem.

### The Serverless File Ephemerality Issue
If you host the Next.js app on **Vercel** or **Netlify** (which run on serverless functions), files written to the local disk are temporary and will be deleted when the server container recycling occurs.
* **VPS Deployment (DigitalOcean, AWS EC2):** No changes needed. The filesystem persists.
* **Serverless Deployment (Vercel):** You must replace the local write functions in `/src/lib/imageProcessor.ts` with direct upload API calls to an external object storage bucket (such as **Supabase Storage**, **AWS S3**, or **Cloudinary**).

#### Transitioning to Supabase Storage:
1. Create a public bucket in Supabase named `catalogue-media`.
2. Install the Supabase JS client (`@supabase/supabase-js`).
3. Replace `fs.writeFile` inside [[src/lib/imageProcessor.ts](file:///C:/Users/Chirag/Desktop/demo-web/src/lib/imageProcessor.ts)] with the Supabase upload call:
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
   
   // Instead of writing to disk:
   const { data, error } = await supabase.storage
     .from('catalogue-media')
     .upload(`optimized/${optimizedFilename}`, buffer, {
       contentType: 'image/webp'
     });
   ```

---

## 🛠 Quick Start Guide

### 1. Clone & Install
```bash
npm install --legacy-peer-deps
```

### 2. Environment Setup
Create a `.env` file at the root of the project (this file is excluded from Git to prevent leaks):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/satyamcatalog?schema=public"
SESSION_SECRET="your-secure-32-character-session-secret-key"
ADMIN_EMAIL="admin@satyamcreations.com"
ADMIN_PASSWORD="admin-password!"
```

### 3. Generate Database Client & Seed
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000). The dev server automatically binds to an alternate port if 3000 is occupied. Check your console.

### 5. Build for Production
Verify typescript compilation and stylesheet optimization:
```bash
npm run build
```
