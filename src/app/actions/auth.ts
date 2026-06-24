'use server';

import { createSession, deleteSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export interface ActionResponse {
  success: boolean;
  error?: string;
}

export async function loginAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const rememberMe = formData.get('rememberMe') === 'true';
  const callbackUrl = (formData.get('callbackUrl') as string) || '/';

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  // 1. Check if email/password matches the secure environment variables first (as required)
  const envAdminEmail = process.env.ADMIN_EMAIL || 'admin@kurticatalog.com';
  const envAdminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

  if (email.toLowerCase() === envAdminEmail.toLowerCase()) {
    if (password === envAdminPassword) {
      await createSession('admin-env', envAdminEmail, 'ADMIN', rememberMe);
      redirect(callbackUrl);
    } else {
      return { success: false, error: 'Invalid password.' };
    }
  }

  // 2. Fallback to database user lookups
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { success: false, error: 'Invalid credentials.' };
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return { success: false, error: 'Invalid credentials.' };
    }

    await createSession(user.id, user.email, user.role, rememberMe);
  } catch (error) {
    console.error('Authentication database error:', error);
    return { success: false, error: 'Authentication failed due to a database error.' };
  }

  redirect(callbackUrl);
}

export async function logoutAction() {
  await deleteSession();
  redirect('/login');
}
