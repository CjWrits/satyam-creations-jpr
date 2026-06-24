import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const SESSION_SECRET = process.env.SESSION_SECRET || 'a-very-long-secret-key-that-is-at-least-32-characters-long-for-security';
const KEY = new TextEncoder().encode(SESSION_SECRET);

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  expiresAt: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function encrypt(payload: SessionPayload) {
  const expSeconds = Math.floor(new Date(payload.expiresAt).getTime() / 1000);
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expSeconds)
    .sign(KEY);
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, KEY, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// Default session age: 30 minutes of inactivity
export const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

export async function createSession(userId: string, email: string, role: string, rememberMe = false) {
  // If rememberMe is checked, session lasts 7 days, otherwise it's 30 mins
  const duration = rememberMe ? 7 * 24 * 60 * 60 * 1000 : SESSION_DURATION;
  const expiresAt = new Date(Date.now() + duration);
  
  const session = await encrypt({ 
    userId, 
    email, 
    role, 
    expiresAt: expiresAt.toISOString() 
  });
  
  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  if (!sessionCookie) return null;
  
  const decrypted = await decrypt(sessionCookie);
  if (!decrypted) return null;

  // Check if session has expired
  if (new Date(decrypted.expiresAt) < new Date()) {
    await deleteSession();
    return null;
  }

  return decrypted;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function updateSession() {
  const session = await getSession();
  if (!session) return null;

  // Check if it's a sliding session (we only extend short sessions, e.g., 30 mins, not rememberMe which is 7 days)
  const expiresTime = new Date(session.expiresAt).getTime();
  const now = Date.now();
  
  // If the session has less than 25 minutes left and was initially a short session, extend it
  const timeLeft = expiresTime - now;
  // If the total duration is less than 1 day, it is a short session, refresh it
  if (timeLeft > 0 && timeLeft < SESSION_DURATION) {
    const newExpiresAt = new Date(now + SESSION_DURATION);
    session.expiresAt = newExpiresAt.toISOString();
    
    const encryptedSession = await encrypt(session);
    const cookieStore = await cookies();
    cookieStore.set('session', encryptedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: newExpiresAt,
      path: '/',
    });
  }
  
  return session;
}
