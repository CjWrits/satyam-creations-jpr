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
    return {
      success: false,
      error: 'Email and password are required.',
    };
  }

  const envAdminEmail = process.env.ADMIN_EMAIL;
  const envAdminPassword = process.env.ADMIN_PASSWORD;

  if (!envAdminEmail || !envAdminPassword) {
    console.error('ADMIN_EMAIL or ADMIN_PASSWORD is missing');

    return {
      success: false,
      error: 'Server configuration error.',
    };
  }

  // Admin login from environment variables
  if (email.toLowerCase() === envAdminEmail.toLowerCase()) {
    if (password === envAdminPassword) {
      await createSession(
        'admin-env',
        envAdminEmail,
        'ADMIN',
        rememberMe
      );

      redirect(callbackUrl);
    }

    return {
      success: false,
      error: 'Invalid password.',
    };
  }

  // Database users
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'Invalid credentials.',
      };
    }

    const isValidPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!isValidPassword) {
      return {
        success: false,
        error: 'Invalid credentials.',
      };
    }

    await createSession(
      user.id,
      user.email,
      user.role,
      rememberMe
    );
  } catch (error) {
    console.error('Authentication database error:', error);

    return {
      success: false,
      error: 'Authentication failed due to a database error.',
    };
  }

  redirect(callbackUrl);
}

export async function logoutAction() {
  await deleteSession();
  redirect('/login');
}