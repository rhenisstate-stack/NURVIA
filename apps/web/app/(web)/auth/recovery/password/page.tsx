import { redirect } from 'next/navigation';

export default function AuthPasswordRecoveryRedirectPage() {
  redirect('/forgot-password');
}
