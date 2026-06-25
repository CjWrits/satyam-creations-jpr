import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      'ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.'
    );
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Royal Owner',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log(`Admin user created: ${admin.email}`);
  } else {
    console.log('Admin user already exists.');
  }

  const categories = [
    { name: 'Anarkali', slug: 'anarkali' },
    { name: 'Straight Cut', slug: 'straight-cut' },
    { name: 'A-Line', slug: 'a-line' },
    { name: 'Short Kurti', slug: 'short-kurti' },
    { name: 'Angrakha', slug: 'angrakha' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  const collections = [
    {
      name: 'Royal Heritage',
      slug: 'royal-heritage',
      description:
        'Timeless masterpieces inspired by Rajasthani palace artistry.',
    },
    {
      name: 'Velvet Dreams',
      slug: 'velvet-dreams',
      description:
        'Plush velvet designs detailed with hand-embroidered Zardozi.',
    },
    {
      name: 'Summer Breeze',
      slug: 'summer-breeze',
      description:
        'Lightweight linen and pure cotton kurtas for breezy summer afternoons.',
    },
    {
      name: 'Festive Glamour',
      slug: 'festive-glamour',
      description:
        'Intricate ethnic wear featuring gold foil prints and heavy zari borders.',
    },
  ];

  for (const col of collections) {
    await prisma.collection.upsert({
      where: { name: col.name },
      update: { description: col.description },
      create: col,
    });
  }

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });