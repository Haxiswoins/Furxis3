
import { redirect } from 'next/navigation';

// This page now simply redirects to the root, as the content is conditionally rendered there.
export default function HomePageRedirect() {
  redirect('/');
}
