import { cookies } from 'next/headers'

export async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  return session === process.env.ADMIN_SECRET
}
