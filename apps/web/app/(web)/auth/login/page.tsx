import { redirect } from 'next/navigation';

export default function AuthLoginRedirectPage() {
  redirect('/sign-in');
}
