
import { redirect } from 'next/navigation';

export default function WelcomePage() {
  // The root page now redirects to the functional home page.
  // The previous landing page with the galaxy animation is no longer needed.
  redirect('/home');
}
