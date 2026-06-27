'use server';

import prisma from '@/lib/prisma';
import { hashPassword, getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createUser(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized. Admin access required.' };
    }

    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;

    if (!email || !password || !role) {
      return { success: false, error: 'Email, Password, and Role are required.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanRole = role.trim().toUpperCase() === 'ADMIN' ? 'ADMIN' : 'VIEWER';

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return { success: false, error: 'User with this email already exists.' };
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
      data: {
        email: cleanEmail,
        name: name?.trim() || null,
        password: hashedPassword,
        role: cleanRole,
      },
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error: unknown) {
    console.error('SERVER ACTION ERROR: createUser failed:', error);
    const err = error as { message?: string };
    return { success: false, error: err.message || 'Failed to create user.' };
  }
}

export async function deleteUser(id: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized. Admin access required.' };
    }

    if (session.userId === id) {
      return { success: false, error: 'Cannot delete your own active session.' };
    }

    // Ensure we do not delete the env-admin (whose ID is 'admin-env')
    if (id === 'admin-env') {
      return { success: false, error: 'Cannot delete the system environment admin account.' };
    }

    await prisma.user.delete({
      where: { id },
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error: unknown) {
    console.error('SERVER ACTION ERROR: deleteUser failed:', error);
    const err = error as { message?: string };
    return { success: false, error: err.message || 'Failed to delete user.' };
  }
}
