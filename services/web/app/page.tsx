import { redirect } from 'next/navigation';

/**
 * Root page — immediately redirect to login.
 * The actual auth redirect (login → role dashboard) is handled by login/page.tsx.
 */
export default function Home() {
  redirect('/login');
}
